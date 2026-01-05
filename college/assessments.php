<?php
/**
 * College Admin - Assessments Overview
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_COLLEGE_ADMIN);

$collegeId = $_SESSION['college_id'];

// Get assessments
$result = query("SELECT a.*, s.name as skill_name, s.icon as skill_icon,
                 u.full_name as created_by_name,
                 (SELECT COUNT(*) FROM questions WHERE assessment_id = a.id) as question_count,
                 (SELECT COUNT(*) FROM attempts WHERE assessment_id = a.id AND status IN ('evaluated', 'auto_submitted')) as attempt_count
                 FROM assessments a
                 JOIN skills s ON a.skill_id = s.id
                 JOIN users u ON a.created_by = u.id
                 WHERE a.college_id = $collegeId
                 ORDER BY a.created_at DESC");
$assessments = fetchAll($result);

$pageTitle = 'Assessments';
include dirname(__DIR__) . '/includes/header.php';
?>

<div class="layout">
    <?php include dirname(__DIR__) . '/includes/sidebar.php'; ?>
    
    <div class="main-content">
        <div class="content-wrapper">
            <div class="content-header">
                <div>
                    <h1 class="page-title">Assessments</h1>
                    <p class="text-muted">All assessments in your college</p>
                </div>
            </div>
            
            <?php if (empty($assessments)): ?>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <h3>No Assessments Yet</h3>
                    <p>Faculty members can create assessments for students</p>
                </div>
            <?php else: ?>
                <div class="card">
                    <div class="card-body">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Assessment</th>
                                        <th class="hide-mobile">Skill</th>
                                        <th class="hide-mobile">Created By</th>
                                        <th>Questions</th>
                                        <th>Attempts</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($assessments as $a): ?>
                                        <tr>
                                            <td>
                                                <div class="font-medium"><?= htmlspecialchars($a['title']) ?></div>
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
                                            <td class="hide-mobile"><?= htmlspecialchars($a['created_by_name']) ?></td>
                                            <td><?= $a['question_count'] ?></td>
                                            <td><?= $a['attempt_count'] ?></td>
                                            <td>
                                                <?php if ($a['is_active']): ?>
                                                    <span class="badge badge-success">Active</span>
                                                <?php else: ?>
                                                    <span class="badge badge-secondary">Inactive</span>
                                                <?php endif; ?>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php include dirname(__DIR__) . '/includes/footer.php'; ?>
