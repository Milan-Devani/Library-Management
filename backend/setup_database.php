<?php
/**
 * Automated Database Setup & Migration Script
 * Library Management System
 * 
 * Automatically connects to MySQL/MariaDB (testing ports 3306 & 3307),
 * creates the database `library_management` if it does not exist,
 * and executes `database/library_management.sql` to seed all tables and records.
 */

// Allow execution from CLI or Web
$isCli = (php_sapi_name() === 'cli');

function logMsg($msg, $isSuccess = null) {
    global $isCli;
    $prefix = $isSuccess === true ? "[OK] " : ($isSuccess === false ? "[ERROR] " : "[INFO] ");
    if ($isCli) {
        echo $prefix . $msg . PHP_EOL;
    } else {
        $color = $isSuccess === true ? 'green' : ($isSuccess === false ? 'red' : '#333');
        echo "<div style='color:{$color}; font-family:monospace; margin:4px 0;'><strong>{$prefix}</strong> {$msg}</div>";
    }
}

logMsg("=================================================");
logMsg("  Library Management System - Database Installer ");
logMsg("=================================================");

$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$dbName = getenv('DB_NAME') ?: 'library_management';
$ports = [3306, 3307];

$pdo = null;
$connectedPort = null;

// Step 1: Probe MySQL Server Connection
logMsg("Detecting active MySQL/MariaDB service...");

foreach ($ports as $port) {
    try {
        $dsn = "mysql:host={$dbHost};port={$port};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 3,
            PDO::MYSQL_ATTR_MULTI_STATEMENTS => true
        ];
        $testPdo = new PDO($dsn, $dbUser, $dbPass, $options);
        $pdo = $testPdo;
        $connectedPort = $port;
        logMsg("Connected to MySQL server on port {$port} successfully!", true);
        break;
    } catch (PDOException $e) {
        logMsg("Port {$port} not available: " . $e->getMessage());
    }
}

if (!$pdo) {
    logMsg("Could not connect to MySQL server on port 3306 or 3307.", false);
    logMsg("Please verify that:", false);
    logMsg("  1. XAMPP / WAMP / MySQL service is started.", false);
    logMsg("  2. MySQL user is 'root' with empty password (or update backend/config/database.php).", false);
    exit(1);
}

// Step 2: Create Database if not exists
try {
    logMsg("Creating database '{$dbName}' if it doesn't exist...");
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $pdo->exec("USE `{$dbName}`;");
    logMsg("Database '{$dbName}' selected.", true);
} catch (PDOException $e) {
    logMsg("Failed to create/select database: " . $e->getMessage(), false);
    exit(1);
}

// Step 3: Read and Execute SQL Seed File
$sqlFile = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'library_management.sql';

if (!file_exists($sqlFile)) {
    logMsg("SQL file not found at: {$sqlFile}", false);
    exit(1);
}

logMsg("Reading SQL schema and seed data from: {$sqlFile}...");
$sqlContent = file_get_contents($sqlFile);

if (empty($sqlContent)) {
    logMsg("SQL file is empty!", false);
    exit(1);
}

try {
    logMsg("Importing tables and seed records into '{$dbName}'...");
    $pdo->exec($sqlContent);
    logMsg("Database schema imported successfully!", true);
} catch (PDOException $e) {
    logMsg("Error executing SQL script: " . $e->getMessage(), false);
    exit(1);
}

// Step 4: Verify Table Counts
try {
    $tablesStmt = $pdo->query("SHOW TABLES;");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);
    
    logMsg("-------------------------------------------------");
    logMsg("Verification Summary (" . count($tables) . " tables created):", true);
    
    $checkCounts = ['books', 'authors', 'categories', 'members', 'issues', 'users'];
    foreach ($checkCounts as $table) {
        if (in_array($table, $tables)) {
            $count = $pdo->query("SELECT COUNT(*) FROM `{$table}`")->fetchColumn();
            logMsg("  - Table '{$table}': {$count} rows found.", true);
        }
    }
    
    logMsg("-------------------------------------------------");
    logMsg("SETUP COMPLETE! Your database is ready to use.", true);
    logMsg("Default Admin Credentials:");
    logMsg("  Email:    admin@library.com");
    logMsg("  Password: admin123");
    logMsg("=================================================");
} catch (PDOException $e) {
    logMsg("Verification failed: " . $e->getMessage(), false);
}
