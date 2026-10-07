<?php
/**
 * Authentication Controller
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../middleware/auth.php';

class AuthController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function login() {
        $data = getRequestBody();
        $errors = validateRequired($data, [
            'email' => 'Email',
            'password' => 'Password'
        ]);

        if (!empty($errors)) {
            sendResponse(false, 'Validation failed', null, 422, $errors);
        }

        $email = trim($data['email']);
        $password = (string)$data['password'];

        $stmt = $this->db->prepare("SELECT id, name, email, password, role FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            sendResponse(false, 'Invalid email or password', null, 401);
        }

        // Generate a 64-character secure token
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));

        $tokenStmt = $this->db->prepare("
            INSERT INTO user_tokens (user_id, token, expires_at)
            VALUES (:user_id, :token, :expires_at)
        ");
        $tokenStmt->execute([
            ':user_id' => $user['id'],
            ':token' => $token,
            ':expires_at' => $expiresAt
        ]);

        unset($user['password']);

        sendResponse(true, 'Login successful', [
            'user' => $user,
            'token' => $token
        ]);
    }

    public function register() {
        $data = getRequestBody();
        $errors = validateRequired($data, [
            'name' => 'Full Name',
            'email' => 'Email',
            'password' => 'Password'
        ]);

        if (!empty($data['email']) && !validateEmail($data['email'])) {
            $errors['email'] = 'Please enter a valid email address';
        }

        if (!empty($data['password']) && strlen($data['password']) < 6) {
            $errors['password'] = 'Password must be at least 6 characters long';
        }

        if (!empty($errors)) {
            sendResponse(false, 'Validation failed', null, 422, $errors);
        }

        $name = sanitizeString($data['name']);
        $email = trim($data['email']);
        $password = (string)$data['password'];
        $role = (!empty($data['role']) && in_array($data['role'], ['admin', 'librarian'])) ? $data['role'] : 'admin';

        // Check duplicate email
        $checkStmt = $this->db->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
        $checkStmt->execute([':email' => $email]);
        if ($checkStmt->fetch()) {
            sendResponse(false, 'Email is already registered', null, 409, ['email' => 'Email already exists']);
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $insertStmt = $this->db->prepare("
            INSERT INTO users (name, email, password, role)
            VALUES (:name, :email, :password, :role)
        ");
        $insertStmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':password' => $hashedPassword,
            ':role' => $role
        ]);

        $userId = $this->db->lastInsertId();

        // Generate token for auto-login
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));

        $tokenStmt = $this->db->prepare("
            INSERT INTO user_tokens (user_id, token, expires_at)
            VALUES (:user_id, :token, :expires_at)
        ");
        $tokenStmt->execute([
            ':user_id' => $userId,
            ':token' => $token,
            ':expires_at' => $expiresAt
        ]);

        sendResponse(true, 'Registration successful', [
            'user' => [
                'id' => (int)$userId,
                'name' => $name,
                'email' => $email,
                'role' => $role
            ],
            'token' => $token
        ], 201);
    }

    public function logout() {
        $token = getBearerToken();
        if ($token) {
            $stmt = $this->db->prepare("DELETE FROM user_tokens WHERE token = :token");
            $stmt->execute([':token' => $token]);
        }
        sendResponse(true, 'Logged out successfully');
    }

    public function me() {
        $user = authenticate();
        sendResponse(true, 'Current user retrieved', ['user' => $user]);
    }
}
