<?php
/**
 * Dashboard Sidebar Include
 */

$userRole = getCurrentUserRole();
$currentPage = $currentPage ?? '';

// Define menu items based on role
$menuItems = [];

switch ($userRole) {
    case ROLE_SUPER_ADMIN:
        $menuItems = [
            'main' => [
                ['url' => 'index.php', 'icon' => 'fas fa-home', 'label' => 'Dashboard', 'page' => 'dashboard'],
            ],
            'management' => [
                ['url' => 'colleges.php', 'icon' => 'fas fa-university', 'label' => 'Colleges', 'page' => 'colleges'],
                ['url' => 'users.php', 'icon' => 'fas fa-users', 'label' => 'Users', 'page' => 'users'],
                ['url' => 'skills.php', 'icon' => 'fas fa-lightbulb', 'label' => 'Skills', 'page' => 'skills'],
            ],
            'content' => [
                ['url' => 'templates.php', 'icon' => 'fas fa-file-certificate', 'label' => 'Certificate Templates', 'page' => 'templates'],
                ['url' => 'certificates.php', 'icon' => 'fas fa-certificate', 'label' => 'Certificates', 'page' => 'certificates'],
            ],
            'reports' => [
                ['url' => 'analytics.php', 'icon' => 'fas fa-chart-bar', 'label' => 'Analytics', 'page' => 'analytics'],
                ['url' => 'reports.php', 'icon' => 'fas fa-file-alt', 'label' => 'Reports', 'page' => 'reports'],
            ],
            'settings' => [
                ['url' => 'settings.php', 'icon' => 'fas fa-cog', 'label' => 'Settings', 'page' => 'settings'],
            ],
        ];
        break;
        
    case ROLE_COLLEGE_ADMIN:
        $menuItems = [
            'main' => [
                ['url' => 'index.php', 'icon' => 'fas fa-home', 'label' => 'Dashboard', 'page' => 'dashboard'],
            ],
            'management' => [
                ['url' => 'faculty.php', 'icon' => 'fas fa-chalkboard-teacher', 'label' => 'Faculty', 'page' => 'faculty'],
                ['url' => 'students.php', 'icon' => 'fas fa-user-graduate', 'label' => 'Students', 'page' => 'students'],
                ['url' => 'departments.php', 'icon' => 'fas fa-sitemap', 'label' => 'Departments', 'page' => 'departments'],
            ],
            'assessments' => [
                ['url' => 'assessments.php', 'icon' => 'fas fa-clipboard-list', 'label' => 'Assessments', 'page' => 'assessments'],
                ['url' => 'questions.php', 'icon' => 'fas fa-question-circle', 'label' => 'Question Bank', 'page' => 'questions'],
            ],
            'certificates' => [
                ['url' => 'certificates.php', 'icon' => 'fas fa-certificate', 'label' => 'Certificates', 'page' => 'certificates'],
                ['url' => 'templates.php', 'icon' => 'fas fa-palette', 'label' => 'Templates', 'page' => 'templates'],
            ],
            'reports' => [
                ['url' => 'analytics.php', 'icon' => 'fas fa-chart-line', 'label' => 'Analytics', 'page' => 'analytics'],
            ],
        ];
        break;
        
    case ROLE_FACULTY:
        $menuItems = [
            'main' => [
                ['url' => 'index.php', 'icon' => 'fas fa-home', 'label' => 'Dashboard', 'page' => 'dashboard'],
            ],
            'assessments' => [
                ['url' => 'assessments.php', 'icon' => 'fas fa-clipboard-list', 'label' => 'My Assessments', 'page' => 'assessments'],
                ['url' => 'create-assessment.php', 'icon' => 'fas fa-plus-circle', 'label' => 'Create Assessment', 'page' => 'create-assessment'],
                ['url' => 'questions.php', 'icon' => 'fas fa-question-circle', 'label' => 'Question Bank', 'page' => 'questions'],
            ],
            'students' => [
                ['url' => 'students.php', 'icon' => 'fas fa-user-graduate', 'label' => 'Students', 'page' => 'students'],
                ['url' => 'results.php', 'icon' => 'fas fa-poll', 'label' => 'Results', 'page' => 'results'],
            ],
            'reports' => [
                ['url' => 'analytics.php', 'icon' => 'fas fa-chart-bar', 'label' => 'Analytics', 'page' => 'analytics'],
            ],
        ];
        break;
        
    case ROLE_STUDENT:
        $menuItems = [
            'main' => [
                ['url' => 'index.php', 'icon' => 'fas fa-home', 'label' => 'Dashboard', 'page' => 'dashboard'],
            ],
            'learning' => [
                ['url' => 'assessments.php', 'icon' => 'fas fa-clipboard-list', 'label' => 'Assessments', 'page' => 'assessments'],
                ['url' => 'daily-quiz.php', 'icon' => 'fas fa-fire', 'label' => 'Daily Quiz', 'page' => 'daily-quiz'],
                ['url' => 'skills.php', 'icon' => 'fas fa-lightbulb', 'label' => 'My Skills', 'page' => 'skills'],
            ],
            'achievements' => [
                ['url' => 'certificates.php', 'icon' => 'fas fa-certificate', 'label' => 'Certificates', 'page' => 'certificates'],
                ['url' => 'progress.php', 'icon' => 'fas fa-chart-line', 'label' => 'Progress', 'page' => 'progress'],
            ],
            'profile' => [
                ['url' => 'resume.php', 'icon' => 'fas fa-file-alt', 'label' => 'Skill Resume', 'page' => 'resume'],
            ],
        ];
        break;
        
    case ROLE_RECRUITER:
        $menuItems = [
            'main' => [
                ['url' => 'index.php', 'icon' => 'fas fa-home', 'label' => 'Dashboard', 'page' => 'dashboard'],
            ],
            'search' => [
                ['url' => 'search.php', 'icon' => 'fas fa-search', 'label' => 'Search Students', 'page' => 'search'],
                ['url' => 'saved.php', 'icon' => 'fas fa-bookmark', 'label' => 'Saved Profiles', 'page' => 'saved'],
            ],
            'verify' => [
                ['url' => 'verify.php', 'icon' => 'fas fa-check-circle', 'label' => 'Verify Certificate', 'page' => 'verify'],
            ],
        ];
        break;
}

