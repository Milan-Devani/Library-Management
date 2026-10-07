<?php
/**
 * Database Connection Configuration
 * Uses PDO with prepared statements for security.
 */

class Database {
    private static $instance = null;
    private $pdo;

    private function __construct() {
        // Load configuration with environment variables or standard defaults
        $host = getenv('DB_HOST') ?: '127.0.0.1';
        $dbName = getenv('DB_NAME') ?: 'library_management';
        $user = getenv('DB_USER') ?: 'root';
        $pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
        $port = getenv('DB_PORT') ?: '3306';

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ];

        // Attempt primary connection
        try {
            $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
            $this->pdo = new PDO($dsn, $user, $pass, $options);
        } catch (PDOException $e) {
            // Fallback attempt: if default port 3306 failed, try 3307 (common secondary port)
            if ($port === '3306') {
                try {
                    $dsnFallback = "mysql:host={$host};port=3307;dbname={$dbName};charset=utf8mb4";
                    $this->pdo = new PDO($dsnFallback, $user, $pass, $options);
                    return;
                } catch (PDOException $e2) {
                    // If connecting to 3307 with $pass failed, try with empty password (standard for local XAMPP MariaDB)
                    try {
                        $this->pdo = new PDO($dsnFallback, $user, '', $options);
                        return;
                    } catch (PDOException $e3) {
                        // Ignore fallback failure and throw original error
                    }
                }
            }

            // Return safe error message
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage(),
                'hint' => 'Ensure MySQL service is running and database library_management is imported.'
            ]);
            exit;
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->pdo;
    }
}
