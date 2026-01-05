<?php
/**
 * Student - My Skills
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_STUDENT);

$userId = getCurrentUserId();

// Get user skills with details
$result = query("SELECT us.*, s.name as skill_name, s.icon as skill_icon, s.category
                 FROM user_skills us
                 JOIN skills s ON us.skill_id = s.id
                 WHERE us.user_id = $userId
                 ORDER BY us.accuracy DESC");
$skills = fetchAll($result);

// Get all available skills for comparison
$result = query("SELECT * FROM skills ORDER BY category, name");
$allSkills = fetchAll($result);

$pageTitle = 'My Skills';
include dirname(__DIR__) . '/includes/header.php';
?>

<div class="layout">
    <?php include dirname(__DIR__) . '/includes/sidebar.php'; ?>
    
    <div class="main-content">
        <div class="content-wrapper">
            <div class="content-header">
                <div>
                    <h1 class="page-title">My Skills</h1>
                    <p class="text-muted">Track your skill progress and proficiency levels</p>
                </div>
                <a href="assessments.php" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                    <span class="hide-mobile">Take Assessment</span>
                </a>
            </div>
            
            <?php if (empty($skills)): ?>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <h3>No Skills Yet</h3>
                    <p>Complete skill assessments to track your progress here</p>
                    <a href="assessments.php" class="btn btn-primary">
                        <i class="fas fa-clipboard-list"></i> Browse Assessments
                    </a>
                </div>
            <?php else: ?>
                <!-- Summary Stats -->
                <div class="stats-grid mb-4">
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Total Skills</span>
                            <div class="stat-card-icon primary">
                                <i class="fas fa-layer-group"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= count($skills) ?></div>
                    </div>
                    
                    <?php
                    $expertCount = count(array_filter($skills, fn($s) => $s['skill_level'] === 'expert'));
                    $advancedCount = count(array_filter($skills, fn($s) => $s['skill_level'] === 'advanced'));
                    $avgAccuracy = array_sum(array_column($skills, 'accuracy')) / count($skills);
                    ?>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Expert Level</span>
                            <div class="stat-card-icon success">
                                <i class="fas fa-star"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= $expertCount ?></div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Advanced Level</span>
                            <div class="stat-card-icon info">
                                <i class="fas fa-medal"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= $advancedCount ?></div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Avg Accuracy</span>
                            <div class="stat-card-icon warning">
                                <i class="fas fa-bullseye"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= number_format($avgAccuracy, 0) ?>%</div>
                    </div>
                </div>
                
                <!-- Skills Grid -->
                <div class="row">
                    <?php foreach ($skills as $skill): ?>
                        <div class="col-12 col-md-6 col-lg-4 mb-4">
                            <div class="card h-100">
                                <div class="card-body">
                                    <div class="d-flex justify-between align-start mb-3">
                                        <div class="stat-card-icon primary">
                                            <i class="<?= htmlspecialchars($skill['skill_icon'] ?: 'fas fa-code') ?>"></i>
                                        </div>
                                        <span class="badge badge-<?= $skill['skill_level'] === 'expert' ? 'success' : ($skill['skill_level'] === 'advanced' ? 'primary' : ($skill['skill_level'] === 'intermediate' ? 'warning' : 'secondary')) ?>">
                                            <?= ucfirst($skill['skill_level']) ?>
                                        </span>
                                    </div>
                                    
                                    <h5 class="card-title mb-1"><?= htmlspecialchars($skill['skill_name']) ?></h5>
                                    <small class="text-muted mb-3 d-block"><?= htmlspecialchars($skill['category'] ?? 'General') ?></small>
                                    
                                    <!-- Accuracy Progress -->
                                    <div class="mb-3">
                                        <div class="d-flex justify-between text-sm mb-1">
                                            <span>Accuracy</span>
                                            <span class="font-medium"><?= number_format($skill['accuracy'], 1) ?>%</span>
                                        </div>
                                        <div class="progress-bar-container">
                                            <div class="progress-bar-fill" style="width: <?= $skill['accuracy'] ?>%"></div>
                                        </div>
                                    </div>
                                    
                                    <div class="row text-center text-sm">
                                        <div class="col-4">
                                            <div class="font-medium"><?= $skill['total_attempts'] ?></div>
                                            <small class="text-muted">Questions</small>
                                        </div>
                                        <div class="col-4">
                                            <div class="font-medium"><?= $skill['total_correct'] ?></div>
                                            <small class="text-muted">Correct</small>
                                        </div>
                                        <div class="col-4">
                                            <div class="font-medium"><?= number_format($skill['best_score'], 0) ?>%</div>
                                            <small class="text-muted">Best</small>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-footer text-muted text-sm">
                                    <i class="fas fa-clock"></i>
                                    Last assessed: <?= date('M j, Y', strtotime($skill['last_assessed_at'])) ?>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php include dirname(__DIR__) . '/includes/footer.php'; ?>
