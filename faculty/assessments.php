<?php
/**
 * Faculty - Assessments Management
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_FACULTY);

$userId = getCurrentUserId();
$collegeId = $_SESSION['college_id'];

// Get assessments
$result = query("SELECT a.*, s.name as skill_name, s.icon as skill_icon,
                 (SELECT COUNT(*) FROM questions WHERE assessment_id = a.id) as question_count,
                 (SELECT COUNT(*) FROM attempts WHERE assessment_id = a.id AND status IN ('evaluated', 'auto_submitted')) as attempt_count
                 FROM assessments a
                 JOIN skills s ON a.skill_id = s.id
                 WHERE a.college_id = $collegeId AND a.created_by = $userId
                 ORDER BY a.created_at DESC");
$assessments = fetchAll($result);

$pageTitle = 'My Assessments';
include dirname(__DIR__) . '/includes/header.php';
?>

<div class="layout">
    <?php include dirname(__DIR__) . '/includes/sidebar.php'; ?>
    
    <div class="main-content">
        <div class="content-wrapper">
            <div class="content-header">
                <div>
                    <h1 class="page-title">My Assessments</h1>
                    <p class="text-muted">Create and manage skill assessments</p>
                </div>
                <a href="create-assessment.php" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                    <span class="hide-mobile">Create Assessment</span>
                </a>
            </div>
            
            <?php if ($flash = getFlash()): ?>
                <div class="alert alert-<?= $flash['type'] ?>">
                    <?= $flash['message'] ?>
                </div>
            <?php endif; ?>
            
            <?php if (empty($assessments)): ?>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <h3>No Assessments Yet</h3>
                    <p>Create your first skill assessment to test students</p>
                    <a href="create-assessment.php" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Create Assessment
                    </a>
                </div>
            <?php else: ?>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Assessment</th>
                                <th class="hide-mobile">Skill</th>
                                <th class="hide-mobile">Questions</th>
                                <th class="hide-mobile">Attempts</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($assessments as $a): ?>
                                <tr>
                                    <td>
                                        <div class="font-medium"><?= htmlspecialchars($a['title']) ?></div>
                                        <div class="text-sm text-muted hide-desktop">
                                            <?= htmlspecialchars($a['skill_name']) ?> • <?= $a['question_count'] ?> Q
                                        </div>
                                        <div class="d-flex gap-1 mt-1">
                                            <span class="badge badge-<?= $a['difficulty'] === 'easy' ? 'success' : ($a['difficulty'] === 'medium' ? 'warning' : 'danger') ?>">
                                                <?= ucfirst($a['difficulty']) ?>
                                            </span>
                                            <?php if ($a['is_daily_quiz']): ?>
                                                <span class="badge badge-info">Daily Quiz</span>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                    <td class="hide-mobile">
                                        <span class="badge badge-primary">
                                            <i class="<?= htmlspecialchars($a['skill_icon'] ?: 'fas fa-code') ?>"></i>
                                            <?= htmlspecialchars($a['skill_name']) ?>
                                        </span>
                                    </td>
                                    <td class="hide-mobile"><?= $a['question_count'] ?></td>
                                    <td class="hide-mobile"><?= $a['attempt_count'] ?></td>
                                    <td>
                                        <?php if ($a['is_active']): ?>
                                            <span class="badge badge-success">Active</span>
                                        <?php else: ?>
                                            <span class="badge badge-secondary">Inactive</span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <div class="d-flex gap-1">
                                            <a href="questions.php?assessment_id=<?= $a['id'] ?>" class="btn btn-sm btn-primary" title="Manage Questions">
                                                <i class="fas fa-list"></i>
                                            </a>
                                            <a href="create-assessment.php?id=<?= $a['id'] ?>" class="btn btn-sm btn-outline" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <a href="assessment-results.php?id=<?= $a['id'] ?>" class="btn btn-sm btn-secondary" title="View Results">
                                                <i class="fas fa-chart-bar"></i>
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php include dirname(__DIR__) . '/includes/footer.php'; ?>
