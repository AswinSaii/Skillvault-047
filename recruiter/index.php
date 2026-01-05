<?php
/**
 * Recruiter Dashboard
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_RECRUITER);

$pageTitle = 'Dashboard';
$currentPage = 'dashboard';
$userId = getCurrentUserId();

$user = getUserById($userId);

// Get all skills for search
$result = query("SELECT * FROM skills WHERE is_active = 1 ORDER BY category, name");
$skills = fetchAll($result);

// Group skills by category
$skillsByCategory = [];
foreach ($skills as $skill) {
    $category = $skill['category'] ?: 'Other';
    $skillsByCategory[$category][] = $skill;
}

// Get verified colleges
$result = query("SELECT id, name, city, state FROM colleges WHERE verification_status = 'approved' ORDER BY name");
$colleges = fetchAll($result);

// Stats
$result = query("SELECT COUNT(*) as count FROM users WHERE role_id = " . ROLE_STUDENT);
$totalStudents = fetch($result)['count'];

$result = query("SELECT COUNT(*) as count FROM certificates WHERE is_revoked = 0");
$totalCerts = fetch($result)['count'];

$result = query("SELECT COUNT(*) as count FROM colleges WHERE verification_status = 'approved'");
$totalColleges = fetch($result)['count'];
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
                        <small class="text-muted"><?= htmlspecialchars($user['company_name']) ?></small>
                    </div>
                    <a href="verify.php" class="btn btn-outline">
                        <i class="fas fa-qrcode"></i>
                        <span class="hide-mobile">Verify Certificate</span>
                    </a>
                </div>
            </header>
            
            <div class="content-wrapper">
                <!-- Info Banner -->
                <div class="alert alert-info mb-4">
                    <i class="fas fa-info-circle"></i>
                    <strong>Note:</strong> You can search and filter students by their verified skills only. 
                    Academic marks and CGPA are not available - we focus on demonstrable skills.
                </div>
                
                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Total Students</span>
                            <div class="stat-card-icon primary">
                                <i class="fas fa-user-graduate"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= number_format($totalStudents) ?></div>
                        <span class="stat-card-change text-muted">Skill-verified profiles</span>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Verified Colleges</span>
                            <div class="stat-card-icon success">
                                <i class="fas fa-university"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= $totalColleges ?></div>
                        <span class="stat-card-change text-muted">Trusted institutions</span>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Certificates Issued</span>
                            <div class="stat-card-icon warning">
                                <i class="fas fa-certificate"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= number_format($totalCerts) ?></div>
                        <span class="stat-card-change text-muted">Verifiable credentials</span>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Skill Categories</span>
                            <div class="stat-card-icon danger">
                                <i class="fas fa-layer-group"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= count($skillsByCategory) ?></div>
                        <span class="stat-card-change text-muted">Diverse skillsets</span>
                    </div>
                </div>
                
                <!-- Search Section -->
                <div class="card mt-3">
                    <div class="card-header">
                        <h5 class="card-title">
                            <i class="fas fa-search"></i>
                            Search Students by Skills
                        </h5>
                    </div>
                    <div class="card-body">
                        <form action="search.php" method="GET">
                            <div class="row">
                                <div class="col-12 col-md-4">
                                    <div class="form-group">
                                        <label for="skill" class="form-label">Select Skill</label>
                                        <select id="skill" name="skill_id" class="form-control">
                                            <option value="">-- Any Skill --</option>
                                            <?php foreach ($skillsByCategory as $category => $categorySkills): ?>
                                                <optgroup label="<?= htmlspecialchars($category) ?>">
                                                    <?php foreach ($categorySkills as $skill): ?>
                                                        <option value="<?= $skill['id'] ?>">
                                                            <?= htmlspecialchars($skill['name']) ?>
                                                        </option>
                                                    <?php endforeach; ?>
                                                </optgroup>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="col-12 col-md-3">
                                    <div class="form-group">
                                        <label for="level" class="form-label">Skill Level</label>
                                        <select id="level" name="level" class="form-control">
                                            <option value="">-- Any Level --</option>
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                            <option value="expert">Expert</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="col-12 col-md-3">
                                    <div class="form-group">
                                        <label for="college" class="form-label">College</label>
                                        <select id="college" name="college_id" class="form-control">
                                            <option value="">-- Any College --</option>
                                            <?php foreach ($colleges as $college): ?>
                                                <option value="<?= $college['id'] ?>">
                                                    <?= htmlspecialchars($college['name']) ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="col-12 col-md-2">
                                    <div class="form-group">
                                        <label class="form-label">&nbsp;</label>
                                        <button type="submit" class="btn btn-primary btn-block">
                                            <i class="fas fa-search"></i>
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                
                <!-- Quick Links -->
                <div class="row mt-3">
                    <div class="col-12 col-md-6">
                        <div class="card">
                            <div class="card-body text-center p-4">
                                <i class="fas fa-qrcode text-primary" style="font-size: 3rem;"></i>
                                <h5 class="mt-2">Verify Certificate</h5>
                                <p class="text-muted">Scan QR code or enter certificate ID to verify authenticity.</p>
                                <a href="verify.php" class="btn btn-primary">Verify Now</a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-12 col-md-6">
                        <div class="card">
                            <div class="card-body text-center p-4">
                                <i class="fas fa-bookmark text-success" style="font-size: 3rem;"></i>
                                <h5 class="mt-2">Saved Profiles</h5>
                                <p class="text-muted">Access your bookmarked student profiles for quick reference.</p>
                                <a href="saved.php" class="btn btn-outline">View Saved</a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Popular Skills -->
                <div class="card mt-3">
                    <div class="card-header">
                        <h5 class="card-title">Browse by Skill Category</h5>
                    </div>
                    <div class="card-body">
                        <div class="d-flex gap-2 flex-wrap">
                            <?php foreach ($skillsByCategory as $category => $categorySkills): ?>
                                <a href="search.php?category=<?= urlencode($category) ?>" class="btn btn-outline">
                                    <?= htmlspecialchars($category) ?>
                                    <span class="badge badge-secondary"><?= count($categorySkills) ?></span>
                                </a>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="<?= APP_URL ?>/assets/js/main.js"></script>
</body>
</html>
