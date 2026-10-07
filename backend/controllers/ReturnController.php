<?php
/**
 * Return Management Controller
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../middleware/auth.php';

class ReturnController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function returnBook($issueId) {
        authenticate();
        $issueId = (int)$issueId;

        $data = getRequestBody();
        $returnDate = !empty($data['return_date']) ? $data['return_date'] : date('Y-m-d');

        // Begin transaction
        $this->db->beginTransaction();

        try {
            // 1. Check issue record
            $issueStmt = $this->db->prepare("
                SELECT i.*, b.id AS book_id, b.title AS book_title, b.available_copies, b.total_copies,
                       m.id AS member_id, m.full_name AS member_name
                FROM issues i
                JOIN books b ON i.book_id = b.id
                JOIN members m ON i.member_id = m.id
                WHERE i.id = :id
                FOR UPDATE
            ");
            $issueStmt->execute([':id' => $issueId]);
            $issue = $issueStmt->fetch();

            if (!$issue) {
                $this->db->rollBack();
                sendResponse(false, 'Issue record not found', null, 404);
            }

            if ($issue['status'] === 'Returned') {
                $this->db->rollBack();
                sendResponse(false, 'This book has already been returned.', null, 400);
            }

            // 2. Fetch fine_per_day setting
            $settingStmt = $this->db->prepare("SELECT setting_value FROM settings WHERE setting_key = 'fine_per_day' LIMIT 1");
            $settingStmt->execute();
            $fineSetting = $settingStmt->fetch();
            $fineRate = $fineSetting ? (float)$fineSetting['setting_value'] : 5.00;

            // 3. Calculate overdue days and fine
            $dueDate = $issue['due_date'];
            $overdueDays = 0;
            $fineAmount = 0.00;

            if ($returnDate > $dueDate) {
                $dDue = new DateTime($dueDate);
                $dReturn = new DateTime($returnDate);
                $interval = $dDue->diff($dReturn);
                $overdueDays = (int)$interval->format('%r%a');
                if ($overdueDays > 0) {
                    $fineAmount = round($overdueDays * $fineRate, 2);
                } else {
                    $overdueDays = 0;
                }
            }

            // 4. Update issue record
            $updateIssueStmt = $this->db->prepare("
                UPDATE issues 
                SET return_date = :return_date, status = 'Returned'
                WHERE id = :id
            ");
            $updateIssueStmt->execute([
                ':return_date' => $returnDate,
                ':id' => $issueId
            ]);

            // 5. Increase available copies
            $newAvailable = min((int)$issue['total_copies'], (int)$issue['available_copies'] + 1);
            $updateBookStmt = $this->db->prepare("
                UPDATE books 
                SET available_copies = :available, status = 'Available'
                WHERE id = :id
            ");
            $updateBookStmt->execute([
                ':available' => $newAvailable,
                ':id' => $issue['book_id']
            ]);

            // 6. Handle fine record
            $fineId = null;
            if ($fineAmount > 0) {
                // Check if fine record already exists (e.g., from overdue auto-generation)
                $checkFineStmt = $this->db->prepare("SELECT id FROM fines WHERE issue_id = :issue_id LIMIT 1");
                $checkFineStmt->execute([':issue_id' => $issueId]);
                $existingFine = $checkFineStmt->fetch();

                if ($existingFine) {
                    $fineId = (int)$existingFine['id'];
                    $updateFineStmt = $this->db->prepare("
                        UPDATE fines 
                        SET overdue_days = :days, fine_amount = :amount 
                        WHERE id = :id
                    ");
                    $updateFineStmt->execute([
                        ':days' => $overdueDays,
                        ':amount' => $fineAmount,
                        ':id' => $fineId
                    ]);
                } else {
                    $insertFineStmt = $this->db->prepare("
                        INSERT INTO fines (issue_id, member_id, overdue_days, fine_amount, payment_status)
                        VALUES (:issue_id, :member_id, :days, :amount, 'Pending')
                    ");
                    $insertFineStmt->execute([
                        ':issue_id' => $issueId,
                        ':member_id' => $issue['member_id'],
                        ':days' => $overdueDays,
                        ':amount' => $fineAmount
                    ]);
                    $fineId = (int)$this->db->lastInsertId();
                }
            }

            // Commit Transaction
            $this->db->commit();

            sendResponse(true, 'Book returned successfully', [
                'issue_id' => $issueId,
                'return_date' => $returnDate,
                'overdue_days' => $overdueDays,
                'fine_amount' => $fineAmount,
                'fine_id' => $fineId,
                'available_copies' => $newAvailable
            ]);

        } catch (Exception $e) {
            $this->db->rollBack();
            sendResponse(false, 'Failed to process return: ' . $e->getMessage(), null, 500);
        }
    }
}
