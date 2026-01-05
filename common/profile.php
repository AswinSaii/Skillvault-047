<?php
/**
 * User Profile Page
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireLogin();

$userId = getCurrentUserId();
$user = getUserById($userId);

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'update_profile') {
        $fullName = escape($_POST['full_name'] ?? '');
        $phone = escape($_POST['phone'] ?? '');
        
        if (!empty($fullName)) {
            $sql = "UPDATE users SET full_name = '$fullName', phone = '$phone' WHERE id = $userId";
            if (query($sql)) {
                $_SESSION['full_name'] = $fullName;
                setFlash('success', 'Profile updated successfully.');
            }
        }
    }
    
    if ($action === 'change_password') {
        $currentPassword = $_POST['current_password'] ?? '';
        $newPassword = $_POST['new_password'] ?? '';
        $confirmPassword = $_POST['confirm_password'] ?? '';
        
        if (password_verify($currentPassword, $user['password'])) {
            if ($newPassword === $confirmPassword && strlen($newPassword) >= 8) {
                $hash = password_hash($newPassword, PASSWORD_DEFAULT);
                if (query("UPDATE users SET password = '$hash' WHERE id = $userId")) {
                    setFlash('success', 'Password changed successfully.');
                }
            } else {
                setFlash('danger', 'Passwords do not match or too short (min 8 characters).');
            }
        } else {
            setFlash('danger', 'Current password is incorrect.');
        }
    }
    
    redirect('profile.php');
}

$pageTitle = 'My Profile';
include dirname(__DIR__) . '/includes/header.php';
?>

<div class="layout">
    <?php include dirname(__DIR__) . '/includes/sidebar.php'; ?>
    
    <div class="main-content">
        <div class="content-wrapper">
            <div class="content-header">
                <div>
                    <h1 class="page-title">My Profile</h1>
                    <p class="text-muted">Manage your account settings</p>
                </div>
            </div>
            
            <?php if ($flash = getFlash()): ?>
                <div class="alert alert-<?= $flash['type'] ?>">
                    <?= $flash['message'] ?>
                </div>
            <?php endif; ?>
            
            <div class="row">
                <!-- Profile Info -->
                <div class="col-12 col-md-8">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title">Profile Information</h5>
                        </div>
                        <div class="card-body">
                            <form method="POST">
                                <input type="hidden" name="action" value="update_profile">
                                
                                <div class="form-group">
                                    <label class="form-label">Full Name</label>
                                    <input type="text" name="full_name" class="form-input" 
                                           value="<?= htmlspecialchars($user['full_name']) ?>" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Email Address</label>
                                    <input type="email" class="form-input" 
                                           value="<?= htmlspecialchars($user['email']) ?>" disabled>
                                    <small class="text-muted">Email cannot be changed</small>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Phone Number</label>
                                    <input type="tel" name="phone" class="form-input" 
                                           value="<?= htmlspecialchars($user['phone'] ?? '') ?>"
                                           placeholder="+91 XXXXX XXXXX">
                                </div>
                                
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Save Changes
                                </button>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Change Password -->
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Change Password</h5>
                        </div>
                        <div class="card-body">
                            <form method="POST">
                                <input type="hidden" name="action" value="change_password">
                                
                                <div class="form-group">
                                    <label class="form-label">Current Password</label>
                                    <input type="password" name="current_password" class="form-input" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">New Password</label>
                                    <input type="password" name="new_password" class="form-input" required minlength="8">
                                    <small class="text-muted">Minimum 8 characters</small>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Confirm New Password</label>
                                    <input type="password" name="confirm_password" class="form-input" required>
                                </div>
                                
                                <button type="submit" class="btn btn-warning">
                                    <i class="fas fa-key"></i> Change Password
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                
                <!-- Sidebar Info -->
                <div class="col-12 col-md-4">
                    <div class="card mb-4">
                        <div class="card-body text-center">
                            <div class="avatar avatar-xl mx-auto mb-3">
                                <?php if ($user['profile_picture']): ?>
                                    <img src="<?= APP_URL ?>/uploads/<?= $user['profile_picture'] ?>" alt="">
                                <?php else: ?>
                                    <?= strtoupper(substr($user['full_name'], 0, 1)) ?>
                                <?php endif; ?>
                            </div>
                            <h5 class="mb-1"><?= htmlspecialchars($user['full_name']) ?></h5>
                            <p class="text-muted mb-3"><?= htmlspecialchars($user['email']) ?></p>
                            
                            <?php
                            $roles = [
                                ROLE_SUPER_ADMIN => ['Super Admin', 'danger'],
                                ROLE_COLLEGE_ADMIN => ['College Admin', 'primary'],
                                ROLE_FACULTY => ['Faculty', 'info'],
                                ROLE_STUDENT => ['Student', 'success'],
                                ROLE_RECRUITER => ['Recruiter', 'warning']
                            ];
                            $roleInfo = $roles[$user['role_id']] ?? ['User', 'secondary'];
                            ?>
                            <span class="badge badge-<?= $roleInfo[1] ?>"><?= $roleInfo[0] ?></span>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title mb-0">Account Details</h6>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <small class="text-muted">Member Since</small>
                                <div><?= date('F j, Y', strtotime($user['created_at'])) ?></div>
                            </div>
                            
                            <?php if ($user['college_id']): ?>
                                <?php
                                $result = query("SELECT name FROM colleges WHERE id = {$user['college_id']}");
                                $college = fetch($result);
                                ?>
                                <div class="mb-3">
                                    <small class="text-muted">College</small>
                                    <div><?= htmlspecialchars($college['name'] ?? 'N/A') ?></div>
                                </div>
                            <?php endif; ?>
                            
                            <div>
                                <small class="text-muted">Account Status</small>
                                <div>
                                    <?php if ($user['is_active']): ?>
                                        <span class="badge badge-success">Active</span>
                                    <?php else: ?>
                                        <span class="badge badge-danger">Inactive</span>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include dirname(__DIR__) . '/includes/footer.php'; ?>
