<?php
/**
 * Utility functions for API Responses and CORS headers
 */

function handleCors() {
    // Allow from any origin in development
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    } else {
        header("Access-Control-Allow-Origin: *");
    }

    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");

    // Handle OPTIONS preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

function sendResponse($success, $message, $data = null, $statusCode = 200, $errors = null) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');

    $response = [
        'success' => (bool)$success,
        'message' => $message
    ];

    if ($data !== null) {
        $response['data'] = $data;
    }

    if ($errors !== null) {
        $response['errors'] = $errors;
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}
