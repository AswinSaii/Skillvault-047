<?php
/**
 * Login Page
 */
require_once dirname(__DIR__) . '/includes/auth.php';

// Redirect if already logged in
if (isLoggedIn()) {
    redirect(getDashboardUrl(getCurrentUserRole()));
}

$error = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    $result = loginUser($email, $password);
    
    if ($result['success']) {
        redirect(getDashboardUrl($_SESSION['user_role']));
    } else {
        $error = $result['message'];
    }
}

$pageTitle = 'Login';
$additionalCSS = ['auth.css'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?> | <?= APP_NAME ?></title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="<?= APP_URL ?>/assets/css/style.css">
    <link rel="stylesheet" href="<?= APP_URL ?>/assets/css/auth.css">
</head>
<body>
    <div class="auth-wrapper">
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <div class="auth-logo">
                        <i class="fas fa-shield-halved"></i>
                        <?= APP_NAME ?>
                    </div>
                    <p class="auth-title">Welcome back! Please login to continue.</p>
                </div>
                
                <div class="auth-body">
                    <?php if ($error): ?>
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-circle"></i>
                            <?= htmlspecialchars($error) ?>
                        </div>
                    <?php endif; ?>
                    
                    <form method="POST" action="" data-validate>
                        <div class="form-group">
                            <label for="email" class="form-label">Email Address</label>
                            <input type="email" id="email" name="email" class="form-control" 
                                   placeholder="Enter your email" required 
                                   value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
                        </div>
                        
                        <div class="form-group">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" id="password" name="password" class="form-control" 
                                   placeholder="Enter your password" required>
                        </div>
                        
                        <div class="form-group">
                            <div class="form-check">
                                <input type="checkbox" id="remember" name="remember" class="form-check-input">
                                <label for="remember" class="form-check-label">Remember me</label>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block btn-lg">
                            <i class="fas fa-sign-in-alt"></i>
                            Login
                        </button>
                        
                        <div class="auth-links">
                            <a href="forgot-password.php">Forgot password?</a>
                        </div>
                    </form>
                </div>
                
                <div class="auth-footer">
                    Don't have an account? <a href="register.php">Register now</a>
                </div>
            </div>
            
            <div class="text-center mt-3">
                <a href="<?= APP_URL ?>" class="text-white" style="opacity: 0.8;">
                    <i class="fas fa-arrow-left"></i> Back to Home
                </a>
            </div>
        </div>
    </div>
    
    <script src="<?= APP_URL ?>/assets/js/main.js"></script>
</body>
</html>
