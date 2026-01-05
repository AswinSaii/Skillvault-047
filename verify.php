<?php
/**
 * Public Certificate Verification
 */
require_once __DIR__ . '/config/config.php';

$code = $_GET['code'] ?? '';
$certificate = null;
$verified = false;

if ($code) {
    $code = escape($code);
    $result = query("SELECT c.*, 
                     u.full_name as student_name, u.email as student_email,
                     a.title as assessment_title, a.difficulty,
                     s.name as skill_name, s.icon as skill_icon,
                     col.name as college_name, col.city, col.state,
                     at.obtained_marks, at.total_marks, at.percentage
                     FROM certificates c
                     JOIN users u ON c.user_id = u.id
                     JOIN assessments a ON c.assessment_id = a.id
                     JOIN skills s ON c.skill_id = s.id
                     JOIN colleges col ON c.college_id = col.id
                     JOIN attempts at ON c.attempt_id = at.id
                     WHERE c.certificate_code = '$code'");
    $certificate = fetch($result);
    $verified = $certificate !== null;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Certificate | <?= APP_NAME ?></title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="<?= APP_URL ?>/assets/css/style.css">
    
    <style>
        .verify-page {
            min-height: 100vh;
            background: linear-gradient(135deg, var(--gray-100) 0%, white 100%);
        }
        
        .verify-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }
        
        .verify-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .verify-logo {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 0.5rem;
        }
        
        .search-form {
            background: white;
            border-radius: var(--radius-lg);
            padding: 2rem;
            box-shadow: var(--shadow-md);
            margin-bottom: 2rem;
        }
        
        .search-input-group {
            display: flex;
            gap: 0.5rem;
        }
        
        .search-input-group input {
            flex: 1;
        }
        
        .verification-result {
            background: white;
            border-radius: var(--radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-md);
        }
        
        .result-header {
            padding: 2rem;
            text-align: center;
        }
        
        .result-header.verified {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
        }
        
        .result-header.invalid {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
        }
        
        .result-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        
        .certificate-details {
            padding: 2rem;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--gray-200);
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            color: var(--gray-600);
            font-size: 0.875rem;
        }
        
        .detail-value {
            font-weight: 500;
            text-align: right;
        }
        
        .certificate-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: var(--gray-100);
            border-radius: var(--radius-full);
            font-weight: 500;
        }
        
        @media (max-width: 640px) {
            .search-input-group {
                flex-direction: column;
            }
        }
    </style>
</head>
<body class="verify-page">
    <div class="verify-container">
        <div class="verify-header">
            <a href="<?= APP_URL ?>" class="verify-logo">
                <i class="fas fa-shield-halved"></i> <?= APP_NAME ?>
            </a>
            <p class="text-muted">Verify skill certificates issued by verified colleges</p>
        </div>
        
        <div class="search-form">
            <h4 class="mb-3"><i class="fas fa-search"></i> Verify Certificate</h4>
            <form method="GET" action="">
                <div class="form-group mb-3">
                    <label class="form-label">Enter Certificate Code</label>
                    <div class="search-input-group">
                        <input type="text" name="code" class="form-input" 
                               value="<?= htmlspecialchars($code) ?>"
                               placeholder="e.g., SV-XXXXXXXX" required>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-search"></i> Verify
                        </button>
                    </div>
                    <small class="text-muted">Enter the certificate code or scan the QR code on the certificate</small>
                </div>
            </form>
        </div>
        
        <?php if ($code): ?>
            <div class="verification-result">
                <?php if ($verified): ?>
                    <div class="result-header verified">
                        <div class="result-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h2>Certificate Verified</h2>
                        <p>This is an authentic certificate issued by a verified institution</p>
                    </div>
                    
                    <div class="certificate-details">
                        <div class="text-center mb-4">
                            <div class="certificate-badge">
                                <i class="<?= htmlspecialchars($certificate['skill_icon'] ?: 'fas fa-code') ?> text-primary"></i>
                                <?= htmlspecialchars($certificate['skill_name']) ?>
                            </div>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Certificate Code</span>
                            <span class="detail-value font-mono"><?= htmlspecialchars($certificate['certificate_code']) ?></span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Student Name</span>
                            <span class="detail-value"><?= htmlspecialchars($certificate['student_name']) ?></span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Assessment</span>
                            <span class="detail-value"><?= htmlspecialchars($certificate['assessment_title']) ?></span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Skill</span>
                            <span class="detail-value">
                                <span class="badge badge-primary">
                                    <?= htmlspecialchars($certificate['skill_name']) ?>
                                </span>
                            </span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Difficulty Level</span>
                            <span class="detail-value">
                                <span class="badge badge-<?= $certificate['difficulty'] === 'easy' ? 'success' : ($certificate['difficulty'] === 'medium' ? 'warning' : 'danger') ?>">
                                    <?= ucfirst($certificate['difficulty']) ?>
                                </span>
                            </span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Score</span>
                            <span class="detail-value"><?= number_format($certificate['percentage'], 1) ?>% (<?= $certificate['obtained_marks'] ?>/<?= $certificate['total_marks'] ?>)</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Issuing Institution</span>
                            <span class="detail-value"><?= htmlspecialchars($certificate['college_name']) ?></span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Location</span>
                            <span class="detail-value"><?= htmlspecialchars($certificate['city'] . ', ' . $certificate['state']) ?></span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Issue Date</span>
                            <span class="detail-value"><?= date('F j, Y', strtotime($certificate['issued_at'])) ?></span>
                        </div>
                        
                        <?php if ($certificate['expires_at']): ?>
                            <div class="detail-row">
                                <span class="detail-label">Valid Until</span>
                                <span class="detail-value">
                                    <?= date('F j, Y', strtotime($certificate['expires_at'])) ?>
                                    <?php if (strtotime($certificate['expires_at']) < time()): ?>
                                        <span class="badge badge-danger">Expired</span>
                                    <?php endif; ?>
                                </span>
                            </div>
                        <?php endif; ?>
                    </div>
                    
                <?php else: ?>
                    <div class="result-header invalid">
                        <div class="result-icon">
                            <i class="fas fa-times-circle"></i>
                        </div>
                        <h2>Certificate Not Found</h2>
                        <p>No certificate found with this code. Please check and try again.</p>
                    </div>
                    
                    <div class="certificate-details">
                        <div class="text-center text-muted">
                            <p>If you believe this is an error, please contact the issuing institution or <a href="mailto:support@skillvault.com">our support team</a>.</p>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        <?php endif; ?>
        
        <div class="text-center mt-4">
            <a href="<?= APP_URL ?>" class="text-muted">
                <i class="fas fa-arrow-left"></i> Back to <?= APP_NAME ?>
            </a>
        </div>
    </div>
</body>
</html>
