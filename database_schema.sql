-- ====================================================================
-- MINI ATS (RESUME SCREENING SYSTEM) - RELATIONAL DATABASE SCHEMA (MySQL)
-- Academic DBMS Mini Project - Schema Specification
-- Corresponds 1:1 with Phase 1 Data Models in storageService.js
-- ====================================================================

CREATE DATABASE IF NOT EXISTS mini_ats_db;
USE mini_ats_db;

-- 1. USERS TABLE (Candidate and Recruiter Accounts)
CREATE TABLE IF NOT EXISTS Users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('candidate', 'recruiter') NOT NULL DEFAULT 'candidate',
    company_name VARCHAR(120),
    phone VARCHAR(20),
    location VARCHAR(100),
    education VARCHAR(150),
    degree VARCHAR(100),
    graduation_year VARCHAR(10),
    experience_years DECIMAL(4, 1) DEFAULT 0.0,
    bio TEXT,
    resume_file_name VARCHAR(255),
    resume_file_size VARCHAR(50),
    resume_uploaded_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. SKILLS TABLE (Master Dictionary of Competencies)
CREATE TABLE IF NOT EXISTS Skills (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    category VARCHAR(50) DEFAULT 'General',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. USER_SKILLS TABLE (Many-to-Many: Candidate to Verified Skills)
CREATE TABLE IF NOT EXISTS User_Skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    skill_name VARCHAR(80) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_skill (user_id, skill_name)
);

-- 4. JOBS TABLE (Recruiter Postings & Shortlisting Criteria)
CREATE TABLE IF NOT EXISTS Jobs (
    id VARCHAR(50) PRIMARY KEY,
    recruiter_id VARCHAR(50) NOT NULL,
    company_name VARCHAR(120) NOT NULL,
    title VARCHAR(120) NOT NULL,
    location VARCHAR(100) NOT NULL,
    job_type ENUM('Full-Time', 'Part-Time', 'Internship', 'Remote', 'Hybrid') DEFAULT 'Full-Time',
    min_experience VARCHAR(50) DEFAULT '0-2 years',
    description TEXT NOT NULL,
    threshold INT DEFAULT 80, -- Automatic Shortlisting Cutoff (0-100%)
    deadline DATE,
    salary VARCHAR(80),
    status ENUM('Active', 'Draft', 'Closed') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 5. JOB_SKILLS TABLE (Many-to-Many: Job to Required Competencies)
CREATE TABLE IF NOT EXISTS Job_Skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id VARCHAR(50) NOT NULL,
    skill_name VARCHAR(80) NOT NULL,
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE,
    UNIQUE KEY uq_job_skill (job_id, skill_name)
);

-- 6. APPLICATIONS TABLE (Applicant Pipeline, Match Scores & ATS Status)
CREATE TABLE IF NOT EXISTS Applications (
    id VARCHAR(50) PRIMARY KEY,
    job_id VARCHAR(50) NOT NULL,
    candidate_id VARCHAR(50) NOT NULL,
    candidate_name VARCHAR(100) NOT NULL,
    candidate_email VARCHAR(120) NOT NULL,
    match_score INT NOT NULL DEFAULT 0, -- Calculated: (matched_count / total_required) * 100
    matched_skills JSON,
    missing_skills JSON,
    status ENUM('Pending', 'Shortlisted', 'Rejected') DEFAULT 'Pending',
    notes TEXT,
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_application (job_id, candidate_id)
);

-- ====================================================================
-- SAMPLE SEED DATA INSERTION (Matches Prototype initialData.js)
-- ====================================================================

-- Insert Sample Recruiter
INSERT IGNORE INTO Users (id, name, email, password_hash, role, company_name, phone, location)
VALUES ('usr-recruiter-1', 'Admin Recruiter', 'recruiter@technova.com', '$2b$12$...', 'recruiter', 'TechNova Solutions', '+91 98201 12345', 'Pune, Maharashtra');

-- Insert Sample Candidate (Rahul Sharma)
INSERT IGNORE INTO Users (id, name, email, password_hash, role, phone, location, education, degree, graduation_year, experience_years)
VALUES ('usr-cand-1', 'Rahul Sharma', 'rahul.sharma@example.com', '$2b$12$...', 'candidate', '+91 98765 43210', 'Pune, Maharashtra', 'B.E. Computer Engineering', 'Bachelor of Engineering', '2025', 1.0);

-- Insert Master Skills
INSERT IGNORE INTO Skills (id, name, category) VALUES
('sk-1', 'Python', 'Programming Languages'),
('sk-2', 'Java', 'Programming Languages'),
('sk-3', 'SQL', 'Database'),
('sk-4', 'MySQL', 'Database'),
('sk-5', 'HTML', 'Frontend'),
('sk-6', 'CSS', 'Frontend'),
('sk-7', 'JavaScript', 'Programming Languages'),
('sk-8', 'React', 'Frontend'),
('sk-9', 'Django', 'Backend'),
('sk-10', 'Flask', 'Backend'),
('sk-11', 'Git', 'Tools & DevOps'),
('sk-12', 'REST API', 'Backend'),
('sk-13', 'Machine Learning', 'Data & AI'),
('sk-14', 'Data Analysis', 'Data & AI'),
('sk-15', 'Power BI', 'Data & BI');

-- User Skills for Rahul Sharma
INSERT IGNORE INTO User_Skills (user_id, skill_name) VALUES
('usr-cand-1', 'Python'),
('usr-cand-1', 'SQL'),
('usr-cand-1', 'Git'),
('usr-cand-1', 'Django');

-- Sample Job: Python Developer
INSERT IGNORE INTO Jobs (id, recruiter_id, company_name, title, location, job_type, min_experience, description, threshold)
VALUES ('job-1', 'usr-recruiter-1', 'TechNova Solutions', 'Python Developer', 'Pune, India (Hybrid)', 'Full-Time', '1-3 years', 'Design scalable backend applications with Python, Django and REST APIs.', 80);

-- Job Skills for Job 1
INSERT IGNORE INTO Job_Skills (job_id, skill_name) VALUES
('job-1', 'Python'),
('job-1', 'SQL'),
('job-1', 'Django'),
('job-1', 'Git'),
('job-1', 'REST API');

-- Sample Application for Rahul Sharma
INSERT IGNORE INTO Applications (id, job_id, candidate_id, candidate_name, candidate_email, match_score, matched_skills, missing_skills, status)
VALUES ('app-1', 'job-1', 'usr-cand-1', 'Rahul Sharma', 'rahul.sharma@example.com', 80, '["Python", "SQL", "Django", "Git"]', '["REST API"]', 'Shortlisted');

