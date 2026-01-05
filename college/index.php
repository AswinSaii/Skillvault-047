<?php
/**
 * College Admin Dashboard
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_COLLEGE_ADMIN);

$pageTitle = 'Dashboard';
$currentPage = 'dashboard';
$collegeId = $_SESSION['college_id'];

// Get college info
$result = query("SELECT * FROM colleges WHERE id = $collegeId");
$college = fetch($result);

// Get statistics
$stats = [];

// Total students
$result = query("SELECT COUNT(*) as count FROM users WHERE role_id = " . ROLE_STUDENT . " AND college_id = $collegeId");
$stats['total_students'] = fetch($result)['count'];

// Total faculty
$result = query("SELECT COUNT(*) as count FROM users WHERE role_id = " . ROLE_FACULTY . " AND college_id = $collegeId");
$stats['total_faculty'] = fetch($result)['count'];

// Total assessments
$result = query("SELECT COUNT(*) as count FROM assessments WHERE college_id = $collegeId");
$stats['total_assessments'] = fetch($result)['count'];

// Total certificates
$result = query("SELECT COUNT(*) as count FROM certificates WHERE college_id = $collegeId AND is_revoked = 0");
$stats['total_certificates'] = fetch($result)['count'];

// Recent students
$result = query("SELECT * FROM users WHERE role_id = " . ROLE_STUDENT . " AND college_id = $collegeId ORDER BY created_at DESC LIMIT 5");
$recentStudents = fetchAll($result);

// Recent assessments
$result = query("SELECT a.*, s.name as skill_name, u.first_name, u.last_name
                 FROM assessments a
                 JOIN skills s ON a.skill_id = s.id
                 JOIN users u ON a.created_by = u.id
                 WHERE a.college_id = $collegeId
                 ORDER BY a.created_at DESC LIMIT 5");
$recentAssessments = fetchAll($result);
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
                        <h5 class="mb-0"><?= htmlspecialchars($college['name']) ?></h5>
                        <small class="text-muted"><?= htmlspecialchars($college['city']) ?>, <?= htmlspecialchars($college['state']) ?></small>
                    </div>
                    <div class="d-flex align-center gap-2">
                        <div class="verified-badge">
                            <i class="fas fa-check-circle"></i>
                            Verified
                        </div>
                    </div>
                </div>
            </header>
            
            <div class="content-wrapper">
                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Total Students</span>
                            <div class="stat-card-icon primary">
                                <i class="fas fa-user-graduate"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= $stats['total_students'] ?></div>
                        <a href="students.php" class="stat-card-change text-primary">
                            View all →
                        </a>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Faculty Members</span>
                            <div class="stat-card-icon success">
                                <i class="fas fa-chalkboard-teacher"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= $stats['total_faculty'] ?></div>
                        <a href="faculty.php" class="stat-card-change text-primary">
                            Manage →
                        </a>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Assessments</span>
                            <div class="stat-card-icon warning">
                                <i class="fas fa-clipboard-list"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= $stats['total_assessments'] ?></div>
                        <a href="assessments.php" class="stat-card-change text-primary">
                            Manage →
                        </a>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Certificates Issued</span>
                            <div class="stat-card-icon danger">
                                <i class="fas fa-certificate"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= $stats['total_certificates'] ?></div>
                        <a href="certificates.php" class="stat-card-change text-primary">
                            View all →
                        </a>
                    </div>
                </div>
                
                <!-- Content Row -->
                <div class="row mt-3">
                    <!-- Recent Students -->
                    <div class="col-12 col-md-6">
                        <div class="card">
                            <div class="card-header d-flex justify-between align-center">
                                <h5 class="card-title">Recent Students</h5>
                                <a href="students.php" class="btn btn-sm btn-outline">View All</a>
                            </div>
                            <div class="card-body p-0">
                                <?php if (empty($recentStudents)): ?>
                                    <div class="empty-state p-4">
                                        <i class="fas fa-user-graduate empty-state-icon"></i>
                                        <p class="empty-state-title">No students yet</p>
                                        <p class="empty-state-text">Share registration link with students.</p>
                                    </div>
                                <?php else: ?>
                                    <div class="table-responsive">
                                        <table class="table mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Student</th>
                                                    <th>Department</th>
                                                    <th>Joined</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php foreach ($recentStudents as $student): ?>
                                                    <tr>
                                                        <td>
                                                            <div class="d-flex align-center gap-1">
                                                                <div class="avatar avatar-sm">
                                                                    <?= strtoupper(substr($student['first_name'], 0, 1)) ?>
                                                                </div>
                                                                <div>
                                                                    <strong><?= htmlspecialchars($student['first_name'] . ' ' . $student['last_name']) ?></strong>
                                                                    <br>
                                                                    <small class="text-muted"><?= htmlspecialchars($student['email']) ?></small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><?= htmlspecialchars($student['department'] ?: '-') ?></td>
                                                        <td>
                                                            <small class="text-muted"><?= formatDate($student['created_at']) ?></small>
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
                    
                    <!-- Recent Assessments -->
                    <div class="col-12 col-md-6">
                        <div class="card">
                            <div class="card-header d-flex justify-between align-center">
                                <h5 class="card-title">Recent Assessments</h5>
                                <a href="assessments.php" class="btn btn-sm btn-outline">View All</a>
                            </div>
                            <div class="card-body p-0">
                                <?php if (empty($recentAssessments)): ?>
                                    <div class="empty-state p-4">
                                        <i class="fas fa-clipboard-list empty-state-icon"></i>
                                        <p class="empty-state-title">No assessments yet</p>
                                        <p class="empty-state-text">Faculty can create assessments.</p>
                                    </div>
                                <?php else: ?>
                                    <div class="table-responsive">
                                        <table class="table mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Assessment</th>
                                                    <th>Created By</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php foreach ($recentAssessments as $assessment): ?>
                                                    <tr>
                                                        <td>
                                                            <strong><?= htmlspecialchars($assessment['title']) ?></strong>
                                                            <br>
                                                            <small class="text-muted"><?= htmlspecialchars($assessment['skill_name']) ?></small>
                                                        </td>
                                                        <td><?= htmlspecialchars($assessment['first_name'] . ' ' . $assessment['last_name']) ?></td>
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
                </div>
                
                <!-- Quick Actions -->
                <div class="card mt-3">
                    <div class="card-header">
                        <h5 class="card-title">Quick Actions</h5>
                    </div>
                    <div class="card-body">
                        <div class="d-flex gap-2 flex-wrap">
                            <a href="faculty.php?action=add" class="btn btn-outline">
                                <i class="fas fa-plus"></i> Add Faculty
                            </a>
                            <a href="students.php?action=invite" class="btn btn-outline">
                                <i class="fas fa-envelope"></i> Invite Students
                            </a>
                            <a href="certificates.php?action=issue" class="btn btn-outline">
                                <i class="fas fa-certificate"></i> Issue Certificate
                            </a>
                            <a href="analytics.php" class="btn btn-outline">
                                <i class="fas fa-chart-bar"></i> View Analytics
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="<?= APP_URL ?>/assets/js/main.js"></script>
</body>
</html>
