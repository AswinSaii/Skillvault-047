<?php
/**
 * SkillVault - Homepage
 */
require_once 'config/config.php';

// Redirect logged-in users to dashboard
if (isLoggedIn()) {
    require_once 'includes/auth.php';
    redirect(getDashboardUrl(getCurrentUserRole()));
}

$pageTitle = 'Home';
$currentPage = 'home';
require_once 'includes/header.php';
?>

<!-- Hero Section -->
<section class="hero-section">
    <div class="hero-bg"></div>
    <div class="container hero-content">
        <div class="row justify-center">
            <div class="col-12 col-md-10 text-center" style="margin: 0 auto;">
                <div class="animate-fade-in-up">
                    <span class="section-badge mb-4">
                        <i class="fas fa-star me-2"></i> #1 Skill Assessment Platform
                    </span>
                    <h1 class="hero-title">
                        Validate Skills.<br>
                        Empower Careers.
                    </h1>
                    <p class="hero-subtitle">
                        The most trusted platform for colleges to assess student skills, issue verifiable certificates, and connect talent with top recruiters.
                    </p>
                    <div class="d-flex justify-center gap-3 flex-wrap" style="justify-content: center;">
                        <a href="auth/register.php" class="btn btn-primary btn-lg">
                            Get Started <i class="fas fa-arrow-right ms-2"></i>
                        </a>
                        <a href="#features" class="btn btn-outline btn-lg text-white border-white hover-white" style="background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.5);">
                            Learn More
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Stats Section -->
<section class="stats-section">
    <div class="container">
        <div class="row">
            <div class="col-12 col-md-4 mb-4 mb-md-0">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                    <div class="stat-value" data-target="10000">0</div>
                    <div class="stat-label">Students Assessed</div>
                </div>
            </div>
            <div class="col-12 col-md-4 mb-4 mb-md-0">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-university"></i>
                    </div>
                    <div class="stat-value" data-target="50">0</div>
                    <div class="stat-label">Partner Colleges</div>
                </div>
            </div>
            <div class="col-12 col-md-4">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <div class="stat-value" data-target="500">0</div>
                    <div class="stat-label">Hiring Partners</div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Features Section -->
<section id="features" class="py-5" style="padding-top: 3rem; padding-bottom: 3rem;">
    <div class="container">
        <div class="section-header">
            <span class="section-badge">Features</span>
            <h2 class="section-title">Why Choose SkillVault?</h2>
            <p class="section-desc">Comprehensive tools for every stakeholder in the education ecosystem.</p>
        </div>

        <div class="row">
            <!-- For Colleges -->
            <div class="col-12 col-md-4 mb-4">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-school"></i>
                    </div>
                    <h3>For Colleges</h3>
                    <p class="text-muted mb-4" style="color: var(--gray-600);">Streamline your assessment process and track student performance with advanced analytics.</p>
                    <ul style="list-style: none; padding: 0;">
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Automated Assessments</li>
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Performance Analytics</li>
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Bulk Student Management</li>
                    </ul>
                </div>
            </div>

            <!-- For Students -->
            <div class="col-12 col-md-4 mb-4">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-user-check"></i>
                    </div>
                    <h3>For Students</h3>
                    <p class="text-muted mb-4" style="color: var(--gray-600);">Showcase your skills with verified certificates and get noticed by top recruiters.</p>
                    <ul style="list-style: none; padding: 0;">
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Skill Verification</li>
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Digital Certificates</li>
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Job Opportunities</li>
                    </ul>
                </div>
            </div>

            <!-- For Recruiters -->
            <div class="col-12 col-md-4 mb-4">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>For Recruiters</h3>
                    <p class="text-muted mb-4" style="color: var(--gray-600);">Find pre-assessed talent that matches your specific skill requirements.</p>
                    <ul style="list-style: none; padding: 0;">
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Verified Talent Pool</li>
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Skill-based Search</li>
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Direct Connection</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- How It Works -->
<section class="py-5 bg-gray-50" style="background-color: var(--gray-50); padding-top: 3rem; padding-bottom: 3rem;">
    <div class="container">
        <div class="section-header">
            <span class="section-badge">Process</span>
            <h2 class="section-title">How It Works</h2>
            <p class="section-desc">A simple path to success for students and institutions.</p>
        </div>

        <div class="row">
            <div class="col-12 col-md-3 mb-4">
                <div class="step-card">
                    <div class="step-number">1</div>
                    <h4>Register</h4>
                    <p class="text-muted text-sm" style="color: var(--gray-600);">Colleges register students and set up assessment profiles.</p>
                </div>
            </div>
            <div class="col-12 col-md-3 mb-4">
                <div class="step-card">
                    <div class="step-number">2</div>
                    <h4>Assess</h4>
                    <p class="text-muted text-sm" style="color: var(--gray-600);">Students take AI-proctored assessments to prove their skills.</p>
                </div>
            </div>
            <div class="col-12 col-md-3 mb-4">
                <div class="step-card">
                    <div class="step-number">3</div>
                    <h4>Certify</h4>
                    <p class="text-muted text-sm" style="color: var(--gray-600);">Earn verifiable digital certificates upon passing.</p>
                </div>
            </div>
            <div class="col-12 col-md-3 mb-4">
                <div class="step-card">
                    <div class="step-number">4</div>
                    <h4>Connect</h4>
                    <p class="text-muted text-sm" style="color: var(--gray-600);">Recruiters find and hire top talent based on verified skills.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section class="container">
    <div class="cta-section">
        <div class="cta-pattern"></div>
        <div class="position-relative z-10 px-4" style="position: relative; z-index: 10;">
            <h2 class="mb-4 text-white">Ready to Transform Your Institution?</h2>
            <p class="mb-5 text-gray-300 max-w-2xl mx-auto" style="color: rgba(255,255,255,0.8); max-width: 600px; margin: 0 auto 2rem;">
                Join hundreds of colleges using SkillVault to empower their students and improve placement records.
            </p>
            <div class="d-flex justify-center gap-3 flex-wrap" style="justify-content: center; gap: 1rem;">
                <a href="auth/college-register.php" class="btn btn-primary btn-lg border-0">
                    Register College
                </a>
                <a href="auth/register.php" class="btn btn-outline btn-lg text-white border-white hover-white" style="background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.5);">
                    Student Registration
                </a>
            </div>
        </div>
    </div>
</section>

<script>
    // Animated Counter for Stats
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target >= 1000 ? (target / 1000).toFixed(0) + 'K+' : target + '+';
                clearInterval(timer);
            } else {
                const displayValue = Math.floor(current);
                element.textContent = displayValue >= 1000 ? (displayValue / 1000).toFixed(1) + 'K' : displayValue;
            }
        }, 16);
    }
    
    // Intersection Observer for Stats Animation
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.stat-value');
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'));
                    animateCounter(counter, target);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
</script>

<?php require_once 'includes/footer.php'; ?>