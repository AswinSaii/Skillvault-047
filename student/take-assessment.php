<?php
/**
 * Student - Take Assessment
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_STUDENT);

$assessmentId = (int)($_GET['id'] ?? 0);
$userId = getCurrentUserId();
$collegeId = $_SESSION['college_id'];

if (!$assessmentId) {
    redirect('assessments.php');
}

// Get assessment
$result = query("SELECT a.*, s.name as skill_name, s.icon as skill_icon
                 FROM assessments a
                 JOIN skills s ON a.skill_id = s.id
                 WHERE a.id = $assessmentId AND a.college_id = $collegeId AND a.is_active = 1");
$assessment = fetch($result);

if (!$assessment) {
    setFlash('danger', 'Assessment not found or not available.');
    redirect('assessments.php');
}

// Check if already has an active attempt
$result = query("SELECT * FROM attempts WHERE user_id = $userId AND assessment_id = $assessmentId AND status = 'in_progress'");
$activeAttempt = fetch($result);

// Get questions
$result = query("SELECT * FROM questions WHERE assessment_id = $assessmentId ORDER BY order_index, id");
$questions = fetchAll($result);

$pageTitle = $assessment['title'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle) ?> | <?= APP_NAME ?></title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="<?= APP_URL ?>/assets/css/style.css">
    
    <style>
        .assessment-header {
            background: white;
            padding: 1rem;
            border-bottom: 1px solid var(--gray-200);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .timer {
            font-size: 1.25rem;
            font-weight: 600;
            font-family: var(--font-mono);
            padding: 0.5rem 1rem;
            background: var(--gray-100);
            border-radius: var(--radius-md);
        }
        
        .timer.warning {
            background: rgba(245, 158, 11, 0.1);
            color: var(--warning);
        }
        
        .timer.danger {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger);
            animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        .question-nav {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .question-nav-item {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-md);
            border: 1px solid var(--gray-300);
            background: white;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all var(--transition-fast);
        }
        
        .question-nav-item:hover {
            border-color: var(--primary);
        }
        
        .question-nav-item.active {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
        }
        
        .question-nav-item.answered {
            background: var(--success);
            color: white;
            border-color: var(--success);
        }
        
        .question-card {
            background: white;
            border-radius: var(--radius-lg);
            padding: 2rem;
            margin-bottom: 1rem;
        }
        
        .question-text {
            font-size: 1.125rem;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }
        
        .option-list {
            list-style: none;
        }
        
        .option-item {
            margin-bottom: 0.75rem;
        }
        
        .option-label {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 1rem;
            background: var(--gray-50);
            border: 2px solid transparent;
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all var(--transition-fast);
        }
        
        .option-label:hover {
            background: var(--gray-100);
        }
        
        .option-item input:checked + .option-label {
            background: rgba(99, 102, 241, 0.05);
            border-color: var(--primary);
        }
        
        .option-letter {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border-radius: var(--radius-full);
            font-weight: 600;
            font-size: 0.875rem;
            flex-shrink: 0;
        }
        
        .option-item input:checked + .option-label .option-letter {
            background: var(--primary);
            color: white;
        }
        
        .proctoring-notice {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: var(--radius-md);
            padding: 1rem;
            margin-bottom: 1rem;
        }
        
        .proctoring-notice i {
            color: var(--danger);
        }
        
        .tab-switch-counter {
            font-size: 0.875rem;
            color: var(--gray-600);
        }
        
        .tab-switch-counter.warning {
            color: var(--danger);
        }
    </style>
</head>
<body>
    <?php if (!$activeAttempt): ?>
        <!-- Start Assessment Modal -->
        <div class="modal-overlay active" id="start-modal">
            <div class="modal">
                <div class="modal-header">
                    <h5 class="modal-title">Start Assessment</h5>
                </div>
                <div class="modal-body">
                    <h4 class="mb-3"><?= htmlspecialchars($assessment['title']) ?></h4>
                    
                    <div class="d-flex gap-2 mb-3 flex-wrap">
                        <span class="badge badge-primary">
                            <i class="<?= htmlspecialchars($assessment['skill_icon'] ?: 'fas fa-code') ?>"></i>
                            <?= htmlspecialchars($assessment['skill_name']) ?>
                        </span>
                        <span class="badge badge-<?= $assessment['difficulty'] === 'easy' ? 'success' : ($assessment['difficulty'] === 'medium' ? 'warning' : 'danger') ?>">
                            <?= ucfirst($assessment['difficulty']) ?>
                        </span>
                    </div>
                    
                    <table class="table mb-3">
                        <tr>
                            <td><i class="fas fa-clock text-muted"></i> Duration</td>
                            <td><strong><?= $assessment['duration_minutes'] ?> minutes</strong></td>
                        </tr>
                        <tr>
                            <td><i class="fas fa-question-circle text-muted"></i> Questions</td>
                            <td><strong><?= count($questions) ?> questions</strong></td>
                        </tr>
                        <tr>
                            <td><i class="fas fa-star text-muted"></i> Total Marks</td>
                            <td><strong><?= $assessment['total_marks'] ?></strong></td>
                        </tr>
                        <tr>
                            <td><i class="fas fa-check-circle text-muted"></i> Passing Marks</td>
                            <td><strong><?= $assessment['passing_marks'] ?></strong></td>
                        </tr>
                    </table>
                    
                    <div class="proctoring-notice">
                        <h6><i class="fas fa-shield-halved"></i> Proctoring Rules</h6>
                        <ul style="font-size: 0.875rem; margin-bottom: 0; padding-left: 1.25rem;">
                            <li>Assessment will run in fullscreen mode</li>
                            <li>Right-click and keyboard shortcuts are disabled</li>
                            <li>Switching tabs will be recorded</li>
                            <li>3 tab switches will auto-submit your test</li>
                            <li>Timer cannot be paused once started</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <a href="assessments.php" class="btn btn-secondary">Cancel</a>
                    <form method="POST" action="start-assessment.php" style="display: inline;">
                        <input type="hidden" name="assessment_id" value="<?= $assessmentId ?>">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-play"></i>
                            Start Assessment
                        </button>
                    </form>
                </div>
            </div>
        </div>
    <?php else: ?>
        <!-- Assessment Interface -->
        <div class="assessment-header">
            <div class="container-lg d-flex justify-between align-center">
                <div>
                    <h5 class="mb-0"><?= htmlspecialchars($assessment['title']) ?></h5>
                    <small class="text-muted"><?= htmlspecialchars($assessment['skill_name']) ?></small>
                </div>
                <div class="d-flex align-center gap-3">
                    <div class="tab-switch-counter" id="tabSwitchCounter">
                        Tab switches: <span id="tabSwitchCount">0</span>/3
                    </div>
                    <div class="timer" id="timer">
                        <?= $assessment['duration_minutes'] ?>:00
                    </div>
                </div>
            </div>
        </div>
        
        <div class="container-lg p-3">
            <form id="assessmentForm" method="POST" action="submit-assessment.php">
                <input type="hidden" name="attempt_id" value="<?= $activeAttempt['id'] ?>">
                <input type="hidden" name="tab_switches" id="tabSwitchesInput" value="0">
                
                <div class="row">
                    <!-- Questions -->
                    <div class="col-12 col-md-9">
                        <?php foreach ($questions as $index => $question): ?>
                            <div class="question-card" id="question-<?= $index + 1 ?>" style="<?= $index > 0 ? 'display:none;' : '' ?>">
                                <div class="d-flex justify-between align-center mb-3">
                                    <span class="badge badge-secondary">Question <?= $index + 1 ?> of <?= count($questions) ?></span>
                                    <span class="badge badge-primary"><?= $question['marks'] ?> marks</span>
                                </div>
                                
                                <div class="question-text">
                                    <?= nl2br(htmlspecialchars($question['question_text'])) ?>
                                </div>
                                
                                <ul class="option-list">
                                    <?php foreach (['A', 'B', 'C', 'D'] as $opt): ?>
                                        <?php $optKey = 'option_' . strtolower($opt); ?>
                                        <?php if (!empty($question[$optKey])): ?>
                                            <li class="option-item">
                                                <input type="radio" 
                                                       name="answer[<?= $question['id'] ?>]" 
                                                       value="<?= $opt ?>" 
                                                       id="q<?= $question['id'] ?>_<?= $opt ?>"
                                                       class="d-none answer-input"
                                                       data-question="<?= $index + 1 ?>">
                                                <label for="q<?= $question['id'] ?>_<?= $opt ?>" class="option-label">
                                                    <span class="option-letter"><?= $opt ?></span>
                                                    <span><?= htmlspecialchars($question[$optKey]) ?></span>
                                                </label>
                                            </li>
                                        <?php endif; ?>
                                    <?php endforeach; ?>
                                </ul>
                            </div>
                        <?php endforeach; ?>
                        
                        <!-- Navigation -->
                        <div class="d-flex justify-between mt-3">
                            <button type="button" id="prevBtn" class="btn btn-outline" disabled>
                                <i class="fas fa-arrow-left"></i> Previous
                            </button>
                            <button type="button" id="nextBtn" class="btn btn-primary">
                                Next <i class="fas fa-arrow-right"></i>
                            </button>
                            <button type="submit" id="submitBtn" class="btn btn-success" style="display: none;">
                                <i class="fas fa-check"></i> Submit Assessment
                            </button>
                        </div>
                    </div>
                    
                    <!-- Sidebar -->
                    <div class="col-12 col-md-3 hide-mobile">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="card-title mb-0">Question Navigator</h6>
                            </div>
                            <div class="card-body">
                                <div class="question-nav">
                                    <?php for ($i = 1; $i <= count($questions); $i++): ?>
                                        <div class="question-nav-item <?= $i === 1 ? 'active' : '' ?>" data-question="<?= $i ?>">
                                            <?= $i ?>
                                        </div>
                                    <?php endfor; ?>
                                </div>
                                
                                <div class="text-sm text-muted">
                                    <div class="d-flex align-center gap-1 mb-1">
                                        <div style="width: 12px; height: 12px; background: var(--success); border-radius: 2px;"></div>
                                        <span>Answered</span>
                                    </div>
                                    <div class="d-flex align-center gap-1">
                                        <div style="width: 12px; height: 12px; background: var(--primary); border-radius: 2px;"></div>
                                        <span>Current</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card mt-3">
                            <div class="card-body">
                                <button type="submit" class="btn btn-success btn-block">
                                    <i class="fas fa-check"></i>
                                    Submit Assessment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        
        <script src="<?= APP_URL ?>/assets/js/proctor.js"></script>
        <script>
            const totalQuestions = <?= count($questions) ?>;
            const durationMinutes = <?= $assessment['duration_minutes'] ?>;
            let currentQuestion = 1;
            let tabSwitches = 0;
            
            // Initialize proctoring
            const proctor = new Proctor({
                fullscreenRequired: true,
                tabSwitchLimit: 3,
                onTabSwitch: function(count) {
                    tabSwitches = count;
                    document.getElementById('tabSwitchCount').textContent = count;
                    document.getElementById('tabSwitchesInput').value = count;
                    
                    if (count >= 2) {
                        document.getElementById('tabSwitchCounter').classList.add('warning');
                    }
                },
                onViolation: function(violation) {
                    console.log('Violation:', violation);
                }
            });
            
            // Start proctoring when page loads
            proctor.start();
            
            // Timer
            let timeLeft = durationMinutes * 60;
            const timerEl = document.getElementById('timer');
            
            const timerInterval = setInterval(() => {
                timeLeft--;
                const mins = Math.floor(timeLeft / 60);
                const secs = timeLeft % 60;
                timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                
                if (timeLeft <= 300) {
                    timerEl.classList.add('warning');
                }
                if (timeLeft <= 60) {
                    timerEl.classList.remove('warning');
                    timerEl.classList.add('danger');
                }
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    window.autoSubmitAssessment();
                }
            }, 1000);
            
            // Auto submit function
            window.autoSubmitAssessment = function() {
                proctor.stop();
                document.getElementById('assessmentForm').submit();
            };
            
            // Question navigation
            function showQuestion(num) {
                document.querySelectorAll('.question-card').forEach(q => q.style.display = 'none');
                document.getElementById('question-' + num).style.display = 'block';
                
                document.querySelectorAll('.question-nav-item').forEach(item => {
                    item.classList.remove('active');
                    if (parseInt(item.dataset.question) === num) {
                        item.classList.add('active');
                    }
                });
                
                currentQuestion = num;
                updateNavButtons();
            }
            
            function updateNavButtons() {
                document.getElementById('prevBtn').disabled = currentQuestion === 1;
                
                if (currentQuestion === totalQuestions) {
                    document.getElementById('nextBtn').style.display = 'none';
                    document.getElementById('submitBtn').style.display = 'inline-flex';
                } else {
                    document.getElementById('nextBtn').style.display = 'inline-flex';
                    document.getElementById('submitBtn').style.display = 'none';
                }
            }
            
            document.getElementById('prevBtn').addEventListener('click', () => {
                if (currentQuestion > 1) showQuestion(currentQuestion - 1);
            });
            
            document.getElementById('nextBtn').addEventListener('click', () => {
                if (currentQuestion < totalQuestions) showQuestion(currentQuestion + 1);
            });
            
            // Question nav click
            document.querySelectorAll('.question-nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    showQuestion(parseInt(item.dataset.question));
                });
            });
            
            // Mark answered questions
            document.querySelectorAll('.answer-input').forEach(input => {
                input.addEventListener('change', function() {
                    const qNum = parseInt(this.dataset.question);
                    document.querySelectorAll('.question-nav-item').forEach(item => {
                        if (parseInt(item.dataset.question) === qNum) {
                            item.classList.add('answered');
                        }
                    });
                });
            });
            
            // Submit confirmation
            document.getElementById('assessmentForm').addEventListener('submit', function(e) {
                const answered = document.querySelectorAll('.answer-input:checked').length;
                if (answered < totalQuestions) {
                    if (!confirm(`You have answered ${answered} out of ${totalQuestions} questions. Submit anyway?`)) {
                        e.preventDefault();
                        return;
                    }
                }
                proctor.stop();
            });
        </script>
    <?php endif; ?>
</body>
</html>
