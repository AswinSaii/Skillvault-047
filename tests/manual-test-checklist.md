# Manual Testing Checklist - Quick Start

## 🚀 Getting Started
**Server Status**: http://localhost:3000 should be running
**Firebase Status**: Check Firebase Console for connectivity

---

## ✅ Critical Path Testing (30 minutes)

### Test 1: Authentication Flow (5 min)
```
1. Open http://localhost:3000
2. Click "Sign Up"
3. Register as Student:
   - Email: test.student@example.com
   - Password: Test123!@#
   - Role: Student
4. ✓ Redirect to student dashboard
5. Click "Logout"
6. Login with same credentials
7. ✓ Successfully logged in

Result: [ ] PASS  [ ] FAIL
Issues: ___________________________
```

### Test 2: Faculty Creates Assessment (10 min)
```
1. Register as Faculty:
   - Email: test.faculty@example.com
   - Password: Test123!@#
   - Role: Faculty
   - College: Test College
2. Navigate to "Assessments"
3. Click "Create Assessment with AI"
4. Fill form:
   - Title: "JavaScript Basics Test"
   - Skill: "JavaScript"
   - Type: "mcq"
   - Difficulty: "medium"
   - Duration: 30 minutes
   - Total Questions: 5
   - Total Marks: 100
   - Passing Marks: 70
   - Tags: "javascript, basics, fundamentals"
5. Click "Create Assessment with AI"
6. ✓ Toast: "Generating 5 questions using AI..."
7. ⚠️  If OpenAI quota error → EXPECTED (no credits)
8. ✓ Assessment appears in list

Result: [ ] PASS  [ ] FAIL  [ ] BLOCKED (OpenAI)
Issues: ___________________________
```

### Test 3: Student Takes Assessment (10 min)
```
1. Login as Student (test.student@example.com)
2. Navigate to "Assessments"
3. Find "JavaScript Basics Test"
4. Click assessment card
5. Review assessment details
6. Click "Start Assessment"
7. ✓ Assessment page loads with questions
8. Answer questions:
   - MCQ: Select option
   - Navigate between questions
   - Mark for review (if feature exists)
9. Click "Submit Assessment"
10. ✓ Confirmation dialog appears
11. Confirm submission
12. ✓ Results page shows score
13. ✓ Can view correct/incorrect answers

Result: [ ] PASS  [ ] FAIL
Issues: ___________________________
```

### Test 4: View Results & Certificate (5 min)
```
1. After completing assessment:
2. ✓ Score displayed (e.g., "80/100")
3. ✓ Pass/Fail status shown
4. If passed (≥70%):
   - ✓ "Download Certificate" button appears
   - Click to download
   - ✓ PDF certificate generated
5. Navigate to "Certificates"
6. ✓ Certificate appears in list

Result: [ ] PASS  [ ] FAIL
Issues: ___________________________
```

---

## 🔍 Feature Testing (Additional 30 minutes)

### Test 5: Question Bank (5 min)
```
Faculty Dashboard:
1. Navigate to "Questions"
2. Click "Create Question"
3. Create MCQ:
   - Title: "What is a closure?"
   - Type: MCQ
   - 4 options
   - Mark correct answer
4. ✓ Question saved
5. ✓ Question appears in bank
6. Edit question
7. ✓ Changes saved
8. Delete question
9. ✓ Deleted successfully

Result: [ ] PASS  [ ] FAIL
Issues: ___________________________
```

### Test 6: Student Management (5 min)
```
Faculty Dashboard:
1. Navigate to "Students"
2. ✓ List of students displayed
3. Filter by:
   - Course/Batch
   - Performance
4. Click student profile
5. ✓ Student details shown
6. ✓ Assessment history visible
7. ✓ Skill levels displayed

Result: [ ] PASS  [ ] FAIL
Issues: ___________________________
```

### Test 7: Recruiter Flow (5 min)
```
1. Register as Recruiter:
   - Email: test.recruiter@example.com
   - Password: Test123!@#
   - Role: Recruiter
   - Company: Tech Corp
2. Navigate to "Discover Students"
3. Search by skill: "JavaScript"
4. ✓ Student list displayed
5. Filter by college, skill level
6. Click student profile
7. ✓ Profile shows certifications, skills
8. Click "Request Verification"
9. ✓ Request sent
10. Navigate to "Shortlisted"
11. Click "Shortlist" on student
12. ✓ Added to shortlist

Result: [ ] PASS  [ ] FAIL
Issues: ___________________________
```

