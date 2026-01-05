<?php
/**
 * Super Admin Dashboard
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_SUPER_ADMIN);

$pageTitle = 'Dashboard';
$currentPage = 'dashboard';

// Get statistics
$stats = [];

// Total colleges
$result = query("SELECT COUNT(*) as count FROM colleges");
$stats['total_colleges'] = fetch($result)['count'];

// Pending colleges
$result = query("SELECT COUNT(*) as count FROM colleges WHERE verification_status = 'pending'");
$stats['pending_colleges'] = fetch($result)['count'];

// Verified colleges
$result = query("SELECT COUNT(*) as count FROM colleges WHERE verification_status = 'approved'");
$stats['verified_colleges'] = fetch($result)['count'];

// Total students
$result = query("SELECT COUNT(*) as count FROM users WHERE role_id = " . ROLE_STUDENT);
$stats['total_students'] = fetch($result)['count'];

// Total faculty
$result = query("SELECT COUNT(*) as count FROM users WHERE role_id = " . ROLE_FACULTY);
$stats['total_faculty'] = fetch($result)['count'];

// Total certificates
$result = query("SELECT COUNT(*) as count FROM certificates");
$stats['total_certificates'] = fetch($result)['count'];

// Total assessments
$result = query("SELECT COUNT(*) as count FROM assessments");
$stats['total_assessments'] = fetch($result)['count'];

// Total skills
$result = query("SELECT COUNT(*) as count FROM skills");
$stats['total_skills'] = fetch($result)['count'];

// Recent pending colleges
$result = query("SELECT * FROM colleges WHERE verification_status = 'pending' ORDER BY created_at DESC LIMIT 5");
$pendingColleges = fetchAll($result);

// Recent activities
$result = query("SELECT u.first_name, u.last_name, u.email, r.name as role_name, u.created_at 
                 FROM users u 
                 JOIN roles r ON u.role_id = r.id 
                 ORDER BY u.created_at DESC LIMIT 10");
$recentUsers = fetchAll($result);

require_once __DIR__ . '/includes/admin-header.php';
?>

    <!-- Stats Grid -->
    <div class="row mb-4">
        <div class="col-12 col-md-3 mb-3">
            <div class="stat-card gradient-blue">
                <div class="stat-icon">
                    <i class="fas fa-university"></i>
                </div>
                <div class="stat-details">
                    <h3><?= $stats['total_colleges'] ?></h3>
                    <p>Total Colleges</p>
                    <?php if($stats['pending_colleges'] > 0): ?>
                        <small class="badge badge-warning"><?= $stats['pending_colleges'] ?> pending</small>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-3 mb-3">
            <div class="stat-card gradient-green">
                <div class="stat-icon">
                    <i class="fas fa-user-graduate"></i>
                </div>
                <div class="stat-details">
                    <h3><?= number_format($stats['total_students']) ?></h3>
                    <p>Total Students</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-3 mb-3">
            <div class="stat-card gradient-purple">
                <div class="stat-icon">
                    <i class="fas fa-chalkboard-teacher"></i>
                </div>
                <div class="stat-details">
                    <h3><?= number_format($stats['total_faculty']) ?></h3>
                    <p>Total Faculty</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-3 mb-3">
            <div class="stat-card gradient-orange">
                <div class="stat-icon">
                    <i class="fas fa-certificate"></i>
                </div>
                <div class="stat-details">
                    <h3><?= number_format($stats['total_certificates']) ?></h3>
                    <p>Certificates Issued</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Secondary Stats -->
    <div class="row mb-4">
        <div class="col-12 col-md-4 mb-3">
            <div class="stat-card gradient-teal">
                <div class="stat-icon">
                    <i class="fas fa-clipboard-check"></i>
                </div>
                <div class="stat-details">
                    <h3><?= number_format($stats['total_assessments']) ?></h3>
                    <p>Total Assessments</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-4 mb-3">
            <div class="stat-card gradient-pink">
                <div class="stat-icon">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="stat-details">
                    <h3><?= number_format($stats['total_skills']) ?></h3>
                    <p>Skills Available</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-4 mb-3">
            <div class="stat-card gradient-indigo">
                <div class="stat-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-details">
                    <h3><?= number_format($stats['verified_colleges']) ?></h3>
                    <p>Verified Colleges</p>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Pending Colleges -->
        <div class="col-12 col-lg-6 mb-4">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-clock"></i> Pending Verifications</h3>
                </div>
                <div class="card-body p-0">
                    <?php if (empty($pendingColleges)): ?>
                        <div class="empty-state">
                            <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                            <h4>All Caught Up!</h4>
                            <p class="text-muted">No pending verification requests</p>
                        </div>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <tbody>
                                    <?php foreach ($pendingColleges as $college): ?>
                                        <tr>
                                            <td>
                                                <div>
                                                    <strong><?= htmlspecialchars($college['name']) ?></strong>
                                                    <br><small class="text-muted"><?= htmlspecialchars($college['city']) ?>, <?= htmlspecialchars($college['state']) ?></small>
                                                </div>
                                            </td>
                                            <td class="text-right">
                                                <a href="colleges.php?action=review&id=<?= $college['id'] ?>" class="btn btn-sm btn-primary">
                                                    <i class="fas fa-eye"></i> Review
                                                </a>
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

        <!-- Recent Registrations -->
        <div class="col-12 col-lg-6 mb-4">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-user-plus"></i> Recent Registrations</h3>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <tbody>
                                <?php foreach ($recentUsers as $user): ?>
                                    <tr>
                                        <td>
                                            <div>
                                                <strong><?= htmlspecialchars($user['first_name'] . ' ' . $user['last_name']) ?></strong>
                                                <br><small class="text-muted"><?= htmlspecialchars($user['email']) ?></small>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="badge badge-<?= 
                                                $user['role_name'] == 'Student' ? 'success' : 
                                                ($user['role_name'] == 'Faculty' ? 'info' : 
                                                ($user['role_name'] == 'College Admin' ? 'warning' : 'secondary'))
                                            ?>">
                                                <?= htmlspecialchars($user['role_name']) ?>
                                            </span>
                                        </td>
                                        <td class="text-right">
                                            <small class="text-muted"><?= date('M d, Y', strtotime($user['created_at'])) ?></small>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
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
