<?php
/**
 * Admin Debug Tool - For Development Only
 * DELETE THIS FILE IN PRODUCTION!
 */
require_once 'config/config.php';

echo "<!DOCTYPE html><html><head><title>Admin Debug Tool</title>";
echo "<style>body{font-family:Arial;padding:20px;} table{border-collapse:collapse;margin:20px 0;} td,th{border:1px solid #ddd;padding:12px;text-align:left;} .success{background:#10b981;color:white;padding:15px;border-radius:5px;margin:20px 0;} .error{background:#ef4444;color:white;padding:15px;border-radius:5px;margin:20px 0;} .warning{background:#f59e0b;color:white;padding:15px;border-radius:5px;margin:20px 0;} .info{background:#3b82f6;color:white;padding:15px;border-radius:5px;margin:20px 0;}</style>";
echo "</head><body>";

echo "<h1>🔧 Admin Debug Tool</h1>";

// Check if user is logged in
if (isLoggedIn()) {
    echo "<div class='success'>";
    echo "<h3>✓ You are currently logged in!</h3>";
    echo "<table style='background:white;color:black;'>";
    echo "<tr><td><strong>Session User ID:</strong></td><td>" . $_SESSION['user_id'] . "</td></tr>";
    echo "<tr><td><strong>Session Role ID:</strong></td><td>" . $_SESSION['user_role'] . "</td></tr>";
    echo "<tr><td><strong>Session Name:</strong></td><td>" . htmlspecialchars($_SESSION['user_name']) . "</td></tr>";
    echo "<tr><td><strong>Session Email:</strong></td><td>" . htmlspecialchars($_SESSION['user_email']) . "</td></tr>";
    echo "<tr><td><strong>Expected Super Admin Role:</strong></td><td>" . ROLE_SUPER_ADMIN . "</td></tr>";
    echo "<tr><td><strong>Role Match:</strong></td><td style='font-weight:bold;color:" . ($_SESSION['user_role'] == ROLE_SUPER_ADMIN ? 'green' : 'red') . ";'>" . ($_SESSION['user_role'] == ROLE_SUPER_ADMIN ? 'YES ✓' : 'NO ✗ (Got: ' . $_SESSION['user_role'] . ')') . "</td></tr>";
    echo "<tr><td><strong>hasRole(ROLE_SUPER_ADMIN):</strong></td><td style='font-weight:bold;color:" . (hasRole(ROLE_SUPER_ADMIN) ? 'green' : 'red') . ";'>" . (hasRole(ROLE_SUPER_ADMIN) ? 'TRUE ✓' : 'FALSE ✗') . "</td></tr>";
    echo "</table>";
    echo "<p><a href='admin/index.php' style='color:white;text-decoration:underline;font-size:16px;'>→ Try accessing Admin Dashboard</a></p>";
    echo "<p><a href='auth/logout.php' style='color:white;text-decoration:underline;'>Logout</a></p>";
    echo "</div>";
} else {
    echo "<div class='warning'>";
    echo "<h3>⚠ You are not logged in</h3>";
    echo "<p><a href='auth/login.php' style='color:white;text-decoration:underline;'>Go to Login Page</a></p>";
    echo "</div>";
}

// Get the admin user from database
$result = query("SELECT id, email, password, first_name, last_name, role_id, is_active FROM users WHERE email = 'admin@skillvault.com'");

