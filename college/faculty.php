<?php
/**
 * College Admin - Faculty Management
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_COLLEGE_ADMIN);

$collegeId = $_SESSION['college_id'];

// Handle actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $facultyId = (int)($_POST['faculty_id'] ?? 0);
    
    if ($action === 'toggle_status' && $facultyId) {
        $result = query("SELECT is_active FROM users WHERE id = $facultyId AND college_id = $collegeId AND role_id = " . ROLE_FACULTY);
        $faculty = fetch($result);
        if ($faculty) {
            $newStatus = $faculty['is_active'] ? 0 : 1;
            query("UPDATE users SET is_active = $newStatus WHERE id = $facultyId");
            setFlash('success', 'Faculty status updated.');
        }
    }
    redirect('faculty.php');
}

// Get faculty
$result = query("SELECT u.*, 
                 (SELECT COUNT(*) FROM assessments WHERE created_by = u.id) as assessments
                 FROM users u
                 WHERE u.college_id = $collegeId AND u.role_id = " . ROLE_FACULTY . "
                 ORDER BY u.created_at DESC");
$faculty = fetchAll($result);

$pageTitle = 'Faculty';
include dirname(__DIR__) . '/includes/header.php';
?>

<div class="layout">
    <?php include dirname(__DIR__) . '/includes/sidebar.php'; ?>
    
    <div class="main-content">
        <div class="content-wrapper">
            <div class="content-header">
                <div>
                    <h1 class="page-title">Faculty</h1>
                    <p class="text-muted">Manage faculty members in your college</p>
                </div>
            </div>
            
            <?php if ($flash = getFlash()): ?>
                <div class="alert alert-<?= $flash['type'] ?>">
                    <?= $flash['message'] ?>
                </div>
            <?php endif; ?>
            
            <?php if (empty($faculty)): ?>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-chalkboard-teacher"></i>
                    </div>
                    <h3>No Faculty Yet</h3>
                    <p>Faculty will appear here once they register with your college</p>
                </div>
            <?php else: ?>
                <div class="card">
                    <div class="card-body">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Faculty</th>
                                        <th class="hide-mobile">Email</th>
                                        <th>Assessments</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($faculty as $f): ?>
                                        <tr>
                                            <td>
                                                <div class="d-flex align-center gap-2">
                                                    <div class="avatar">
                                                        <?= strtoupper(substr($f['full_name'], 0, 1)) ?>
                                                    </div>
                                                    <div>
                                                        <div class="font-medium"><?= htmlspecialchars($f['full_name']) ?></div>
                                                        <small class="text-muted hide-desktop"><?= htmlspecialchars($f['email']) ?></small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="hide-mobile"><?= htmlspecialchars($f['email']) ?></td>
                                            <td><?= $f['assessments'] ?></td>
                                            <td>
                                                <?php if ($f['is_active']): ?>
                                                    <span class="badge badge-success">Active</span>
                                                <?php else: ?>
                                                    <span class="badge badge-secondary">Inactive</span>
                                                <?php endif; ?>
                                            </td>
                                            <td>
                                                <form method="POST" style="display: inline;">
                                                    <input type="hidden" name="action" value="toggle_status">
                                                    <input type="hidden" name="faculty_id" value="<?= $f['id'] ?>">
                                                    <button type="submit" class="btn btn-sm btn-<?= $f['is_active'] ? 'warning' : 'success' ?>">
                                                        <i class="fas fa-<?= $f['is_active'] ? 'ban' : 'check' ?>"></i>
                                                        <?= $f['is_active'] ? 'Deactivate' : 'Activate' ?>
                                                    </button>
                                                </form>
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
