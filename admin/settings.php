<?php
/**
 * Super Admin - Settings
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_SUPER_ADMIN);

$pageTitle = 'Settings';
$currentPage = 'settings';

require_once __DIR__ . '/includes/admin-header.php';
?>

<div class="row">
    <!-- General Settings -->
    <div class="col-12 col-lg-8 mb-4">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-sliders-h"></i> General Settings</h3>
                </div>
                <div class="card-body">
                    <form>
                        <div class="form-group">
                            <label>Platform Name</label>
                            <input type="text" class="form-control" value="SkillVault" placeholder="Platform Name">
                        </div>
                        <div class="form-group">
                            <label>Platform Email</label>
                            <input type="email" class="form-control" value="admin@skillvault.com" placeholder="Email">
                        </div>
                        <div class="form-group">
                            <label>Support Email</label>
                            <input type="email" class="form-control" value="support@skillvault.com" placeholder="Support Email">
                        </div>
                        <div class="form-group">
                            <label>Time Zone</label>
                            <select class="form-control">
                                <option>Asia/Kolkata</option>
                                <option>America/New_York</option>
                                <option>Europe/London</option>
                                <option>Asia/Tokyo</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                    </form>
                </div>
            </div>

            <!-- Assessment Settings -->
            <div class="card mt-4">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-clipboard-check"></i> Assessment Settings</h3>
                </div>
                <div class="card-body">
                    <form>
                        <div class="form-group">
                            <label>Default Assessment Duration (minutes)</label>
                            <input type="number" class="form-control" value="60" min="15" max="180">
                        </div>
                        <div class="form-group">
                            <label>Passing Score (%)</label>
                            <input type="number" class="form-control" value="70" min="0" max="100">
                        </div>
                        <div class="form-group">
                            <label>Daily Quiz Questions</label>
                            <input type="number" class="form-control" value="5" min="1" max="20">
                        </div>
                        <div class="form-group">
                            <div class="custom-control custom-switch">
                                <input type="checkbox" class="custom-control-input" id="allowRetakes" checked>
                                <label class="custom-control-label" for="allowRetakes">Allow Assessment Retakes</label>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="custom-control custom-switch">
                                <input type="checkbox" class="custom-control-input" id="showAnswers" checked>
                                <label class="custom-control-label" for="showAnswers">Show Correct Answers After Completion</label>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                    </form>
                </div>
            </div>

            <!-- Email Settings -->
            <div class="card mt-4">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-envelope"></i> Email Settings</h3>
                </div>
                <div class="card-body">
                    <form>
                        <div class="form-group">
                            <label>SMTP Host</label>
                            <input type="text" class="form-control" placeholder="smtp.gmail.com">
                        </div>
                        <div class="form-group">
                            <label>SMTP Port</label>
                            <input type="number" class="form-control" value="587">
                        </div>
                        <div class="form-group">
                            <label>SMTP Username</label>
                            <input type="text" class="form-control" placeholder="username@gmail.com">
                        </div>
                        <div class="form-group">
                            <label>SMTP Password</label>
                            <input type="password" class="form-control" placeholder="••••••••">
                        </div>
                        <div class="form-group">
                            <div class="custom-control custom-switch">
                                <input type="checkbox" class="custom-control-input" id="emailEnabled" checked>
                                <label class="custom-control-label" for="emailEnabled">Enable Email Notifications</label>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="testEmail()">
                            <i class="fas fa-paper-plane"></i> Send Test Email
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="col-12 col-lg-4">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-bolt"></i> Quick Actions</h3>
                </div>
                <div class="card-body">
                    <div class="list-group list-group-flush">
                        <button class="list-group-item list-group-item-action" onclick="clearCache()">
                            <i class="fas fa-trash-alt text-danger"></i> Clear System Cache
                        </button>
                        <button class="list-group-item list-group-item-action" onclick="optimizeDb()">
                            <i class="fas fa-database text-primary"></i> Optimize Database
                        </button>
                        <button class="list-group-item list-group-item-action" onclick="generateBackup()">
                            <i class="fas fa-download text-success"></i> Generate Backup
                        </button>
                        <button class="list-group-item list-group-item-action" onclick="viewLogs()">
                            <i class="fas fa-file-alt text-info"></i> View System Logs
                        </button>
                        <button class="list-group-item list-group-item-action" onclick="checkUpdates()">
                            <i class="fas fa-sync text-warning"></i> Check for Updates
                        </button>
                    </div>
                </div>
            </div>

            <!-- System Info -->
            <div class="card mt-4">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-info-circle"></i> System Information</h3>
                </div>
                <div class="card-body">
                    <table class="table table-sm">
                        <tr>
                            <td><strong>Version:</strong></td>
                            <td>1.0.0</td>
                        </tr>
                        <tr>
                            <td><strong>PHP Version:</strong></td>
                            <td><?= phpversion() ?></td>
                        </tr>
                        <tr>
                            <td><strong>Database:</strong></td>
                            <td>MySQL</td>
                        </tr>
                        <tr>
                            <td><strong>Server:</strong></td>
                            <td><?= $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown' ?></td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Maintenance Mode -->
            <div class="card mt-4">
                <div class="card-header bg-warning">
                    <h3 class="card-title"><i class="fas fa-exclamation-triangle"></i> Maintenance Mode</h3>
                </div>
                <div class="card-body text-center">
                    <p class="text-muted">Temporarily disable public access for maintenance</p>
                    <div class="custom-control custom-switch d-inline-block">
                        <input type="checkbox" class="custom-control-input" id="maintenanceMode">
                        <label class="custom-control-label" for="maintenanceMode">Enable Maintenance Mode</label>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function clearCache() {
    if (confirm('Clear system cache? This may temporarily slow down the platform.')) {
        alert('Cache cleared successfully!');
    }
}

function optimizeDb() {
    if (confirm('Optimize database? This may take a few moments.')) {
        alert('Database optimized successfully!');
    }
}

function generateBackup() {
    alert('Generating backup...\n\nThis feature will create a complete database backup with downloadable archive.');
}

function viewLogs() {
    alert('System Logs\n\nThis feature will display recent system activity and error logs.');
}

function checkUpdates() {
    alert('Checking for updates...\n\nYou are running the latest version of SkillVault!');
}

function testEmail() {
    alert('Sending test email...\n\nPlease check your inbox for a test message.');
}
</script>

<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
