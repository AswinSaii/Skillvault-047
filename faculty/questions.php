<?php
/**
 * Faculty - Assessment Questions Management
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_FACULTY);

$userId = getCurrentUserId();
$collegeId = $_SESSION['college_id'];
$assessmentId = (int)($_GET['assessment_id'] ?? 0);

// Get assessment
$result = query("SELECT a.*, s.name as skill_name FROM assessments a 
                 JOIN skills s ON a.skill_id = s.id 
                 WHERE a.id = $assessmentId AND a.college_id = $collegeId AND a.created_by = $userId");
$assessment = fetch($result);

if (!$assessment) {
    setFlash('danger', 'Assessment not found.');
    redirect('assessments.php');
}

// Handle form submission (Add/Edit Question)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'add' || $action === 'edit') {
        $questionId = (int)($_POST['question_id'] ?? 0);
        $questionText = escape($_POST['question_text'] ?? '');
        $optionA = escape($_POST['option_a'] ?? '');
        $optionB = escape($_POST['option_b'] ?? '');
        $optionC = escape($_POST['option_c'] ?? '');
        $optionD = escape($_POST['option_d'] ?? '');
        $correctAnswer = escape($_POST['correct_answer'] ?? '');
        $marks = (int)($_POST['marks'] ?? 1);
        $explanation = escape($_POST['explanation'] ?? '');
        
        $errors = [];
        if (empty($questionText)) $errors[] = 'Question text is required';
        if (empty($optionA) || empty($optionB)) $errors[] = 'At least 2 options are required';
        if (!in_array($correctAnswer, ['A', 'B', 'C', 'D'])) $errors[] = 'Valid correct answer is required';
        
        if (empty($errors)) {
            if ($action === 'edit' && $questionId) {
                $sql = "UPDATE questions SET 
                        question_text = '$questionText',
                        option_a = '$optionA',
                        option_b = '$optionB',
                        option_c = '$optionC',
                        option_d = '$optionD',
                        correct_answer = '$correctAnswer',
                        marks = $marks,
                        explanation = '$explanation'
                        WHERE id = $questionId AND assessment_id = $assessmentId";
            } else {
                $orderIndex = 0;
                $result = query("SELECT MAX(order_index) as max_order FROM questions WHERE assessment_id = $assessmentId");
                $row = fetch($result);
                if ($row) $orderIndex = ($row['max_order'] ?? 0) + 1;
                
                $sql = "INSERT INTO questions (assessment_id, question_text, option_a, option_b, option_c, option_d, correct_answer, marks, explanation, order_index) 
                        VALUES ($assessmentId, '$questionText', '$optionA', '$optionB', '$optionC', '$optionD', '$correctAnswer', $marks, '$explanation', $orderIndex)";
            }
            
            if (query($sql)) {
                setFlash('success', 'Question ' . ($action === 'edit' ? 'updated' : 'added') . ' successfully.');
            }
        } else {
            setFlash('danger', implode(', ', $errors));
        }
    }
    
    if ($action === 'delete') {
        $questionId = (int)($_POST['question_id'] ?? 0);
        if (query("DELETE FROM questions WHERE id = $questionId AND assessment_id = $assessmentId")) {
            setFlash('success', 'Question deleted.');
        }
    }
    
    redirect("questions.php?assessment_id=$assessmentId");
}

// Get questions
$result = query("SELECT * FROM questions WHERE assessment_id = $assessmentId ORDER BY order_index, id");
$questions = fetchAll($result);

$pageTitle = 'Manage Questions';
include dirname(__DIR__) . '/includes/header.php';
?>

<div class="layout">
    <?php include dirname(__DIR__) . '/includes/sidebar.php'; ?>
    
    <div class="main-content">
        <div class="content-wrapper">
            <div class="content-header">
                <div>
                    <h1 class="page-title">Manage Questions</h1>
                    <p class="text-muted"><?= htmlspecialchars($assessment['title']) ?> • <?= htmlspecialchars($assessment['skill_name']) ?></p>
                </div>
                <div class="d-flex gap-2">
                    <a href="create-assessment.php?id=<?= $assessmentId ?>" class="btn btn-outline">
                        <i class="fas fa-edit"></i> Edit Assessment
                    </a>
                    <a href="assessments.php" class="btn btn-secondary">
                        <i class="fas fa-arrow-left"></i> Back
                    </a>
                </div>
            </div>
            
            <?php if ($flash = getFlash()): ?>
                <div class="alert alert-<?= $flash['type'] ?>">
                    <?= $flash['message'] ?>
                </div>
            <?php endif; ?>
            
            <!-- Assessment Summary -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="row">
                        <div class="col-6 col-md-3">
                            <div class="text-center">
                                <h3 class="text-primary mb-0"><?= count($questions) ?></h3>
                                <small class="text-muted">Questions</small>
                            </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="text-center">
                                <h3 class="text-success mb-0"><?= $assessment['total_marks'] ?></h3>
                                <small class="text-muted">Total Marks</small>
                            </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="text-center">
                                <h3 class="text-warning mb-0"><?= $assessment['duration_minutes'] ?></h3>
                                <small class="text-muted">Minutes</small>
                            </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="text-center">
                                <h3 class="mb-0">
                                    <span class="badge badge-<?= $assessment['is_active'] ? 'success' : 'secondary' ?>">
                                        <?= $assessment['is_active'] ? 'Active' : 'Inactive' ?>
                                    </span>
                                </h3>
                                <small class="text-muted">Status</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <!-- Add Question Form -->
                <div class="col-12 col-lg-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title" id="formTitle">Add Question</h5>
                        </div>
                        <div class="card-body">
                            <form method="POST" id="questionForm">
                                <input type="hidden" name="action" value="add" id="formAction">
                                <input type="hidden" name="question_id" value="" id="questionId">
                                
                                <div class="form-group">
                                    <label class="form-label">Question *</label>
                                    <textarea name="question_text" class="form-input" rows="3" required id="questionText" 
                                              placeholder="Enter your question here..."></textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Option A *</label>
                                    <input type="text" name="option_a" class="form-input" required id="optionA">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Option B *</label>
                                    <input type="text" name="option_b" class="form-input" required id="optionB">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Option C</label>
                                    <input type="text" name="option_c" class="form-input" id="optionC">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Option D</label>
                                    <input type="text" name="option_d" class="form-input" id="optionD">
                                </div>
                                
                                <div class="row">
                                    <div class="col-6">
                                        <div class="form-group">
                                            <label class="form-label">Correct Answer *</label>
                                            <select name="correct_answer" class="form-select" required id="correctAnswer">
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="form-group">
                                            <label class="form-label">Marks *</label>
                                            <input type="number" name="marks" class="form-input" value="1" min="1" required id="marks">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Explanation (shown after answer)</label>
                                    <textarea name="explanation" class="form-input" rows="2" id="explanation" 
                                              placeholder="Explain why this answer is correct..."></textarea>
                                </div>
                                
                                <div class="d-flex gap-2">
                                    <button type="submit" class="btn btn-primary flex-1" id="submitBtn">
                                        <i class="fas fa-plus"></i> Add Question
                                    </button>
                                    <button type="button" class="btn btn-secondary" onclick="resetForm()" style="display: none;" id="cancelBtn">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                <!-- Questions List -->
                <div class="col-12 col-lg-8">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Questions (<?= count($questions) ?>)</h5>
                        </div>
                        <div class="card-body">
                            <?php if (empty($questions)): ?>
                                <div class="empty-state py-4">
                                    <div class="empty-icon">
                                        <i class="fas fa-question-circle"></i>
                                    </div>
                                    <h4>No Questions Yet</h4>
                                    <p>Add questions using the form on the left</p>
                                </div>
                            <?php else: ?>
                                <?php foreach ($questions as $index => $q): ?>
                                    <div class="card mb-3" style="border-left: 3px solid var(--primary);">
                                        <div class="card-body">
                                            <div class="d-flex justify-between align-start mb-2">
                                                <span class="badge badge-secondary">Q<?= $index + 1 ?></span>
                                                <div class="d-flex gap-1">
                                                    <span class="badge badge-primary"><?= $q['marks'] ?> marks</span>
                                                    <button type="button" class="btn btn-sm btn-outline" onclick="editQuestion(<?= htmlspecialchars(json_encode($q)) ?>)">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <form method="POST" style="display: inline;" onsubmit="return confirm('Delete this question?')">
                                                        <input type="hidden" name="action" value="delete">
                                                        <input type="hidden" name="question_id" value="<?= $q['id'] ?>">
                                                        <button type="submit" class="btn btn-sm btn-danger">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>
                                            
                                            <p class="font-medium mb-2"><?= nl2br(htmlspecialchars($q['question_text'])) ?></p>
                                            
                                            <div class="row text-sm">
                                                <?php foreach (['A', 'B', 'C', 'D'] as $opt): ?>
                                                    <?php $optKey = 'option_' . strtolower($opt); ?>
                                                    <?php if (!empty($q[$optKey])): ?>
                                                        <div class="col-6 mb-1">
                                                            <span class="<?= $q['correct_answer'] === $opt ? 'text-success font-medium' : 'text-muted' ?>">
                                                                <?php if ($q['correct_answer'] === $opt): ?>
                                                                    <i class="fas fa-check-circle"></i>
                                                                <?php endif; ?>
                                                                <?= $opt ?>. <?= htmlspecialchars($q[$optKey]) ?>
                                                            </span>
                                                        </div>
                                                    <?php endif; ?>
                                                <?php endforeach; ?>
                                            </div>
                                            
                                            <?php if ($q['explanation']): ?>
                                                <div class="mt-2 text-sm text-muted">
                                                    <i class="fas fa-lightbulb text-warning"></i>
                                                    <?= htmlspecialchars($q['explanation']) ?>
                                                </div>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function editQuestion(q) {
    document.getElementById('formTitle').textContent = 'Edit Question';
    document.getElementById('formAction').value = 'edit';
    document.getElementById('questionId').value = q.id;
    document.getElementById('questionText').value = q.question_text;
    document.getElementById('optionA').value = q.option_a;
    document.getElementById('optionB').value = q.option_b;
    document.getElementById('optionC').value = q.option_c || '';
    document.getElementById('optionD').value = q.option_d || '';
    document.getElementById('correctAnswer').value = q.correct_answer;
    document.getElementById('marks').value = q.marks;
    document.getElementById('explanation').value = q.explanation || '';
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Update Question';
    document.getElementById('cancelBtn').style.display = 'inline-flex';
    document.getElementById('questionText').focus();
}

function resetForm() {
    document.getElementById('formTitle').textContent = 'Add Question';
    document.getElementById('formAction').value = 'add';
    document.getElementById('questionId').value = '';
    document.getElementById('questionForm').reset();
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-plus"></i> Add Question';
    document.getElementById('cancelBtn').style.display = 'none';
}
</script>

<?php include dirname(__DIR__) . '/includes/footer.php'; ?>
