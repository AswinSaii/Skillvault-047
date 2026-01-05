<?php
/**
 * Super Admin - Certificate Templates Management
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_SUPER_ADMIN);

$pageTitle = 'Certificate Templates';
$currentPage = 'templates';

// Get templates
$result = query("SELECT t.*, c.name as college_name 
                 FROM certificate_templates t 
                 LEFT JOIN colleges c ON t.college_id = c.id 
                 ORDER BY t.created_at DESC");
$templates = fetchAll($result);

require_once __DIR__ . '/includes/admin-header.php';
?>

<div class="row mb-4">
    <div class="col-12 col-md-4 mb-3">
        <div class="stat-card gradient-purple">
            <div class="stat-icon">
                <i class="fas fa-file-certificate"></i>
            </div>
            <div class="stat-details">
                <h3><?= count($templates) ?></h3>
                <p>Total Templates</p>
                </div>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="card-header d-flex justify-between align-items-center">
            <h3 class="card-title">All Templates</h3>
            <button class="btn btn-primary" onclick="alert('Template upload feature coming soon!')">
                <i class="fas fa-plus"></i> Add Template
            </button>
        </div>
        <div class="card-body">
            <?php if (empty($templates)): ?>
                <div class="empty-state">
                    <i class="fas fa-file-certificate fa-4x text-muted mb-3"></i>
                    <h4>No Templates Yet</h4>
                    <p class="text-muted">Start by uploading your first certificate template</p>
                    <button class="btn btn-primary mt-3" onclick="alert('Template upload feature coming soon!')">
                        <i class="fas fa-upload"></i> Upload Template
                    </button>
                </div>
            <?php else: ?>
                <div class="row">
                    <?php foreach ($templates as $template): ?>
                        <div class="col-12 col-md-4 mb-4">
                            <div class="card template-card">
                                <div class="template-preview">
                                    <i class="fas fa-certificate fa-3x text-primary"></i>
                                </div>
                                <div class="card-body">
                                    <h5><?= htmlspecialchars($template['name']) ?></h5>
                                    <p class="text-muted mb-2">
                                        <small><?= htmlspecialchars($template['college_name'] ?? 'Platform Default') ?></small>
                                    </p>
                                    <div class="btn-group w-100">
                                        <button class="btn btn-sm btn-outline">
                                            <i class="fas fa-eye"></i> Preview
                                        </button>
                                        <button class="btn btn-sm btn-outline">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
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

<style>
.template-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.template-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}
.template-preview {
    padding: 3rem;
    background: linear-gradient(135deg, var(--primary-bg) 0%, rgba(79, 70, 229, 0.1) 100%);
    text-align: center;
}
</style>

<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
