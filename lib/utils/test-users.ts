/**
 * Test user credentials for automated testing
 * These users should be created in Firebase Auth and Firestore for testing purposes
 */

export const TEST_USERS = {
  student: {
    email: "test.student@example.com",
    password: "Test123!@#",
    name: "Test Student",
    role: "student" as const,
    collegeId: "college_1",
    collegeName: "Test College",
  },
  faculty: {
    email: "test.faculty@example.com",
    password: "Test123!@#",
    name: "Test Faculty",
    role: "faculty" as const,
    collegeId: "college_1",
    collegeName: "Test College",
  },
  "college-admin": {
    email: "test.admin@example.com",
    password: "Test123!@#",
    name: "Test College Admin",
    role: "college-admin" as const,
    collegeId: "college_1",
    collegeName: "Test College",
  },
  recruiter: {
    email: "test.recruiter@example.com",
    password: "Test123!@#",
    name: "Test Recruiter",
    role: "recruiter" as const,
  },
  "super-admin": {
    email: "test.superadmin@example.com",
    password: "Test123!@#",
    name: "Test Super Admin",
    role: "super-admin" as const,
  },
}

/**
 * Helper to check if we're in test mode
 */
export function isTestMode(): boolean {
  return process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_TEST_MODE === "true"
}

/**
 * Allow signup without verified college in test mode
 */
export function canSkipCollegeVerification(role: string): boolean {
  if (isTestMode()) {
    return role === "recruiter" || role === "super-admin"
  }
  return role === "recruiter" || role === "super-admin"
}

