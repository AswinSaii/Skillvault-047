<?php
/**
 * Student - Download Certificate (HTML to PDF-ready)
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_STUDENT);

$certId = (int)($_GET['id'] ?? 0);
$userId = getCurrentUserId();

// Get certificate
$result = query("SELECT c.*, 
                 u.full_name as student_name,
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
                 WHERE c.id = $certId AND c.user_id = $userId");
$cert = fetch($result);

if (!$cert) {
    setFlash('danger', 'Certificate not found.');
    redirect('certificates.php');
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate - <?= htmlspecialchars($cert['skill_name']) ?></title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: #f5f5f5;
            padding: 20px;
            font-family: 'Inter', sans-serif;
        }
        
        .certificate {
            width: 900px;
            min-height: 640px;
            margin: 0 auto;
            background: white;
            position: relative;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        
        .certificate-border {
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
            border: 2px solid #6366f1;
        }
        
        .certificate-border-inner {
            position: absolute;
            top: 5px;
            left: 5px;
            right: 5px;
            bottom: 5px;
            border: 1px solid #6366f1;
        }
        
        .certificate-content {
            position: relative;
            z-index: 1;
            text-align: center;
            padding: 20px;
        }
        
        .certificate-logo {
            font-size: 2rem;
            color: #6366f1;
            margin-bottom: 10px;
        }
        
        .certificate-logo-text {
            font-size: 1.25rem;
            font-weight: 600;
            color: #6366f1;
            letter-spacing: 2px;
            margin-bottom: 30px;
        }
        
        .certificate-title {
            font-family: 'Playfair Display', serif;
            font-size: 3rem;
            font-weight: 600;
            color: #1a1a2e;
            margin-bottom: 10px;
            letter-spacing: 4px;
        }
        
        .certificate-subtitle {
            font-size: 1rem;
            color: #666;
            margin-bottom: 30px;
            letter-spacing: 1px;
        }
        
        .certificate-presented {
            font-size: 0.9rem;
            color: #888;
            margin-bottom: 10px;
        }
        
        .certificate-name {
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 20px;
            border-bottom: 2px solid #6366f1;
            display: inline-block;
            padding-bottom: 5px;
        }
        
        .certificate-achievement {
            font-size: 1rem;
            color: #444;
            line-height: 1.8;
            max-width: 600px;
            margin: 0 auto 25px;
        }
        
        .certificate-skill {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: white;
            padding: 10px 30px;
            border-radius: 30px;
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 25px;
        }
        
        .certificate-details {
            display: flex;
            justify-content: center;
            gap: 50px;
            margin-bottom: 25px;
        }
        
        .certificate-detail {
            text-align: center;
        }
        
        .detail-label {
            font-size: 0.75rem;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        
        .detail-value {
            font-size: 1rem;
            font-weight: 600;
            color: #333;
        }
        
        .certificate-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        
        .certificate-college {
            text-align: left;
        }
        
        .college-name {
            font-weight: 600;
            color: #333;
        }
        
        .college-location {
            font-size: 0.875rem;
            color: #666;
        }
        
        .certificate-qr {
            text-align: center;
        }
        
        .qr-placeholder {
            width: 80px;
            height: 80px;
            background: #f5f5f5;
            border: 1px solid #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 5px;
            font-size: 0.7rem;
            color: #888;
        }
        
        .certificate-code {
            font-family: monospace;
            font-size: 0.75rem;
            color: #666;
        }
        
        .certificate-date {
            text-align: right;
        }
        
        .print-btn {
            display: block;
            width: 900px;
            margin: 20px auto;
            padding: 15px;
            background: #6366f1;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
        }
        
        .print-btn:hover {
            background: #4f46e5;
        }
        
        @media print {
            body {
                padding: 0;
                background: white;
            }
            
            .certificate {
                box-shadow: none;
            }
            
            .print-btn {
                display: none;
            }
        }
        
        @media (max-width: 960px) {
            .certificate {
                width: 100%;
                min-height: auto;
                padding: 20px;
            }
            
            .certificate-title {
                font-size: 2rem;
            }
            
            .certificate-name {
                font-size: 1.75rem;
            }
            
            .certificate-details {
                flex-direction: column;
                gap: 15px;
            }
            
            .certificate-footer {
                flex-direction: column;
                gap: 20px;
                align-items: center;
                text-align: center;
            }
            
            .certificate-college,
            .certificate-date {
                text-align: center;
            }
            
            .print-btn {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="certificate-border">
            <div class="certificate-border-inner"></div>
        </div>
        
        <div class="certificate-content">
            <div class="certificate-logo">
                <i class="fas fa-shield-halved"></i>
            </div>
            <div class="certificate-logo-text">SKILLVAULT</div>
            
            <h1 class="certificate-title">CERTIFICATE</h1>
            <p class="certificate-subtitle">OF SKILL PROFICIENCY</p>
            
            <p class="certificate-presented">This is to certify that</p>
            <h2 class="certificate-name"><?= htmlspecialchars($cert['student_name']) ?></h2>
            
            <p class="certificate-achievement">
                has successfully demonstrated proficiency in the skill assessment and achieved a score of 
                <strong><?= number_format($cert['percentage'], 1) ?>%</strong>
                (<?= $cert['obtained_marks'] ?>/<?= $cert['total_marks'] ?> marks) in
            </p>
            
            <div class="certificate-skill">
                <i class="<?= htmlspecialchars($cert['skill_icon'] ?: 'fas fa-code') ?>"></i>
                <?= htmlspecialchars($cert['skill_name']) ?>
            </div>
            
            <p class="certificate-achievement" style="margin-bottom: 0;">
                Assessment: <?= htmlspecialchars($cert['assessment_title']) ?>
            </p>
            
            <div class="certificate-details">
                <div class="certificate-detail">
                    <div class="detail-label">Difficulty Level</div>
                    <div class="detail-value"><?= ucfirst($cert['difficulty']) ?></div>
                </div>
                <div class="certificate-detail">
                    <div class="detail-label">Issue Date</div>
                    <div class="detail-value"><?= date('F j, Y', strtotime($cert['issued_at'])) ?></div>
                </div>
                <?php if ($cert['expires_at']): ?>
                    <div class="certificate-detail">
                        <div class="detail-label">Valid Until</div>
                        <div class="detail-value"><?= date('F j, Y', strtotime($cert['expires_at'])) ?></div>
                    </div>
                <?php endif; ?>
            </div>
            
            <div class="certificate-footer">
                <div class="certificate-college">
                    <div class="college-name"><?= htmlspecialchars($cert['college_name']) ?></div>
                    <div class="college-location"><?= htmlspecialchars($cert['city'] . ', ' . $cert['state']) ?></div>
                </div>
                
                <div class="certificate-qr">
                    <div class="qr-placeholder">
                        <span>Scan to<br>verify</span>
                    </div>
                    <div class="certificate-code"><?= htmlspecialchars($cert['certificate_code']) ?></div>
                </div>
                
                <div class="certificate-date">
                    <div class="detail-label">Verify at</div>
                    <div class="detail-value"><?= APP_URL ?>/verify.php</div>
                </div>
            </div>
        </div>
    </div>
    
    <button class="print-btn" onclick="window.print()">
        <i class="fas fa-print"></i> Print / Save as PDF
    </button>
</body>
</html>
