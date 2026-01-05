<?php
/**
 * Header Include - Main Layout
 */
require_once dirname(__DIR__) . '/config/config.php';

$pageTitle = $pageTitle ?? 'SkillVault';
$currentPage = $currentPage ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="SkillVault - Skill Assessment & Certification Platform">
    <title><?= htmlspecialchars($pageTitle) ?> | <?= APP_NAME ?></title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="<?= APP_URL ?>/assets/images/favicon.ico">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Main Stylesheet -->
    <link rel="stylesheet" href="<?= APP_URL ?>/assets/css/style.css">
    
    <?php if (isset($additionalCSS)): ?>
        <?php foreach ($additionalCSS as $css): ?>
            <link rel="stylesheet" href="<?= APP_URL ?>/assets/css/<?= $css ?>">
        <?php endforeach; ?>
    <?php endif; ?>
</head>
<body>
    <!-- Navbar -->
    <nav class="navbar">
        <div class="navbar-container">
            <a href="<?= APP_URL ?>" class="navbar-brand">
                <i class="fas fa-shield-halved"></i>
                <?= APP_NAME ?>
            </a>
            
            <button class="navbar-toggle" aria-label="Toggle navigation">
                <i class="fas fa-bars"></i>
            </button>
            
            <ul class="navbar-nav">
                <?php if (!isLoggedIn()): ?>
                    <li><a href="<?= APP_URL ?>" class="nav-link <?= $currentPage === 'home' ? 'active' : '' ?>">Home</a></li>
                    <li><a href="<?= APP_URL ?>/about.php" class="nav-link <?= $currentPage === 'about' ? 'active' : '' ?>">About</a></li>
                    <li><a href="<?= APP_URL ?>/auth/login.php" class="btn btn-outline">Login</a></li>
                    <li><a href="<?= APP_URL ?>/auth/register.php" class="btn btn-primary">Get Started</a></li>
                <?php else: ?>
                    <li><a href="<?= APP_URL ?>/dashboard" class="nav-link">Dashboard</a></li>
                    <li class="dropdown">
                        <button class="nav-link dropdown-toggle">
                            <span class="avatar avatar-sm"><?= strtoupper(substr($_SESSION['user_name'] ?? 'U', 0, 1)) ?></span>
                            <span class="hide-mobile"><?= htmlspecialchars($_SESSION['user_name'] ?? 'User') ?></span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="dropdown-menu">
                            <a href="<?= APP_URL ?>/profile.php" class="dropdown-item">
                                <i class="fas fa-user"></i> Profile
                            </a>
                            <a href="<?= APP_URL ?>/settings.php" class="dropdown-item">
                                <i class="fas fa-cog"></i> Settings
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="<?= APP_URL ?>/auth/logout.php" class="dropdown-item text-danger">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </a>
                        </div>
                    </li>
                <?php endif; ?>
            </ul>
        </div>
    </nav>
    
    <!-- Flash Messages -->
    <?php if ($flash = getFlash()): ?>
        <div class="container mt-2">
            <div class="alert alert-<?= $flash['type'] ?>" data-dismiss="5000">
                <?= htmlspecialchars($flash['message']) ?>
                <button class="alert-close" aria-label="Close">&times;</button>
            </div>
        </div>
    <?php endif; ?>
    
    <!-- Main Content -->
    <main>