// Section labels
$sectionLabels = [
    'main' => 'Main',
    'management' => 'Management',
    'content' => 'Content',
    'assessments' => 'Assessments',
    'students' => 'Students',
    'learning' => 'Learning',
    'achievements' => 'Achievements',
    'certificates' => 'Certificates',
    'reports' => 'Reports & Analytics',
    'settings' => 'Settings',
    'profile' => 'Profile',
    'search' => 'Recruitment',
    'verify' => 'Verification',
];
?>

<!-- Sidebar Overlay (Mobile) -->
<div class="sidebar-overlay"></div>

<!-- Sidebar -->
<aside class="sidebar">
    <div class="sidebar-header">
        <a href="<?= APP_URL ?>" class="sidebar-brand">
            <i class="fas fa-shield-halved text-primary"></i>
            <?= APP_NAME ?>
        </a>
    </div>
    
    <nav class="sidebar-nav">
        <?php foreach ($menuItems as $section => $items): ?>
            <div class="sidebar-section">
                <div class="sidebar-section-title"><?= $sectionLabels[$section] ?? ucfirst($section) ?></div>
                <?php foreach ($items as $item): ?>
                    <a href="<?= $item['url'] ?>" class="sidebar-link <?= $currentPage === $item['page'] ? 'active' : '' ?>">
                        <i class="<?= $item['icon'] ?>"></i>
                        <span><?= $item['label'] ?></span>
                    </a>
                <?php endforeach; ?>
            </div>
        <?php endforeach; ?>
    </nav>
    
    <!-- User Info (Bottom) -->
    <div class="sidebar-nav" style="margin-top: auto; border-top: 1px solid var(--gray-100); padding-top: var(--space-md);">
        <a href="<?= APP_URL ?>/profile.php" class="sidebar-link">
            <i class="fas fa-user"></i>
            <span>Profile</span>
        </a>
        <a href="<?= APP_URL ?>/auth/logout.php" class="sidebar-link text-danger">
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
        </a>
    </div>
</aside>
