<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?? 'Admin Dashboard' ?> | <?= APP_NAME ?></title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="<?= APP_URL ?>/assets/css/style.css">
    <link rel="stylesheet" href="<?= APP_URL ?>/assets/css/admin.css">
</head>
<body class="admin-layout">
    
    <!-- Sidebar -->
    <aside class="admin-sidebar">
        <div class="admin-sidebar-header">
            <div class="admin-brand">
                <div class="admin-brand-icon">
                    <i class="fas fa-shield-halved"></i>
                </div>
                <div class="admin-brand-text">
                    <h3>SkillVault</h3>
                    <span>Super Admin</span>
                </div>
            </div>
            <button class="admin-sidebar-toggle" id="sidebarToggle">
                <i class="fas fa-bars"></i>
            </button>
        </div>
        
        <nav class="admin-nav">
            <!-- Main -->
            <div class="admin-nav-section">
                <div class="admin-nav-title">Main</div>
                <a href="index.php" class="admin-nav-item <?= ($currentPage === 'dashboard') ? 'active' : '' ?>">
                    <i class="fas fa-th-large"></i>
                    <span>Dashboard</span>
                </a>
            </div>
            
            <!-- Management -->
            <div class="admin-nav-section">
                <div class="admin-nav-title">Management</div>
                <a href="colleges.php" class="admin-nav-item <?= ($currentPage === 'colleges') ? 'active' : '' ?>">
                    <i class="fas fa-university"></i>
                    <span>Colleges</span>
                </a>
                <a href="users.php" class="admin-nav-item <?= ($currentPage === 'users') ? 'active' : '' ?>">
                    <i class="fas fa-users"></i>
                    <span>Users</span>
                </a>
                <a href="skills.php" class="admin-nav-item <?= ($currentPage === 'skills') ? 'active' : '' ?>">
                    <i class="fas fa-brain"></i>
                    <span>Skills</span>
                </a>
            </div>
            
            <!-- Content -->
            <div class="admin-nav-section">
                <div class="admin-nav-title">Content</div>
                <a href="templates.php" class="admin-nav-item <?= ($currentPage === 'templates') ? 'active' : '' ?>">
                    <i class="fas fa-file-certificate"></i>
                    <span>Templates</span>
                </a>
                <a href="certificates.php" class="admin-nav-item <?= ($currentPage === 'certificates') ? 'active' : '' ?>">
                    <i class="fas fa-certificate"></i>
                    <span>Certificates</span>
                </a>
            </div>
            
            <!-- Analytics -->
            <div class="admin-nav-section">
                <div class="admin-nav-title">Analytics</div>
                <a href="analytics.php" class="admin-nav-item <?= ($currentPage === 'analytics') ? 'active' : '' ?>">
                    <i class="fas fa-chart-line"></i>
                    <span>Analytics</span>
                </a>
                <a href="reports.php" class="admin-nav-item <?= ($currentPage === 'reports') ? 'active' : '' ?>">
                    <i class="fas fa-file-alt"></i>
                    <span>Reports</span>
                </a>
            </div>
            
            <!-- Settings -->
            <div class="admin-nav-section">
                <div class="admin-nav-title">System</div>
                <a href="settings.php" class="admin-nav-item <?= ($currentPage === 'settings') ? 'active' : '' ?>">
                    <i class="fas fa-cog"></i>
                    <span>Settings</span>
                </a>
            </div>
        </nav>
        
        <div class="admin-sidebar-footer">
            <div class="admin-user-profile">
                <div class="admin-user-avatar">
                    <?php
                    $user = getCurrentUser();
                    echo strtoupper(substr($user['first_name'] ?? 'A', 0, 1));
                    ?>
                </div>
                <div class="admin-user-info">
                    <div class="admin-user-name"><?php echo htmlspecialchars($user['first_name'] ?? 'Admin'); ?></div>
                    <div class="admin-user-role">Super Admin</div>
                </div>
                <a href="<?= APP_URL ?>/auth/logout.php" class="admin-logout-btn" title="Logout">
                    <i class="fas fa-sign-out-alt"></i>
                </a>
            </div>
        </div>
    </aside>
    
    <!-- Main Content Area -->
    <div class="admin-main">
        <!-- Top Navbar -->
        <header class="admin-header">
            <div class="admin-header-left">
                <button class="admin-mobile-toggle" id="mobileToggle">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="admin-breadcrumb">
                    <i class="fas fa-home"></i>
                    <span>/</span>
                    <span><?= $pageTitle ?? 'Dashboard' ?></span>
                </div>
            </div>
            
            <div class="admin-header-right">
                <button class="admin-header-btn" title="Notifications">
                    <i class="fas fa-bell"></i>
                    <span class="admin-badge">3</span>
                </button>
                
                <button class="admin-header-btn" title="Messages">
                    <i class="fas fa-envelope"></i>
                    <span class="admin-badge">5</span>
                </button>
                
                <div class="admin-header-divider"></div>
                
                <div class="admin-header-user">
                    <div class="admin-header-avatar">
                        <?php
                        $user = getCurrentUser();
                        echo strtoupper(substr($user['first_name'] ?? 'A', 0, 1));
                        ?>
                    </div>
                    <div class="admin-header-user-info">
                        <div class="admin-header-user-name"><?php echo htmlspecialchars(($user['first_name'] ?? 'Admin') . ' ' . ($user['last_name'] ?? '')); ?></div>
                        <div class="admin-header-user-role">Super Admin</div>
                    </div>
                </div>
            </div>
        </header>
        
        <!-- Page Content -->
        <div class="admin-content">
