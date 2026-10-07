<?php
/**
 * Author Management Controller
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../middleware/auth.php';

class AuthorController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll() {
        authenticate();

        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : null;
        $limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 10;

        $where = ["1=1"];
        $params = [];

        if (!empty($search)) {
            $where[] = "(a.name LIKE :s1 OR a.country LIKE :s2 OR a.biography LIKE :s3)";
            $params[':s1'] = "%{$search}%";
            $params[':s2'] = "%{$search}%";
            $params[':s3'] = "%{$search}%";
        }

        $whereClause = implode(" AND ", $where);

        $countSql = "SELECT COUNT(*) as total FROM authors a WHERE {$whereClause}";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int)$countStmt->fetch()['total'];

        $sql = "
            SELECT 
                a.*,
                (SELECT COUNT(*) FROM books b WHERE b.author_id = a.id) AS books_count
            FROM authors a
            WHERE {$whereClause}
            ORDER BY a.name ASC
        ";

        if ($page !== null) {
            $offset = ($page - 1) * $limit;
            $sql .= " LIMIT :limit OFFSET :offset";
        }

        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        if ($page !== null) {
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        }
        $stmt->execute();
        $authors = $stmt->fetchAll();

        sendResponse(true, 'Authors retrieved successfully', [
            'authors' => $authors,
            'pagination' => [
                'total' => $total,
                'page' => $page ?? 1,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    public function getById($id) {
        authenticate();
        $id = (int)$id;

        $stmt = $this->db->prepare("
            SELECT a.*, (SELECT COUNT(*) FROM books b WHERE b.author_id = a.id) AS books_count
            FROM authors a 
            WHERE a.id = :id 
            LIMIT 1
        ");
        $stmt->execute([':id' => $id]);
        $author = $stmt->fetch();

        if (!$author) {
            sendResponse(false, 'Author not found', null, 404);
        }

        // Fetch books written by this author
        $bookStmt = $this->db->prepare("SELECT id, title, isbn, publication_year, available_copies FROM books WHERE author_id = :id");
        $bookStmt->execute([':id' => $id]);
        $author['books'] = $bookStmt->fetchAll();

        sendResponse(true, 'Author retrieved successfully', ['author' => $author]);
    }

    public function create() {
        authenticate();
        $data = getRequestBody();

        $errors = validateRequired($data, [
            'name' => 'Author Name'
        ]);

        if (!empty($errors)) {
            sendResponse(false, 'Validation failed', null, 422, $errors);
        }

        $name = sanitizeString($data['name']);
        $biography = isset($data['biography']) ? sanitizeString($data['biography']) : null;
        $country = isset($data['country']) ? sanitizeString($data['country']) : null;

        $insertStmt = $this->db->prepare("INSERT INTO authors (name, biography, country) VALUES (:name, :biography, :country)");
        $insertStmt->execute([
            ':name' => $name,
            ':biography' => $biography,
            ':country' => $country
        ]);

        $newId = $this->db->lastInsertId();
        sendResponse(true, 'Author created successfully', ['id' => (int)$newId], 201);
    }

    public function update($id) {
        authenticate();
        $id = (int)$id;

        $stmt = $this->db->prepare("SELECT id FROM authors WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        if (!$stmt->fetch()) {
            sendResponse(false, 'Author not found', null, 404);
        }

        $data = getRequestBody();
        $errors = validateRequired($data, [
            'name' => 'Author Name'
        ]);

        if (!empty($errors)) {
            sendResponse(false, 'Validation failed', null, 422, $errors);
        }

        $name = sanitizeString($data['name']);
        $biography = isset($data['biography']) ? sanitizeString($data['biography']) : null;
        $country = isset($data['country']) ? sanitizeString($data['country']) : null;

        $updateStmt = $this->db->prepare("UPDATE authors SET name = :name, biography = :biography, country = :country WHERE id = :id");
        $updateStmt->execute([
            ':name' => $name,
            ':biography' => $biography,
            ':country' => $country,
            ':id' => $id
        ]);

        sendResponse(true, 'Author updated successfully');
    }

    public function delete($id) {
        authenticate();
        $id = (int)$id;

        $stmt = $this->db->prepare("SELECT id, name FROM authors WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $author = $stmt->fetch();
        if (!$author) {
            sendResponse(false, 'Author not found', null, 404);
        }

        // Check if books are associated with author
        $bookCountStmt = $this->db->prepare("SELECT COUNT(*) AS total FROM books WHERE author_id = :id");
        $bookCountStmt->execute([':id' => $id]);
        $booksCount = (int)$bookCountStmt->fetch()['total'];

        if ($booksCount > 0) {
            sendResponse(false, "Cannot delete author '{$author['name']}' because {$booksCount} book(s) are associated with this author. Please reassign or delete the books first.", null, 409);
        }

        $delStmt = $this->db->prepare("DELETE FROM authors WHERE id = :id");
        $delStmt->execute([':id' => $id]);

        sendResponse(true, "Author '{$author['name']}' deleted successfully.");
    }
}
