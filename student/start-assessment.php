<?php
/**
 * Student - Start Assessment (Create Attempt)
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_STUDENT);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('assessments.php');
}

$assessmentId = (int)($_POST['assessment_id'] ?? 0);
$userId = getCurrentUserId();
$collegeId = $_SESSION['college_id'];

// Validate assessment
$result = query("SELECT * FROM assessments WHERE id = $assessmentId AND college_id = $collegeId AND is_active = 1");
$assessment = fetch($result);

if (!$assessment) {
    setFlash('danger', 'Assessment not found.');
    redirect('assessments.php');
}

// Check for existing in-progress attempt
$result = query("SELECT * FROM attempts WHERE user_id = $userId AND assessment_id = $assessmentId AND status = 'in_progress'");
if (numRows($result) > 0) {
    // Resume existing attempt
    redirect("take-assessment.php?id=$assessmentId");
}

// Get total marks
$result = query("SELECT SUM(marks) as total FROM questions WHERE assessment_id = $assessmentId");
$totalMarks = fetch($result)['total'] ?: $assessment['total_marks'];

// Create new attempt
$ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
$userAgent = escape($_SERVER['HTTP_USER_AGENT'] ?? '');

$sql = "INSERT INTO attempts (user_id, assessment_id, total_marks, status, ip_address, user_agent) 
        VALUES ($userId, $assessmentId, $totalMarks, 'in_progress', '$ipAddress', '$userAgent')";

if (query($sql)) {
    redirect("take-assessment.php?id=$assessmentId");
} else {
    setFlash('danger', 'Failed to start assessment. Please try again.');
    redirect('assessments.php');
}
?>
