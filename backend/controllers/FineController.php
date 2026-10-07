<?php
/**
 * Fine Management Controller
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../middleware/auth.php';

class FineController {
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
        $status = isset($_GET['status']) && in_array($_GET['status'], ['Pending', 'Paid']) ? $_GET['status'] : null;

        $where = ["1=1"];
        $params = [];

        if (!empty($search)) {
            $where[] = "(m.full_name LIKE :s1 OR m.member_code LIKE :s2 OR b.title LIKE :s3)";
            $params[':s1'] = "%{$search}%";
            $params[':s2'] = "%{$search}%";
            $params[':s3'] = "%{$search}%";
        }

        if ($status !== null) {
            $where[] = "f.payment_status = :status";
            $params[':status'] = $status;
        }

        $whereClause = implode(" AND ", $where);

        $countSql = "
            SELECT COUNT(*) as total 
            FROM fines f 
            JOIN issues i ON f.issue_id = i.id 
            JOIN books b ON i.book_id = b.id 
            JOIN members m ON f.member_id = m.id 
            WHERE {$whereClause}
        ";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int)$countStmt->fetch()['total'];

        $sql = "
            SELECT 
                f.id, f.issue_id, f.member_id, f.overdue_days, f.fine_amount, 
                f.payment_status, f.paid_date, f.created_at,
                i.due_date, i.return_date, i.status AS issue_status,
                b.title AS book_title, b.isbn AS book_isbn,
                m.full_name AS member_name, m.member_code, m.email AS member_email, m.phone AS member_phone
            FROM fines f
            JOIN issues i ON f.issue_id = i.id
            JOIN books b ON i.book_id = b.id
            JOIN members m ON f.member_id = m.id
            WHERE {$whereClause}
            ORDER BY f.id DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $fines = $stmt->fetchAll();

        // Calculate summary totals
        $summaryStmt = $this->db->query("
            SELECT 
                COALESCE(SUM(CASE WHEN payment_status = 'Pending' THEN fine_amount ELSE 0 END), 0) AS total_pending,
                COALESCE(SUM(CASE WHEN payment_status = 'Paid' THEN fine_amount ELSE 0 END), 0) AS total_collected,
                COUNT(CASE WHEN payment_status = 'Pending' THEN 1 END) AS pending_count
            FROM fines
        ");
        $summary = $summaryStmt->fetch();

        sendResponse(true, 'Fines retrieved successfully', [
            'fines' => $fines,
            'summary' => [
                'total_pending' => (float)$summary['total_pending'],
                'total_collected' => (float)$summary['total_collected'],
                'pending_count' => (int)$summary['pending_count']
            ],
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    public function payFine($id) {
        authenticate();
        $id = (int)$id;

        $stmt = $this->db->prepare("SELECT * FROM fines WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $fine = $stmt->fetch();

        if (!$fine) {
            sendResponse(false, 'Fine record not found', null, 404);
        }

        if ($fine['payment_status'] === 'Paid') {
            sendResponse(false, 'Fine has already been marked as paid.', null, 400);
        }

        $paidDate = date('Y-m-d');
        $updateStmt = $this->db->prepare("
            UPDATE fines 
            SET payment_status = 'Paid', paid_date = :paid_date 
            WHERE id = :id
        ");
        $updateStmt->execute([
            ':paid_date' => $paidDate,
            ':id' => $id
        ]);

        sendResponse(true, 'Fine marked as paid successfully', [
            'id' => $id,
            'payment_status' => 'Paid',
            'paid_date' => $paidDate
        ]);
    }
}
