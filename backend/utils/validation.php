<?php
/**
 * Request Validation Helpers
 */

function getRequestBody() {
    $rawInput = file_get_contents('php://input');
    if (empty($rawInput)) {
        return $_POST;
    }
    $decoded = json_decode($rawInput, true);
    return is_array($decoded) ? $decoded : [];
}

function sanitizeString($val) {
    if ($val === null) return null;
    return trim(htmlspecialchars((string)$val, ENT_QUOTES, 'UTF-8'));
}

function validateRequired($data, array $fields) {
    $errors = [];
    foreach ($fields as $field => $label) {
        if (!isset($data[$field]) || trim((string)$data[$field]) === '') {
            $errors[$field] = "{$label} is required.";
        }
    }
    return $errors;
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validatePositiveInt($val) {
    return filter_var($val, FILTER_VALIDATE_INT) !== false && (int)$val > 0;
}
