<?php
/**
 * Faculty Dashboard
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_FACULTY);

$pageTitle = 'Dashboard';
$currentPage = 'dashboard';
$userId = getCurrentUserId();
$collegeId = $_SESSION['college_id'];

$user = getUserById($userId);

// Get statistics
$stats = [];

// My assessments
$result = query("SELECT COUNT(*) as count FROM assessments WHERE created_by = $userId");
$stats['my_assessments'] = fetch($result)['count'];

// Total questions
$result = query("SELECT COUNT(*) as count FROM questions q JOIN assessments a ON q.assessment_id = a.id WHERE a.created_by = $userId");
$stats['total_questions'] = fetch($result)['count'];

// Total attempts on my assessments
$result = query("SELECT COUNT(*) as count FROM attempts at JOIN assessments a ON at.assessment_id = a.id WHERE a.created_by = $userId");
$stats['total_attempts'] = fetch($result)['count'];

// Students in college
$result = query("SELECT COUNT(*) as count FROM users WHERE role_id = " . ROLE_STUDENT . " AND college_id = $collegeId");
$stats['total_students'] = fetch($result)['count'];

// Recent assessments
$result = query("SELECT a.*, s.name as skill_name,
                 (SELECT COUNT(*) FROM questions WHERE assessment_id = a.id) as question_count,
                 (SELECT COUNT(*) FROM attempts WHERE assessment_id = a.id) as attempt_count
                 FROM assessments a
                 JOIN skills s ON a.skill_id = s.id
                 WHERE a.created_by = $userId
                 ORDER BY a.created_at DESC LIMIT 5");
$myAssessments = fetchAll($result);

// Recent student performance
$result = query("SELECT at.*, u.first_name, u.last_name, a.title as assessment_title, s.name as skill_name
                 FROM attempts at
                 JOIN users u ON at.user_id = u.id
                 JOIN assessments a ON at.assessment_id = a.id
                 JOIN skills s ON a.skill_id = s.id
                 WHERE a.created_by = $userId AND at.status = 'evaluated'
                 ORDER BY at.submitted_at DESC LIMIT 10");
$recentResults = fetchAll($result);
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
                        <h5 class="mb-0">Welcome, <?= htmlspecialchars($user['first_name']) ?>!</h5>
                        <small class="text-muted">Faculty - <?= htmlspecialchars($_SESSION['college_name']) ?></small>
                    </div>
                    <a href="create-assessment.php" class="btn btn-primary">
                        <i class="fas fa-plus"></i>
                        <span class="hide-mobile">Create Assessment</span>
                    </a>
                </div>
            </header>
            
            <div class="content-wrapper">
                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">My Assessments</span>
                            <div class="stat-card-icon primary">
                                <i class="fas fa-clipboard-list"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= $stats['my_assessments'] ?></div>
                        <a href="assessments.php" class="stat-card-change text-primary">
                            View all →
                        </a>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Total Questions</span>
                            <div class="stat-card-icon success">
                                <i class="fas fa-question-circle"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= $stats['total_questions'] ?></div>
                        <a href="questions.php" class="stat-card-change text-primary">
                            Question bank →
                        </a>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Total Attempts</span>
                            <div class="stat-card-icon warning">
                                <i class="fas fa-users"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= $stats['total_attempts'] ?></div>
                        <a href="results.php" class="stat-card-change text-primary">
                            View results →
                        </a>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">College Students</span>
                            <div class="stat-card-icon danger">
                                <i class="fas fa-user-graduate"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= $stats['total_students'] ?></div>
                        <a href="students.php" class="stat-card-change text-primary">
                            View all →
                        </a>
                    </div>
                </div>
                
                <!-- Content Row -->
                <div class="row mt-3">
                    <!-- My Assessments -->
                    <div class="col-12 col-md-6">
                        <div class="card">
                            <div class="card-header d-flex justify-between align-center">
                                <h5 class="card-title">My Assessments</h5>
                                <a href="create-assessment.php" class="btn btn-sm btn-primary">
                                    <i class="fas fa-plus"></i> Create
                                </a>
                            </div>
                            <div class="card-body p-0">
                                <?php if (empty($myAssessments)): ?>
                                    <div class="empty-state p-4">
                                        <i class="fas fa-clipboard-list empty-state-icon"></i>
                                        <p class="empty-state-title">No assessments created</p>
                                        <p class="empty-state-text">Create your first assessment to get started.</p>
                                        <a href="create-assessment.php" class="btn btn-primary">Create Assessment</a>
                                    </div>
                                <?php else: ?>
                                    <div class="table-responsive">
                                        <table class="table mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Assessment</th>
                                                    <th>Questions</th>
                                                    <th>Attempts</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php foreach ($myAssessments as $assessment): ?>
                                                    <tr>
                                                        <td>
                                                            <strong><?= htmlspecialchars($assessment['title']) ?></strong>
                                                            <br>
                                                            <small class="text-muted"><?= htmlspecialchars($assessment['skill_name']) ?></small>
                                                        </td>
                                                        <td><?= $assessment['question_count'] ?></td>
                                                        <td><?= $assessment['attempt_count'] ?></td>
                                                        <td>
                                                            <?php if ($assessment['is_active']): ?>
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
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Recent Results -->
                    <div class="col-12 col-md-6">
                        <div class="card">
                            <div class="card-header d-flex justify-between align-center">
                                <h5 class="card-title">Recent Results</h5>
                                <a href="results.php" class="btn btn-sm btn-outline">View All</a>
                            </div>
                            <div class="card-body p-0">
                                <?php if (empty($recentResults)): ?>
                                    <div class="empty-state p-4">
                                        <i class="fas fa-poll empty-state-icon"></i>
                                        <p class="empty-state-title">No results yet</p>
                                        <p class="empty-state-text">Results will appear when students complete assessments.</p>
                                    </div>
                                <?php else: ?>
                                    <div class="table-responsive">
                                        <table class="table mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Student</th>
                                                    <th>Assessment</th>
                                                    <th>Score</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php foreach ($recentResults as $result): ?>
                                                    <tr>
                                                        <td>
                                                            <?= htmlspecialchars($result['first_name'] . ' ' . $result['last_name']) ?>
                                                        </td>
                                                        <td>
                                                            <small><?= htmlspecialchars($result['assessment_title']) ?></small>
                                                        </td>
                                                        <td>
                                                            <span class="badge badge-<?= $result['is_passed'] ? 'success' : 'danger' ?>">
                                                                <?= number_format($result['percentage'], 1) ?>%
                                                            </span>
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
        </div>
    </div>
    
    <script src="<?= APP_URL ?>/assets/js/main.js"></script>
</body>
</html>
