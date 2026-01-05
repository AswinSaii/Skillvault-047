<?php
/**
 * 403 Forbidden - Access Denied
 */
require_once 'config/config.php';

$pageTitle = '403 - Access Denied';
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
    
    <style>
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .error-container {
            text-align: center;
            padding: 3rem;
            background: white;
            border-radius: 1rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            margin: 2rem;
        }
        
        .error-icon {
            font-size: 5rem;
            color: #ef4444;
            margin-bottom: 1.5rem;
        }
        
        .error-code {
            font-size: 4rem;
            font-weight: 800;
            color: #1f2937;
            margin-bottom: 0.5rem;
        }
        
        .error-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 1rem;
        }
        
        .error-message {
            color: #6b7280;
            margin-bottom: 2rem;
            line-height: 1.6;
        }
        
        .error-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">
            <i class="fas fa-ban"></i>
        </div>
        <h1 class="error-code">403</h1>
        <h2 class="error-title">Access Denied</h2>
        <p class="error-message">
            You don't have permission to access this page. This area is restricted to authorized users only.
        </p>
        <div class="error-actions">
            <a href="<?= APP_URL ?>" class="btn btn-primary">
                <i class="fas fa-home"></i> Go Home
            </a>
            <?php if (isLoggedIn()): ?>
                <a href="<?= APP_URL ?>/auth/logout.php" class="btn btn-secondary">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            <?php else: ?>
                <a href="<?= APP_URL ?>/auth/login.php" class="btn btn-secondary">
                    <i class="fas fa-sign-in-alt"></i> Login
                </a>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
