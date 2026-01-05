<?php
/**
 * Super Admin - Certificates Management
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_SUPER_ADMIN);

$pageTitle = 'Certificates';
$currentPage = 'certificates';

// Get certificates
$result = query("SELECT c.*, u.first_name, u.last_name, u.email, s.name as skill_name, col.name as college_name
                 FROM certificates c
                 JOIN users u ON c.user_id = u.id
                 JOIN skills s ON c.skill_id = s.id
                 JOIN colleges col ON c.college_id = col.id
                 ORDER BY c.issued_at DESC
                 LIMIT 100");
$certificates = fetchAll($result);

// Get stats
$statsResult = query("SELECT 
    COUNT(*) as total_certificates,
    SUM(CASE WHEN is_revoked = 0 THEN 1 ELSE 0 END) as active_certificates,
    SUM(CASE WHEN is_revoked = 1 THEN 1 ELSE 0 END) as revoked_certificates
    FROM certificates");
$stats = fetch($statsResult);

require_once __DIR__ . '/includes/admin-header.php';
?>

<div class="row mb-4">
        <div class="col-12 col-md-4 mb-3">
            <div class="stat-card gradient-green">
                <div class="stat-icon">
                    <i class="fas fa-certificate"></i>
                </div>
                <div class="stat-details">
                    <h3><?= $stats['total_certificates'] ?></h3>
                    <p>Total Issued</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-4 mb-3">
            <div class="stat-card gradient-blue">
                <div class="stat-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-details">
                    <h3><?= $stats['active_certificates'] ?></h3>
                    <p>Active</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-4 mb-3">
            <div class="stat-card gradient-red">
                <div class="stat-icon">
                    <i class="fas fa-ban"></i>
                </div>
                <div class="stat-details">
                    <h3><?= $stats['revoked_certificates'] ?></h3>
                    <p>Revoked</p>
                </div>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="card-header">
            <h3 class="card-title">Recent Certificates</h3>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Certificate ID</th>
                            <th>Student</th>
                            <th>Skill</th>
                            <th>Level</th>
                            <th>College</th>
                            <th>Issued Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($certificates)): ?>
                            <tr>
                                <td colspan="8" class="text-center py-4">
                                    <i class="fas fa-certificate fa-3x text-muted mb-3"></i>
                                    <p class="text-muted">No certificates issued yet</p>
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($certificates as $cert): ?>
                                <tr>
                                    <td><code><?= htmlspecialchars($cert['certificate_uid']) ?></code></td>
                                    <td>
                                        <div>
                                            <strong><?= htmlspecialchars($cert['first_name'] . ' ' . $cert['last_name']) ?></strong>
                                            <br><small class="text-muted"><?= htmlspecialchars($cert['email']) ?></small>
                                        </div>
                                    </td>
                                    <td><?= htmlspecialchars($cert['skill_name']) ?></td>
                                    <td>
                                        <span class="badge badge-<?= 
                                            $cert['skill_level'] == 'expert' ? 'danger' :
                                            ($cert['skill_level'] == 'advanced' ? 'warning' :
                                            ($cert['skill_level'] == 'intermediate' ? 'info' : 'success'))
                                        ?>">
                                            <?= ucfirst($cert['skill_level']) ?>
                                        </span>
                                    </td>
                                    <td><?= htmlspecialchars($cert['college_name']) ?></td>
                                    <td><?= date('M d, Y', strtotime($cert['issued_at'])) ?></td>
                                    <td>
                                        <?php if ($cert['is_revoked']): ?>
                                            <span class="badge badge-danger"><i class="fas fa-ban"></i> Revoked</span>
                                        <?php else: ?>
                                            <span class="badge badge-success"><i class="fas fa-check"></i> Valid</span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <div class="btn-group">
                                            <button class="btn btn-sm btn-primary" title="View">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button class="btn btn-sm btn-info" title="Download">
                                                <i class="fas fa-download"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
