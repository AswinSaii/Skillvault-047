<?php
/**
 * Super Admin - Reports
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_SUPER_ADMIN);

$pageTitle = 'Reports';
$currentPage = 'reports';

require_once __DIR__ . '/includes/admin-header.php';
?>

<div class="row">
    <!-- User Reports -->
    <div class="col-12 col-md-6 col-lg-4 mb-4">
        <div class="card report-card">
            <div class="card-body text-center">
                <div class="report-icon gradient-blue mb-3">
                        <i class="fas fa-users fa-3x"></i>
                    </div>
                    <h4>User Reports</h4>
                    <p class="text-muted">Comprehensive user data including registrations, activity, and demographics</p>
                    <button class="btn btn-primary btn-block mt-3" onclick="generateReport('users')">
                        <i class="fas fa-download"></i> Generate Report
                    </button>
                </div>
            </div>
        </div>

        <!-- Assessment Reports -->
        <div class="col-12 col-md-6 col-lg-4 mb-4">
            <div class="card report-card">
                <div class="card-body text-center">
                    <div class="report-icon gradient-green mb-3">
                        <i class="fas fa-clipboard-check fa-3x"></i>
                    </div>
                    <h4>Assessment Reports</h4>
                    <p class="text-muted">Detailed assessment performance, completion rates, and skill trends</p>
                    <button class="btn btn-success btn-block mt-3" onclick="generateReport('assessments')">
                        <i class="fas fa-download"></i> Generate Report
                    </button>
                </div>
            </div>
        </div>

        <!-- College Reports -->
        <div class="col-12 col-md-6 col-lg-4 mb-4">
            <div class="card report-card">
                <div class="card-body text-center">
                    <div class="report-icon gradient-purple mb-3">
                        <i class="fas fa-university fa-3x"></i>
                    </div>
                    <h4>College Reports</h4>
                    <p class="text-muted">College-wise performance metrics, student count, and engagement levels</p>
                    <button class="btn btn-purple btn-block mt-3" onclick="generateReport('colleges')">
                        <i class="fas fa-download"></i> Generate Report
                    </button>
                </div>
            </div>
        </div>

        <!-- Certificate Reports -->
        <div class="col-12 col-md-6 col-lg-4 mb-4">
            <div class="card report-card">
                <div class="card-body text-center">
                    <div class="report-icon gradient-orange mb-3">
                        <i class="fas fa-certificate fa-3x"></i>
                    </div>
                    <h4>Certificate Reports</h4>
                    <p class="text-muted">Certificate issuance data, skill certifications, and verification logs</p>
                    <button class="btn btn-warning btn-block mt-3" onclick="generateReport('certificates')">
                        <i class="fas fa-download"></i> Generate Report
                    </button>
                </div>
            </div>
        </div>

        <!-- Skill Reports -->
        <div class="col-12 col-md-6 col-lg-4 mb-4">
            <div class="card report-card">
                <div class="card-body text-center">
                    <div class="report-icon gradient-teal mb-3">
                        <i class="fas fa-brain fa-3x"></i>
                    </div>
                    <h4>Skill Reports</h4>
                    <p class="text-muted">Popular skills, proficiency levels, and skill acquisition trends</p>
                    <button class="btn btn-info btn-block mt-3" onclick="generateReport('skills')">
                        <i class="fas fa-download"></i> Generate Report
                    </button>
                </div>
            </div>
        </div>

        <!-- Custom Report -->
        <div class="col-12 col-md-6 col-lg-4 mb-4">
            <div class="card report-card">
                <div class="card-body text-center">
                    <div class="report-icon gradient-pink mb-3">
                        <i class="fas fa-cog fa-3x"></i>
                    </div>
                    <h4>Custom Report</h4>
                    <p class="text-muted">Build custom reports with specific date ranges and filters</p>
                    <button class="btn btn-secondary btn-block mt-3" onclick="openCustomReportModal()">
                        <i class="fas fa-magic"></i> Build Custom
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Reports -->
    <div class="card">
        <div class="card-header">
            <h3 class="card-title"><i class="fas fa-history"></i> Recent Reports</h3>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Report Type</th>
                            <th>Generated By</th>
                            <th>Date Range</th>
                            <th>Generated At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="5" class="text-center py-4 text-muted">
                                <i class="fas fa-file-alt fa-2x mb-2"></i>
                                <p>No reports generated yet. Click a report button above to generate your first report.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<style>
.report-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    height: 100%;
}
.report-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.15);
}
.report-icon {
    width: 120px;
    height: 120px;
    margin: 0 auto;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}
.btn-purple {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
}
.btn-purple:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}
</style>

<script>
function generateReport(type) {
    alert(`Generating ${type} report...\n\nThis feature will be implemented soon with downloadable CSV/PDF reports.`);
}

function openCustomReportModal() {
    alert('Custom report builder coming soon!\n\nYou will be able to:\n- Select specific date ranges\n- Choose data fields\n- Apply custom filters\n- Export in multiple formats');
}
</script>

<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
