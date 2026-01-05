<?php
/**
 * Application Configuration
 * SkillVault - Skill Assessment & Certification Platform
 */

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Application settings
define('APP_NAME', 'SkillVault');
define('APP_VERSION', '1.0.0');
define('APP_URL', 'http://localhost/skillvault');

// Directory paths
define('ROOT_PATH', dirname(__DIR__) . '/');
define('CONFIG_PATH', ROOT_PATH . 'config/');
define('INCLUDES_PATH', ROOT_PATH . 'includes/');
define('ASSETS_PATH', ROOT_PATH . 'assets/');
define('UPLOADS_PATH', ROOT_PATH . 'uploads/');

// Include database
require_once CONFIG_PATH . 'database.php';

// User roles
define('ROLE_SUPER_ADMIN', 1);
define('ROLE_COLLEGE_ADMIN', 2);
define('ROLE_FACULTY', 3);
define('ROLE_STUDENT', 4);
define('ROLE_RECRUITER', 5);

// College verification status
define('COLLEGE_PENDING', 'pending');
define('COLLEGE_APPROVED', 'approved');
define('COLLEGE_REJECTED', 'rejected');

// Assessment difficulty levels
define('DIFFICULTY_EASY', 'easy');
define('DIFFICULTY_MEDIUM', 'medium');
define('DIFFICULTY_HARD', 'hard');

// Streak milestones
define('STREAK_BRONZE', 3);
define('STREAK_SILVER', 7);
define('STREAK_GOLD', 30);

/**
 * Redirect to URL
 */
function redirect($url) {
    header("Location: $url");
    exit();
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

/**
 * Get current user ID
 */
function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}

/**
 * Get current user role
 */
function getCurrentUserRole() {
    return $_SESSION['user_role'] ?? null;
}

/**
 * Get current user data
 */
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    // Try to get from session cache first
    if (isset($_SESSION['user_data'])) {
        return $_SESSION['user_data'];
    }
    
    // Fetch from database
    $userId = getCurrentUserId();
    $result = query("SELECT * FROM users WHERE id = " . (int)$userId);
    $user = fetch($result);
    
    // Cache in session
    if ($user) {
        $_SESSION['user_data'] = $user;
    }
    
    return $user;
}

/**
 * Check if user has specific role
 */
function hasRole($role) {
    return getCurrentUserRole() == $role; // Use == instead of === to allow type coercion
}

/**
 * Require login
 */
function requireLogin() {
    if (!isLoggedIn()) {
        redirect(APP_URL . '/auth/login.php');
    }
}

/**
 * Require specific role
 */
function requireRole($role) {
    requireLogin();
    if (!hasRole($role)) {
        redirect(APP_URL . '/403.php');
    }
}

/**
 * Set flash message
 */
function setFlash($type, $message) {
    $_SESSION['flash'] = [
        'type' => $type,
        'message' => $message
    ];
}

/**
 * Get and clear flash message
 */
function getFlash() {
    if (isset($_SESSION['flash'])) {
        $flash = $_SESSION['flash'];
        unset($_SESSION['flash']);
        return $flash;
    }
    return null;
}

/**
 * Generate random string
 */
function generateToken($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Format date
 */
function formatDate($date, $format = 'M d, Y') {
    return date($format, strtotime($date));
}

/**
 * Sanitize input
 */
function sanitize($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}
?>
