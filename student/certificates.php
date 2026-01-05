<?php
/**
 * Student - Certificates
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_STUDENT);

$userId = getCurrentUserId();

// Get certificates
$result = query("SELECT c.*, 
                 a.title as assessment_title, a.difficulty,
                 s.name as skill_name, s.icon as skill_icon,
                 col.name as college_name
                 FROM certificates c
                 JOIN assessments a ON c.assessment_id = a.id
                 JOIN skills s ON c.skill_id = s.id
                 JOIN colleges col ON c.college_id = col.id
                 WHERE c.user_id = $userId
                 ORDER BY c.issued_at DESC");
$certificates = fetchAll($result);

$pageTitle = 'My Certificates';
include dirname(__DIR__) . '/includes/header.php';
?>

<div class="layout">
    <?php include dirname(__DIR__) . '/includes/sidebar.php'; ?>
    
    <div class="main-content">
        <div class="content-wrapper">
            <div class="content-header">
                <div>
                    <h1 class="page-title">My Certificates</h1>
                    <p class="text-muted">View and download your skill certificates</p>
                </div>
            </div>
            
            <?php if (empty($certificates)): ?>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-certificate"></i>
                    </div>
                    <h3>No Certificates Yet</h3>
                    <p>Pass skill assessments to earn verified certificates</p>
                    <a href="assessments.php" class="btn btn-primary">
                        <i class="fas fa-clipboard-list"></i> Browse Assessments
                    </a>
                </div>
            <?php else: ?>
                <div class="row">
                    <?php foreach ($certificates as $cert): ?>
                        <div class="col-12 col-md-6 col-lg-4 mb-4">
                            <div class="card h-100">
                                <div class="card-body">
                                    <div class="d-flex justify-between align-start mb-3">
                                        <div class="stat-card-icon primary">
                                            <i class="<?= htmlspecialchars($cert['skill_icon'] ?: 'fas fa-code') ?>"></i>
                                        </div>
                                        <span class="badge badge-success">
                                            <i class="fas fa-check-circle"></i> Verified
                                        </span>
                                    </div>
                                    
                                    <h5 class="card-title"><?= htmlspecialchars($cert['skill_name']) ?></h5>
                                    <p class="text-muted text-sm mb-3"><?= htmlspecialchars($cert['assessment_title']) ?></p>
                                    
                                    <div class="d-flex flex-wrap gap-2 mb-3">
                                        <span class="badge badge-<?= $cert['difficulty'] === 'easy' ? 'success' : ($cert['difficulty'] === 'medium' ? 'warning' : 'danger') ?>">
                                            <?= ucfirst($cert['difficulty']) ?>
                                        </span>
                                    </div>
                                    
                                    <div class="text-sm text-muted mb-3">
                                        <div class="mb-1">
                                            <i class="fas fa-building"></i>
                                            <?= htmlspecialchars($cert['college_name']) ?>
                                        </div>
                                        <div class="mb-1">
                                            <i class="fas fa-calendar"></i>
                                            Issued: <?= date('M j, Y', strtotime($cert['issued_at'])) ?>
                                        </div>
                                        <?php if ($cert['expires_at']): ?>
                                            <div>
                                                <i class="fas fa-clock"></i>
                                                <?php if (strtotime($cert['expires_at']) > time()): ?>
                                                    Valid until: <?= date('M j, Y', strtotime($cert['expires_at'])) ?>
                                                <?php else: ?>
                                                    <span class="text-danger">Expired: <?= date('M j, Y', strtotime($cert['expires_at'])) ?></span>
                                                <?php endif; ?>
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                    
                                    <div class="p-2 bg-gray rounded mb-3">
                                        <small class="text-muted">Certificate Code</small>
                                        <div class="font-mono font-medium"><?= htmlspecialchars($cert['certificate_code']) ?></div>
                                    </div>
                                </div>
                                
                                <div class="card-footer">
                                    <div class="d-flex gap-2">
                                        <a href="download-certificate.php?id=<?= $cert['id'] ?>" class="btn btn-primary flex-1">
                                            <i class="fas fa-download"></i> Download
                                        </a>
                                        <a href="<?= APP_URL ?>/verify.php?code=<?= urlencode($cert['certificate_code']) ?>" 
                                           class="btn btn-outline" target="_blank" title="Verify">
                                            <i class="fas fa-external-link-alt"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php include dirname(__DIR__) . '/includes/footer.php'; ?>
