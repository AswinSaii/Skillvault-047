<?php
/**
 * College Registration Page
 */
require_once dirname(__DIR__) . '/includes/auth.php';

if (isLoggedIn()) {
    redirect(getDashboardUrl(getCurrentUserRole()));
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = escape($_POST['name'] ?? '');
    $email = escape($_POST['email'] ?? '');
    $phone = escape($_POST['phone'] ?? '');
    $address = escape($_POST['address'] ?? '');
    $city = escape($_POST['city'] ?? '');
    $state = escape($_POST['state'] ?? '');
    $website = escape($_POST['website'] ?? '');
    
    // Admin details
    $adminFirstName = escape($_POST['admin_first_name'] ?? '');
    $adminLastName = escape($_POST['admin_last_name'] ?? '');
    $adminEmail = escape($_POST['admin_email'] ?? '');
    $adminPassword = $_POST['admin_password'] ?? '';
    
    // Validate
    if (empty($name) || empty($email) || empty($city) || empty($state)) {
        $error = 'Please fill in all required fields';
    } elseif (empty($adminFirstName) || empty($adminEmail) || empty($adminPassword)) {
        $error = 'Please fill in admin details';
    } elseif (strlen($adminPassword) < 8) {
        $error = 'Password must be at least 8 characters';
    } else {
        // Check if college email exists
        $result = query("SELECT id FROM colleges WHERE email = '$email'");
        if (numRows($result) > 0) {
            $error = 'A college with this email already exists';
        } else {
            // Check if admin email exists
            $result = query("SELECT id FROM users WHERE email = '$adminEmail'");
            if (numRows($result) > 0) {
                $error = 'An account with this admin email already exists';
            } else {
                // Insert college
                $sql = "INSERT INTO colleges (name, email, phone, address, city, state, website, verification_status) 
                        VALUES ('$name', '$email', '$phone', '$address', '$city', '$state', '$website', 'pending')";
                
                if (query($sql)) {
                    $collegeId = lastId();
                    
                    // Create admin user
                    $hashedPassword = password_hash($adminPassword, PASSWORD_DEFAULT);
                    $sql = "INSERT INTO users (role_id, college_id, email, password, first_name, last_name, is_active) 
                            VALUES (" . ROLE_COLLEGE_ADMIN . ", $collegeId, '$adminEmail', '$hashedPassword', '$adminFirstName', '$adminLastName', 0)";
                    
                    if (query($sql)) {
                        $success = 'College registration submitted successfully! Your account will be activated once the college is verified by our team.';
                    } else {
                        $error = 'Failed to create admin account';
                    }
                } else {
                    $error = 'Registration failed. Please try again.';
                }
            }
        }
    }
}

$pageTitle = 'Register College';
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
    <link rel="stylesheet" href="<?= APP_URL ?>/assets/css/auth.css">
