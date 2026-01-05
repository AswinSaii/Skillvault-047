<?php
/**
 * Super Admin - Colleges Management
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_SUPER_ADMIN);

$pageTitle = 'Manage Colleges';
$currentPage = 'colleges';

// Handle actions
$action = $_GET['action'] ?? '';
$id = (int)($_GET['id'] ?? 0);
$message = '';
$messageType = '';

// Handle approval/rejection
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $collegeId = (int)$_POST['college_id'];
    $action = $_POST['action'] ?? '';
    
    if ($action === 'approve') {
        $sql = "UPDATE colleges SET verification_status = 'approved', verified_at = NOW(), verified_by = " . getCurrentUserId() . " WHERE id = $collegeId";
        if (query($sql)) {
            // Activate college admin
            query("UPDATE users SET is_active = 1 WHERE college_id = $collegeId AND role_id = " . ROLE_COLLEGE_ADMIN);
            $message = 'College approved successfully!';
            $messageType = 'success';
        }
    } elseif ($action === 'reject') {
        $reason = escape($_POST['reason'] ?? '');
        $sql = "UPDATE colleges SET verification_status = 'rejected', rejection_reason = '$reason' WHERE id = $collegeId";
        if (query($sql)) {
            $message = 'College rejected.';
            $messageType = 'warning';
        }
    }
}

// Get filter
$statusFilter = $_GET['status'] ?? '';
$where = '';
if ($statusFilter && in_array($statusFilter, ['pending', 'approved', 'rejected'])) {
    $where = "WHERE verification_status = '$statusFilter'";
}

// Get colleges
$result = query("SELECT c.*, 
                 (SELECT COUNT(*) FROM users WHERE college_id = c.id AND role_id = " . ROLE_STUDENT . ") as student_count,
                 (SELECT COUNT(*) FROM users WHERE college_id = c.id AND role_id = " . ROLE_FACULTY . ") as faculty_count
                 FROM colleges c $where ORDER BY c.created_at DESC");
$colleges = fetchAll($result);

// Get counts
$result = query("SELECT verification_status, COUNT(*) as count FROM colleges GROUP BY verification_status");
$counts = [];
while ($row = fetch($result)) {
    $counts[$row['verification_status']] = $row['count'];
}

// If reviewing specific college
$reviewCollege = null;
if ($action === 'review' && $id) {
    $result = query("SELECT c.*, u.first_name, u.last_name, u.email as admin_email 
                     FROM colleges c 
                     LEFT JOIN users u ON u.college_id = c.id AND u.role_id = " . ROLE_COLLEGE_ADMIN . "
                     WHERE c.id = $id");
    $reviewCollege = fetch($result);
}

require_once __DIR__ . '/includes/admin-header.php';
?>

    <!-- Stats -->
    <div class="row mb-4">
        <div class="col-12 col-md-4 mb-3">
            <div class="stat-card gradient-blue">
                <div class="stat-icon">
                    <i class="fas fa-university"></i>
                </div>
                <div class="stat-details">
                    <h3><?= count($colleges) ?></h3>
                    <p>Total Colleges</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-4 mb-3">
            <div class="stat-card gradient-orange">
                <div class="stat-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-details">
                    <h3><?= $counts['pending'] ?? 0 ?></h3>
                    <p>Pending Review</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-4 mb-3">
            <div class="stat-card gradient-green">
                <div class="stat-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-details">
                    <h3><?= $counts['approved'] ?? 0 ?></h3>
                    <p>Approved</p>
                </div>
            </div>
        </div>
    </div>
            
            <div class="content-wrapper">
                <?php if ($message): ?>
                    <div class="alert alert-<?= $messageType ?>">
                        <?= htmlspecialchars($message) ?>
                    </div>
                <?php endif; ?>
                
                <?php if ($reviewCollege): ?>
                    <!-- Review Modal -->
                    <div class="card">
                        <div class="card-header d-flex justify-between align-center">
                            <h5 class="card-title">Review College Application</h5>
                            <a href="colleges.php" class="btn btn-outline btn-sm">
                                <i class="fas fa-arrow-left"></i> Back
                            </a>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-12 col-md-6">
                                    <h6 class="text-muted mb-3">College Information</h6>
                                    <table class="table">
                                        <tr>
                                            <td class="font-semibold">Name</td>
                                            <td><?= htmlspecialchars($reviewCollege['name']) ?></td>
                                        </tr>
                                        <tr>
                                            <td class="font-semibold">Email</td>
                                            <td><?= htmlspecialchars($reviewCollege['email']) ?></td>
                                        </tr>
                                        <tr>
                                            <td class="font-semibold">Phone</td>
                                            <td><?= htmlspecialchars($reviewCollege['phone'] ?: '-') ?></td>
                                        </tr>
                                        <tr>
                                            <td class="font-semibold">Location</td>
                                            <td><?= htmlspecialchars($reviewCollege['city'] . ', ' . $reviewCollege['state']) ?></td>
                                        </tr>
                                        <tr>
                                            <td class="font-semibold">Address</td>
                                            <td><?= htmlspecialchars($reviewCollege['address'] ?: '-') ?></td>
                                        </tr>
                                        <tr>
                                            <td class="font-semibold">Website</td>
                                            <td>
                                                <?php if ($reviewCollege['website']): ?>
                                                    <a href="<?= htmlspecialchars($reviewCollege['website']) ?>" target="_blank">
                                                        <?= htmlspecialchars($reviewCollege['website']) ?>
                                                        <i class="fas fa-external-link-alt"></i>
                                                    </a>
                                                <?php else: ?>
                                                    -
                                                <?php endif; ?>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="font-semibold">Applied On</td>
                                            <td><?= formatDate($reviewCollege['created_at'], 'M d, Y H:i') ?></td>
                                        </tr>
                                    </table>
                                </div>
                                <div class="col-12 col-md-6">
                                    <h6 class="text-muted mb-3">Admin Details</h6>
                                    <table class="table">
                                        <tr>
                                            <td class="font-semibold">Name</td>
                                            <td><?= htmlspecialchars($reviewCollege['first_name'] . ' ' . $reviewCollege['last_name']) ?></td>
                                        </tr>
                                        <tr>
                                            <td class="font-semibold">Email</td>
                                            <td><?= htmlspecialchars($reviewCollege['admin_email']) ?></td>
                                        </tr>
                                    </table>
                                    
                                    <h6 class="text-muted mb-3 mt-4">Current Status</h6>
                                    <?php
                                    $statusClass = $reviewCollege['verification_status'] === 'approved' ? 'success' : 
                                                   ($reviewCollege['verification_status'] === 'rejected' ? 'danger' : 'warning');
                                    ?>
                                    <span class="badge badge-<?= $statusClass ?>" style="font-size: 1rem; padding: 0.5rem 1rem;">
                                        <?= ucfirst($reviewCollege['verification_status']) ?>
                                    </span>
                                </div>
                            </div>
                            
                            <?php if ($reviewCollege['verification_status'] === 'pending'): ?>
                                <hr class="my-4">
                                <h6 class="mb-3">Take Action</h6>
                                <div class="row">
                                    <div class="col-12 col-md-6">
                                        <form method="POST" action="">
                                            <input type="hidden" name="college_id" value="<?= $reviewCollege['id'] ?>">
                                            <input type="hidden" name="action" value="approve">
                                            <button type="submit" class="btn btn-success btn-block" onclick="return confirm('Approve this college?')">
                                                <i class="fas fa-check"></i>
                                                Approve College
                                            </button>
                                        </form>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <form method="POST" action="">
                                            <input type="hidden" name="college_id" value="<?= $reviewCollege['id'] ?>">
                                            <input type="hidden" name="action" value="reject">
                                            <div class="form-group">
                                                <textarea name="reason" class="form-control" placeholder="Reason for rejection (optional)" rows="2"></textarea>
                                            </div>
                                            <button type="submit" class="btn btn-danger btn-block" onclick="return confirm('Reject this college?')">
                                                <i class="fas fa-times"></i>
                                                Reject
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                    
                <?php else: ?>
                    <!-- Colleges List -->
                    <!-- Filter Tabs -->
                    <div class="d-flex gap-2 mb-4 flex-wrap">
                        <a href="colleges.php" class="btn <?= !$statusFilter ? 'btn-primary' : 'btn-outline' ?>">
                            All <span class="badge badge-secondary"><?= array_sum($counts) ?></span>
                        </a>
                        <a href="colleges.php?status=pending" class="btn <?= $statusFilter === 'pending' ? 'btn-primary' : 'btn-outline' ?>">
                            Pending <span class="badge badge-warning"><?= $counts['pending'] ?? 0 ?></span>
                        </a>
                        <a href="colleges.php?status=approved" class="btn <?= $statusFilter === 'approved' ? 'btn-primary' : 'btn-outline' ?>">
                            Approved <span class="badge badge-success"><?= $counts['approved'] ?? 0 ?></span>
                        </a>
                        <a href="colleges.php?status=rejected" class="btn <?= $statusFilter === 'rejected' ? 'btn-primary' : 'btn-outline' ?>">
                            Rejected <span class="badge badge-danger"><?= $counts['rejected'] ?? 0 ?></span>
                        </a>
                    </div>
                    
                    <div class="card">
                        <div class="card-body p-0">
                            <?php if (empty($colleges)): ?>
                                <div class="empty-state p-4">
                                    <i class="fas fa-university empty-state-icon"></i>
                                    <p class="empty-state-title">No colleges found</p>
                                    <p class="empty-state-text">No colleges match the current filter.</p>
                                </div>
                            <?php else: ?>
                                <div class="table-responsive">
                                    <table class="table mb-0">
                                        <thead>
                                            <tr>
                                                <th>College</th>
                                                <th class="hide-mobile">Location</th>
                                                <th>Status</th>
                                                <th class="hide-mobile">Students</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach ($colleges as $college): ?>
                                                <tr>
                                                    <td>
                                                        <strong><?= htmlspecialchars($college['name']) ?></strong>
                                                        <br>
                                                        <small class="text-muted"><?= htmlspecialchars($college['email']) ?></small>
                                                    </td>
                                                    <td class="hide-mobile">
                                                        <?= htmlspecialchars($college['city']) ?>, <?= htmlspecialchars($college['state']) ?>
                                                    </td>
                                                    <td>
                                                        <?php
                                                        $statusClass = $college['verification_status'] === 'approved' ? 'success' : 
                                                                       ($college['verification_status'] === 'rejected' ? 'danger' : 'warning');
                                                        ?>
                                                        <span class="badge badge-<?= $statusClass ?>">
                                                            <?php if ($college['verification_status'] === 'approved'): ?>
                                                                <i class="fas fa-check-circle"></i>
                                                            <?php endif; ?>
                                                            <?= ucfirst($college['verification_status']) ?>
                                                        </span>
                                                    </td>
                                                    <td class="hide-mobile">
                                                        <?= $college['student_count'] ?>
                                                    </td>
                                                    <td>
                                                        <?php if ($college['verification_status'] === 'pending'): ?>
                                                            <a href="colleges.php?action=review&id=<?= $college['id'] ?>" class="btn btn-sm btn-primary">
                                                                Review
                                                            </a>
                                                        <?php else: ?>
                                                            <a href="colleges.php?action=review&id=<?= $college['id'] ?>" class="btn btn-sm btn-outline">
                                                                View
                                                            </a>
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
                <?php endif; ?>
            </div>
        </div>
    </div>

<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