### Test 8: College Admin (5 min)
```
1. Register as College Admin:
   - Email: test.admin@example.com
   - Password: Test123!@#
   - Role: College Admin
2. Navigate to "Faculty"
3. Click "Add Faculty"
4. Fill faculty details
5. ✓ Faculty added
6. Navigate to "Students"
7. Click "Add Student"
8. ✓ Student added
9. Navigate to "Analytics"
10. ✓ College performance dashboard visible

Result: [ ] PASS  [ ] FAIL
Issues: ___________________________
```

### Test 9: Super Admin (5 min)
```
1. Login as Super Admin:
   - Email: Use credentials from scripts/create-superadmin.js
2. Navigate to "Colleges"
3. ✓ All colleges listed
4. Click college
5. ✓ College details shown
6. Navigate to "Users"
7. ✓ All users across platform visible
8. Navigate to "Templates"
9. Click "Create Template"
10. Upload template image
11. ✓ Template created

Result: [ ] PASS  [ ] FAIL
Issues: ___________________________
```

### Test 10: Daily Quiz (5 min)
```
Student Dashboard:
1. Navigate to "Daily Quiz"
2. ✓ Quiz interface loads
3. Answer question
4. Click "Next"
5. ✓ Next question loads
6. Complete quiz
7. ✓ Score displayed
8. ✓ Points/badges awarded
9. View quiz history
10. ✓ Previous quizzes shown

Result: [ ] PASS  [ ] FAIL
Issues: ___________________________
```

---

## 🔧 Technical Testing (15 minutes)

### Test 11: Firebase Integration
```
1. Open Firebase Console
2. Check Firestore:
   - ✓ Collections exist: users, assessments, questions
   - ✓ Documents created during testing
   - ✓ Timestamps correct
3. Check Authentication:
   - ✓ Test users registered
   - ✓ Email/password enabled
4. Check Composite Indexes:
   - ✓ assessments: createdBy + createdAt
   - If missing → Create manually

Result: [ ] PASS  [ ] FAIL
Issues: ___________________________
```

### Test 12: API Endpoints
```
1. Open Browser DevTools → Network
2. Create assessment:
   - ✓ POST /api/generate-questions
   - Status: 200 (or 429 if quota exceeded)
   - Response: {success, questions, count}
3. Take assessment:
   - ✓ Firebase Firestore queries
   - ✓ No 403/401 errors
4. Check Console for errors
   - ✓ No red errors (warnings OK)

Result: [ ] PASS  [ ] FAIL
Issues: ___________________________
```

### Test 13: Responsive Design
```
1. Open DevTools → Toggle device toolbar
2. Test on:
   - ✓ iPhone SE (375px)
   - ✓ iPad (768px)
   - ✓ Desktop (1920px)
3. Navigation menu:
   - ✓ Mobile: Hamburger menu
   - ✓ Desktop: Full menu
4. Tables:
   - ✓ Scrollable on mobile
   - ✓ Responsive columns

Result: [ ] PASS  [ ] FAIL
Issues: ___________________________
```

---

## 🐛 Known Issues to Verify

### Issue 1: OpenAI API Quota
```
Expected Error: "429 You exceeded your current quota"
Status: [ ] Confirmed  [ ] Fixed  [ ] Not Tested
Workaround: Add billing to OpenAI account
```

### Issue 2: Firebase Composite Index
```
Expected Error: "The query requires an index"
Status: [ ] Confirmed  [ ] Fixed  [ ] Not Tested
Fix: Create index in Firebase Console
Link: [See FIREBASE_ASSESSMENT_INDEX.md]
```

### Issue 3: Student "Assessment Not Found"
```
When: Student tries to take assessment with no questions
Status: [ ] Confirmed  [ ] Fixed  [ ] Not Tested
Fix: AI question generation should resolve this
```

---

## 📊 Test Results Summary

### Pass Rate
- Critical Tests (1-4): ____ / 4 (___%)
- Feature Tests (5-10): ____ / 6 (___%)
- Technical Tests (11-13): ____ / 3 (___%)
- **Overall**: ____ / 13 (___%)

### Bug Count
- **Critical** (Blocker): ____
- **High** (Major issue): ____
- **Medium** (Minor issue): ____
- **Low** (Cosmetic): ____

### Performance Notes
- Page load times: [ ] Acceptable  [ ] Slow
- API response times: [ ] Fast  [ ] Moderate  [ ] Slow
- No crashes/freezes: [ ] Yes  [ ] No

### Recommendations
1. ____________________________
2. ____________________________
3. ____________________________

---

## ✅ Sign-Off

**Tester Name**: ____________________
**Date**: January 6, 2026
**Environment**: http://localhost:3000
**Browser**: Chrome / Firefox / Safari / Edge
**Overall Status**: [ ] READY FOR PRODUCTION  [ ] NEEDS WORK  [ ] BLOCKED

**Notes**:
_____________________________________________
_____________________________________________
_____________________________________________
