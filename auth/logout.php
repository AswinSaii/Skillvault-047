<?php
/**
 * Logout Handler
 */
require_once dirname(__DIR__) . '/includes/auth.php';

logoutUser();
setFlash('success', 'You have been logged out successfully.');
redirect(APP_URL . '/auth/login.php');
?>
