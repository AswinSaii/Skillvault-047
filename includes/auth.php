<?php
/**
 * User Authentication Functions
 */
require_once dirname(__DIR__) . '/config/config.php';

/**
 * Register a new user
 */
function registerUser($data) {
    global $conn;
    
    // Validate required fields
    if (empty($data['email']) || empty($data['password']) || empty($data['first_name'])) {
        return ['success' => false, 'message' => 'Please fill in all required fields'];
    }
    
    // Validate email format
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        return ['success' => false, 'message' => 'Invalid email format'];
    }
    
    // Check if email exists
    $email = escape($data['email']);
    $result = query("SELECT id FROM users WHERE email = '$email'");
    if (numRows($result) > 0) {
        return ['success' => false, 'message' => 'Email already registered'];
    }
    
    // For students and faculty, verify college
    if (in_array($data['role_id'], [ROLE_STUDENT, ROLE_FACULTY])) {
        if (empty($data['college_id'])) {
            return ['success' => false, 'message' => 'Please select a college'];
        }
        
        // Check if college is verified
        $collegeId = (int)$data['college_id'];
        $result = query("SELECT verification_status FROM colleges WHERE id = $collegeId");
        $college = fetch($result);
        
        if (!$college || $college['verification_status'] !== 'approved') {
            return ['success' => false, 'message' => 'Selected college is not verified. Registration is only allowed for verified colleges.'];
        }
    }
    
    // Hash password
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Prepare data
    $firstName = escape($data['first_name']);
    $lastName = escape($data['last_name'] ?? '');
    $roleId = (int)$data['role_id'];
    $collegeId = isset($data['college_id']) ? (int)$data['college_id'] : 'NULL';
    $phone = escape($data['phone'] ?? '');
    $department = escape($data['department'] ?? '');
    $enrollmentNumber = escape($data['enrollment_number'] ?? '');
    $graduationYear = isset($data['graduation_year']) ? (int)$data['graduation_year'] : 'NULL';
    $companyName = escape($data['company_name'] ?? '');
    $designation = escape($data['designation'] ?? '');
    
    // Build query based on role
    $collegeValue = $collegeId === 'NULL' ? 'NULL' : $collegeId;
    $gradValue = $graduationYear === 'NULL' ? 'NULL' : $graduationYear;
    
    $sql = "INSERT INTO users (role_id, college_id, email, password, first_name, last_name, phone, 
            department, enrollment_number, graduation_year, company_name, designation) 
            VALUES ($roleId, $collegeValue, '$email', '$hashedPassword', '$firstName', '$lastName', 
            '$phone', '$department', '$enrollmentNumber', $gradValue, '$companyName', '$designation')";
    
    if (query($sql)) {
        $userId = lastId();
        
        // Create streak record for students
        if ($roleId === ROLE_STUDENT) {
            query("INSERT INTO streaks (user_id) VALUES ($userId)");
        }
        
        return ['success' => true, 'message' => 'Registration successful! You can now login.', 'user_id' => $userId];
    }
    
    return ['success' => false, 'message' => 'Registration failed. Please try again.'];
}

/**
 * Login user
 */
