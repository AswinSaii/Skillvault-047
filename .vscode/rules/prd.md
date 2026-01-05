# Product Requirements Document (PRD)

## Product Name

**SkillVault** – Skill Assessment & Certification Platform for Colleges

## Domain

EdTech & Skill Development

---

## 1. Problem Statement

Traditional academic systems focus on marks and memory-based exams, which do not accurately represent a student’s real-world skills. Recruiters struggle to trust resumes and certificates, colleges lack actionable skill analytics, and students are unaware of their actual skill readiness for placements.

---

## 2. Product Vision

SkillVault is an **AI-ready, skill-first assessment and certification platform** that enables verified colleges to assess, certify, and showcase student skills in a trusted and recruiter-verifiable manner.

---

## 3. Objectives

* Enable skill-based assessment instead of mark-based evaluation
* Ensure trust through **college verification and certificate validation**
* Provide recruiters with direct access to verified skill data
* Prevent cheating using lightweight proctoring techniques
* Gamify learning through streaks and daily quizzes

---

## 4. User Roles & Access Control

### 4.1 Super Admin (Platform Authority)

* Approve or reject college registration requests
* Manage verified colleges
* Control global certificate templates
* Monitor platform-wide analytics

### 4.2 College Admin

* Visible only after college verification
* Manage faculty and students under the college
* Issue certificates
* Access college-level analytics

### 4.3 Faculty

* Create and manage assessments
* Upload question banks
* Evaluate student performance
* View student skill analytics

### 4.4 Student

* Register only under verified colleges
* Attempt assessments
* Maintain daily skill streaks
* Download certificates
* Track skill progress

### 4.5 Recruiter

* Search students by verified skills
* View and verify certificates
* No access to marks or CGPA

---

## 5. College Verification & Trust System

### 5.1 College Onboarding Flow

1. College submits registration request
2. Status set to **Pending**
3. Super Admin reviews details
4. College is Approved or Rejected

### 5.2 Verified Badge System

* Approved colleges receive a **✔ Verified** badge
* Badge appears on:

  * College profile
  * Student certificates
  * Recruiter search results

### 5.3 Registration Restriction

* Students and faculty can register **only if their college is verified**

---

## 6. Core Functionalities

### 6.1 Skill Assessment System

* MCQ-based assessments
* Coding challenges with test-case evaluation
* Practical task submission (file/GitHub link)
* Difficulty levels: Easy, Medium, Hard

### 6.2 Daily Quiz & Streak System

* Daily quiz for students
* Continuous participation maintains streak
* Missed day resets streak
* Visual streak indicators (3, 7, 30 days)

### 6.3 Anti-Cheating & Proctoring

* Disable right-click
* Disable copy, paste, inspect, view source shortcuts
* Disable text selection
* Fullscreen enforcement during tests
* Tab-switch detection with auto-submit
* Server-side timer validation

### 6.4 Skill Analytics Dashboard

* Skill-wise progress tracking
* Accuracy percentage
* Attempt history
* Weak-skill identification

### 6.5 Certificate Generation & Verification

* Auto-generated PDF certificates
* QR code embedded for verification
* Unique certificate ID
* Skill level shown on certificate
* Issued only by verified colleges

### 6.6 Certificate Template Management

* Multiple templates upload (image-based)
* Dynamic selection based on:

  * Course
  * Department
  * Issuer (college/industry)

### 6.7 Recruiter Module

* Skill-based student search
* Filter by skill, level, college
* Certificate verification portal
* No access to academic marks

### 6.8 Skill Gap Recommendation

* System suggests next skills to improve
* Based on failed attempts and low accuracy

### 6.9 Resume Skill Export

* Generate skill-only resume PDF
* Includes verified badges and certificates

---

## 7. Non-Functional Requirements

* Secure role-based access control
* Scalable multi-college architecture
* Lightweight and fast performance
* Browser compatibility
* Data integrity and validation

---

---

## 9. Database Overview (High-Level)

* users
* roles
* colleges
* skills
* assessments
* questions
* attempts
* certificates
* certificate_templates
* streaks

---

## 10. Success Metrics

* Number of verified colleges onboarded
* Certificates issued and verified
* Student daily streak participation
* Recruiter searches and verification actions

---

## 11. Hackathon Impact Statement

SkillVault bridges the trust gap between colleges and companies by shifting the focus from marks to **verified, demonstrable skills**, enabling fair, transparent, and skill-driven placements.

---

## 12. Future Enhancements

* AI-based code evaluation
* Webcam-based proctoring
* Industry-partner issued certificates
* API integration for job portals
