<?php
/**
 * Student - Daily Quiz
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_STUDENT);

$userId = getCurrentUserId();
$collegeId = $_SESSION['college_id'];
$today = date('Y-m-d');

// Check if already completed today's quiz
$result = query("SELECT dql.*, at.obtained_marks, at.total_marks, at.percentage, at.is_passed,
                 a.title as assessment_title, s.name as skill_name
                 FROM daily_quiz_log dql
                 JOIN attempts at ON dql.attempt_id = at.id
                 JOIN assessments a ON at.assessment_id = a.id
                 JOIN skills s ON a.skill_id = s.id
                 WHERE dql.user_id = $userId AND dql.quiz_date = '$today'");
$todayQuiz = fetch($result);

// Get user's streak
$result = query("SELECT * FROM streaks WHERE user_id = $userId");
$streak = fetch($result);

if (!$streak) {
    // Create streak record
    query("INSERT INTO streaks (user_id) VALUES ($userId)");
    $streak = ['current_streak' => 0, 'longest_streak' => 0, 'total_quizzes_completed' => 0];
}

// Get available daily quizzes
$result = query("SELECT a.*, s.name as skill_name, s.icon as skill_icon,
                 (SELECT COUNT(*) FROM questions WHERE assessment_id = a.id) as question_count
                 FROM assessments a
                 JOIN skills s ON a.skill_id = s.id
                 WHERE a.college_id = $collegeId AND a.is_active = 1 AND a.is_daily_quiz = 1
                 ORDER BY RAND()
                 LIMIT 5");
$dailyQuizzes = fetchAll($result);

// Get recent quiz history
$result = query("SELECT dql.*, at.obtained_marks, at.total_marks, at.percentage, at.is_passed,
                 a.title as assessment_title, s.name as skill_name
                 FROM daily_quiz_log dql
                 JOIN attempts at ON dql.attempt_id = at.id
                 JOIN assessments a ON at.assessment_id = a.id
                 JOIN skills s ON a.skill_id = s.id
                 WHERE dql.user_id = $userId
                 ORDER BY dql.quiz_date DESC
                 LIMIT 7");
$recentQuizzes = fetchAll($result);

$pageTitle = 'Daily Quiz';
include dirname(__DIR__) . '/includes/header.php';
?>

<div class="layout">
    <?php include dirname(__DIR__) . '/includes/sidebar.php'; ?>
    
    <div class="main-content">
        <div class="content-wrapper">
            <div class="content-header">
                <div>
                    <h1 class="page-title">Daily Quiz</h1>
                    <p class="text-muted">Complete a daily quiz to maintain your streak!</p>
                </div>
            </div>
            
            <!-- Streak Display -->
            <div class="card mb-4" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white;">
                <div class="card-body">
                    <div class="row align-center">
                        <div class="col-12 col-md-4 text-center mb-3 mb-md-0">
                            <div class="streak-display">
                                <div class="streak-icon">
                                    <i class="fas fa-fire"></i>
                                </div>
                                <div class="streak-count"><?= $streak['current_streak'] ?></div>
                                <div class="streak-label">Day Streak</div>
                            </div>
                        </div>
                        <div class="col-6 col-md-4 text-center">
                            <h3 class="mb-0"><?= $streak['longest_streak'] ?></h3>
                            <small>Longest Streak</small>
                        </div>
                        <div class="col-6 col-md-4 text-center">
                            <h3 class="mb-0"><?= $streak['total_quizzes_completed'] ?></h3>
                            <small>Total Quizzes</small>
                        </div>
                    </div>
                    
                    <!-- Streak badges -->
                    <div class="text-center mt-3">
                        <?php if ($streak['current_streak'] >= 7): ?>
                            <span class="badge" style="background: rgba(255,255,255,0.2);">
                                <i class="fas fa-trophy"></i> 7 Day Streak!
                            </span>
                        <?php endif; ?>
                        <?php if ($streak['current_streak'] >= 30): ?>
                            <span class="badge" style="background: rgba(255,255,255,0.2);">
                                <i class="fas fa-crown"></i> Monthly Master!
                            </span>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            
            <?php if ($todayQuiz): ?>
                <!-- Already completed today -->
                <div class="card mb-4">
                    <div class="card-body text-center py-5">
                        <div class="text-success mb-3" style="font-size: 4rem;">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3>Today's Quiz Completed!</h3>
                        <p class="text-muted mb-3">
                            You scored <?= number_format($todayQuiz['percentage'], 1) ?>% on "<?= htmlspecialchars($todayQuiz['assessment_title']) ?>"
                        </p>
                        <p class="text-muted">Come back tomorrow to continue your streak!</p>
                        <a href="assessment-result.php?id=<?= $todayQuiz['attempt_id'] ?>" class="btn btn-primary">
                            <i class="fas fa-eye"></i> View Result
                        </a>
                    </div>
                </div>
            <?php else: ?>
                <!-- Available Daily Quizzes -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title">
                            <i class="fas fa-bolt text-warning"></i> Today's Quizzes
                        </h5>
                    </div>
                    <div class="card-body">
                        <?php if (empty($dailyQuizzes)): ?>
                            <div class="empty-state py-4">
                                <div class="empty-icon">
                                    <i class="fas fa-calendar-day"></i>
                                </div>
                                <h4>No Daily Quizzes Available</h4>
                                <p>Your college hasn't set up daily quizzes yet. Check back later!</p>
                            </div>
                        <?php else: ?>
                            <div class="row">
                                <?php foreach ($dailyQuizzes as $quiz): ?>
                                    <div class="col-12 col-md-6 col-lg-4 mb-3">
                                        <div class="card h-100" style="border: 2px solid var(--warning);">
                                            <div class="card-body">
                                                <div class="d-flex align-center gap-2 mb-2">
                                                    <div class="stat-card-icon warning" style="width: 36px; height: 36px;">
                                                        <i class="<?= htmlspecialchars($quiz['skill_icon'] ?: 'fas fa-code') ?>"></i>
                                                    </div>
                                                    <div>
                                                        <h6 class="mb-0"><?= htmlspecialchars($quiz['title']) ?></h6>
                                                        <small class="text-muted"><?= htmlspecialchars($quiz['skill_name']) ?></small>
                                                    </div>
                                                </div>
                                                
                                                <div class="d-flex justify-between text-sm text-muted mb-3">
                                                    <span><i class="fas fa-question-circle"></i> <?= $quiz['question_count'] ?> Q</span>
                                                    <span><i class="fas fa-clock"></i> <?= $quiz['duration_minutes'] ?> min</span>
                                                </div>
                                                
                                                <a href="take-assessment.php?id=<?= $quiz['id'] ?>" class="btn btn-warning btn-block">
                                                    <i class="fas fa-play"></i> Start Quiz
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>
            
            <!-- Recent Quiz History -->
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title">Recent Quiz History</h5>
                </div>
                <div class="card-body">
                    <?php if (empty($recentQuizzes)): ?>
                        <p class="text-muted text-center py-3">No quiz history yet. Start your first daily quiz!</p>
                    <?php else: ?>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Quiz</th>
                                        <th class="hide-mobile">Skill</th>
                                        <th>Score</th>
                                        <th>Result</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($recentQuizzes as $quiz): ?>
                                        <tr>
                                            <td><?= date('M j', strtotime($quiz['quiz_date'])) ?></td>
                                            <td><?= htmlspecialchars($quiz['assessment_title']) ?></td>
                                            <td class="hide-mobile">
                                                <span class="badge badge-primary"><?= htmlspecialchars($quiz['skill_name']) ?></span>
                                            </td>
                                            <td><?= number_format($quiz['percentage'], 1) ?>%</td>
                                            <td>
                                                <?php if ($quiz['is_passed']): ?>
                                                    <span class="badge badge-success">Pass</span>
                                                <?php else: ?>
                                                    <span class="badge badge-danger">Fail</span>
                                                <?php endif; ?>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include dirname(__DIR__) . '/includes/footer.php'; ?>
