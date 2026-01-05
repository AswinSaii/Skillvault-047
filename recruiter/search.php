<?php
/**
 * Recruiter - Search Students
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_RECRUITER);

$userId = getCurrentUserId();

// Search parameters
$skillIds = $_GET['skills'] ?? [];
$minAccuracy = (int)($_GET['min_accuracy'] ?? 0);
$skillLevel = $_GET['skill_level'] ?? '';
$location = escape($_GET['location'] ?? '');

// Get all skills for filter
$result = query("SELECT * FROM skills ORDER BY name");
$skills = fetchAll($result);

// Build search query
$students = [];
$searched = !empty($skillIds) || $minAccuracy > 0 || !empty($skillLevel) || !empty($location);

if ($searched) {
    $where = "u.role_id = " . ROLE_STUDENT . " AND u.is_active = 1 AND c.verification_status = 'approved'";
    $joins = "JOIN colleges c ON u.college_id = c.id";
    $having = [];
    
    if (!empty($skillIds) && is_array($skillIds)) {
        $skillIdList = implode(',', array_map('intval', $skillIds));
        $joins .= " JOIN user_skills us ON u.id = us.user_id AND us.skill_id IN ($skillIdList)";
    }
    
    if ($minAccuracy > 0) {
        $having[] = "AVG(us.accuracy) >= $minAccuracy";
    }
    
    if (!empty($skillLevel) && in_array($skillLevel, ['beginner', 'intermediate', 'advanced', 'expert'])) {
        $where .= " AND us.skill_level = '$skillLevel'";
    }
    
    if (!empty($location)) {
        $where .= " AND (c.city LIKE '%$location%' OR c.state LIKE '%$location%')";
    }
    
    $havingClause = !empty($having) ? "HAVING " . implode(' AND ', $having) : "";
    
    $sql = "SELECT u.id, u.full_name, u.email, u.profile_picture,
                   c.name as college_name, c.city, c.state,
                   COUNT(DISTINCT us.skill_id) as skill_count,
                   AVG(us.accuracy) as avg_accuracy,
                   (SELECT COUNT(*) FROM certificates WHERE user_id = u.id) as cert_count
            FROM users u
            $joins
            LEFT JOIN user_skills us ON u.id = us.user_id
            WHERE $where
            GROUP BY u.id
            $havingClause
            ORDER BY avg_accuracy DESC
            LIMIT 50";
    
    $result = query($sql);
    $students = fetchAll($result);
}

$pageTitle = 'Search Students';
include dirname(__DIR__) . '/includes/header.php';
?>

<div class="layout">
    <?php include dirname(__DIR__) . '/includes/sidebar.php'; ?>
    
    <div class="main-content">
        <div class="content-wrapper">
            <div class="content-header">
                <div>
                    <h1 class="page-title">Search Students</h1>
                    <p class="text-muted">Find skilled candidates from verified colleges</p>
                </div>
            </div>
            
            <!-- Search Form -->
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="card-title"><i class="fas fa-filter"></i> Search Filters</h5>
                </div>
                <div class="card-body">
                    <form method="GET">
                        <div class="row">
                            <div class="col-12 col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Skills</label>
                                    <select name="skills[]" class="form-select" multiple style="height: 150px;">
                                        <?php foreach ($skills as $skill): ?>
                                            <option value="<?= $skill['id'] ?>" <?= in_array($skill['id'], $skillIds) ? 'selected' : '' ?>>
                                                <?= htmlspecialchars($skill['name']) ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                    <small class="text-muted">Hold Ctrl/Cmd to select multiple</small>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Minimum Accuracy</label>
                                    <select name="min_accuracy" class="form-select">
                                        <option value="0">Any</option>
                                        <option value="50" <?= $minAccuracy == 50 ? 'selected' : '' ?>>50%+</option>
                                        <option value="70" <?= $minAccuracy == 70 ? 'selected' : '' ?>>70%+</option>
                                        <option value="80" <?= $minAccuracy == 80 ? 'selected' : '' ?>>80%+</option>
                                        <option value="90" <?= $minAccuracy == 90 ? 'selected' : '' ?>>90%+</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Skill Level</label>
                                    <select name="skill_level" class="form-select">
                                        <option value="">Any Level</option>
                                        <option value="beginner" <?= $skillLevel === 'beginner' ? 'selected' : '' ?>>Beginner</option>
                                        <option value="intermediate" <?= $skillLevel === 'intermediate' ? 'selected' : '' ?>>Intermediate</option>
                                        <option value="advanced" <?= $skillLevel === 'advanced' ? 'selected' : '' ?>>Advanced</option>
                                        <option value="expert" <?= $skillLevel === 'expert' ? 'selected' : '' ?>>Expert</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Location (City/State)</label>
                                    <input type="text" name="location" class="form-input" 
                                           value="<?= htmlspecialchars($location) ?>" 
                                           placeholder="e.g., Mumbai, Karnataka">
                                </div>
                            </div>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-search"></i> Search
                            </button>
                            <a href="search.php" class="btn btn-secondary">Clear Filters</a>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- Results -->
            <?php if ($searched): ?>
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">
                            Search Results
                            <span class="badge badge-primary"><?= count($students) ?> found</span>
                        </h5>
                    </div>
                    <div class="card-body">
                        <?php if (empty($students)): ?>
                            <div class="empty-state py-4">
                                <div class="empty-icon">
                                    <i class="fas fa-user-slash"></i>
                                </div>
                                <h4>No Students Found</h4>
                                <p>Try adjusting your search criteria</p>
                            </div>
                        <?php else: ?>
                            <div class="row">
                                <?php foreach ($students as $student): ?>
                                    <div class="col-12 col-md-6 col-lg-4 mb-4">
                                        <div class="card h-100">
                                            <div class="card-body">
                                                <div class="d-flex align-center gap-3 mb-3">
                                                    <div class="avatar avatar-lg">
                                                        <?php if ($student['profile_picture']): ?>
                                                            <img src="<?= APP_URL ?>/uploads/<?= $student['profile_picture'] ?>" alt="">
                                                        <?php else: ?>
                                                            <?= strtoupper(substr($student['full_name'], 0, 1)) ?>
                                                        <?php endif; ?>
                                                    </div>
                                                    <div>
                                                        <h6 class="mb-0"><?= htmlspecialchars($student['full_name']) ?></h6>
                                                        <small class="text-muted"><?= htmlspecialchars($student['college_name']) ?></small>
                                                    </div>
                                                </div>
                                                
                                                <div class="text-sm text-muted mb-3">
                                                    <i class="fas fa-map-marker-alt"></i>
                                                    <?= htmlspecialchars($student['city'] . ', ' . $student['state']) ?>
                                                </div>
                                                
                                                <div class="d-flex justify-between mb-3">
                                                    <div class="text-center">
                                                        <div class="font-medium"><?= $student['skill_count'] ?></div>
                                                        <small class="text-muted">Skills</small>
                                                    </div>
                                                    <div class="text-center">
                                                        <div class="font-medium"><?= number_format($student['avg_accuracy'] ?? 0, 0) ?>%</div>
                                                        <small class="text-muted">Accuracy</small>
                                                    </div>
                                                    <div class="text-center">
                                                        <div class="font-medium"><?= $student['cert_count'] ?></div>
                                                        <small class="text-muted">Certs</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="card-footer">
                                                <a href="student-profile.php?id=<?= $student['id'] ?>" class="btn btn-outline btn-block">
                                                    <i class="fas fa-eye"></i> View Profile
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php else: ?>
                <div class="text-center py-5">
                    <i class="fas fa-search text-muted" style="font-size: 4rem;"></i>
                    <h4 class="mt-3">Start Your Search</h4>
                    <p class="text-muted">Select skills and filters above to find skilled candidates</p>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php include dirname(__DIR__) . '/includes/footer.php'; ?>
