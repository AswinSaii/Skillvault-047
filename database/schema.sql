-- SkillVault Database Schema
-- Skill Assessment & Certification Platform

-- Drop tables if exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS streaks;
DROP TABLE IF EXISTS attempt_answers;
DROP TABLE IF EXISTS attempts;
DROP TABLE IF EXISTS certificates;
DROP TABLE IF EXISTS certificate_templates;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS assessments;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS colleges;
DROP TABLE IF EXISTS roles;

-- Roles table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (id, name, description) VALUES
(1, 'super_admin', 'Platform Authority - Manages entire platform'),
(2, 'college_admin', 'College Administrator - Manages college operations'),
(3, 'faculty', 'Faculty Member - Creates and manages assessments'),
(4, 'student', 'Student - Takes assessments and earns certificates'),
(5, 'recruiter', 'Recruiter - Searches and verifies student skills');

-- Colleges table
CREATE TABLE colleges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    website VARCHAR(255),
    logo VARCHAR(255),
    verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    verification_document VARCHAR(255),
    verified_at TIMESTAMP NULL,
    verified_by INT NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    college_id INT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(255),
    department VARCHAR(100),
    enrollment_number VARCHAR(50),
    graduation_year INT,
    company_name VARCHAR(255),
    designation VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    email_verified_at TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE SET NULL
);

-- Skills table
CREATE TABLE skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),
    icon VARCHAR(50),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default skills
INSERT INTO skills (name, slug, category, icon) VALUES
('JavaScript', 'javascript', 'Programming', 'fab fa-js'),
('Python', 'python', 'Programming', 'fab fa-python'),
('Java', 'java', 'Programming', 'fab fa-java'),
('HTML/CSS', 'html-css', 'Web Development', 'fab fa-html5'),
('React', 'react', 'Frontend', 'fab fa-react'),
('Node.js', 'nodejs', 'Backend', 'fab fa-node-js'),
('SQL', 'sql', 'Database', 'fas fa-database'),
('Data Structures', 'data-structures', 'Computer Science', 'fas fa-project-diagram'),
('Algorithms', 'algorithms', 'Computer Science', 'fas fa-code-branch'),
('Machine Learning', 'machine-learning', 'AI/ML', 'fas fa-brain'),
('Communication', 'communication', 'Soft Skills', 'fas fa-comments'),
('Problem Solving', 'problem-solving', 'Soft Skills', 'fas fa-lightbulb');

-- Assessments table
CREATE TABLE assessments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    college_id INT NOT NULL,
    skill_id INT NOT NULL,
    created_by INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('mcq', 'coding', 'practical') DEFAULT 'mcq',
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    duration_minutes INT DEFAULT 30,
    total_marks INT DEFAULT 100,
    passing_marks INT DEFAULT 40,
    is_daily_quiz TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    starts_at TIMESTAMP NULL,
    ends_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Questions table
CREATE TABLE questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assessment_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('mcq', 'coding', 'file_upload') DEFAULT 'mcq',
    option_a VARCHAR(500),
    option_b VARCHAR(500),
    option_c VARCHAR(500),
    option_d VARCHAR(500),
    correct_answer CHAR(1),
    code_template TEXT,
    test_cases TEXT,
    marks INT DEFAULT 1,
    explanation TEXT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

-- Attempts table
CREATE TABLE attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    assessment_id INT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    time_taken_seconds INT,
    total_marks INT DEFAULT 0,
    obtained_marks INT DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    is_passed TINYINT(1) DEFAULT 0,
    status ENUM('in_progress', 'submitted', 'evaluated', 'auto_submitted') DEFAULT 'in_progress',
    tab_switches INT DEFAULT 0,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

-- Attempt answers table
CREATE TABLE attempt_answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_answer CHAR(1),
    code_submission TEXT,
    file_path VARCHAR(255),
    is_correct TINYINT(1) DEFAULT 0,
    marks_obtained INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Certificate templates table
CREATE TABLE certificate_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    college_id INT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_image VARCHAR(255) NOT NULL,
    is_default TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
);

-- Certificates table
CREATE TABLE certificates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    certificate_uid VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    assessment_id INT NOT NULL,
    attempt_id INT NOT NULL,
    template_id INT,
    skill_id INT NOT NULL,
    skill_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
    issued_by INT NOT NULL,
    college_id INT NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP NULL,
    certificate_pdf VARCHAR(255),
    qr_code VARCHAR(255),
    is_revoked TINYINT(1) DEFAULT 0,
    revoked_at TIMESTAMP NULL,
    revoked_reason TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id),
    FOREIGN KEY (attempt_id) REFERENCES attempts(id),
    FOREIGN KEY (template_id) REFERENCES certificate_templates(id),
    FOREIGN KEY (skill_id) REFERENCES skills(id),
    FOREIGN KEY (issued_by) REFERENCES users(id),
    FOREIGN KEY (college_id) REFERENCES colleges(id)
);

-- Streaks table
CREATE TABLE streaks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date DATE,
    total_quizzes_completed INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_streak (user_id)
);

-- Daily quiz log table
CREATE TABLE daily_quiz_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    quiz_date DATE NOT NULL,
    attempt_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_daily_quiz (user_id, quiz_date)
);

-- User skills table (aggregated skill data)
CREATE TABLE user_skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    total_attempts INT DEFAULT 0,
    total_correct INT DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0,
    best_score DECIMAL(5,2) DEFAULT 0,
    skill_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
    last_assessed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id),
    UNIQUE KEY unique_user_skill (user_id, skill_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_college ON users(college_id);
CREATE INDEX idx_colleges_status ON colleges(verification_status);
CREATE INDEX idx_assessments_college ON assessments(college_id);
CREATE INDEX idx_assessments_skill ON assessments(skill_id);
CREATE INDEX idx_attempts_user ON attempts(user_id);
CREATE INDEX idx_attempts_assessment ON attempts(assessment_id);
CREATE INDEX idx_certificates_uid ON certificates(certificate_uid);
CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_streaks_user ON streaks(user_id);

-- Insert super admin user (password: admin123)
INSERT INTO users (role_id, email, password, first_name, last_name, is_active, email_verified_at) VALUES
(1, 'admin@skillvault.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super', 'Admin', 1, NOW());
