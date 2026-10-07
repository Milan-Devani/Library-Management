<?php
/**
 * Settings Management Controller
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../middleware/auth.php';

class SettingController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll() {
        authenticate();

        $stmt = $this->db->query("SELECT setting_key, setting_value, description FROM settings");
        $rows = $stmt->fetchAll();

        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        sendResponse(true, 'Settings retrieved successfully', ['settings' => $settings]);
    }

    public function update() {
        authenticate();
        $data = getRequestBody();

        $allowedKeys = [
            'library_name',
            'fine_per_day',
            'max_issue_days',
            'max_books_per_member',
            'contact_email',
            'contact_phone',
            'currency_symbol'
        ];

        $updateStmt = $this->db->prepare("
            INSERT INTO settings (setting_key, setting_value) 
            VALUES (:key, :val) 
            ON DUPLICATE KEY UPDATE setting_value = :val2
        ");

        foreach ($data as $key => $val) {
            if (in_array($key, $allowedKeys)) {
                $valStr = (string)$val;
                $updateStmt->execute([
                    ':key' => $key,
                    ':val' => $valStr,
                    ':val2' => $valStr
                ]);
            }
        }

        $this->getAll();
    }
}
