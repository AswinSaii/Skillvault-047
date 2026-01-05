# SkillVault Platform - Testing Guide

## Overview
This directory contains comprehensive testing documentation and scripts for the SkillVault platform.

## Quick Start

### 1. Start the Application
```powershell
cd C:\Users\asus\Downloads\skillvaultplatform
npm run dev
```
Server should be running at: http://localhost:3000

### 2. Manual Testing
Follow the checklist in order:
1. **[manual-test-checklist.md](./manual-test-checklist.md)** - Quick 30-minute critical path testing
2. **[test-plan.md](./test-plan.md)** - Comprehensive 2-3 hour full platform testing

### 3. TestSprite MCP Testing (Optional)
If you have TestSprite configured in VS Code:
```json
// .vscode/settings.json
{
  "mcp.servers": {
    "TestSprite": {
      "command": "npx",
      "args": ["@testsprite/testsprite-mcp@latest"],
      "env": {
        "API_KEY": "your-testsprite-api-key"
      }
    }
  }
}
```

Then use Copilot commands:
```
@testsprite test authentication flow
@testsprite test assessment creation
@testsprite generate test cases for student dashboard
```

## Test Files

### Critical Path Tests
- **manual-test-checklist.md** - Essential tests to verify core functionality
  - Authentication (5 min)
  - Assessment creation (10 min)
  - Assessment taking (10 min)
  - Results & certificates (5 min)

### Comprehensive Tests
- **test-plan.md** - Full test coverage (350+ test cases)
  - Authentication & Authorization
  - Faculty Dashboard (Assessments, Questions, Students)
  - Student Dashboard (Assessments, Skills, Certificates)
  - Recruiter Dashboard
  - College Admin Dashboard
  - Super Admin Dashboard
  - AI Question Generation
  - Firebase Integration
  - UI/UX, Performance, Security

## Test Accounts

### Test Users
Create these accounts during testing:
- **Student**: test.student@example.com / Test123!@#
- **Faculty**: test.faculty@example.com / Test123!@#
- **College Admin**: test.admin@example.com / Test123!@#
- **Recruiter**: test.recruiter@example.com / Test123!@#
- **Super Admin**: Check `scripts/create-superadmin.js` output

## Prerequisites

### Firebase Setup
1. Ensure Firebase project is configured
2. Check `.env.local` has Firebase credentials
3. Verify Firestore security rules are set
4. Create composite indexes (see FIREBASE_ASSESSMENT_INDEX.md)

### OpenAI Setup (For AI Features)
1. Add `OPENAI_API_KEY` to `.env.local`
2. Ensure API key has available credits
3. Note: Without credits, assessment creation will fail at question generation

## Known Issues

### 1. OpenAI API Quota Exceeded
**Error**: "429 You exceeded your current quota"
**Impact**: Cannot create assessments with AI questions
**Workaround**: 
- Add billing to OpenAI account
- Or manually create questions in question bank
- Or use test assessments without AI generation

### 2. Firebase Composite Index Required
**Error**: "The query requires an index"
**Impact**: Assessment list may not load
**Fix**: 
- Open Firebase Console
- Create composite index: `assessments` collection
  - Fields: `createdBy` (ASC), `createdAt` (DESC)
- Wait 2-5 minutes for build
- See [FIREBASE_ASSESSMENT_INDEX.md](../FIREBASE_ASSESSMENT_INDEX.md) for details

### 3. Student Assessment Not Found
**Scenario**: Student sees "Assessment Not Found" error
**Cause**: Assessment has empty questions array
**Fix**: Ensure assessments are created with AI questions or manually add questions

## Testing Strategies

### Manual Testing (Recommended for First Pass)
- Use manual-test-checklist.md
- Follow step-by-step instructions
- Check off completed tests
- Record bugs/issues
- Takes ~1 hour for critical paths

### Automated Testing (For Regression)
- Use TestSprite MCP for automated tests
- Configure in VS Code settings
- Run via Copilot commands
- Generates test reports

### Exploratory Testing
- Try edge cases
- Test with invalid data
- Stress test with large datasets
- Test different browsers
- Test on mobile devices

## Browser Compatibility

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ⚠️  Safari (may have minor issues)

## Performance Benchmarks

### Target Metrics
- Page Load: < 2s (home), < 3s (dashboard)
- API Calls: < 500ms (Firestore queries)
- AI Generation: < 15s (10 questions)
- No memory leaks
- Lighthouse score: > 90

### Testing Tools
- Chrome DevTools → Performance
- Lighthouse (built into Chrome)
- Network tab for API timing

## Security Testing

### Authentication
- ✅ Passwords hashed (Firebase Auth)
- ✅ Sessions managed securely
- ✅ Role-based access control
- ✅ API routes protected

### Data Security
- ✅ Environment variables for secrets
- ✅ No API keys in client code
- ✅ Firebase security rules enforced
- ✅ XSS prevention

## Accessibility Testing

### Standards
- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios

### Tools
- axe DevTools (Chrome extension)
- WAVE (Web Accessibility Evaluation Tool)
- Lighthouse Accessibility audit

## Bug Reporting Template

When you find a bug, document:
```markdown
### Bug #[X]: [Title]
**Severity**: Critical / High / Medium / Low
**Browser**: Chrome 120
**URL**: http://localhost:3000/dashboard/faculty/assessments
**User Role**: Faculty

**Steps to Reproduce**:
1. Login as faculty
2. Click "Create Assessment"
3. Fill form and submit
4. [Bug occurs]

**Expected**: Assessment should be created with questions
**Actual**: Error: "Failed to generate questions"
**Screenshot**: [Attach if relevant]

**Console Errors**:
```
Error: 429 Too Many Requests
at generateQuestions...
```

**Additional Context**: OpenAI API quota exceeded
```

## Test Coverage Goals

- ✅ **Authentication**: 100%
- ✅ **Critical Paths**: 100% (assessment flow)
- ⏳ **Feature Completeness**: 90%
- ⏳ **Edge Cases**: 80%
- ⏳ **Browser Compatibility**: 95%
- ⏳ **Mobile Responsive**: 90%
- ⏳ **Performance**: 85%
- ⏳ **Accessibility**: 80%

## Support

### Getting Help
- Check [test-plan.md](./test-plan.md) for detailed test scenarios
- Review [manual-test-checklist.md](./manual-test-checklist.md) for quick tests
- See [../FIREBASE_ASSESSMENT_INDEX.md](../FIREBASE_ASSESSMENT_INDEX.md) for Firebase issues

### Contributing
If you find issues not covered in the test plan:
1. Document the scenario
2. Add to appropriate test section
3. Create bug report
4. Submit pull request with test case

---

**Last Updated**: January 6, 2026
**Test Plan Version**: 1.0
**Platform Version**: SkillVault v1.0-beta
