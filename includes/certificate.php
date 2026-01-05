<?php
/**
 * Generate Certificate After Passing Assessment
 * This is called internally or can be included in submit-assessment.php
 */

function generateCertificate($attemptId, $userId) {
    global $conn;
    
    // Get attempt details
    $result = query("SELECT at.*, a.skill_id, a.college_id 
                     FROM attempts at 
                     JOIN assessments a ON at.assessment_id = a.id 
                     WHERE at.id = $attemptId AND at.user_id = $userId AND at.is_passed = 1");
    $attempt = fetch($result);
    
    if (!$attempt) {
        return false;
    }
    
    // Check if certificate already exists
    $result = query("SELECT id FROM certificates WHERE attempt_id = $attemptId");
    if (numRows($result) > 0) {
        return fetch($result)['id'];
    }
    
    // Generate unique certificate code
    $code = 'SV-' . strtoupper(bin2hex(random_bytes(4)));
    
    // Check code uniqueness
    while (true) {
        $result = query("SELECT id FROM certificates WHERE certificate_code = '$code'");
        if (numRows($result) === 0) break;
        $code = 'SV-' . strtoupper(bin2hex(random_bytes(4)));
    }
    
    // Set expiry (2 years from now)
    $expiresAt = date('Y-m-d H:i:s', strtotime('+2 years'));
    
    // Create certificate
    $sql = "INSERT INTO certificates (user_id, assessment_id, attempt_id, skill_id, college_id, certificate_code, expires_at) 
            VALUES ($userId, {$attempt['assessment_id']}, $attemptId, {$attempt['skill_id']}, {$attempt['college_id']}, '$code', '$expiresAt')";
    
    if (query($sql)) {
        return lastId();
    }
    
    return false;
}
