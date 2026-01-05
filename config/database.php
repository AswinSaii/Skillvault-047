<?php
/**
 * Database Configuration
 * SkillVault - Skill Assessment & Certification Platform
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'skillvault');

// Create connection
$conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS);

// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// Create database if not exists
$sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME;
if (!mysqli_query($conn, $sql)) {
    die("Error creating database: " . mysqli_error($conn));
}

// Select database
mysqli_select_db($conn, DB_NAME);

// Set charset
mysqli_set_charset($conn, "utf8mb4");

/**
 * Execute a query and return result
 */
function query($sql) {
    global $conn;
    return mysqli_query($conn, $sql);
}

/**
 * Escape string for SQL
 */
function escape($string) {
    global $conn;
    return mysqli_real_escape_string($conn, $string);
}

/**
 * Get single row
 */
function fetch($result) {
    return mysqli_fetch_assoc($result);
}

/**
 * Get all rows
 */
function fetchAll($result) {
    $rows = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $rows[] = $row;
    }
    return $rows;
}

/**
 * Get last insert ID
 */
function lastId() {
    global $conn;
    return mysqli_insert_id($conn);
}

/**
 * Get number of rows
 */
function numRows($result) {
    return mysqli_num_rows($result);
}
?>
