<?php
/**
 * Dashboard Statistics Controller
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/auth.php';

class DashboardController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getStats() {
        authenticate();

        // 1. Core count statistics
        $statsStmt = $this->db->query("
            SELECT
                (SELECT COUNT(*) FROM books) AS total_books,
                (SELECT COALESCE(SUM(total_copies), 0) FROM books) AS total_book_copies,
                (SELECT COALESCE(SUM(available_copies), 0) FROM books) AS available_copies,
                (SELECT COUNT(*) FROM members WHERE status = 'Active') AS total_members,
                (SELECT COUNT(*) FROM members) AS total_all_members,
                (SELECT COUNT(*) FROM categories) AS total_categories,
                (SELECT COUNT(*) FROM authors) AS total_authors,
                (SELECT COUNT(*) FROM issues WHERE status IN ('Issued', 'Overdue')) AS books_issued,
                (SELECT COUNT(*) FROM issues WHERE (status = 'Overdue' OR (status = 'Issued' AND due_date < CURRENT_DATE()))) AS overdue_books,
                (SELECT COALESCE(SUM(fine_amount), 0) FROM fines WHERE payment_status = 'Pending') AS pending_fines,
                (SELECT COALESCE(SUM(fine_amount), 0) FROM fines WHERE payment_status = 'Paid') AS collected_fines,
                (SELECT COALESCE(SUM(fine_amount), 0) FROM fines) AS total_fines
        ");
        $counts = $statsStmt->fetch();

        // 2. Recent Issues (last 6)
        $recentIssuesStmt = $this->db->query("
            SELECT 
                i.id, i.issue_date, i.due_date, i.return_date, i.status,
                b.title AS book_title, b.isbn AS book_isbn,
                m.full_name AS member_name, m.member_code
            FROM issues i
            JOIN books b ON i.book_id = b.id
            JOIN members m ON i.member_id = m.id
            ORDER BY i.id DESC
            LIMIT 6
        ");
        $recentIssues = $recentIssuesStmt->fetchAll();

        // 3. Popular Books (highest number of issues)
        $popularBooksStmt = $this->db->query("
            SELECT 
                b.id, b.title, b.isbn, b.available_copies, b.total_copies,
                a.name AS author_name,
                c.name AS category_name,
                COUNT(i.id) AS issue_count
            FROM books b
            LEFT JOIN issues i ON b.id = i.book_id
            LEFT JOIN authors a ON b.author_id = a.id
            LEFT JOIN categories c ON b.category_id = c.id
            GROUP BY b.id
            ORDER BY issue_count DESC, b.id DESC
            LIMIT 5
        ");
        $popularBooks = $popularBooksStmt->fetchAll();

        // 4. Overdue Books List
        $settingStmt = $this->db->query("SELECT setting_value FROM settings WHERE setting_key = 'fine_per_day' LIMIT 1");
        $fineRow = $settingStmt->fetch();
        $fineRate = $fineRow ? (float)$fineRow['setting_value'] : 5.00;

        $overdueStmt = $this->db->prepare("
            SELECT 
                i.id, i.issue_date, i.due_date,
                b.title AS book_title, b.isbn AS book_isbn,
                m.full_name AS member_name, m.member_code, m.phone AS member_phone,
                DATEDIFF(CURRENT_DATE(), i.due_date) AS days_overdue,
                ROUND(DATEDIFF(CURRENT_DATE(), i.due_date) * :rate, 2) AS estimated_fine
            FROM issues i
            JOIN books b ON i.book_id = b.id
            JOIN members m ON i.member_id = m.id
            WHERE (i.status = 'Overdue' OR (i.status = 'Issued' AND i.due_date < CURRENT_DATE()))
            ORDER BY days_overdue DESC
            LIMIT 6
        ");
        $overdueStmt->execute([':rate' => $fineRate]);
        $overdueBooks = $overdueStmt->fetchAll();

        sendResponse(true, 'Dashboard statistics retrieved successfully', [
            'counts' => [
                'total_books' => (int)$counts['total_books'],
                'total_book_copies' => (int)$counts['total_book_copies'],
                'available_copies' => (int)$counts['available_copies'],
                'total_members' => (int)$counts['total_members'],
                'total_all_members' => (int)$counts['total_all_members'],
                'total_categories' => (int)$counts['total_categories'],
                'total_authors' => (int)$counts['total_authors'],
                'books_issued' => (int)$counts['books_issued'],
                'overdue_books' => (int)$counts['overdue_books'],
                'pending_fines' => (float)$counts['pending_fines'],
                'collected_fines' => (float)$counts['collected_fines'],
                'total_fines' => (float)$counts['total_fines']
            ],
            'recent_issues' => $recentIssues,
            'popular_books' => $popularBooks,
            'overdue_books' => $overdueBooks
        ]);
    }
}