if (numRows($result) > 0) {
    $user = fetch($result);
    
    echo "<h2>Database Admin Account Info</h2>";
    echo "<table>";
    echo "<tr><td><strong>Email:</strong></td><td>" . htmlspecialchars($user['email']) . "</td></tr>";
    echo "<tr><td><strong>ID:</strong></td><td>" . $user['id'] . "</td></tr>";
    echo "<tr><td><strong>Name:</strong></td><td>" . htmlspecialchars($user['first_name'] . ' ' . $user['last_name']) . "</td></tr>";
    echo "<tr><td><strong>Role ID in DB:</strong></td><td>" . $user['role_id'] . " (Expected: " . ROLE_SUPER_ADMIN . ")</td></tr>";
    echo "<tr><td><strong>Role Match:</strong></td><td style='font-weight:bold;color:" . ($user['role_id'] == ROLE_SUPER_ADMIN ? 'green' : 'red') . ";'>" . ($user['role_id'] == ROLE_SUPER_ADMIN ? 'YES ✓' : 'NO ✗') . "</td></tr>";
    echo "<tr><td><strong>Is Active:</strong></td><td>" . ($user['is_active'] ? 'Yes ✓' : 'No ✗') . "</td></tr>";
    echo "<tr><td><strong>Password Hash:</strong></td><td style='font-family:monospace;font-size:10px;word-break:break-all;'>" . htmlspecialchars($user['password']) . "</td></tr>";
    echo "</table>";
    
    // Test password
    $testPassword = 'admin123';
    $isValid = password_verify($testPassword, $user['password']);
    
    if ($isValid) {
        echo "<div class='success'>";
        echo "<h3>✓ Password Test: PASSED</h3>";
        echo "<p>The password 'admin123' is correct!</p>";
        echo "</div>";
    } else {
        echo "<div class='error'>";
        echo "<h3>✗ Password Test: FAILED</h3>";
        echo "<p>The password 'admin123' does NOT match the database hash.</p>";
        echo "<form method='POST'>";
        echo "<button type='submit' name='fix_password' style='padding:10px 20px;background:white;color:#ef4444;border:2px solid white;border-radius:5px;cursor:pointer;font-size:16px;font-weight:bold;'>Fix Password Now</button>";
        echo "</form>";
        echo "</div>";
        
        if (isset($_POST['fix_password'])) {
            $newHash = password_hash($testPassword, PASSWORD_DEFAULT);
            $userId = $user['id'];
            if (query("UPDATE users SET password = '$newHash' WHERE id = $userId")) {
                echo "<div class='success'><p style='margin:0;'>✓ Password updated! <a href='auth/login.php' style='color:white;text-decoration:underline;'>Login now</a></p></div>";
            }
        }
    }
    
    // Check roles table
    echo "<h2>Roles in Database</h2>";
    $rolesResult = query("SELECT * FROM roles ORDER BY id");
    echo "<table><tr><th>ID</th><th>Name</th><th>Description</th></tr>";
    while ($role = fetch($rolesResult)) {
        $highlight = ($role['id'] == ROLE_SUPER_ADMIN) ? 'background:#e0e7ff;' : '';
        echo "<tr style='$highlight'><td>" . $role['id'] . "</td><td>" . htmlspecialchars($role['name']) . "</td><td>" . htmlspecialchars($role['description']) . "</td></tr>";
    }
    echo "</table>";
    
} else {
    echo "<div class='error'>";
    echo "<h2>✗ Admin User Not Found!</h2>";
    echo "<p>The admin user doesn't exist in the database. You need to run the schema.sql file first.</p>";
    echo "</div>";
}

// Check constants
echo "<h2>Role Constants</h2>";
echo "<table>";
echo "<tr><td><strong>ROLE_SUPER_ADMIN</strong></td><td>" . ROLE_SUPER_ADMIN . "</td></tr>";
echo "<tr><td><strong>ROLE_COLLEGE_ADMIN</strong></td><td>" . ROLE_COLLEGE_ADMIN . "</td></tr>";
echo "<tr><td><strong>ROLE_FACULTY</strong></td><td>" . ROLE_FACULTY . "</td></tr>";
echo "<tr><td><strong>ROLE_STUDENT</strong></td><td>" . ROLE_STUDENT . "</td></tr>";
echo "<tr><td><strong>ROLE_RECRUITER</strong></td><td>" . ROLE_RECRUITER . "</td></tr>";
echo "</table>";

echo "<hr>";
echo "<div class='error'>";
echo "<p style='margin:0;'><strong>⚠️ SECURITY WARNING:</strong> Delete this file (debug-admin.php) after debugging!</p>";
echo "</div>";

echo "</body></html>";
?>