</head>
<body>
    <div class="auth-wrapper">
        <div class="auth-container" style="max-width: 600px;">
            <div class="auth-card">
                <div class="auth-header">
                    <div class="auth-logo">
                        <i class="fas fa-university"></i>
                        Register College
                    </div>
                    <p class="auth-title">Register your institution on SkillVault</p>
                </div>
                
                <div class="auth-body">
                    <?php if ($error): ?>
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-circle"></i>
                            <?= htmlspecialchars($error) ?>
                        </div>
                    <?php endif; ?>
                    
                    <?php if ($success): ?>
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle"></i>
                            <?= htmlspecialchars($success) ?>
                        </div>
                        <div class="text-center">
                            <a href="login.php" class="btn btn-primary">Go to Login</a>
                        </div>
                    <?php else: ?>
                    
                    <!-- Registration Steps -->
                    <div class="registration-steps">
                        <div class="step-item active">
                            <div class="step-number">1</div>
                            <span class="step-label">College Info</span>
                        </div>
                        <div class="step-item">
                            <div class="step-number">2</div>
                            <span class="step-label">Admin Account</span>
                        </div>
                        <div class="step-item">
                            <div class="step-number">3</div>
                            <span class="step-label">Verification</span>
                        </div>
                    </div>
                    
                    <form method="POST" action="" data-validate>
                        <!-- College Details -->
                        <h6 class="mb-3">
                            <i class="fas fa-building"></i>
                            College Information
                        </h6>
                        
                        <div class="form-group">
                            <label for="name" class="form-label">College Name *</label>
                            <input type="text" id="name" name="name" class="form-control" 
                                   placeholder="e.g., ABC Engineering College" required
                                   value="<?= htmlspecialchars($_POST['name'] ?? '') ?>">
                        </div>
                        
                        <div class="row">
                            <div class="col-6">
                                <div class="form-group">
                                    <label for="email" class="form-label">College Email *</label>
                                    <input type="email" id="email" name="email" class="form-control" 
                                           placeholder="contact@college.edu" required
                                           value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="form-group">
                                    <label for="phone" class="form-label">Phone</label>
                                    <input type="tel" id="phone" name="phone" class="form-control" 
                                           placeholder="+91 1234567890"
                                           value="<?= htmlspecialchars($_POST['phone'] ?? '') ?>">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="address" class="form-label">Address</label>
                            <textarea id="address" name="address" class="form-control" rows="2"
                                      placeholder="Street address"><?= htmlspecialchars($_POST['address'] ?? '') ?></textarea>
                        </div>
                        
                        <div class="row">
                            <div class="col-6">
                                <div class="form-group">
                                    <label for="city" class="form-label">City *</label>
                                    <input type="text" id="city" name="city" class="form-control" 
                                           placeholder="City" required
                                           value="<?= htmlspecialchars($_POST['city'] ?? '') ?>">
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="form-group">
                                    <label for="state" class="form-label">State *</label>
                                    <input type="text" id="state" name="state" class="form-control" 
                                           placeholder="State" required
                                           value="<?= htmlspecialchars($_POST['state'] ?? '') ?>">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="website" class="form-label">Website</label>
                            <input type="url" id="website" name="website" class="form-control" 
                                   placeholder="https://www.college.edu"
                                   value="<?= htmlspecialchars($_POST['website'] ?? '') ?>">
                        </div>
                        
                        <hr class="my-4">
                        
                        <!-- Admin Details -->
                        <h6 class="mb-3">
                            <i class="fas fa-user-shield"></i>
                            College Admin Account
                        </h6>
                        <p class="text-muted mb-3" style="font-size: 0.875rem;">
                            This person will manage the college account once verified.
                        </p>
                        
                        <div class="row">
                            <div class="col-6">
                                <div class="form-group">
                                    <label for="admin_first_name" class="form-label">First Name *</label>
                                    <input type="text" id="admin_first_name" name="admin_first_name" 
                                           class="form-control" placeholder="John" required
                                           value="<?= htmlspecialchars($_POST['admin_first_name'] ?? '') ?>">
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="form-group">
                                    <label for="admin_last_name" class="form-label">Last Name</label>
                                    <input type="text" id="admin_last_name" name="admin_last_name" 
                                           class="form-control" placeholder="Doe"
                                           value="<?= htmlspecialchars($_POST['admin_last_name'] ?? '') ?>">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="admin_email" class="form-label">Admin Email *</label>
                            <input type="email" id="admin_email" name="admin_email" class="form-control" 
                                   placeholder="admin@college.edu" required
                                   value="<?= htmlspecialchars($_POST['admin_email'] ?? '') ?>">
                        </div>
                        
                        <div class="form-group">
                            <label for="admin_password" class="form-label">Password *</label>
                            <input type="password" id="admin_password" name="admin_password" 
                                   class="form-control" placeholder="Min. 8 characters" required minlength="8">
                        </div>
                        
                        <div class="form-group">
                            <div class="form-check">
                                <input type="checkbox" id="terms" name="terms" class="form-check-input" required>
                                <label for="terms" class="form-check-label">
                                    I confirm that I am authorized to register this college and agree to the 
                                    <a href="<?= APP_URL ?>/terms.php">Terms of Service</a>
                                </label>
                            </div>
                        </div>
                        
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle"></i>
                            <strong>Verification Process:</strong> After submission, our team will verify your college details. 
                            This typically takes 1-2 business days. You'll receive an email once approved.
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block btn-lg">
                            <i class="fas fa-paper-plane"></i>
                            Submit for Verification
                        </button>
                    </form>
                    
                    <?php endif; ?>
                </div>
                
                <div class="auth-footer">
                    Already registered? <a href="login.php">Login here</a>
                </div>
            </div>
            
            <div class="text-center mt-3">
                <a href="<?= APP_URL ?>" class="text-white" style="opacity: 0.8;">
                    <i class="fas fa-arrow-left"></i> Back to Home
                </a>
            </div>
        </div>
    </div>
    
    <script src="<?= APP_URL ?>/assets/js/main.js"></script>
</body>
</html>