function loginUser($email, $password) {
    global $conn;
    
    $email = escape($email);
    $result = query("SELECT u.*, r.name as role_name, c.name as college_name, c.verification_status 
                     FROM users u 
                     LEFT JOIN roles r ON u.role_id = r.id 
                     LEFT JOIN colleges c ON u.college_id = c.id 
                     WHERE u.email = '$email'");
    
    if (numRows($result) === 0) {
        return ['success' => false, 'message' => 'Invalid email or password'];
    }
    
    $user = fetch($result);
    
    // Verify password
    if (!password_verify($password, $user['password'])) {
        return ['success' => false, 'message' => 'Invalid email or password'];
    }
    
    // Check if account is active
    if (!$user['is_active']) {
        return ['success' => false, 'message' => 'Your account has been deactivated'];
    }
    
    // For college users, check college verification (but not for admin or recruiter)
    if (in_array($user['role_id'], [ROLE_COLLEGE_ADMIN, ROLE_FACULTY, ROLE_STUDENT])) {
        if (empty($user['verification_status']) || $user['verification_status'] !== 'approved') {
            return ['success' => false, 'message' => 'Your college is not yet verified. Please wait for verification.'];
        }
    }
    
    // Update last login
    $userId = $user['id'];
    query("UPDATE users SET last_login = NOW() WHERE id = $userId");
    
    // Set session (ensure role_id is stored as integer)
    $_SESSION['user_id'] = (int)$user['id'];
    $_SESSION['user_role'] = (int)$user['role_id'];
    $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['college_id'] = $user['college_id'];
    $_SESSION['college_name'] = $user['college_name'];
    
    return ['success' => true, 'message' => 'Login successful', 'user' => $user];
}

/**
 * Logout user
 */
function logoutUser() {
    session_unset();
    session_destroy();
    return ['success' => true, 'message' => 'Logged out successfully'];
}

/**
 * Get user by ID
 */
function getUserById($id) {
    $id = (int)$id;
    $result = query("SELECT u.*, r.name as role_name, c.name as college_name 
                     FROM users u 
                     LEFT JOIN roles r ON u.role_id = r.id 
                     LEFT JOIN colleges c ON u.college_id = c.id 
                     WHERE u.id = $id");
    return fetch($result);
}

/**
 * Update user profile
 */
function updateUserProfile($userId, $data) {
    $userId = (int)$userId;
    
    $updates = [];
    
    if (isset($data['first_name'])) {
        $updates[] = "first_name = '" . escape($data['first_name']) . "'";
    }
    if (isset($data['last_name'])) {
        $updates[] = "last_name = '" . escape($data['last_name']) . "'";
    }
    if (isset($data['phone'])) {
        $updates[] = "phone = '" . escape($data['phone']) . "'";
    }
    if (isset($data['department'])) {
        $updates[] = "department = '" . escape($data['department']) . "'";
    }
    
    if (empty($updates)) {
        return ['success' => false, 'message' => 'No data to update'];
    }
    
    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = $userId";
    
    if (query($sql)) {
        return ['success' => true, 'message' => 'Profile updated successfully'];
    }
    
    return ['success' => false, 'message' => 'Update failed'];
}

/**
 * Change password
 */
function changePassword($userId, $currentPassword, $newPassword) {
    $userId = (int)$userId;
    
    // Get current user
    $result = query("SELECT password FROM users WHERE id = $userId");
    $user = fetch($result);
    
    if (!$user) {
        return ['success' => false, 'message' => 'User not found'];
    }
    
    // Verify current password
    if (!password_verify($currentPassword, $user['password'])) {
        return ['success' => false, 'message' => 'Current password is incorrect'];
    }
    
    // Validate new password
    if (strlen($newPassword) < 8) {
        return ['success' => false, 'message' => 'Password must be at least 8 characters'];
    }
    
    // Update password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    if (query("UPDATE users SET password = '$hashedPassword' WHERE id = $userId")) {
        return ['success' => true, 'message' => 'Password changed successfully'];
    }
    
    return ['success' => false, 'message' => 'Failed to change password'];
}

/**
 * Get verified colleges for registration
 */
function getVerifiedColleges() {
    $result = query("SELECT id, name, city, state FROM colleges WHERE verification_status = 'approved' ORDER BY name");
    return fetchAll($result);
}

/**
 * Get dashboard redirect URL based on role
 */
function getDashboardUrl($roleId) {
    switch ($roleId) {
        case ROLE_SUPER_ADMIN:
            return APP_URL . '/admin/index.php';
        case ROLE_COLLEGE_ADMIN:
            return APP_URL . '/college/index.php';
        case ROLE_FACULTY:
            return APP_URL . '/faculty/index.php';
        case ROLE_STUDENT:
            return APP_URL . '/student/index.php';
        case ROLE_RECRUITER:
            return APP_URL . '/recruiter/index.php';
        default:
            return APP_URL;
    }
}
?>
