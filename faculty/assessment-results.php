<?php
/**
 * Faculty - Assessment Results
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_FACULTY);

$userId = getCurrentUserId();
$collegeId = $_SESSION['college_id'];
$assessmentId = (int)($_GET['id'] ?? 0);

// Get assessment
$result = query("SELECT a.*, s.name as skill_name FROM assessments a 
                 JOIN skills s ON a.skill_id = s.id 
                 WHERE a.id = $assessmentId AND a.college_id = $collegeId AND a.created_by = $userId");
$assessment = fetch($result);

if (!$assessment) {
    setFlash('danger', 'Assessment not found.');
    redirect('assessments.php');
}

// Get attempts
$result = query("SELECT at.*, u.full_name, u.email
                 FROM attempts at
                 JOIN users u ON at.user_id = u.id
                 WHERE at.assessment_id = $assessmentId AND at.status IN ('evaluated', 'auto_submitted')
                 ORDER BY at.submitted_at DESC");
$attempts = fetchAll($result);

// Calculate stats
$totalAttempts = count($attempts);
$passedCount = count(array_filter($attempts, fn($a) => $a['is_passed']));
$avgScore = $totalAttempts > 0 ? array_sum(array_column($attempts, 'percentage')) / $totalAttempts : 0;

$pageTitle = 'Assessment Results';
include dirname(__DIR__) . '/includes/header.php';
?>

<div class="layout">
    <?php include dirname(__DIR__) . '/includes/sidebar.php'; ?>
    
    <div class="main-content">
        <div class="content-wrapper">
            <div class="content-header">
                <div>
                    <h1 class="page-title">Assessment Results</h1>
                    <p class="text-muted"><?= htmlspecialchars($assessment['title']) ?></p>
                </div>
                <a href="assessments.php" class="btn btn-outline">
                    <i class="fas fa-arrow-left"></i> Back
                </a>
            </div>
            
            <!-- Stats -->
            <div class="stats-grid mb-4">
                <div class="stat-card">
                    <div class="stat-card-header">
                        <span class="stat-card-title">Total Attempts</span>
                        <div class="stat-card-icon primary">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                    <div class="stat-card-value"><?= $totalAttempts ?></div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-header">
                        <span class="stat-card-title">Passed</span>
                        <div class="stat-card-icon success">
                            <i class="fas fa-check"></i>
                        </div>
                    </div>
                    <div class="stat-card-value"><?= $passedCount ?></div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-header">
                        <span class="stat-card-title">Pass Rate</span>
                        <div class="stat-card-icon warning">
                            <i class="fas fa-percentage"></i>
                        </div>
                    </div>
                    <div class="stat-card-value"><?= $totalAttempts > 0 ? number_format(($passedCount / $totalAttempts) * 100, 1) : 0 ?>%</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-header">
                        <span class="stat-card-title">Average Score</span>
                        <div class="stat-card-icon info">
                            <i class="fas fa-chart-line"></i>
                        </div>
                    </div>
                    <div class="stat-card-value"><?= number_format($avgScore, 1) ?>%</div>
                </div>
            </div>
            
            <!-- Results Table -->
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title">Student Attempts</h5>
                </div>
                <div class="card-body">
                    <?php if (empty($attempts)): ?>
                        <div class="empty-state py-4">
                            <div class="empty-icon">
                                <i class="fas fa-clipboard-list"></i>
                            </div>
                            <h4>No Attempts Yet</h4>
                            <p>No students have attempted this assessment yet.</p>
                        </div>
                    <?php else: ?>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th class="hide-mobile">Score</th>
                                        <th>Percentage</th>
                                        <th class="hide-mobile">Time</th>
                                        <th>Result</th>
                                        <th class="hide-mobile">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($attempts as $attempt): ?>
                                        <tr>
                                            <td>
                                                <div class="font-medium"><?= htmlspecialchars($attempt['full_name']) ?></div>
                                                <small class="text-muted hide-desktop"><?= htmlspecialchars($attempt['email']) ?></small>
                                            </td>
                                            <td class="hide-mobile">
                                                <?= $attempt['obtained_marks'] ?>/<?= $attempt['total_marks'] ?>
                                            </td>
                                            <td>
                                                <div class="d-flex align-center gap-2">
                                                    <div class="progress-bar-container" style="width: 60px;">
                                                        <div class="progress-bar-fill" style="width: <?= $attempt['percentage'] ?>%"></div>
                                                    </div>
                                                    <span><?= number_format($attempt['percentage'], 1) ?>%</span>
                                                </div>
                                            </td>
                                            <td class="hide-mobile">
                                                <?= floor($attempt['time_taken_seconds'] / 60) ?>:<?= str_pad($attempt['time_taken_seconds'] % 60, 2, '0', STR_PAD_LEFT) ?>
                                            </td>
                                            <td>
                                                <?php if ($attempt['is_passed']): ?>
                                                    <span class="badge badge-success">Passed</span>
                                                <?php else: ?>
                                                    <span class="badge badge-danger">Failed</span>
                                                <?php endif; ?>
                                                <?php if ($attempt['status'] === 'auto_submitted'): ?>
                                                    <span class="badge badge-warning" title="Auto-submitted due to tab switches">
                                                        <i class="fas fa-exclamation-triangle"></i>
                                                    </span>
                                                <?php endif; ?>
                                            </td>
                                            <td class="hide-mobile">
                                                <?= date('M j, g:i A', strtotime($attempt['submitted_at'])) ?>
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
    </div>
</div>

<?php include dirname(__DIR__) . '/includes/footer.php'; ?>
