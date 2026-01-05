<?php
/**
 * Student Dashboard
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_STUDENT);

$pageTitle = 'Dashboard';
$currentPage = 'dashboard';
$userId = getCurrentUserId();

// Get student info
$user = getUserById($userId);

// Get streak data
$result = query("SELECT * FROM streaks WHERE user_id = $userId");
$streak = fetch($result);
if (!$streak) {
    // Initialize streak
    query("INSERT INTO streaks (user_id) VALUES ($userId)");
    $streak = ['current_streak' => 0, 'longest_streak' => 0, 'total_quizzes_completed' => 0];
}

// Get skill stats
$result = query("SELECT COUNT(DISTINCT skill_id) as skill_count FROM user_skills WHERE user_id = $userId");
$skillStats = fetch($result);

// Get certificate count
$result = query("SELECT COUNT(*) as count FROM certificates WHERE user_id = $userId AND is_revoked = 0");
$certCount = fetch($result)['count'];

// Get recent assessments
$collegeId = $_SESSION['college_id'];
$result = query("SELECT a.*, s.name as skill_name, s.icon as skill_icon,
                 (SELECT COUNT(*) FROM attempts WHERE assessment_id = a.id AND user_id = $userId) as attempt_count
                 FROM assessments a
                 JOIN skills s ON a.skill_id = s.id
                 WHERE a.college_id = $collegeId AND a.is_active = 1
                 ORDER BY a.created_at DESC LIMIT 6");
$assessments = fetchAll($result);

// Get today's quiz status
$today = date('Y-m-d');
$result = query("SELECT * FROM daily_quiz_log WHERE user_id = $userId AND quiz_date = '$today'");
$todayQuizDone = numRows($result) > 0;

// Get user skills with progress
$result = query("SELECT us.*, s.name as skill_name, s.icon as skill_icon, s.category
                 FROM user_skills us
                 JOIN skills s ON us.skill_id = s.id
                 WHERE us.user_id = $userId
                 ORDER BY us.accuracy DESC LIMIT 5");
$topSkills = fetchAll($result);

// Get recent certificates
$result = query("SELECT c.*, s.name as skill_name
                 FROM certificates c
                 JOIN skills s ON c.skill_id = s.id
                 WHERE c.user_id = $userId AND c.is_revoked = 0
                 ORDER BY c.issued_at DESC LIMIT 3");
$recentCerts = fetchAll($result);
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
</head>
<body>
    <div class="layout">
        <?php include dirname(__DIR__) . '/includes/sidebar.php'; ?>
        
        <div class="main-content">
            <!-- Top Bar -->
            <header class="bg-white border-bottom p-3">
                <div class="d-flex justify-between align-center">
                    <button class="btn btn-icon sidebar-toggle hide-desktop">
                        <i class="fas fa-bars"></i>
                    </button>
                    <div>
                        <h5 class="mb-0">Welcome back, <?= htmlspecialchars($user['first_name']) ?>! 👋</h5>
                        <small class="text-muted"><?= htmlspecialchars($_SESSION['college_name']) ?></small>
                    </div>
                    <div class="d-flex align-center gap-2">
                        <div class="verified-badge">
                            <i class="fas fa-check-circle"></i>
                            Verified College
                        </div>
                    </div>
                </div>
            </header>
            
            <div class="content-wrapper">
                <!-- Streak Banner -->
                <div class="streak-display mb-4">
                    <div class="streak-icon">🔥</div>
                    <div>
                        <div class="streak-count"><?= $streak['current_streak'] ?></div>
                        <div class="streak-label">Day Streak</div>
                        <div class="streak-badges">
                            <span class="streak-badge <?= $streak['current_streak'] >= 3 ? 'earned' : '' ?>" title="3-Day Streak">🥉</span>
                            <span class="streak-badge <?= $streak['current_streak'] >= 7 ? 'earned' : '' ?>" title="7-Day Streak">🥈</span>
                            <span class="streak-badge <?= $streak['current_streak'] >= 30 ? 'earned' : '' ?>" title="30-Day Streak">🥇</span>
                        </div>
                    </div>
                    <div class="hide-mobile" style="margin-left: auto;">
                        <?php if (!$todayQuizDone): ?>
                            <a href="daily-quiz.php" class="btn btn-light">
                                <i class="fas fa-bolt"></i>
                                Take Today's Quiz
                            </a>
                        <?php else: ?>
                            <span class="badge" style="background: rgba(255,255,255,0.2); color: white; padding: 0.5rem 1rem;">
                                <i class="fas fa-check"></i>
                                Today's Quiz Complete!
                            </span>
                        <?php endif; ?>
                    </div>
                </div>
                
                <!-- Mobile Daily Quiz Button -->
                <?php if (!$todayQuizDone): ?>
                    <div class="hide-desktop mb-3">
                        <a href="daily-quiz.php" class="btn btn-primary btn-block">
                            <i class="fas fa-bolt"></i>
                            Take Today's Quiz
                        </a>
                    </div>
                <?php endif; ?>
                
                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Skills Learned</span>
                            <div class="stat-card-icon primary">
                                <i class="fas fa-lightbulb"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= $skillStats['skill_count'] ?></div>
                        <div class="stat-card-change">
                            <a href="skills.php" class="text-primary">View all skills →</a>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Certificates</span>
                            <div class="stat-card-icon success">
                                <i class="fas fa-certificate"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= $certCount ?></div>
                        <div class="stat-card-change">
                            <a href="certificates.php" class="text-primary">View certificates →</a>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Quizzes Completed</span>
                            <div class="stat-card-icon warning">
                                <i class="fas fa-tasks"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= $streak['total_quizzes_completed'] ?></div>
                        <div class="stat-card-change up">
                            <i class="fas fa-arrow-up"></i> Keep going!
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Longest Streak</span>
                            <div class="stat-card-icon danger">
                                <i class="fas fa-fire-flame-curved"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= $streak['longest_streak'] ?></div>
                        <div class="stat-card-change">
                            <span class="text-muted">Personal best</span>
                        </div>
                    </div>
                </div>
                
                <!-- Content Row -->
                <div class="row mt-3">
                    <!-- Available Assessments -->
                    <div class="col-12 col-md-8">
                        <div class="card">
                            <div class="card-header d-flex justify-between align-center">
                                <h5 class="card-title">Available Assessments</h5>
                                <a href="assessments.php" class="btn btn-sm btn-outline">View All</a>
                            </div>
                            <div class="card-body">
                                <?php if (empty($assessments)): ?>
                                    <div class="empty-state">
                                        <i class="fas fa-clipboard-list empty-state-icon"></i>
                                        <p class="empty-state-title">No assessments available</p>
                                        <p class="empty-state-text">Check back later for new assessments.</p>
                                    </div>
                                <?php else: ?>
                                    <div class="row">
                                        <?php foreach ($assessments as $assessment): ?>
                                            <div class="col-12 col-md-6 mb-3">
                                                <div class="card border" style="box-shadow: none;">
                                                    <div class="card-body">
                                                        <div class="d-flex align-center gap-2 mb-2">
                                                            <div class="avatar" style="background: rgba(99, 102, 241, 0.1); color: var(--primary);">
                                                                <i class="<?= htmlspecialchars($assessment['skill_icon'] ?: 'fas fa-code') ?>"></i>
                                                            </div>
                                                            <div>
                                                                <strong><?= htmlspecialchars($assessment['title']) ?></strong>
                                                                <br>
                                                                <small class="text-muted"><?= htmlspecialchars($assessment['skill_name']) ?></small>
                                                            </div>
                                                        </div>
                                                        <div class="d-flex gap-1 mb-2">
                                                            <span class="badge badge-<?= $assessment['difficulty'] === 'easy' ? 'success' : ($assessment['difficulty'] === 'medium' ? 'warning' : 'danger') ?>">
                                                                <?= ucfirst($assessment['difficulty']) ?>
                                                            </span>
                                                            <span class="badge badge-secondary">
                                                                <i class="fas fa-clock"></i>
                                                                <?= $assessment['duration_minutes'] ?> min
                                                            </span>
                                                        </div>
                                                        <?php if ($assessment['attempt_count'] > 0): ?>
                                                            <span class="text-success text-sm">
                                                                <i class="fas fa-check-circle"></i>
                                                                Attempted <?= $assessment['attempt_count'] ?> time(s)
                                                            </span>
                                                        <?php else: ?>
                                                            <a href="take-assessment.php?id=<?= $assessment['id'] ?>" class="btn btn-sm btn-primary">
                                                                Start Assessment
                                                            </a>
                                                        <?php endif; ?>
                                                    </div>
                                                </div>
                                            </div>
                                        <?php endforeach; ?>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sidebar -->
                    <div class="col-12 col-md-4">
                        <!-- Top Skills -->
                        <div class="card mb-3">
                            <div class="card-header">
                                <h5 class="card-title">Your Top Skills</h5>
                            </div>
                            <div class="card-body">
                                <?php if (empty($topSkills)): ?>
                                    <div class="text-center p-3">
                                        <i class="fas fa-lightbulb text-muted" style="font-size: 2rem;"></i>
                                        <p class="text-muted mt-2 mb-0">Complete assessments to track your skills</p>
                                    </div>
                                <?php else: ?>
                                    <?php foreach ($topSkills as $skill): ?>
                                        <div class="mb-3">
                                            <div class="d-flex justify-between mb-1">
                                                <span class="font-medium"><?= htmlspecialchars($skill['skill_name']) ?></span>
                                                <span class="text-muted"><?= number_format($skill['accuracy'], 1) ?>%</span>
                                            </div>
                                            <div class="progress">
                                                <div class="progress-bar <?= $skill['accuracy'] >= 70 ? 'success' : ($skill['accuracy'] >= 40 ? 'warning' : 'danger') ?>" 
                                                     style="width: <?= $skill['accuracy'] ?>%"></div>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </div>
                        </div>
                        
                        <!-- Recent Certificates -->
                        <div class="card">
                            <div class="card-header d-flex justify-between align-center">
                                <h5 class="card-title">Recent Certificates</h5>
                                <a href="certificates.php" class="text-primary" style="font-size: 0.875rem;">View All</a>
                            </div>
                            <div class="card-body">
                                <?php if (empty($recentCerts)): ?>
                                    <div class="text-center p-3">
                                        <i class="fas fa-certificate text-muted" style="font-size: 2rem;"></i>
                                        <p class="text-muted mt-2 mb-0">Pass assessments to earn certificates</p>
                                    </div>
                                <?php else: ?>
                                    <?php foreach ($recentCerts as $cert): ?>
                                        <div class="d-flex align-center gap-2 mb-2 pb-2 border-bottom">
                                            <div class="avatar avatar-sm" style="background: rgba(16, 185, 129, 0.1); color: var(--success);">
                                                <i class="fas fa-certificate"></i>
                                            </div>
                                            <div>
                                                <strong><?= htmlspecialchars($cert['skill_name']) ?></strong>
                                                <br>
                                                <small class="text-muted"><?= formatDate($cert['issued_at']) ?></small>
                                            </div>
                                            <a href="certificates.php?view=<?= $cert['id'] ?>" class="btn btn-sm btn-icon" style="margin-left: auto;">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                        </div>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="<?= APP_URL ?>/assets/js/main.js"></script>
</body>
</html>
