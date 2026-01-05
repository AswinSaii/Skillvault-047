<?php
/**
 * Registration Page
 */
require_once dirname(__DIR__) . '/includes/auth.php';

// Redirect if already logged in
if (isLoggedIn()) {
    redirect(getDashboardUrl(getCurrentUserRole()));
}

$error = '';
$success = '';
$colleges = getVerifiedColleges();

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = [
        'role_id' => (int)($_POST['role'] ?? 0),
        'email' => $_POST['email'] ?? '',
        'password' => $_POST['password'] ?? '',
        'first_name' => $_POST['first_name'] ?? '',
        'last_name' => $_POST['last_name'] ?? '',
        'phone' => $_POST['phone'] ?? '',
        'college_id' => $_POST['college_id'] ?? null,
        'department' => $_POST['department'] ?? '',
        'enrollment_number' => $_POST['enrollment_number'] ?? '',
        'graduation_year' => $_POST['graduation_year'] ?? null,
        'company_name' => $_POST['company_name'] ?? '',
        'designation' => $_POST['designation'] ?? '',
    ];
    
    // Validate password confirmation
    if ($_POST['password'] !== ($_POST['confirm_password'] ?? '')) {
        $error = 'Passwords do not match';
    } else {
        $result = registerUser($data);
        
        if ($result['success']) {
            $success = $result['message'];
        } else {
            $error = $result['message'];
        }
    }
}

