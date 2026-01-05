<?php
/**
 * Faculty - Create/Edit Assessment
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_FACULTY);

$userId = getCurrentUserId();
$collegeId = $_SESSION['college_id'];
$assessmentId = (int)($_GET['id'] ?? 0);
$assessment = null;

if ($assessmentId) {
    $result = query("SELECT * FROM assessments WHERE id = $assessmentId AND college_id = $collegeId AND created_by = $userId");
    $assessment = fetch($result);
    if (!$assessment) {
        setFlash('danger', 'Assessment not found.');
        redirect('assessments.php');
    }
}

// Get skills
$result = query("SELECT * FROM skills ORDER BY name");
$skills = fetchAll($result);

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = escape($_POST['title'] ?? '');
    $description = escape($_POST['description'] ?? '');
    $skillId = (int)($_POST['skill_id'] ?? 0);
    $difficulty = escape($_POST['difficulty'] ?? 'medium');
    $duration = (int)($_POST['duration_minutes'] ?? 30);
    $totalMarks = (int)($_POST['total_marks'] ?? 100);
    $passingMarks = (int)($_POST['passing_marks'] ?? 40);
    $isDailyQuiz = isset($_POST['is_daily_quiz']) ? 1 : 0;
    $isActive = isset($_POST['is_active']) ? 1 : 0;
    
    $errors = [];
    
    if (empty($title)) $errors[] = 'Title is required';
    if (!$skillId) $errors[] = 'Skill is required';
    if ($duration < 5 || $duration > 180) $errors[] = 'Duration must be between 5 and 180 minutes';
    if ($passingMarks > $totalMarks) $errors[] = 'Passing marks cannot exceed total marks';
    
    if (empty($errors)) {
        if ($assessmentId) {
            // Update
            $sql = "UPDATE assessments SET 
                    title = '$title',
                    description = '$description',
                    skill_id = $skillId,
                    difficulty = '$difficulty',
                    duration_minutes = $duration,
                    total_marks = $totalMarks,
                    passing_marks = $passingMarks,
                    is_daily_quiz = $isDailyQuiz,
                    is_active = $isActive
                    WHERE id = $assessmentId";
        } else {
            // Create
            $sql = "INSERT INTO assessments (college_id, created_by, title, description, skill_id, difficulty, duration_minutes, total_marks, passing_marks, is_daily_quiz, is_active) 
                    VALUES ($collegeId, $userId, '$title', '$description', $skillId, '$difficulty', $duration, $totalMarks, $passingMarks, $isDailyQuiz, $isActive)";
        }
        
        if (query($sql)) {
            $newId = $assessmentId ?: lastId();
            setFlash('success', 'Assessment ' . ($assessmentId ? 'updated' : 'created') . ' successfully.');
            redirect("questions.php?assessment_id=$newId");
        } else {
            $errors[] = 'Database error. Please try again.';
        }
    }
}

$pageTitle = $assessmentId ? 'Edit Assessment' : 'Create Assessment';
include dirname(__DIR__) . '/includes/header.php';
?>

<div class="layout">
    <?php include dirname(__DIR__) . '/includes/sidebar.php'; ?>
    
    <div class="main-content">
        <div class="content-wrapper">
            <div class="content-header">
                <div>
                    <h1 class="page-title"><?= $assessmentId ? 'Edit' : 'Create' ?> Assessment</h1>
                    <p class="text-muted"><?= $assessmentId ? 'Update assessment details' : 'Create a new skill assessment' ?></p>
                </div>
                <a href="assessments.php" class="btn btn-outline">
                    <i class="fas fa-arrow-left"></i> Back
                </a>
            </div>
            
            <?php if (!empty($errors)): ?>
                <div class="alert alert-danger">
                    <ul class="mb-0">
                        <?php foreach ($errors as $error): ?>
                            <li><?= $error ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            <?php endif; ?>
            
            <div class="card">
                <div class="card-body">
                    <form method="POST">
                        <div class="row">
                            <div class="col-12 col-md-8">
                                <div class="form-group">
                                    <label class="form-label">Assessment Title *</label>
                                    <input type="text" name="title" class="form-input" 
                                           value="<?= htmlspecialchars($assessment['title'] ?? $_POST['title'] ?? '') ?>" 
                                           placeholder="e.g., JavaScript Fundamentals" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Description</label>
                                    <textarea name="description" class="form-input" rows="3" 
                                              placeholder="Brief description of the assessment"><?= htmlspecialchars($assessment['description'] ?? $_POST['description'] ?? '') ?></textarea>
                                </div>
                            </div>
                            
                            <div class="col-12 col-md-4">
                                <div class="form-group">
                                    <label class="form-label">Skill *</label>
                                    <select name="skill_id" class="form-select" required>
                                        <option value="">Select Skill</option>
                                        <?php foreach ($skills as $skill): ?>
                                            <option value="<?= $skill['id'] ?>" <?= ($assessment['skill_id'] ?? $_POST['skill_id'] ?? 0) == $skill['id'] ? 'selected' : '' ?>>
                                                <?= htmlspecialchars($skill['name']) ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Difficulty *</label>
                                    <select name="difficulty" class="form-select" required>
                                        <option value="easy" <?= ($assessment['difficulty'] ?? $_POST['difficulty'] ?? '') === 'easy' ? 'selected' : '' ?>>Easy</option>
                                        <option value="medium" <?= ($assessment['difficulty'] ?? $_POST['difficulty'] ?? 'medium') === 'medium' ? 'selected' : '' ?>>Medium</option>
                                        <option value="hard" <?= ($assessment['difficulty'] ?? $_POST['difficulty'] ?? '') === 'hard' ? 'selected' : '' ?>>Hard</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-12 col-md-4">
                                <div class="form-group">
                                    <label class="form-label">Duration (minutes) *</label>
                                    <input type="number" name="duration_minutes" class="form-input" 
                                           value="<?= $assessment['duration_minutes'] ?? $_POST['duration_minutes'] ?? 30 ?>" 
                                           min="5" max="180" required>
                                </div>
                            </div>
                            <div class="col-12 col-md-4">
                                <div class="form-group">
                                    <label class="form-label">Total Marks *</label>
                                    <input type="number" name="total_marks" class="form-input" 
                                           value="<?= $assessment['total_marks'] ?? $_POST['total_marks'] ?? 100 ?>" 
                                           min="1" required>
                                </div>
                            </div>
                            <div class="col-12 col-md-4">
                                <div class="form-group">
                                    <label class="form-label">Passing Marks *</label>
                                    <input type="number" name="passing_marks" class="form-input" 
                                           value="<?= $assessment['passing_marks'] ?? $_POST['passing_marks'] ?? 40 ?>" 
                                           min="1" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-12 col-md-6">
                                <div class="form-group">
                                    <label class="d-flex align-center gap-2">
                                        <input type="checkbox" name="is_daily_quiz" value="1" 
                                               <?= ($assessment['is_daily_quiz'] ?? false) ? 'checked' : '' ?>>
                                        <span>Use as Daily Quiz</span>
                                    </label>
                                    <small class="text-muted">Daily quizzes contribute to student streaks</small>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="form-group">
                                    <label class="d-flex align-center gap-2">
                                        <input type="checkbox" name="is_active" value="1" 
                                               <?= ($assessment['is_active'] ?? true) ? 'checked' : '' ?>>
                                        <span>Active</span>
                                    </label>
                                    <small class="text-muted">Only active assessments are visible to students</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i>
                                <?= $assessmentId ? 'Update' : 'Create' ?> Assessment
                            </button>
                            <a href="assessments.php" class="btn btn-secondary">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include dirname(__DIR__) . '/includes/footer.php'; ?>
