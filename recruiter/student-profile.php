<?php
/**
 * Recruiter - Student Profile View
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_RECRUITER);

$studentId = (int)($_GET['id'] ?? 0);

// Get student info
$result = query("SELECT u.*, c.name as college_name, c.city, c.state
                 FROM users u
                 JOIN colleges c ON u.college_id = c.id
                 WHERE u.id = $studentId AND u.role_id = " . ROLE_STUDENT . " 
                 AND u.is_active = 1 AND c.verification_status = 'approved'");
$student = fetch($result);

if (!$student) {
    setFlash('danger', 'Student not found.');
    redirect('search.php');
}

// Get student skills
$result = query("SELECT us.*, s.name as skill_name, s.icon as skill_icon
                 FROM user_skills us
                 JOIN skills s ON us.skill_id = s.id
                 WHERE us.user_id = $studentId
                 ORDER BY us.accuracy DESC");
$skills = fetchAll($result);

// Get certificates
$result = query("SELECT c.*, s.name as skill_name, s.icon as skill_icon, 
                 a.title as assessment_title, a.difficulty
                 FROM certificates c
                 JOIN skills s ON c.skill_id = s.id
                 JOIN assessments a ON c.assessment_id = a.id
                 WHERE c.user_id = $studentId
                 ORDER BY c.issued_at DESC");
$certificates = fetchAll($result);

// Get streak
$result = query("SELECT * FROM streaks WHERE user_id = $studentId");
$streak = fetch($result);

$pageTitle = $student['full_name'];
include dirname(__DIR__) . '/includes/header.php';
?>

<div class="layout">
    <?php include dirname(__DIR__) . '/includes/sidebar.php'; ?>
    
    <div class="main-content">
        <div class="content-wrapper">
            <div class="content-header">
                <a href="search.php" class="btn btn-outline">
                    <i class="fas fa-arrow-left"></i> Back to Search
                </a>
            </div>
            
            <!-- Profile Header -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="row align-center">
                        <div class="col-12 col-md-8">
                            <div class="d-flex align-center gap-4">
                                <div class="avatar avatar-xl">
                                    <?php if ($student['profile_picture']): ?>
                                        <img src="<?= APP_URL ?>/uploads/<?= $student['profile_picture'] ?>" alt="">
                                    <?php else: ?>
                                        <?= strtoupper(substr($student['full_name'], 0, 1)) ?>
                                    <?php endif; ?>
                                </div>
                                <div>
                                    <h2 class="mb-1"><?= htmlspecialchars($student['full_name']) ?></h2>
                                    <p class="text-muted mb-2">
                                        <i class="fas fa-building"></i> <?= htmlspecialchars($student['college_name']) ?>
                                    </p>
                                    <p class="text-muted mb-0">
                                        <i class="fas fa-map-marker-alt"></i> 
                                        <?= htmlspecialchars($student['city'] . ', ' . $student['state']) ?>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-4 text-right mt-3 mt-md-0">
                            <a href="mailto:<?= htmlspecialchars($student['email']) ?>" class="btn btn-primary">
                                <i class="fas fa-envelope"></i> Contact
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <!-- Stats & Skills -->
                <div class="col-12 col-lg-8">
                    <!-- Quick Stats -->
                    <div class="stats-grid mb-4">
                        <div class="stat-card">
                            <div class="stat-card-header">
                                <span class="stat-card-title">Skills</span>
                                <div class="stat-card-icon primary">
                                    <i class="fas fa-code"></i>
                                </div>
                            </div>
                            <div class="stat-card-value"><?= count($skills) ?></div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-card-header">
                                <span class="stat-card-title">Certificates</span>
                                <div class="stat-card-icon success">
                                    <i class="fas fa-certificate"></i>
                                </div>
                            </div>
                            <div class="stat-card-value"><?= count($certificates) ?></div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-card-header">
                                <span class="stat-card-title">Current Streak</span>
                                <div class="stat-card-icon warning">
                                    <i class="fas fa-fire"></i>
                                </div>
                            </div>
                            <div class="stat-card-value"><?= $streak['current_streak'] ?? 0 ?></div>
                        </div>
                    </div>
                    
                    <!-- Skills -->
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title">Skill Proficiencies</h5>
                        </div>
                        <div class="card-body">
                            <?php if (empty($skills)): ?>
                                <p class="text-muted text-center">No skills assessed yet</p>
                            <?php else: ?>
                                <?php foreach ($skills as $skill): ?>
                                    <div class="mb-3">
                                        <div class="d-flex justify-between align-center mb-1">
                                            <div class="d-flex align-center gap-2">
                                                <i class="<?= htmlspecialchars($skill['skill_icon'] ?: 'fas fa-code') ?> text-primary"></i>
                                                <span class="font-medium"><?= htmlspecialchars($skill['skill_name']) ?></span>
                                                <span class="badge badge-<?= $skill['skill_level'] === 'expert' ? 'success' : ($skill['skill_level'] === 'advanced' ? 'primary' : ($skill['skill_level'] === 'intermediate' ? 'warning' : 'secondary')) ?>">
                                                    <?= ucfirst($skill['skill_level']) ?>
                                                </span>
                                            </div>
                                            <span class="text-muted"><?= number_format($skill['accuracy'], 0) ?>%</span>
                                        </div>
                                        <div class="progress-bar-container">
                                            <div class="progress-bar-fill" style="width: <?= $skill['accuracy'] ?>%"></div>
                                        </div>
                                        <small class="text-muted">
                                            Best: <?= number_format($skill['best_score'], 0) ?>% • 
                                            <?= $skill['total_correct'] ?>/<?= $skill['total_attempts'] ?> correct
                                        </small>
                                    </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
                
                <!-- Certificates -->
                <div class="col-12 col-lg-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Verified Certificates</h5>
                        </div>
                        <div class="card-body">
                            <?php if (empty($certificates)): ?>
                                <p class="text-muted text-center">No certificates yet</p>
                            <?php else: ?>
                                <?php foreach ($certificates as $cert): ?>
                                    <div class="d-flex align-center gap-2 mb-3 pb-3" style="border-bottom: 1px solid var(--gray-200);">
                                        <div class="stat-card-icon primary" style="width: 36px; height: 36px;">
                                            <i class="<?= htmlspecialchars($cert['skill_icon'] ?: 'fas fa-code') ?>"></i>
                                        </div>
                                        <div class="flex-1">
                                            <div class="font-medium"><?= htmlspecialchars($cert['skill_name']) ?></div>
                                            <small class="text-muted">
                                                <?= date('M Y', strtotime($cert['issued_at'])) ?> •
                                                <span class="badge badge-xs badge-<?= $cert['difficulty'] === 'easy' ? 'success' : ($cert['difficulty'] === 'medium' ? 'warning' : 'danger') ?>">
                                                    <?= ucfirst($cert['difficulty']) ?>
                                                </span>
                                            </small>
                                        </div>
                                        <a href="<?= APP_URL ?>/verify.php?code=<?= urlencode($cert['certificate_code']) ?>" 
                                           class="btn btn-sm btn-outline" target="_blank" title="Verify">
                                            <i class="fas fa-check-circle"></i>
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

<?php include dirname(__DIR__) . '/includes/footer.php'; ?>