$pageTitle = 'Register';
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
        <div class="auth-container" style="max-width: 500px;">
            <div class="auth-card">
                <div class="auth-header">
                    <div class="auth-logo">
                        <i class="fas fa-shield-halved"></i>
                        <?= APP_NAME ?>
                    </div>
                    <p class="auth-title">Create your account to get started</p>
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
                            <a href="login.php">Click here to login</a>
                        </div>
                    <?php else: ?>
                    
                    <form method="POST" action="" data-validate>
                        <!-- Role Selection -->
                        <div class="form-group">
                            <label class="form-label">I am a</label>
                            <div class="role-selection">
                                <label class="role-option">
                                    <input type="radio" name="role" value="<?= ROLE_STUDENT ?>" required 
                                           <?= ($_POST['role'] ?? '') == ROLE_STUDENT ? 'checked' : '' ?>>
                                    <div class="role-card">
                                        <div class="role-icon"><i class="fas fa-user-graduate"></i></div>
                                        <span class="role-name">Student</span>
                                    </div>
                                </label>
                                <label class="role-option">
                                    <input type="radio" name="role" value="<?= ROLE_FACULTY ?>" 
                                           <?= ($_POST['role'] ?? '') == ROLE_FACULTY ? 'checked' : '' ?>>
                                    <div class="role-card">
                                        <div class="role-icon"><i class="fas fa-chalkboard-teacher"></i></div>
                                        <span class="role-name">Faculty</span>
                                    </div>
                                </label>
                                <label class="role-option">
                                    <input type="radio" name="role" value="<?= ROLE_RECRUITER ?>" 
                                           <?= ($_POST['role'] ?? '') == ROLE_RECRUITER ? 'checked' : '' ?>>
                                    <div class="role-card">
                                        <div class="role-icon"><i class="fas fa-briefcase"></i></div>
                                        <span class="role-name">Recruiter</span>
                                    </div>
                                </label>
                                <label class="role-option">
                                    <input type="radio" name="role" value="<?= ROLE_COLLEGE_ADMIN ?>" 
                                           <?= ($_POST['role'] ?? '') == ROLE_COLLEGE_ADMIN ? 'checked' : '' ?>>
                                    <div class="role-card">
                                        <div class="role-icon"><i class="fas fa-university"></i></div>
                                        <span class="role-name">College Admin</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Basic Info -->
                        <div class="row">
                            <div class="col-6">
                                <div class="form-group">
                                    <label for="first_name" class="form-label">First Name *</label>
                                    <input type="text" id="first_name" name="first_name" class="form-control" 
                                           placeholder="John" required 
                                           value="<?= htmlspecialchars($_POST['first_name'] ?? '') ?>">
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="form-group">
                                    <label for="last_name" class="form-label">Last Name</label>
                                    <input type="text" id="last_name" name="last_name" class="form-control" 
                                           placeholder="Doe"
                                           value="<?= htmlspecialchars($_POST['last_name'] ?? '') ?>">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="email" class="form-label">Email Address *</label>
                            <input type="email" id="email" name="email" class="form-control" 
                                   placeholder="john@example.com" required 
                                   value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
                        </div>
                        
                        <div class="form-group">
                            <label for="phone" class="form-label">Phone Number</label>
                            <input type="tel" id="phone" name="phone" class="form-control" 
                                   placeholder="+91 9876543210"
                                   value="<?= htmlspecialchars($_POST['phone'] ?? '') ?>">
                        </div>
                        
                        <!-- College Selection (for students & faculty) -->
                        <div id="college-section" class="form-group" style="display: none;">
                            <label for="college_id" class="form-label">Select College *</label>
                            <select id="college_id" name="college_id" class="form-control">
                                <option value="">-- Select Verified College --</option>
                                <?php foreach ($colleges as $college): ?>
                                    <option value="<?= $college['id'] ?>" 
                                            <?= ($_POST['college_id'] ?? '') == $college['id'] ? 'selected' : '' ?>>
                                        <?= htmlspecialchars($college['name']) ?> 
                                        (<?= htmlspecialchars($college['city']) ?>)
                                    </option>
                                <?php endforeach; ?>
                            </select>
                            <div class="form-text">
                                <i class="fas fa-info-circle"></i>
                                Only verified colleges are shown. 
                                <a href="college-register.php">Register your college</a>
                            </div>
                        </div>
                        
                        <!-- Student-specific fields -->
                        <div id="student-fields" style="display: none;">
                            <div class="row">
                                <div class="col-6">
                                    <div class="form-group">
                                        <label for="enrollment_number" class="form-label">Enrollment No.</label>
                                        <input type="text" id="enrollment_number" name="enrollment_number" 
                                               class="form-control" placeholder="2024CS001"
                                               value="<?= htmlspecialchars($_POST['enrollment_number'] ?? '') ?>">
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="form-group">
                                        <label for="graduation_year" class="form-label">Graduation Year</label>
                                        <select id="graduation_year" name="graduation_year" class="form-control">
                                            <option value="">Select Year</option>
                                            <?php for ($year = date('Y'); $year <= date('Y') + 6; $year++): ?>
                                                <option value="<?= $year ?>" 
                                                        <?= ($_POST['graduation_year'] ?? '') == $year ? 'selected' : '' ?>>
                                                    <?= $year ?>
                                                </option>
                                            <?php endfor; ?>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="department" class="form-label">Department</label>
                                <input type="text" id="department" name="department" class="form-control" 
                                       placeholder="Computer Science"
                                       value="<?= htmlspecialchars($_POST['department'] ?? '') ?>">
                            </div>
                        </div>
                        
                        <!-- Recruiter-specific fields -->
                        <div id="recruiter-fields" style="display: none;">
                            <div class="form-group">
                                <label for="company_name" class="form-label">Company Name *</label>
                                <input type="text" id="company_name" name="company_name" class="form-control" 
                                       placeholder="Tech Corp Inc."
                                       value="<?= htmlspecialchars($_POST['company_name'] ?? '') ?>">
                            </div>
                            <div class="form-group">
                                <label for="designation" class="form-label">Designation</label>
                                <input type="text" id="designation" name="designation" class="form-control" 
                                       placeholder="HR Manager"
                                       value="<?= htmlspecialchars($_POST['designation'] ?? '') ?>">
                            </div>
                        </div>
                        
                        <!-- Password -->
                        <div class="row">
                            <div class="col-6">
                                <div class="form-group">
                                    <label for="password" class="form-label">Password *</label>
                                    <input type="password" id="password" name="password" class="form-control" 
                                           placeholder="Min. 8 characters" required minlength="8">
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="form-group">
                                    <label for="confirm_password" class="form-label">Confirm Password *</label>
                                    <input type="password" id="confirm_password" name="confirm_password" 
                                           class="form-control" placeholder="Re-enter password" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="form-check">
                                <input type="checkbox" id="terms" name="terms" class="form-check-input" required>
                                <label for="terms" class="form-check-label">
                                    I agree to the <a href="<?= APP_URL ?>/terms.php">Terms of Service</a> and 
                                    <a href="<?= APP_URL ?>/privacy.php">Privacy Policy</a>
                                </label>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block btn-lg">
                            <i class="fas fa-user-plus"></i>
                            Create Account
                        </button>
                    </form>
                    
                    <?php endif; ?>
                </div>
                
                <div class="auth-footer">
                    Already have an account? <a href="login.php">Login here</a>
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
    <script>
        // Show/hide role-specific fields
        document.querySelectorAll('input[name="role"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const role = parseInt(this.value);
                const collegeSection = document.getElementById('college-section');
                const studentFields = document.getElementById('student-fields');
                const recruiterFields = document.getElementById('recruiter-fields');
                
                // Hide all
                collegeSection.style.display = 'none';
                studentFields.style.display = 'none';
                recruiterFields.style.display = 'none';
                
                // Show relevant sections
                if (role === <?= ROLE_STUDENT ?>) {
                    collegeSection.style.display = 'block';
                    studentFields.style.display = 'block';
                    document.getElementById('college_id').required = true;
                } else if (role === <?= ROLE_FACULTY ?>) {
                    collegeSection.style.display = 'block';
                    document.getElementById('college_id').required = true;
                } else if (role === <?= ROLE_RECRUITER ?>) {
                    recruiterFields.style.display = 'block';
                    document.getElementById('college_id').required = false;
                } else {
                    document.getElementById('college_id').required = false;
                }
            });
        });
        
        // Trigger on page load if role is pre-selected
        const checkedRole = document.querySelector('input[name="role"]:checked');
        if (checkedRole) {
            checkedRole.dispatchEvent(new Event('change'));
        }
    </script>
</body>
</html>
