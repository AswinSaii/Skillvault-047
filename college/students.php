<?php
/**
 * College Admin - Students Management
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_COLLEGE_ADMIN);

$collegeId = $_SESSION['college_id'];

// Get students
$result = query("SELECT u.*, 
                 (SELECT COUNT(*) FROM attempts WHERE user_id = u.id AND status IN ('evaluated', 'auto_submitted')) as attempts,
                 (SELECT COUNT(*) FROM certificates WHERE user_id = u.id) as certificates,
                 (SELECT current_streak FROM streaks WHERE user_id = u.id) as streak
                 FROM users u
                 WHERE u.college_id = $collegeId AND u.role_id = " . ROLE_STUDENT . "
                 ORDER BY u.created_at DESC");
$students = fetchAll($result);

$pageTitle = 'Students';
include dirname(__DIR__) . '/includes/header.php';
?>

<div class="layout">
    <?php include dirname(__DIR__) . '/includes/sidebar.php'; ?>
    
    <div class="main-content">
        <div class="content-wrapper">
            <div class="content-header">
                <div>
                    <h1 class="page-title">Students</h1>
                    <p class="text-muted">Manage students in your college</p>
                </div>
            </div>
            
            <?php if (empty($students)): ?>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                    <h3>No Students Yet</h3>
                    <p>Students will appear here once they register with your college</p>
                </div>
            <?php else: ?>
                <div class="card">
                    <div class="card-body">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th class="hide-mobile">Email</th>
                                        <th>Attempts</th>
                                        <th class="hide-mobile">Certificates</th>
                                        <th class="hide-mobile">Streak</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($students as $student): ?>
                                        <tr>
                                            <td>
                                                <div class="d-flex align-center gap-2">
                                                    <div class="avatar">
                                                        <?= strtoupper(substr($student['full_name'], 0, 1)) ?>
                                                    </div>
                                                    <div>
                                                        <div class="font-medium"><?= htmlspecialchars($student['full_name']) ?></div>
                                                        <small class="text-muted hide-desktop"><?= htmlspecialchars($student['email']) ?></small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="hide-mobile"><?= htmlspecialchars($student['email']) ?></td>
                                            <td><?= $student['attempts'] ?></td>
                                            <td class="hide-mobile"><?= $student['certificates'] ?></td>
                                            <td class="hide-mobile">
                                                <?php if ($student['streak'] > 0): ?>
                                                    <span class="d-flex align-center gap-1">
                                                        <i class="fas fa-fire text-warning"></i>
                                                        <?= $student['streak'] ?>
                                                    </span>
                                                <?php else: ?>
                                                    -
                                                <?php endif; ?>
                                            </td>
                                            <td>
                                                <?php if ($student['is_active']): ?>
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
