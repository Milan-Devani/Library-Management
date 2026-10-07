<?php
/**
 * Issue Management Controller
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../middleware/auth.php';

class IssueController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll() {
        authenticate();

        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 10;
        $offset = ($page - 1) * $limit;

        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $status = isset($_GET['status']) && in_array($_GET['status'], ['Issued', 'Returned', 'Overdue']) ? $_GET['status'] : null;

        // Auto-update overdue records where due_date < CURRENT_DATE and status = 'Issued'
        $this->db->query("
            UPDATE issues 
            SET status = 'Overdue' 
            WHERE status = 'Issued' AND due_date < CURRENT_DATE()
        ");

        $where = ["1=1"];
        $params = [];

        if (!empty($search)) {
            $where[] = "(b.title LIKE :s1 OR b.isbn LIKE :s2 OR m.full_name LIKE :s3 OR m.member_code LIKE :s4)";
            $params[':s1'] = "%{$search}%";
            $params[':s2'] = "%{$search}%";
            $params[':s3'] = "%{$search}%";
            $params[':s4'] = "%{$search}%";
        }

        if ($status !== null) {
            $where[] = "i.status = :status";
            $params[':status'] = $status;
        }

        $whereClause = implode(" AND ", $where);

        $countSql = "
            SELECT COUNT(*) as total 
            FROM issues i 
            JOIN books b ON i.book_id = b.id 
            JOIN members m ON i.member_id = m.id 
            WHERE {$whereClause}
        ";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int)$countStmt->fetch()['total'];

        $sql = "
            SELECT 
                i.id, i.book_id, i.member_id, i.issue_date, i.due_date, i.return_date, 
                i.status, i.notes, i.created_at,
                b.title AS book_title, b.isbn AS book_isbn,
                m.full_name AS member_name, m.member_code, m.email AS member_email, m.phone AS member_phone,
                f.fine_amount, f.payment_status AS fine_status, f.overdue_days,
                DATEDIFF(CURRENT_DATE(), i.due_date) AS current_overdue_days
            FROM issues i
            JOIN books b ON i.book_id = b.id
            JOIN members m ON i.member_id = m.id
            LEFT JOIN fines f ON f.issue_id = i.id
            WHERE {$whereClause}
            ORDER BY i.id DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $issues = $stmt->fetchAll();

        sendResponse(true, 'Issues retrieved successfully', [
            'issues' => $issues,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    public function getById($id) {
        authenticate();
        $id = (int)$id;

        $stmt = $this->db->prepare("
            SELECT 
                i.*,
                b.title AS book_title, b.isbn AS book_isbn, b.available_copies,
                m.full_name AS member_name, m.member_code, m.email AS member_email, m.phone AS member_phone,
                f.fine_amount, f.payment_status AS fine_status, f.overdue_days, f.paid_date
            FROM issues i
            JOIN books b ON i.book_id = b.id
            JOIN members m ON i.member_id = m.id
            LEFT JOIN fines f ON f.issue_id = i.id
            WHERE i.id = :id
            LIMIT 1
        ");
        $stmt->execute([':id' => $id]);
        $issue = $stmt->fetch();

        if (!$issue) {
            sendResponse(false, 'Issue record not found', null, 404);
        }

        sendResponse(true, 'Issue retrieved successfully', ['issue' => $issue]);
    }

    public function create() {
        authenticate();
        $data = getRequestBody();

        $errors = validateRequired($data, [
            'member_id' => 'Member',
            'book_id' => 'Book',
            'issue_date' => 'Issue Date',
            'due_date' => 'Due Date'
        ]);

        if (!empty($data['issue_date']) && !empty($data['due_date'])) {
            if ($data['issue_date'] > $data['due_date']) {
                $errors['due_date'] = 'Due date must be on or after issue date';
            }
        }

        if (!empty($errors)) {
            sendResponse(false, 'Validation failed', null, 422, $errors);
        }

        $memberId = (int)$data['member_id'];
        $bookId = (int)$data['book_id'];
        $issueDate = $data['issue_date'];
        $dueDate = $data['due_date'];
        $notes = isset($data['notes']) ? sanitizeString($data['notes']) : null;

        // Fetch settings for max books allowed
        $settingStmt = $this->db->prepare("SELECT setting_value FROM settings WHERE setting_key = 'max_books_per_member' LIMIT 1");
        $settingStmt->execute();
        $maxBooksRow = $settingStmt->fetch();
        $maxBooks = $maxBooksRow ? (int)$maxBooksRow['setting_value'] : 3;

        // Begin Transaction
        $this->db->beginTransaction();

        try {
            // 1. Check member status
            $memberStmt = $this->db->prepare("SELECT id, full_name, status FROM members WHERE id = :id FOR UPDATE");
            $memberStmt->execute([':id' => $memberId]);
            $member = $memberStmt->fetch();

            if (!$member) {
                $this->db->rollBack();
                sendResponse(false, 'Member not found', null, 404);
            }

            if ($member['status'] !== 'Active') {
                $this->db->rollBack();
                sendResponse(false, "Cannot issue book to inactive member '{$member['full_name']}'. Please activate member first.", null, 400);
            }

            // 2. Check active issued count for this member
            $activeCountStmt = $this->db->prepare("
                SELECT COUNT(*) AS active_count 
                FROM issues 
                WHERE member_id = :member_id AND status IN ('Issued', 'Overdue')
            ");
            $activeCountStmt->execute([':member_id' => $memberId]);
            $activeCount = (int)$activeCountStmt->fetch()['active_count'];

            if ($activeCount >= $maxBooks) {
                $this->db->rollBack();
                sendResponse(false, "Member '{$member['full_name']}' has reached the maximum allowed limit of {$maxBooks} active borrowed books.", null, 400);
            }

            // 3. Check if member already has this exact book currently issued
            $dupIssueStmt = $this->db->prepare("
                SELECT id 
                FROM issues 
                WHERE member_id = :member_id AND book_id = :book_id AND status IN ('Issued', 'Overdue')
                LIMIT 1
            ");
            $dupIssueStmt->execute([':member_id' => $memberId, ':book_id' => $bookId]);
            if ($dupIssueStmt->fetch()) {
                $this->db->rollBack();
                sendResponse(false, "Member already has an active issue record for this book. Cannot issue duplicate active copies to the same student.", null, 400);
            }

            // 4. Check book availability
            $bookStmt = $this->db->prepare("SELECT id, title, available_copies, status FROM books WHERE id = :id FOR UPDATE");
            $bookStmt->execute([':id' => $bookId]);
            $book = $bookStmt->fetch();

            if (!$book) {
                $this->db->rollBack();
                sendResponse(false, 'Book not found', null, 404);
            }

            if ((int)$book['available_copies'] <= 0) {
                $this->db->rollBack();
                sendResponse(false, "No available copies for book '{$book['title']}'. All copies are currently issued.", null, 400);
            }

            // 5. Insert issue record
            $initialStatus = ($dueDate < date('Y-m-d')) ? 'Overdue' : 'Issued';
            $insertStmt = $this->db->prepare("
                INSERT INTO issues (book_id, member_id, issue_date, due_date, status, notes)
                VALUES (:book_id, :member_id, :issue_date, :due_date, :status, :notes)
            ");
            $insertStmt->execute([
                ':book_id' => $bookId,
                ':member_id' => $memberId,
                ':issue_date' => $issueDate,
                ':due_date' => $dueDate,
                ':status' => $initialStatus,
                ':notes' => $notes
            ]);
            $newIssueId = $this->db->lastInsertId();

            // 6. Decrease available copies
            $newAvailable = (int)$book['available_copies'] - 1;
            $newBookStatus = ($newAvailable > 0) ? 'Available' : 'Unavailable';

            $updateBookStmt = $this->db->prepare("
                UPDATE books 
                SET available_copies = :available, status = :status 
                WHERE id = :id
            ");
            $updateBookStmt->execute([
                ':available' => $newAvailable,
                ':status' => $newBookStatus,
                ':id' => $bookId
            ]);

            // Commit Transaction
            $this->db->commit();

            sendResponse(true, 'Book issued successfully', [
                'issue_id' => (int)$newIssueId,
                'available_copies_remaining' => $newAvailable
            ], 201);

        } catch (Exception $e) {
            $this->db->rollBack();
            sendResponse(false, 'Failed to issue book: ' . $e->getMessage(), null, 500);
        }
    }
}
