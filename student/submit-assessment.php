<?php
/**
 * Student - Submit Assessment
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/certificate.php';

requireRole(ROLE_STUDENT);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('assessments.php');
}

$attemptId = (int)($_POST['attempt_id'] ?? 0);
$answers = $_POST['answer'] ?? [];
$tabSwitches = (int)($_POST['tab_switches'] ?? 0);
$userId = getCurrentUserId();

// Validate attempt
$result = query("SELECT at.*, a.passing_marks, a.skill_id, a.college_id, a.is_daily_quiz
                 FROM attempts at
                 JOIN assessments a ON at.assessment_id = a.id
                 WHERE at.id = $attemptId AND at.user_id = $userId AND at.status = 'in_progress'");
$attempt = fetch($result);

if (!$attempt) {
    setFlash('danger', 'Invalid attempt.');
    redirect('assessments.php');
}

$assessmentId = $attempt['assessment_id'];

// Get questions and evaluate
$result = query("SELECT * FROM questions WHERE assessment_id = $assessmentId");
$questions = fetchAll($result);

$obtainedMarks = 0;
$totalCorrect = 0;

foreach ($questions as $question) {
    $selectedAnswer = $answers[$question['id']] ?? null;
    $isCorrect = $selectedAnswer && strtoupper($selectedAnswer) === strtoupper($question['correct_answer']);
    $marksObtained = $isCorrect ? $question['marks'] : 0;
    
    if ($isCorrect) {
        $obtainedMarks += $marksObtained;
        $totalCorrect++;
    }
    
    // Save answer
    $selectedAnswer = escape($selectedAnswer ?? '');
    $sql = "INSERT INTO attempt_answers (attempt_id, question_id, selected_answer, is_correct, marks_obtained) 
            VALUES ($attemptId, {$question['id']}, '$selectedAnswer', " . ($isCorrect ? 1 : 0) . ", $marksObtained)";
    query($sql);
}

// Calculate percentage
$percentage = $attempt['total_marks'] > 0 ? ($obtainedMarks / $attempt['total_marks']) * 100 : 0;
$isPassed = $obtainedMarks >= $attempt['passing_marks'] ? 1 : 0;

// Calculate time taken
$startTime = strtotime($attempt['started_at']);
$timeTaken = time() - $startTime;

// Auto-submit status check
$status = $tabSwitches >= 3 ? 'auto_submitted' : 'evaluated';

// Update attempt
$sql = "UPDATE attempts SET 
        submitted_at = NOW(),
        time_taken_seconds = $timeTaken,
        obtained_marks = $obtainedMarks,
        percentage = $percentage,
        is_passed = $isPassed,
        status = '$status',
        tab_switches = $tabSwitches
        WHERE id = $attemptId";
query($sql);

// Update user skills
$skillId = $attempt['skill_id'];
$result = query("SELECT * FROM user_skills WHERE user_id = $userId AND skill_id = $skillId");
$userSkill = fetch($result);

if ($userSkill) {
    $newTotalAttempts = $userSkill['total_attempts'] + count($questions);
    $newTotalCorrect = $userSkill['total_correct'] + $totalCorrect;
    $newAccuracy = ($newTotalCorrect / $newTotalAttempts) * 100;
    $newBestScore = max($userSkill['best_score'], $percentage);
    
    // Determine skill level
    $skillLevel = 'beginner';
    if ($newAccuracy >= 85) $skillLevel = 'expert';
    elseif ($newAccuracy >= 70) $skillLevel = 'advanced';
    elseif ($newAccuracy >= 50) $skillLevel = 'intermediate';
    
    $sql = "UPDATE user_skills SET 
            total_attempts = $newTotalAttempts,
            total_correct = $newTotalCorrect,
            accuracy = $newAccuracy,
            best_score = $newBestScore,
            skill_level = '$skillLevel',
            last_assessed_at = NOW()
            WHERE user_id = $userId AND skill_id = $skillId";
    query($sql);
} else {
    $accuracy = count($questions) > 0 ? ($totalCorrect / count($questions)) * 100 : 0;
    $skillLevel = 'beginner';
    if ($accuracy >= 85) $skillLevel = 'expert';
    elseif ($accuracy >= 70) $skillLevel = 'advanced';
    elseif ($accuracy >= 50) $skillLevel = 'intermediate';
    
    $sql = "INSERT INTO user_skills (user_id, skill_id, total_attempts, total_correct, accuracy, best_score, skill_level, last_assessed_at) 
            VALUES ($userId, $skillId, " . count($questions) . ", $totalCorrect, $accuracy, $percentage, '$skillLevel', NOW())";
    query($sql);
}

// If daily quiz, update streak
if ($attempt['is_daily_quiz']) {
    $today = date('Y-m-d');
    
    // Check if already logged today
    $result = query("SELECT * FROM daily_quiz_log WHERE user_id = $userId AND quiz_date = '$today'");
    if (numRows($result) === 0) {
        // Log the quiz
        query("INSERT INTO daily_quiz_log (user_id, quiz_date, attempt_id) VALUES ($userId, '$today', $attemptId)");
        
        // Update streak
        $result = query("SELECT * FROM streaks WHERE user_id = $userId");
        $streak = fetch($result);
        
        if ($streak) {
            $lastActivity = $streak['last_activity_date'];
            $yesterday = date('Y-m-d', strtotime('-1 day'));
            
            if ($lastActivity === $yesterday) {
                // Continuing streak
                $newStreak = $streak['current_streak'] + 1;
                $longestStreak = max($streak['longest_streak'], $newStreak);
            } elseif ($lastActivity === $today) {
                // Already updated today
                $newStreak = $streak['current_streak'];
                $longestStreak = $streak['longest_streak'];
            } else {
                // Streak broken
                $newStreak = 1;
                $longestStreak = $streak['longest_streak'];
            }
            
            $totalQuizzes = $streak['total_quizzes_completed'] + 1;
            
            query("UPDATE streaks SET 
                   current_streak = $newStreak, 
                   longest_streak = $longestStreak,
                   total_quizzes_completed = $totalQuizzes,
                   last_activity_date = '$today' 
                   WHERE user_id = $userId");
        }
    }
}

// Generate certificate if passed
if ($isPassed) {
    generateCertificate($attemptId, $userId);
}

// Redirect to result page
redirect("assessment-result.php?id=$attemptId");
?>
