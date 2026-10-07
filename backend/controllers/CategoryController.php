<?php
/**
 * Category Management Controller
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../middleware/auth.php';

class CategoryController {
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
            $where[] = "(c.name LIKE :s1 OR c.description LIKE :s2)";
            $params[':s1'] = "%{$search}%";
            $params[':s2'] = "%{$search}%";
        }

        $whereClause = implode(" AND ", $where);

        $countSql = "SELECT COUNT(*) as total FROM categories c WHERE {$whereClause}";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int)$countStmt->fetch()['total'];

        $sql = "
            SELECT 
                c.*,
                (SELECT COUNT(*) FROM books b WHERE b.category_id = c.id) AS books_count
            FROM categories c
            WHERE {$whereClause}
            ORDER BY c.name ASC
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
        $categories = $stmt->fetchAll();

        sendResponse(true, 'Categories retrieved successfully', [
            'categories' => $categories,
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
            SELECT c.*, (SELECT COUNT(*) FROM books b WHERE b.category_id = c.id) AS books_count
            FROM categories c 
            WHERE c.id = :id 
            LIMIT 1
        ");
        $stmt->execute([':id' => $id]);
        $category = $stmt->fetch();

        if (!$category) {
            sendResponse(false, 'Category not found', null, 404);
        }

        sendResponse(true, 'Category retrieved successfully', ['category' => $category]);
    }

    public function create() {
        authenticate();
        $data = getRequestBody();

        $errors = validateRequired($data, [
            'name' => 'Category Name'
        ]);

        if (!empty($errors)) {
            sendResponse(false, 'Validation failed', null, 422, $errors);
        }

        $name = sanitizeString($data['name']);
        $description = isset($data['description']) ? sanitizeString($data['description']) : null;

        // Check duplicate name
        $checkStmt = $this->db->prepare("SELECT id FROM categories WHERE name = :name LIMIT 1");
        $checkStmt->execute([':name' => $name]);
        if ($checkStmt->fetch()) {
            sendResponse(false, 'Category name already exists', null, 409, ['name' => 'Category name already exists']);
        }

        $insertStmt = $this->db->prepare("INSERT INTO categories (name, description) VALUES (:name, :description)");
        $insertStmt->execute([
            ':name' => $name,
            ':description' => $description
        ]);

        $newId = $this->db->lastInsertId();
        sendResponse(true, 'Category created successfully', ['id' => (int)$newId], 201);
    }

    public function update($id) {
        authenticate();
        $id = (int)$id;

        $stmt = $this->db->prepare("SELECT id FROM categories WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        if (!$stmt->fetch()) {
            sendResponse(false, 'Category not found', null, 404);
        }

        $data = getRequestBody();
        $errors = validateRequired($data, [
            'name' => 'Category Name'
        ]);

        if (!empty($errors)) {
            sendResponse(false, 'Validation failed', null, 422, $errors);
        }

        $name = sanitizeString($data['name']);
        $description = isset($data['description']) ? sanitizeString($data['description']) : null;

        // Check duplicate name excluding current
        $checkStmt = $this->db->prepare("SELECT id FROM categories WHERE name = :name AND id != :id LIMIT 1");
        $checkStmt->execute([':name' => $name, ':id' => $id]);
        if ($checkStmt->fetch()) {
            sendResponse(false, 'Category name already exists', null, 409, ['name' => 'Category name already exists']);
        }

        $updateStmt = $this->db->prepare("UPDATE categories SET name = :name, description = :description WHERE id = :id");
        $updateStmt->execute([
            ':name' => $name,
            ':description' => $description,
            ':id' => $id
        ]);

        sendResponse(true, 'Category updated successfully');
    }

    public function delete($id) {
        authenticate();
        $id = (int)$id;

        $stmt = $this->db->prepare("SELECT id, name FROM categories WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $category = $stmt->fetch();
        if (!$category) {
            sendResponse(false, 'Category not found', null, 404);
        }

        // Check whether books exist for this category
        $bookCountStmt = $this->db->prepare("SELECT COUNT(*) AS total FROM books WHERE category_id = :id");
        $bookCountStmt->execute([':id' => $id]);
        $booksCount = (int)$bookCountStmt->fetch()['total'];

        if ($booksCount > 0) {
            sendResponse(false, "Cannot delete category '{$category['name']}' because {$booksCount} book(s) belong to it. Reassign or remove the books first.", null, 409);
        }

        $delStmt = $this->db->prepare("DELETE FROM categories WHERE id = :id");
        $delStmt->execute([':id' => $id]);

        sendResponse(true, "Category '{$category['name']}' deleted successfully.");
    }
}
