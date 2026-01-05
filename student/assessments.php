<?php
/**
 * Student - Assessments List
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_STUDENT);

$userId = getCurrentUserId();
$collegeId = $_SESSION['college_id'];

$skillFilter = (int)($_GET['skill'] ?? 0);
$difficultyFilter = $_GET['difficulty'] ?? '';

// Build query
$where = "a.college_id = $collegeId AND a.is_active = 1 AND a.is_daily_quiz = 0";
if ($skillFilter) {
    $where .= " AND a.skill_id = $skillFilter";
}
if ($difficultyFilter && in_array($difficultyFilter, ['easy', 'medium', 'hard'])) {
    $where .= " AND a.difficulty = '$difficultyFilter'";
}

// Get assessments
$result = query("SELECT a.*, s.name as skill_name, s.icon as skill_icon,
                 (SELECT COUNT(*) FROM questions WHERE assessment_id = a.id) as question_count,
                 (SELECT at.id FROM attempts at WHERE at.assessment_id = a.id AND at.user_id = $userId AND at.status IN ('evaluated', 'auto_submitted') ORDER BY at.id DESC LIMIT 1) as last_attempt_id,
                 (SELECT at.is_passed FROM attempts at WHERE at.assessment_id = a.id AND at.user_id = $userId AND at.status IN ('evaluated', 'auto_submitted') ORDER BY at.id DESC LIMIT 1) as is_passed,
                 (SELECT at.percentage FROM attempts at WHERE at.assessment_id = a.id AND at.user_id = $userId AND at.status IN ('evaluated', 'auto_submitted') ORDER BY at.id DESC LIMIT 1) as best_score
                 FROM assessments a
                 JOIN skills s ON a.skill_id = s.id
                 WHERE $where
                 ORDER BY a.created_at DESC");
$assessments = fetchAll($result);

// Get skills for filter
$result = query("SELECT * FROM skills ORDER BY name");
$skills = fetchAll($result);

$pageTitle = 'Assessments';
include dirname(__DIR__) . '/includes/header.php';
?>

<div class="layout">
    <?php include dirname(__DIR__) . '/includes/sidebar.php'; ?>
    
    <div class="main-content">
        <div class="content-wrapper">
            <div class="content-header">
                <div>
                    <h1 class="page-title">Skill Assessments</h1>
                    <p class="text-muted">Test your skills and earn certificates</p>
                </div>
            </div>
            
            <!-- Filters -->
            <div class="card mb-4">
                <div class="card-body">
                    <form method="GET" class="d-flex gap-3 flex-wrap">
                        <div class="form-group mb-0" style="min-width: 200px;">
                            <label class="form-label">Skill</label>
                            <select name="skill" class="form-select">
                                <option value="">All Skills</option>
                                <?php foreach ($skills as $skill): ?>
                                    <option value="<?= $skill['id'] ?>" <?= $skillFilter == $skill['id'] ? 'selected' : '' ?>>
                                        <?= htmlspecialchars($skill['name']) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div class="form-group mb-0" style="min-width: 150px;">
                            <label class="form-label">Difficulty</label>
                            <select name="difficulty" class="form-select">
                                <option value="">All Levels</option>
                                <option value="easy" <?= $difficultyFilter === 'easy' ? 'selected' : '' ?>>Easy</option>
                                <option value="medium" <?= $difficultyFilter === 'medium' ? 'selected' : '' ?>>Medium</option>
                                <option value="hard" <?= $difficultyFilter === 'hard' ? 'selected' : '' ?>>Hard</option>
                            </select>
                        </div>
                        
                        <div class="form-group mb-0 d-flex align-end">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-filter"></i> Filter
                            </button>
                            <a href="assessments.php" class="btn btn-secondary ml-2">Clear</a>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- Assessments Grid -->
            <?php if (empty($assessments)): ?>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <h3>No Assessments Available</h3>
                    <p>There are no assessments matching your criteria. Check back later!</p>
                </div>
            <?php else: ?>
                <div class="row">
                    <?php foreach ($assessments as $assessment): ?>
                        <div class="col-12 col-md-6 col-lg-4 mb-4">
                            <div class="card h-100">
                                <div class="card-body">
                                    <div class="d-flex justify-between align-start mb-3">
                                        <div class="stat-card-icon primary">
                                            <i class="<?= htmlspecialchars($assessment['skill_icon'] ?: 'fas fa-code') ?>"></i>
                                        </div>
                                        <?php if ($assessment['is_passed']): ?>
                                            <span class="badge badge-success">
                                                <i class="fas fa-check"></i> Passed
                                            </span>
                                        <?php elseif ($assessment['last_attempt_id']): ?>
                                            <span class="badge badge-warning">Attempted</span>
                                        <?php endif; ?>
                                    </div>
                                    
                                    <h5 class="card-title"><?= htmlspecialchars($assessment['title']) ?></h5>
                                    <p class="text-muted text-sm mb-3">
                                        <?= htmlspecialchars(substr($assessment['description'], 0, 100)) ?>...
                                    </p>
                                    
                                    <div class="d-flex flex-wrap gap-2 mb-3">
                                        <span class="badge badge-primary">
                                            <?= htmlspecialchars($assessment['skill_name']) ?>
                                        </span>
                                        <span class="badge badge-<?= $assessment['difficulty'] === 'easy' ? 'success' : ($assessment['difficulty'] === 'medium' ? 'warning' : 'danger') ?>">
                                            <?= ucfirst($assessment['difficulty']) ?>
                                        </span>
                                    </div>
                                    
                                    <div class="text-sm text-muted mb-3">
                                        <div class="d-flex justify-between mb-1">
                                            <span><i class="fas fa-question-circle"></i> <?= $assessment['question_count'] ?> questions</span>
                                            <span><i class="fas fa-clock"></i> <?= $assessment['duration_minutes'] ?> min</span>
                                        </div>
                                        <div class="d-flex justify-between">
                                            <span><i class="fas fa-star"></i> <?= $assessment['total_marks'] ?> marks</span>
                                            <span><i class="fas fa-check-circle"></i> Pass: <?= $assessment['passing_marks'] ?></span>
                                        </div>
                                    </div>
                                    
                                    <?php if ($assessment['best_score']): ?>
                                        <div class="mb-3">
                                            <small class="text-muted">Best Score</small>
                                            <div class="progress-bar-container">
                                                <div class="progress-bar-fill" style="width: <?= $assessment['best_score'] ?>%"></div>
                                            </div>
                                            <small class="text-muted"><?= number_format($assessment['best_score'], 1) ?>%</small>
                                        </div>
                                    <?php endif; ?>
                                </div>
                                
                                <div class="card-footer">
                                    <?php if ($assessment['is_passed']): ?>
                                        <a href="assessment-result.php?id=<?= $assessment['last_attempt_id'] ?>" class="btn btn-outline btn-block">
                                            <i class="fas fa-eye"></i> View Result
                                        </a>
                                    <?php else: ?>
                                        <a href="take-assessment.php?id=<?= $assessment['id'] ?>" class="btn btn-primary btn-block">
                                            <i class="fas fa-play"></i> <?= $assessment['last_attempt_id'] ? 'Retry' : 'Start' ?> Assessment
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

<?php include dirname(__DIR__) . '/includes/footer.php'; ?>
