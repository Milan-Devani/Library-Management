<?php
/**
 * Library Management System API Entry Point
 */

// Error reporting settings
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Set default timezone
date_default_timezone_set('Asia/Kolkata');

require_once __DIR__ . '/utils/response.php';

// Handle CORS and preflight requests
handleCors();

// Dispatch route
try {
    require_once __DIR__ . '/routes/api.php';
    routeRequest();
} catch (Throwable $e) {
    error_log("Unhandled Exception: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    sendResponse(false, 'An unexpected server error occurred. Please try again.', null, 500, [
        'debug' => $e->getMessage()
    ]);
}
