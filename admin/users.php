<?php
/**
 * Super Admin - Users Management
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_SUPER_ADMIN);

$pageTitle = 'Users Management';
$currentPage = 'users';

// Handle user actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'activate':
                $userId = (int)$_POST['user_id'];
                query("UPDATE users SET is_active = 1 WHERE id = $userId");
                setFlash('success', 'User activated successfully');
                break;
            case 'deactivate':
                $userId = (int)$_POST['user_id'];
                query("UPDATE users SET is_active = 0 WHERE id = $userId");
                setFlash('success', 'User deactivated successfully');
                break;
            case 'delete':
                $userId = (int)$_POST['user_id'];
                query("DELETE FROM users WHERE id = $userId AND role_id != " . ROLE_SUPER_ADMIN);
                setFlash('success', 'User deleted successfully');
                break;
        }
        redirect('users.php');
    }
}

// Get filters
$roleFilter = $_GET['role'] ?? '';
$statusFilter = $_GET['status'] ?? '';
$searchQuery = $_GET['search'] ?? '';

// Build query
$whereClause = "WHERE 1=1";
if ($roleFilter) {
    $whereClause .= " AND u.role_id = " . (int)$roleFilter;
}
if ($statusFilter !== '') {
    $whereClause .= " AND u.is_active = " . (int)$statusFilter;
}
if ($searchQuery) {
    $search = escape($searchQuery);
    $whereClause .= " AND (u.first_name LIKE '%$search%' OR u.last_name LIKE '%$search%' OR u.email LIKE '%$search%')";
}

// Get users
$result = query("SELECT u.*, r.name as role_name, c.name as college_name 
                 FROM users u 
                 LEFT JOIN roles r ON u.role_id = r.id 
                 LEFT JOIN colleges c ON u.college_id = c.id 
                 $whereClause
                 ORDER BY u.created_at DESC");
$users = fetchAll($result);

// Get stats
$statsResult = query("SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
    SUM(CASE WHEN role_id = " . ROLE_STUDENT . " THEN 1 ELSE 0 END) as total_students,
    SUM(CASE WHEN role_id = " . ROLE_FACULTY . " THEN 1 ELSE 0 END) as total_faculty
    FROM users WHERE role_id != " . ROLE_SUPER_ADMIN);
$stats = fetch($statsResult);

// Get roles for filter
$rolesResult = query("SELECT * FROM roles WHERE id != " . ROLE_SUPER_ADMIN . " ORDER BY name");
$roles = fetchAll($rolesResult);

require_once __DIR__ . '/includes/admin-header.php';
?>

<!-- Stats Cards -->
    <div class="row mb-4">
        <div class="col-12 col-md-3 mb-3">
            <div class="stat-card gradient-purple">
                <div class="stat-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-details">
                    <h3><?= $stats['total_users'] ?></h3>
                    <p>Total Users</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-3 mb-3">
            <div class="stat-card gradient-green">
                <div class="stat-icon">
                    <i class="fas fa-user-check"></i>
                </div>
                <div class="stat-details">
                    <h3><?= $stats['active_users'] ?></h3>
                    <p>Active Users</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-3 mb-3">
            <div class="stat-card gradient-blue">
                <div class="stat-icon">
                    <i class="fas fa-user-graduate"></i>
                </div>
                <div class="stat-details">
                    <h3><?= $stats['total_students'] ?></h3>
                    <p>Students</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-3 mb-3">
            <div class="stat-card gradient-orange">
                <div class="stat-icon">
                    <i class="fas fa-chalkboard-teacher"></i>
                </div>
                <div class="stat-details">
                    <h3><?= $stats['total_faculty'] ?></h3>
                    <p>Faculty</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
        <div class="card-body">
            <form method="GET" class="filter-form">
                <div class="row">
                    <div class="col-12 col-md-3 mb-3 mb-md-0">
                        <input type="text" name="search" class="form-control" placeholder="Search users..." value="<?= htmlspecialchars($searchQuery) ?>">
                    </div>
                    <div class="col-12 col-md-3 mb-3 mb-md-0">
                        <select name="role" class="form-control">
                            <option value="">All Roles</option>
                            <?php foreach ($roles as $role): ?>
                                <option value="<?= $role['id'] ?>" <?= $roleFilter == $role['id'] ? 'selected' : '' ?>>
                                    <?= htmlspecialchars($role['name']) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-12 col-md-3 mb-3 mb-md-0">
                        <select name="status" class="form-control">
                            <option value="">All Status</option>
                            <option value="1" <?= $statusFilter === '1' ? 'selected' : '' ?>>Active</option>
                            <option value="0" <?= $statusFilter === '0' ? 'selected' : '' ?>>Inactive</option>
                        </select>
                    </div>
                    <div class="col-12 col-md-3">
                        <button type="submit" class="btn btn-primary btn-block">
                            <i class="fas fa-search"></i> Filter
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Users Table -->
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">All Users (<?= count($users) ?>)</h3>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>College</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($users)): ?>
                            <tr>
                                <td colspan="7" class="text-center py-4">
                                    <i class="fas fa-users fa-3x text-muted mb-3"></i>
                                    <p class="text-muted">No users found</p>
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($users as $user): ?>
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <div class="avatar avatar-sm me-2">
                                                <?= strtoupper(substr($user['first_name'], 0, 1)) ?>
                                            </div>
                                            <div>
                                                <strong><?= htmlspecialchars($user['first_name'] . ' ' . $user['last_name']) ?></strong>
                                            </div>
                                        </div>
                                    </td>
                                    <td><?= htmlspecialchars($user['email']) ?></td>
                                    <td>
                                        <span class="badge badge-<?= 
                                            $user['role_id'] == ROLE_COLLEGE_ADMIN ? 'primary' :
                                            ($user['role_id'] == ROLE_FACULTY ? 'info' :
                                            ($user['role_id'] == ROLE_STUDENT ? 'success' : 'warning'))
                                        ?>">
                                            <?= htmlspecialchars($user['role_name']) ?>
                                        </span>
                                    </td>
                                    <td><?= $user['college_name'] ? htmlspecialchars($user['college_name']) : '-' ?></td>
                                    <td>
                                        <?php if ($user['is_active']): ?>
                                            <span class="badge badge-success"><i class="fas fa-check"></i> Active</span>
                                        <?php else: ?>
                                            <span class="badge badge-danger"><i class="fas fa-times"></i> Inactive</span>
                                        <?php endif; ?>
                                    </td>
                                    <td><?= date('M d, Y', strtotime($user['created_at'])) ?></td>
                                    <td>
                                        <div class="btn-group">
                                            <?php if ($user['is_active']): ?>
                                                <form method="POST" class="d-inline">
                                                    <input type="hidden" name="action" value="deactivate">
                                                    <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                                    <button type="submit" class="btn btn-sm btn-warning" onclick="return confirm('Deactivate this user?')">
                                                        <i class="fas fa-ban"></i>
                                                    </button>
                                                </form>
                                            <?php else: ?>
                                                <form method="POST" class="d-inline">
                                                    <input type="hidden" name="action" value="activate">
                                                    <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                                    <button type="submit" class="btn btn-sm btn-success">
                                                        <i class="fas fa-check"></i>
                                                    </button>
                                                </form>
                                            <?php endif; ?>
                                            <form method="POST" class="d-inline">
                                                <input type="hidden" name="action" value="delete">
                                                <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                                <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('Delete this user permanently?')">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
