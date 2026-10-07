<?php
/**
 * Book Management Controller
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../middleware/auth.php';

class BookController {
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
        $categoryId = isset($_GET['category_id']) && $_GET['category_id'] !== '' ? (int)$_GET['category_id'] : null;
        $authorId = isset($_GET['author_id']) && $_GET['author_id'] !== '' ? (int)$_GET['author_id'] : null;
        $status = isset($_GET['status']) && in_array($_GET['status'], ['Available', 'Unavailable']) ? $_GET['status'] : null;

        $sort = isset($_GET['sort']) ? $_GET['sort'] : 'b.id';
        $order = (isset($_GET['order']) && strtolower($_GET['order']) === 'asc') ? 'ASC' : 'DESC';

        $allowedSorts = [
            'id' => 'b.id',
            'title' => 'b.title',
            'isbn' => 'b.isbn',
            'author' => 'a.name',
            'category' => 'c.name',
            'publication_year' => 'b.publication_year',
            'total_copies' => 'b.total_copies',
            'available_copies' => 'b.available_copies'
        ];
        $sortColumn = $allowedSorts[$sort] ?? 'b.id';

        $where = ["1=1"];
        $params = [];

        if (!empty($search)) {
            $where[] = "(b.title LIKE :s1 OR b.isbn LIKE :s2 OR a.name LIKE :s3)";
            $params[':s1'] = "%{$search}%";
            $params[':s2'] = "%{$search}%";
            $params[':s3'] = "%{$search}%";
        }

        if ($categoryId !== null) {
            $where[] = "b.category_id = :cat_id";
            $params[':cat_id'] = $categoryId;
        }

        if ($authorId !== null) {
            $where[] = "b.author_id = :auth_id";
            $params[':auth_id'] = $authorId;
        }

        if ($status !== null) {
            $where[] = "b.status = :status";
            $params[':status'] = $status;
        }

        $whereClause = implode(" AND ", $where);

        // Count total
        $countSql = "
            SELECT COUNT(*) as total 
            FROM books b 
            LEFT JOIN authors a ON b.author_id = a.id 
            LEFT JOIN categories c ON b.category_id = c.id 
            WHERE {$whereClause}
        ";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int)$countStmt->fetch()['total'];

        // Fetch paginated
        $sql = "
            SELECT 
                b.id, b.isbn, b.title, b.author_id, b.category_id, 
                b.publisher, b.publication_year, b.total_copies, b.available_copies, 
                b.shelf_number, b.description, b.status, b.created_at, b.updated_at,
                a.name AS author_name,
                c.name AS category_name
            FROM books b
            LEFT JOIN authors a ON b.author_id = a.id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE {$whereClause}
            ORDER BY {$sortColumn} {$order}
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $books = $stmt->fetchAll();

        sendResponse(true, 'Books retrieved successfully', [
            'books' => $books,
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

        $stmt = $this->db->prepare("
            SELECT 
                b.*,
                a.name AS author_name, a.biography AS author_biography, a.country AS author_country,
                c.name AS category_name, c.description AS category_description,
                (b.total_copies - b.available_copies) AS issued_copies
            FROM books b
            LEFT JOIN authors a ON b.author_id = a.id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.id = :id
            LIMIT 1
        ");
        $stmt->execute([':id' => (int)$id]);
        $book = $stmt->fetch();

        if (!$book) {
            sendResponse(false, 'Book not found', null, 404);
        }

        // Also fetch active and recent issue history for this book
        $historyStmt = $this->db->prepare("
            SELECT i.id, i.issue_date, i.due_date, i.return_date, i.status,
                   m.full_name AS member_name, m.member_code
            FROM issues i
            JOIN members m ON i.member_id = m.id
            WHERE i.book_id = :id
            ORDER BY i.id DESC
            LIMIT 5
        ");
        $historyStmt->execute([':id' => (int)$id]);
        $book['recent_issues'] = $historyStmt->fetchAll();

        sendResponse(true, 'Book retrieved successfully', ['book' => $book]);
    }

    public function create() {
        authenticate();
        $data = getRequestBody();

        $errors = validateRequired($data, [
            'isbn' => 'ISBN',
            'title' => 'Title',
            'author_id' => 'Author',
            'category_id' => 'Category',
            'total_copies' => 'Total Copies'
        ]);

        if (!empty($data['total_copies']) && !validatePositiveInt($data['total_copies'])) {
            $errors['total_copies'] = 'Total copies must be a positive integer greater than 0';
        }

        $currentYear = (int)date('Y');
        if (!empty($data['publication_year']) && (!is_numeric($data['publication_year']) || (int)$data['publication_year'] < 1000 || (int)$data['publication_year'] > $currentYear + 1)) {
            $errors['publication_year'] = 'Please enter a valid publication year';
        }

        if (!empty($errors)) {
            sendResponse(false, 'Validation failed', null, 422, $errors);
        }

        $isbn = trim($data['isbn']);
        $title = sanitizeString($data['title']);
        $authorId = (int)$data['author_id'];
        $categoryId = (int)$data['category_id'];
        $publisher = isset($data['publisher']) ? sanitizeString($data['publisher']) : null;
        $publicationYear = !empty($data['publication_year']) ? (int)$data['publication_year'] : null;
        $totalCopies = (int)$data['total_copies'];
        $availableCopies = isset($data['available_copies']) ? (int)$data['available_copies'] : $totalCopies;
        $shelfNumber = isset($data['shelf_number']) ? sanitizeString($data['shelf_number']) : null;
        $description = isset($data['description']) ? sanitizeString($data['description']) : null;

        if ($availableCopies > $totalCopies) {
            sendResponse(false, 'Available copies cannot exceed total copies', null, 422, [
                'available_copies' => 'Available copies cannot exceed total copies'
            ]);
        }

        $status = $availableCopies > 0 ? 'Available' : 'Unavailable';

        // Check duplicate ISBN
        $checkIsbn = $this->db->prepare("SELECT id FROM books WHERE isbn = :isbn LIMIT 1");
        $checkIsbn->execute([':isbn' => $isbn]);
        if ($checkIsbn->fetch()) {
            sendResponse(false, 'A book with this ISBN already exists', null, 409, ['isbn' => 'ISBN already exists']);
        }

        // Verify author and category exist
        $checkAuthor = $this->db->prepare("SELECT id FROM authors WHERE id = :id LIMIT 1");
        $checkAuthor->execute([':id' => $authorId]);
        if (!$checkAuthor->fetch()) {
            sendResponse(false, 'Selected author does not exist', null, 404, ['author_id' => 'Author not found']);
        }

        $checkCat = $this->db->prepare("SELECT id FROM categories WHERE id = :id LIMIT 1");
        $checkCat->execute([':id' => $categoryId]);
        if (!$checkCat->fetch()) {
            sendResponse(false, 'Selected category does not exist', null, 404, ['category_id' => 'Category not found']);
        }

        $stmt = $this->db->prepare("
            INSERT INTO books (
                isbn, title, author_id, category_id, publisher, publication_year,
                total_copies, available_copies, shelf_number, description, status
            ) VALUES (
                :isbn, :title, :author_id, :category_id, :publisher, :publication_year,
                :total_copies, :available_copies, :shelf_number, :description, :status
            )
        ");

        $stmt->execute([
            ':isbn' => $isbn,
            ':title' => $title,
            ':author_id' => $authorId,
            ':category_id' => $categoryId,
            ':publisher' => $publisher,
            ':publication_year' => $publicationYear,
            ':total_copies' => $totalCopies,
            ':available_copies' => $availableCopies,
            ':shelf_number' => $shelfNumber,
            ':description' => $description,
            ':status' => $status
        ]);

        $newId = $this->db->lastInsertId();
        sendResponse(true, 'Book created successfully', ['id' => (int)$newId], 201);
    }

    public function update($id) {
        authenticate();
        $id = (int)$id;

        // Fetch existing book
        $stmt = $this->db->prepare("SELECT * FROM books WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $existing = $stmt->fetch();
        if (!$existing) {
            sendResponse(false, 'Book not found', null, 404);
        }

        $data = getRequestBody();
        $errors = validateRequired($data, [
            'isbn' => 'ISBN',
            'title' => 'Title',
            'author_id' => 'Author',
            'category_id' => 'Category',
            'total_copies' => 'Total Copies'
        ]);

        if (!empty($data['total_copies']) && !validatePositiveInt($data['total_copies'])) {
            $errors['total_copies'] = 'Total copies must be a positive integer greater than 0';
        }

        if (!empty($errors)) {
            sendResponse(false, 'Validation failed', null, 422, $errors);
        }

        $isbn = trim($data['isbn']);
        $title = sanitizeString($data['title']);
        $authorId = (int)$data['author_id'];
        $categoryId = (int)$data['category_id'];
        $publisher = isset($data['publisher']) ? sanitizeString($data['publisher']) : null;
        $publicationYear = !empty($data['publication_year']) ? (int)$data['publication_year'] : null;
        $newTotalCopies = (int)$data['total_copies'];
        $shelfNumber = isset($data['shelf_number']) ? sanitizeString($data['shelf_number']) : null;
        $description = isset($data['description']) ? sanitizeString($data['description']) : null;

        // Check unique ISBN excluding this book
        $checkIsbn = $this->db->prepare("SELECT id FROM books WHERE isbn = :isbn AND id != :id LIMIT 1");
        $checkIsbn->execute([':isbn' => $isbn, ':id' => $id]);
        if ($checkIsbn->fetch()) {
            sendResponse(false, 'A book with this ISBN already exists', null, 409, ['isbn' => 'ISBN already exists']);
        }

        // Calculate currently issued copies
        $currentlyIssued = (int)$existing['total_copies'] - (int)$existing['available_copies'];

        if ($newTotalCopies < $currentlyIssued) {
            sendResponse(false, "Cannot set total copies to {$newTotalCopies} because {$currentlyIssued} copies are currently issued to members.", null, 422, [
                'total_copies' => "Total copies cannot be less than currently issued copies ({$currentlyIssued})."
            ]);
        }

        // Adjust available copies based on new total copies
        $diff = $newTotalCopies - (int)$existing['total_copies'];
        $newAvailableCopies = max(0, (int)$existing['available_copies'] + $diff);
        $newStatus = $newAvailableCopies > 0 ? 'Available' : 'Unavailable';

        $updateStmt = $this->db->prepare("
            UPDATE books SET 
                isbn = :isbn,
                title = :title,
                author_id = :author_id,
                category_id = :category_id,
                publisher = :publisher,
                publication_year = :publication_year,
                total_copies = :total_copies,
                available_copies = :available_copies,
                shelf_number = :shelf_number,
                description = :description,
                status = :status
            WHERE id = :id
        ");

        $updateStmt->execute([
            ':isbn' => $isbn,
            ':title' => $title,
            ':author_id' => $authorId,
            ':category_id' => $categoryId,
            ':publisher' => $publisher,
            ':publication_year' => $publicationYear,
            ':total_copies' => $newTotalCopies,
            ':available_copies' => $newAvailableCopies,
            ':shelf_number' => $shelfNumber,
            ':description' => $description,
            ':status' => $newStatus,
            ':id' => $id
        ]);

        sendResponse(true, 'Book updated successfully');
    }

    public function delete($id) {
        authenticate();
        $id = (int)$id;

        // Check if book exists
        $stmt = $this->db->prepare("SELECT id, title FROM books WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $book = $stmt->fetch();
        if (!$book) {
            sendResponse(false, 'Book not found', null, 404);
        }

        // Check whether the book has active issues
        $issueStmt = $this->db->prepare("
            SELECT COUNT(*) AS active_count 
            FROM issues 
            WHERE book_id = :id AND status IN ('Issued', 'Overdue')
        ");
        $issueStmt->execute([':id' => $id]);
        $activeCount = (int)$issueStmt->fetch()['active_count'];

        if ($activeCount > 0) {
            sendResponse(false, "Unable to delete this book because {$activeCount} copy/copies are currently issued to members.", null, 409);
        }

        // Delete book
        $delStmt = $this->db->prepare("DELETE FROM books WHERE id = :id");
        $delStmt->execute([':id' => $id]);

        sendResponse(true, "Book '{$book['title']}' deleted successfully.");
    }
}
