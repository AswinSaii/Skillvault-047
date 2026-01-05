<?php
/**
 * Super Admin - Analytics Dashboard
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_SUPER_ADMIN);

$pageTitle = 'Analytics';
$currentPage = 'analytics';

// Get analytics data
$userGrowthResult = query("SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
                           FROM users 
                           WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                           GROUP BY month ORDER BY month");
$userGrowth = fetchAll($userGrowthResult);

$skillDistResult = query("SELECT s.name, COUNT(DISTINCT ua.user_id) as count 
                          FROM skills s 
                          LEFT JOIN user_assessments ua ON s.id = ua.skill_id 
                          GROUP BY s.id ORDER BY count DESC LIMIT 10");
$skillDist = fetchAll($skillDistResult);

$assessmentStatsResult = query("SELECT 
    COUNT(*) as total_assessments,
    AVG(score) as avg_score,
    COUNT(DISTINCT user_id) as unique_users
    FROM user_assessments WHERE completed_at IS NOT NULL");
$assessmentStats = fetch($assessmentStatsResult);

$collegeStatsResult = query("SELECT 
    c.name, 
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT ua.id) as total_assessments,
    AVG(ua.score) as avg_score
    FROM colleges c
    LEFT JOIN users u ON c.id = u.college_id
    LEFT JOIN user_assessments ua ON u.id = ua.user_id AND ua.completed_at IS NOT NULL
    WHERE c.is_verified = 1
    GROUP BY c.id
    ORDER BY total_users DESC LIMIT 10");
$collegeStats = fetchAll($collegeStatsResult);

require_once __DIR__ . '/includes/admin-header.php';
?>

<!-- Key Metrics -->
<div class="row mb-4">
    <div class="col-12 col-md-4 mb-3">
        <div class="stat-card gradient-blue">
            <div class="stat-icon">
                <i class="fas fa-clipboard-check"></i>
            </div>
            <div class="stat-details">
                    <h3><?= number_format($assessmentStats['total_assessments']) ?></h3>
                    <p>Total Assessments</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-4 mb-3">
            <div class="stat-card gradient-green">
                <div class="stat-icon">
                    <i class="fas fa-percentage"></i>
                </div>
                <div class="stat-details">
                    <h3><?= number_format($assessmentStats['avg_score'], 1) ?>%</h3>
                    <p>Average Score</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-4 mb-3">
            <div class="stat-card gradient-purple">
                <div class="stat-icon">
                    <i class="fas fa-user-graduate"></i>
                </div>
                <div class="stat-details">
                    <h3><?= number_format($assessmentStats['unique_users']) ?></h3>
                    <p>Active Learners</p>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- User Growth Chart -->
        <div class="col-12 col-lg-6 mb-4">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-chart-area"></i> User Growth</h3>
                </div>
                <div class="card-body">
                    <canvas id="userGrowthChart" height="250"></canvas>
                </div>
            </div>
        </div>

        <!-- Skills Distribution Chart -->
        <div class="col-12 col-lg-6 mb-4">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-chart-bar"></i> Top Skills</h3>
                </div>
                <div class="card-body">
                    <canvas id="skillsChart" height="250"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- College Performance Table -->
    <div class="card">
        <div class="card-header">
            <h3 class="card-title"><i class="fas fa-university"></i> College Performance</h3>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>College</th>
                            <th>Total Users</th>
                            <th>Assessments</th>
                            <th>Avg Score</th>
                            <th>Performance</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php $rank = 1; foreach ($collegeStats as $college): ?>
                            <tr>
                                <td><strong>#<?= $rank++ ?></strong></td>
                                <td><?= htmlspecialchars($college['name']) ?></td>
                                <td><?= number_format($college['total_users']) ?></td>
                                <td><?= number_format($college['total_assessments']) ?></td>
                                <td><?= number_format($college['avg_score'], 1) ?>%</td>
                                <td>
                                    <?php 
                                    $score = $college['avg_score'];
                                    if ($score >= 80): ?>
                                        <span class="badge badge-success">Excellent</span>
                                    <?php elseif ($score >= 60): ?>
                                        <span class="badge badge-info">Good</span>
                                    <?php elseif ($score >= 40): ?>
                                        <span class="badge badge-warning">Average</span>
                                    <?php else: ?>
                                        <span class="badge badge-danger">Needs Improvement</span>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script>
// User Growth Chart
const userGrowthData = <?= json_encode($userGrowth) ?>;
const userGrowthCtx = document.getElementById('userGrowthChart');
new Chart(userGrowthCtx, {
    type: 'line',
    data: {
        labels: userGrowthData.map(d => d.month),
        datasets: [{
            label: 'New Users',
            data: userGrowthData.map(d => d.count),
            borderColor: 'rgb(79, 70, 229)',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            tension: 0.4,
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { precision: 0 }
            }
        }
    }
});

// Skills Distribution Chart
const skillsData = <?= json_encode($skillDist) ?>;
const skillsCtx = document.getElementById('skillsChart');
new Chart(skillsCtx, {
    type: 'bar',
    data: {
        labels: skillsData.map(d => d.name),
        datasets: [{
            label: 'Active Users',
            data: skillsData.map(d => d.count),
            backgroundColor: [
                'rgba(79, 70, 229, 0.8)',
                'rgba(14, 165, 233, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(168, 85, 247, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(251, 146, 60, 0.8)',
                'rgba(56, 189, 248, 0.8)',
                'rgba(132, 204, 22, 0.8)',
                'rgba(249, 115, 22, 0.8)'
            ],
            borderRadius: 6
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { precision: 0 }
            }
        }
    }
});
</script>

<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
