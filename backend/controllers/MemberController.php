<?php
/**
 * Member / Student Management Controller
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../middleware/auth.php';

class MemberController {
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
        $status = isset($_GET['status']) && in_array($_GET['status'], ['Active', 'Inactive']) ? $_GET['status'] : null;

        $where = ["1=1"];
        $params = [];

        if (!empty($search)) {
            $where[] = "(m.full_name LIKE :s1 OR m.email LIKE :s2 OR m.member_code LIKE :s3 OR m.phone LIKE :s4)";
            $params[':s1'] = "%{$search}%";
            $params[':s2'] = "%{$search}%";
            $params[':s3'] = "%{$search}%";
            $params[':s4'] = "%{$search}%";
        }

        if ($status !== null) {
            $where[] = "m.status = :status";
            $params[':status'] = $status;
        }

        $whereClause = implode(" AND ", $where);

        $countSql = "SELECT COUNT(*) as total FROM members m WHERE {$whereClause}";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int)$countStmt->fetch()['total'];

        $sql = "
            SELECT 
                m.*,
                (SELECT COUNT(*) FROM issues i WHERE i.member_id = m.id AND i.status IN ('Issued', 'Overdue')) AS active_issues_count
            FROM members m
            WHERE {$whereClause}
            ORDER BY m.id DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $members = $stmt->fetchAll();

        sendResponse(true, 'Members retrieved successfully', [
            'members' => $members,
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

        $stmt = $this->db->prepare("SELECT * FROM members WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $member = $stmt->fetch();

        if (!$member) {
            sendResponse(false, 'Member not found', null, 404);
        }

        // Active and past issues
        $issueStmt = $this->db->prepare("
            SELECT i.*, b.title AS book_title, b.isbn,
                   f.fine_amount, f.payment_status AS fine_payment_status
            FROM issues i
            JOIN books b ON i.book_id = b.id
            LEFT JOIN fines f ON f.issue_id = i.id
            WHERE i.member_id = :id
            ORDER BY i.id DESC
        ");
        $issueStmt->execute([':id' => $id]);
        $member['issues'] = $issueStmt->fetchAll();

        // Calculate pending fine total
        $fineStmt = $this->db->prepare("
            SELECT COALESCE(SUM(fine_amount), 0) AS pending_fines
            FROM fines
            WHERE member_id = :id AND payment_status = 'Pending'
        ");
        $fineStmt->execute([':id' => $id]);
        $member['pending_fines'] = (float)$fineStmt->fetch()['pending_fines'];

        sendResponse(true, 'Member retrieved successfully', ['member' => $member]);
    }

    public function create() {
        authenticate();
        $data = getRequestBody();

        $errors = validateRequired($data, [
            'member_code' => 'Member Code / Student ID',
            'full_name' => 'Full Name',
            'email' => 'Email',
            'phone' => 'Phone Number'
        ]);

        if (!empty($data['email']) && !validateEmail($data['email'])) {
            $errors['email'] = 'Please enter a valid email address';
        }

        if (!empty($errors)) {
            sendResponse(false, 'Validation failed', null, 422, $errors);
        }

        $memberCode = trim($data['member_code']);
        $fullName = sanitizeString($data['full_name']);
        $email = trim($data['email']);
        $phone = trim($data['phone']);
        $department = isset($data['department']) ? sanitizeString($data['department']) : null;
        $course = isset($data['course']) ? sanitizeString($data['course']) : null;
        $year = isset($data['year']) ? sanitizeString($data['year']) : null;
        $address = isset($data['address']) ? sanitizeString($data['address']) : null;
        $joinDate = !empty($data['join_date']) ? $data['join_date'] : date('Y-m-d');
        $status = (!empty($data['status']) && in_array($data['status'], ['Active', 'Inactive'])) ? $data['status'] : 'Active';

        // Check duplicate member code
        $checkCode = $this->db->prepare("SELECT id FROM members WHERE member_code = :code LIMIT 1");
        $checkCode->execute([':code' => $memberCode]);
        if ($checkCode->fetch()) {
            sendResponse(false, 'Member code is already in use', null, 409, ['member_code' => 'Member code already exists']);
        }

        // Check duplicate email
        $checkEmail = $this->db->prepare("SELECT id FROM members WHERE email = :email LIMIT 1");
        $checkEmail->execute([':email' => $email]);
        if ($checkEmail->fetch()) {
            sendResponse(false, 'Email address is already in use', null, 409, ['email' => 'Email already exists']);
        }

        $stmt = $this->db->prepare("
            INSERT INTO members (
                member_code, full_name, email, phone, department, course, year, address, join_date, status
            ) VALUES (
                :member_code, :full_name, :email, :phone, :department, :course, :year, :address, :join_date, :status
            )
        ");

        $stmt->execute([
            ':member_code' => $memberCode,
            ':full_name' => $fullName,
            ':email' => $email,
            ':phone' => $phone,
            ':department' => $department,
            ':course' => $course,
            ':year' => $year,
            ':address' => $address,
            ':join_date' => $joinDate,
            ':status' => $status
        ]);

        $newId = $this->db->lastInsertId();
        sendResponse(true, 'Member created successfully', ['id' => (int)$newId], 201);
    }

    public function update($id) {
        authenticate();
        $id = (int)$id;

        $stmt = $this->db->prepare("SELECT * FROM members WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $existing = $stmt->fetch();
        if (!$existing) {
            sendResponse(false, 'Member not found', null, 404);
        }

        $data = getRequestBody();
        $errors = validateRequired($data, [
            'member_code' => 'Member Code',
            'full_name' => 'Full Name',
            'email' => 'Email',
            'phone' => 'Phone Number'
        ]);

        if (!empty($data['email']) && !validateEmail($data['email'])) {
            $errors['email'] = 'Please enter a valid email address';
        }

        if (!empty($errors)) {
            sendResponse(false, 'Validation failed', null, 422, $errors);
        }

        $memberCode = trim($data['member_code']);
        $fullName = sanitizeString($data['full_name']);
        $email = trim($data['email']);
        $phone = trim($data['phone']);
        $department = isset($data['department']) ? sanitizeString($data['department']) : null;
        $course = isset($data['course']) ? sanitizeString($data['course']) : null;
        $year = isset($data['year']) ? sanitizeString($data['year']) : null;
        $address = isset($data['address']) ? sanitizeString($data['address']) : null;
        $joinDate = !empty($data['join_date']) ? $data['join_date'] : $existing['join_date'];
        $status = (!empty($data['status']) && in_array($data['status'], ['Active', 'Inactive'])) ? $data['status'] : $existing['status'];

        // Check duplicate code excluding current
        $checkCode = $this->db->prepare("SELECT id FROM members WHERE member_code = :code AND id != :id LIMIT 1");
        $checkCode->execute([':code' => $memberCode, ':id' => $id]);
        if ($checkCode->fetch()) {
            sendResponse(false, 'Member code is already in use', null, 409, ['member_code' => 'Member code already exists']);
        }

        // Check duplicate email excluding current
        $checkEmail = $this->db->prepare("SELECT id FROM members WHERE email = :email AND id != :id LIMIT 1");
        $checkEmail->execute([':email' => $email, ':id' => $id]);
        if ($checkEmail->fetch()) {
            sendResponse(false, 'Email address is already in use', null, 409, ['email' => 'Email already exists']);
        }

        $updateStmt = $this->db->prepare("
            UPDATE members SET 
                member_code = :member_code,
                full_name = :full_name,
                email = :email,
                phone = :phone,
                department = :department,
                course = :course,
                year = :year,
                address = :address,
                join_date = :join_date,
                status = :status
            WHERE id = :id
        ");

        $updateStmt->execute([
            ':member_code' => $memberCode,
            ':full_name' => $fullName,
            ':email' => $email,
            ':phone' => $phone,
            ':department' => $department,
            ':course' => $course,
            ':year' => $year,
            ':address' => $address,
            ':join_date' => $joinDate,
            ':status' => $status,
            ':id' => $id
        ]);

        sendResponse(true, 'Member updated successfully');
    }

    public function delete($id) {
        authenticate();
        $id = (int)$id;

        $stmt = $this->db->prepare("SELECT id, full_name FROM members WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $member = $stmt->fetch();
        if (!$member) {
            sendResponse(false, 'Member not found', null, 404);
        }

        // Check if member has active or overdue issued books
        $issueStmt = $this->db->prepare("
            SELECT COUNT(*) AS active_count 
            FROM issues 
            WHERE member_id = :id AND status IN ('Issued', 'Overdue')
        ");
        $issueStmt->execute([':id' => $id]);
        $activeCount = (int)$issueStmt->fetch()['active_count'];

        if ($activeCount > 0) {
            sendResponse(false, "Unable to delete member '{$member['full_name']}' because they currently have {$activeCount} unreturned book(s).", null, 409);
        }

        // Delete member
        $delStmt = $this->db->prepare("DELETE FROM members WHERE id = :id");
        $delStmt->execute([':id' => $id]);

        sendResponse(true, "Member '{$member['full_name']}' deleted successfully.");
    }
}
