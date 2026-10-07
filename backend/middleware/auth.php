<?php
/**
 * Authentication Middleware
 * Checks Bearer Token in Authorization header.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

function getBearerToken() {
    $header = null;
    if (isset($_SERVER['Authorization'])) {
        $header = trim($_SERVER['Authorization']);
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $header = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (isset($requestHeaders['Authorization'])) {
            $header = trim($requestHeaders['Authorization']);
        }
    }

    if (!empty($header) && preg_match('/Bearer\s(\S+)/i', $header, $matches)) {
        return $matches[1];
    }
    return null;
}

function authenticate() {
    $token = getBearerToken();
    if (!$token) {
        sendResponse(false, 'Authentication token missing. Please login.', null, 401);
    }

    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("
        SELECT u.id, u.name, u.email, u.role 
        FROM user_tokens ut
        JOIN users u ON ut.user_id = u.id
        WHERE ut.token = :token AND ut.expires_at > NOW()
        LIMIT 1
    ");
    $stmt->execute([':token' => $token]);
    $user = $stmt->fetch();

    if (!$user) {
        sendResponse(false, 'Invalid or expired session. Please log in again.', null, 401);
    }

    return $user;
}
