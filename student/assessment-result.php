<?php
/**
 * Student - Assessment Result
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_STUDENT);

$attemptId = (int)($_GET['id'] ?? 0);
$userId = getCurrentUserId();

// Get attempt with assessment details
$result = query("SELECT at.*, a.title, a.description, a.difficulty, a.passing_marks,
                 s.name as skill_name, s.icon as skill_icon, c.name as college_name
                 FROM attempts at
                 JOIN assessments a ON at.assessment_id = a.id
                 JOIN skills s ON a.skill_id = s.id
                 JOIN colleges c ON a.college_id = c.id
                 WHERE at.id = $attemptId AND at.user_id = $userId");
$attempt = fetch($result);

if (!$attempt) {
    setFlash('danger', 'Result not found.');
    redirect('assessments.php');
}

// Get answers with questions
$result = query("SELECT aa.*, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, 
                 q.correct_answer, q.explanation, q.marks
                 FROM attempt_answers aa
                 JOIN questions q ON aa.question_id = q.id
                 WHERE aa.attempt_id = $attemptId
                 ORDER BY q.order_index, q.id");
$answers = fetchAll($result);

$pageTitle = 'Assessment Result';
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
    
    <style>
        .result-header {
            background: linear-gradient(135deg, <?= $attempt['is_passed'] ? '#10b981' : '#ef4444' ?> 0%, <?= $attempt['is_passed'] ? '#059669' : '#dc2626' ?> 100%);
            color: white;
            padding: 3rem 0;
            text-align: center;
        }
        
        .result-score {
            font-size: 4rem;
            font-weight: 700;
            line-height: 1;
        }
        
        .result-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        
        .answer-card {
            background: white;
            border-radius: var(--radius-lg);
            padding: 1.5rem;
            margin-bottom: 1rem;
            border-left: 4px solid var(--gray-300);
        }
        
        .answer-card.correct {
            border-left-color: var(--success);
        }
        
        .answer-card.incorrect {
            border-left-color: var(--danger);
        }
        
        .option-display {
            padding: 0.5rem 1rem;
            border-radius: var(--radius-md);
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
        }
        
        .option-display.selected {
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid var(--primary);
        }
        
        .option-display.correct {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid var(--success);
        }
        
        .option-display.selected.incorrect {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid var(--danger);
        }
    </style>
</head>
<body>
    <div class="layout">
        <?php include dirname(__DIR__) . '/includes/sidebar.php'; ?>
        
        <div class="main-content">
            <!-- Result Header -->
            <div class="result-header">
                <div class="container">
                    <div class="result-icon">
                        <?php if ($attempt['is_passed']): ?>
                            <i class="fas fa-trophy"></i>
                        <?php else: ?>
                            <i class="fas fa-times-circle"></i>
                        <?php endif; ?>
                    </div>
                    
                    <h2><?= $attempt['is_passed'] ? 'Congratulations!' : 'Keep Practicing!' ?></h2>
                    <p class="mb-3"><?= htmlspecialchars($attempt['title']) ?></p>
                    
                    <div class="result-score"><?= number_format($attempt['percentage'], 1) ?>%</div>
                    <p>
                        <?= $attempt['obtained_marks'] ?> / <?= $attempt['total_marks'] ?> marks
                    </p>
                    
                    <?php if ($attempt['is_passed']): ?>
                        <span class="badge" style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; font-size: 1rem;">
                            <i class="fas fa-check-circle"></i> PASSED
                        </span>
                    <?php else: ?>
                        <span class="badge" style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; font-size: 1rem;">
                            Passing marks: <?= $attempt['passing_marks'] ?>
                        </span>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="content-wrapper">
                <!-- Summary Stats -->
                <div class="stats-grid mb-4">
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Correct Answers</span>
                            <div class="stat-card-icon success">
                                <i class="fas fa-check"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">
                            <?= count(array_filter($answers, fn($a) => $a['is_correct'])) ?>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Incorrect Answers</span>
                            <div class="stat-card-icon danger">
                                <i class="fas fa-times"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">
                            <?= count(array_filter($answers, fn($a) => !$a['is_correct'] && $a['selected_answer'])) ?>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Time Taken</span>
                            <div class="stat-card-icon primary">
                                <i class="fas fa-clock"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">
                            <?= floor($attempt['time_taken_seconds'] / 60) ?>:<?= str_pad($attempt['time_taken_seconds'] % 60, 2, '0', STR_PAD_LEFT) ?>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-title">Tab Switches</span>
                            <div class="stat-card-icon warning">
                                <i class="fas fa-window-restore"></i>
                            </div>
                        </div>
                        <div class="stat-card-value"><?= $attempt['tab_switches'] ?></div>
                    </div>
                </div>
                
                <?php if ($attempt['status'] === 'auto_submitted'): ?>
                    <div class="alert alert-warning mb-4">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Note:</strong> This assessment was auto-submitted due to multiple tab switches.
                    </div>
                <?php endif; ?>
                
                <!-- Actions -->
                <div class="d-flex gap-2 mb-4 flex-wrap">
                    <a href="assessments.php" class="btn btn-outline">
                        <i class="fas fa-arrow-left"></i> Back to Assessments
                    </a>
                    <?php if ($attempt['is_passed']): ?>
                        <a href="certificates.php" class="btn btn-success">
                            <i class="fas fa-certificate"></i> View Certificate
                        </a>
                    <?php else: ?>
                        <a href="take-assessment.php?id=<?= $attempt['assessment_id'] ?>" class="btn btn-primary">
                            <i class="fas fa-redo"></i> Retry Assessment
                        </a>
                    <?php endif; ?>
                </div>
                
                <!-- Answer Review -->
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Review Your Answers</h5>
                    </div>
                    <div class="card-body">
                        <?php foreach ($answers as $index => $answer): ?>
                            <div class="answer-card <?= $answer['is_correct'] ? 'correct' : ($answer['selected_answer'] ? 'incorrect' : '') ?>">
                                <div class="d-flex justify-between align-center mb-2">
                                    <span class="badge badge-secondary">Question <?= $index + 1 ?></span>
                                    <?php if ($answer['is_correct']): ?>
                                        <span class="badge badge-success">
                                            <i class="fas fa-check"></i> Correct (+<?= $answer['marks_obtained'] ?>)
                                        </span>
                                    <?php elseif ($answer['selected_answer']): ?>
                                        <span class="badge badge-danger">
                                            <i class="fas fa-times"></i> Incorrect
                                        </span>
                                    <?php else: ?>
                                        <span class="badge badge-secondary">Not Answered</span>
                                    <?php endif; ?>
                                </div>
                                
                                <p class="font-medium mb-3"><?= nl2br(htmlspecialchars($answer['question_text'])) ?></p>
                                
                                <?php foreach (['A', 'B', 'C', 'D'] as $opt): ?>
                                    <?php $optKey = 'option_' . strtolower($opt); ?>
                                    <?php if (!empty($answer[$optKey])): ?>
                                        <?php
                                        $classes = 'option-display';
                                        if (strtoupper($answer['selected_answer']) === $opt) {
                                            $classes .= ' selected';
                                            if (!$answer['is_correct']) {
                                                $classes .= ' incorrect';
                                            }
                                        }
                                        if (strtoupper($answer['correct_answer']) === $opt) {
                                            $classes .= ' correct';
                                        }
                                        ?>
                                        <div class="<?= $classes ?>">
                                            <strong><?= $opt ?>.</strong> <?= htmlspecialchars($answer[$optKey]) ?>
                                            <?php if (strtoupper($answer['correct_answer']) === $opt): ?>
                                                <i class="fas fa-check text-success"></i>
                                            <?php endif; ?>
                                        </div>
                                    <?php endif; ?>
                                <?php endforeach; ?>
                                
                                <?php if ($answer['explanation'] && !$answer['is_correct']): ?>
                                    <div class="mt-3 p-3 bg-gray rounded">
                                        <strong><i class="fas fa-lightbulb text-warning"></i> Explanation:</strong>
                                        <p class="mb-0 mt-1"><?= htmlspecialchars($answer['explanation']) ?></p>
                                    </div>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="<?= APP_URL ?>/assets/js/main.js"></script>
</body>
</html>
