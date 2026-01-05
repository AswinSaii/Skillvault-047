/**
 * Dummy Data Generator for all role pages
 * Generates realistic test data for development and testing
 */

import { 
  collection, 
  addDoc, 
  doc, 
  setDoc,
  serverTimestamp,
  Timestamp,
  query,
  where,
  limit,
  getDocs
} from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { issueCertificate } from "@/lib/firebase/certificates"

export interface DummyDataOptions {
  userId: string
  userRole: string
  collegeId?: string
  collegeName?: string
}

const SKILLS = [
  "JavaScript", "React", "Node.js", "Python", "Java", "C++",
  "Data Structures", "Algorithms", "SQL", "MongoDB", "TypeScript",
  "HTML/CSS", "Vue.js", "Angular", "Express.js", "Docker", "Kubernetes"
]

const ASSESSMENT_TITLES = {
  "JavaScript": ["JavaScript Fundamentals", "ES6+ Features", "Async Programming", "DOM Manipulation"],
  "React": ["React Basics", "Hooks & Context", "State Management", "Component Patterns"],
  "Python": ["Python Basics", "Data Structures in Python", "OOP in Python", "Python for Data Science"],
  "Node.js": ["Node.js Fundamentals", "Express.js Basics", "RESTful APIs", "Authentication"],
  "Data Structures": ["Arrays & Lists", "Trees & Graphs", "Hash Tables", "Sorting Algorithms"],
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomDate(daysAgo: number = 30): Date {
  const date = new Date()
  date.setDate(date.getDate() - getRandomInt(0, daysAgo))
  return date
}

/**
 * Generate dummy assessments for faculty
 */
export async function generateDummyAssessments(options: DummyDataOptions): Promise<string[]> {
  if (options.userRole !== "faculty") return []

  const assessmentIds: string[] = []
  const numAssessments = getRandomInt(5, 10)

  for (let i = 0; i < numAssessments; i++) {
    const skill = getRandomElement(SKILLS)
    const titles = ASSESSMENT_TITLES[skill as keyof typeof ASSESSMENT_TITLES] || [skill + " Assessment"]
    const title = getRandomElement(titles) + ` ${i + 1}`

    try {
      const assessmentData = {
        title,
        description: `Comprehensive assessment covering ${skill} fundamentals and advanced concepts.`,
        type: getRandomElement(["mcq", "coding", "mixed"]),
        skill,
        difficulty: getRandomElement(["easy", "medium", "hard"]),
        duration: getRandomInt(30, 120),
        totalMarks: getRandomInt(50, 100),
        passingMarks: getRandomInt(40, 70),
        questions: [],
        createdBy: options.userId,
        collegeId: options.collegeId || "college_1",
        isActive: Math.random() > 0.2, // 80% active
        tags: [skill.toLowerCase(), getRandomElement(["basics", "advanced", "intermediate"])],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "assessments"), assessmentData)
      assessmentIds.push(docRef.id)
    } catch (error) {
      console.error("Error creating dummy assessment:", error)
    }
  }

  return assessmentIds
}

/**
 * Generate dummy attempts for students
 */
export async function generateDummyAttempts(
  studentId: string,
  assessmentIds: string[],
  collegeId: string
): Promise<string[]> {
  if (assessmentIds.length === 0) return []

  const attemptIds: string[] = []
  const numAttempts = getRandomInt(3, Math.min(assessmentIds.length * 2, 15))

  for (let i = 0; i < numAttempts; i++) {
    const assessmentId = getRandomElement(assessmentIds)
    const percentage = getRandomInt(45, 95)
    const status = percentage >= 70 ? "completed" : getRandomElement(["completed", "in-progress"])
    const startedAt = getRandomDate(60)
    const submittedAt = status === "completed" 
      ? new Date(startedAt.getTime() + getRandomInt(15, 120) * 60000)
      : null

    try {
      const attemptData = {
        assessmentId,
        studentId,
        collegeId,
        answers: [],
        score: Math.round((percentage / 100) * 100),
        totalMarks: 100,
        percentage,
        status,
        timeSpent: submittedAt ? Math.floor((submittedAt.getTime() - startedAt.getTime()) / 1000) : 0,
        tabSwitches: getRandomInt(0, 2),
        proctoringFlags: percentage < 50 ? ["low_score"] : [],
        startedAt: Timestamp.fromDate(startedAt),
        submittedAt: submittedAt ? Timestamp.fromDate(submittedAt) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "attempts"), attemptData)
      attemptIds.push(docRef.id)
    } catch (error) {
      console.error("Error creating dummy attempt:", error)
    }
  }

  return attemptIds
}

/**
 * Generate dummy certificates for students
 */
export async function generateDummyCertificates(
  studentId: string,
  studentName: string,
  studentEmail: string,
  attemptIds: string[],
  collegeId: string,
  collegeName: string
): Promise<string[]> {
  const certificateIds: string[] = []
  
  // Only create certificates for attempts with >= 70% score
  const passingAttempts = attemptIds.slice(0, Math.min(attemptIds.length, 5))
  
  for (const attemptId of passingAttempts) {
    try {
      // Get attempt data
      const { getDoc } = await import("firebase/firestore")
      const attemptDoc = await getDoc(doc(db, "attempts", attemptId))
      
      if (!attemptDoc.exists()) continue
      
      const attemptData = attemptDoc.data()
      if (attemptData.percentage < 70) continue
      
      // Get assessment data
      const assessmentDoc = await getDoc(doc(db, "assessments", attemptData.assessmentId))
      if (!assessmentDoc.exists()) continue
      
      const assessmentData = assessmentDoc.data()
      const skill = assessmentData.skill || getRandomElement(SKILLS)
      
      // Use the proper issueCertificate function to ensure proper certificate creation
      const certResult = await issueCertificate({
        studentId,
        studentName,
        studentEmail,
        collegeId,
        collegeName,
        assessmentId: attemptData.assessmentId,
        assessmentTitle: assessmentData.title || `${skill} Assessment`,
        skill,
        score: attemptData.score || Math.round((attemptData.percentage / 100) * 100),
        percentage: attemptData.percentage,
        passingGrade: assessmentData.passingMarks || 70,
        attemptId,
      })

      if (certResult.success && certResult.certificateId) {
        // Store the actual certificate ID (CERT-XXXXX format) for verification
        certificateIds.push(certResult.certificateId)
      }
    } catch (error) {
      console.error("Error creating dummy certificate:", error)
    }
  }

  return certificateIds
}

/**
 * Generate dummy students for faculty/college admin
 */
export async function generateDummyStudents(
  collegeId: string,
  collegeName: string,
  numStudents: number = 10
): Promise<string[]> {
  const studentIds: string[] = []

  for (let i = 0; i < numStudents; i++) {
    const names = [
      "Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson", "Emma Brown",
      "Frank Miller", "Grace Lee", "Henry Taylor", "Ivy Chen", "Jack Anderson"
    ]
    const name = names[i % names.length] + ` ${i > 9 ? i : ""}`
    const email = `student${i}@testcollege.com`

    try {
      const studentData = {
        email,
        name,
        role: "student",
        verified: true,
        collegeId,
        collegeName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "users"), studentData)
      studentIds.push(docRef.id)
    } catch (error) {
      console.error("Error creating dummy student:", error)
    }
  }

  return studentIds
}

/**
 * Generate dummy streak data for students
 */
export async function generateDummyStreak(
  studentId: string
): Promise<void> {
  try {
    const streakData = {
      studentId,
      currentStreak: getRandomInt(1, 30),
      longestStreak: getRandomInt(5, 50),
      totalQuizzesTaken: getRandomInt(10, 100),
      lastQuizDate: new Date().toISOString().split("T")[0],
      streakHistory: Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return {
          date: date.toISOString().split("T")[0],
          completed: Math.random() > 0.3, // 70% completion rate
        }
      }),
      updatedAt: serverTimestamp(),
    }

    await setDoc(doc(db, "streaks", studentId), streakData)
  } catch (error) {
    console.error("Error creating dummy streak:", error)
  }
}

/**
 * Generate test data for recruiters (students with certificates and attempts)
 */
export async function generateRecruiterTestData(): Promise<{
  success: boolean
  message: string
  data?: {
    students?: string[]
    attempts?: string[]
    certificates?: string[]
  }
}> {
  try {
    // First, get or create some assessments
    const assessmentsQuery = query(
      collection(db, "assessments"),
      where("isActive", "==", true),
      limit(20)
    )
    const assessmentsSnapshot = await getDocs(assessmentsQuery)
    let assessmentIds = assessmentsSnapshot.docs.map(doc => doc.id)

    // If no assessments exist, create some
    if (assessmentIds.length === 0) {
      const skills = ["React", "JavaScript", "Python", "Node.js", "SQL", "MongoDB"]
      for (const skill of skills) {
        const assessmentData = {
          title: `${skill} Fundamentals Assessment`,
          description: `Comprehensive ${skill} assessment`,
          type: "mcq",
          skill,
          difficulty: "medium",
          duration: 60,
          totalMarks: 100,
          passingMarks: 70,
          questions: [],
          createdBy: "system",
          collegeId: "college_1",
          isActive: true,
          tags: [skill.toLowerCase()],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
        const docRef = await addDoc(collection(db, "assessments"), assessmentData)
        assessmentIds.push(docRef.id)
      }
    }

    // Generate 20-30 students with attempts and certificates
    const numStudents = getRandomInt(20, 30)
    const studentIds: string[] = []
    const attemptIds: string[] = []
    const certificateIds: string[] = []

    const studentNames = [
      "Alex Johnson", "Sarah Chen", "Michael Brown", "Emily Davis", "James Wilson",
      "Olivia Martinez", "David Lee", "Sophia Anderson", "Daniel Taylor", "Emma Garcia",
      "Matthew Thomas", "Isabella Jackson", "Christopher White", "Ava Harris", "Andrew Martin",
      "Mia Thompson", "Joshua Moore", "Charlotte Young", "Ryan Clark", "Amelia Lewis",
      "Nathan Walker", "Harper Hall", "Ethan Allen", "Evelyn King", "Logan Wright",
      "Abigail Lopez", "Benjamin Hill", "Madison Green", "Lucas Adams", "Chloe Baker"
    ]

    for (let i = 0; i < numStudents; i++) {
      const name = studentNames[i % studentNames.length] + (i > studentNames.length - 1 ? ` ${Math.floor(i / studentNames.length) + 1}` : "")
      const email = `student.recruiter.${i}@testcollege.com`
      const collegeId = `college_${(i % 3) + 1}`
      const collegeName = `Test College ${(i % 3) + 1}`

      // Create student user
      const studentData = {
        email,
        name,
        role: "student",
        verified: true,
        collegeId,
        collegeName,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const studentDocRef = await addDoc(collection(db, "users"), studentData)
      studentIds.push(studentDocRef.id)

      // Generate 3-8 attempts per student
      const numAttempts = getRandomInt(3, 8)
      const studentAttemptIds: string[] = []

      for (let j = 0; j < numAttempts; j++) {
        const assessmentId = getRandomElement(assessmentIds)
        const percentage = getRandomInt(65, 95) // Higher scores for recruiter testing
        const startedAt = getRandomDate(90)
        const submittedAt = new Date(startedAt.getTime() + getRandomInt(20, 90) * 60000)

        const attemptData = {
          assessmentId,
          studentId: studentDocRef.id,
          collegeId,
          answers: [],
          score: Math.round((percentage / 100) * 100),
          totalMarks: 100,
          percentage,
          status: "completed",
          timeSpent: Math.floor((submittedAt.getTime() - startedAt.getTime()) / 1000),
          tabSwitches: getRandomInt(0, 1),
          proctoringFlags: [],
          startedAt: Timestamp.fromDate(startedAt),
          submittedAt: Timestamp.fromDate(submittedAt),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }

        const attemptDocRef = await addDoc(collection(db, "attempts"), attemptData)
        attemptIds.push(attemptDocRef.id)
        studentAttemptIds.push(attemptDocRef.id)

        // Create certificate for passing attempts (>= 70%)
        if (percentage >= 70) {
          // Get assessment data
          const { getDoc } = await import("firebase/firestore")
          const assessmentDoc = await getDoc(doc(db, "assessments", assessmentId))
          if (assessmentDoc.exists()) {
            const assessmentData = assessmentDoc.data()
            const skill = assessmentData.skill || "General"
            
            // Use the proper issueCertificate function to ensure proper certificate creation
            const certResult = await issueCertificate({
              studentId: studentDocRef.id,
              studentName: name,
              studentEmail: email,
              collegeId,
              collegeName,
              assessmentId,
              assessmentTitle: assessmentData.title || `${skill} Assessment`,
              skill,
              score: attemptData.score,
              percentage,
              passingGrade: assessmentData.passingMarks || 70,
              attemptId: attemptDocRef.id,
            })

            if (certResult.success && certResult.certificateId) {
              certificateIds.push(certResult.certificateId)
            }
          }
        }
      }
    }

    return {
      success: true,
      message: `Generated ${studentIds.length} students with ${attemptIds.length} attempts and ${certificateIds.length} certificates for recruiter testing`,
      data: {
        students: studentIds,
        attempts: attemptIds,
        certificates: certificateIds,
      },
    }
  } catch (error: any) {
    console.error("Error generating recruiter test data:", error)
    return {
      success: false,
      message: error.message || "Failed to generate recruiter test data",
    }
  }
}

/**
 * Generate all dummy data for a specific role
 */
export async function generateAllDummyData(options: DummyDataOptions): Promise<{
  success: boolean
  message: string
  data?: {
    assessments?: string[]
    attempts?: string[]
    certificates?: string[]
    students?: string[]
  }
}> {
  try {
    const results: any = {}

    switch (options.userRole) {
      case "faculty":
        // Generate assessments
        results.assessments = await generateDummyAssessments(options)
        return {
          success: true,
          message: `Generated ${results.assessments.length} dummy assessments`,
          data: results,
        }

      case "student":
        // Get available assessments
        const assessmentsQuery = query(
          collection(db, "assessments"),
          where("collegeId", "==", options.collegeId || "college_1"),
          where("isActive", "==", true),
          limit(10)
        )
        
        const assessmentsSnapshot = await getDocs(assessmentsQuery)
        const assessmentIds = assessmentsSnapshot.docs.map(doc => doc.id)
        
        if (assessmentIds.length === 0) {
          return {
            success: false,
            message: "No assessments available. Please ask a faculty member to create assessments first.",
          }
        }

        // Generate attempts
        results.attempts = await generateDummyAttempts(
          options.userId,
          assessmentIds,
          options.collegeId || "college_1"
        )

        // Generate certificates for passing attempts
        // Get user data for certificate generation
        const { getDoc } = await import("firebase/firestore")
        const userDoc = await getDoc(doc(db, "users", options.userId))
        const userData = userDoc.exists() ? userDoc.data() : null
        
        const passingAttempts = results.attempts.slice(0, Math.min(results.attempts.length, 5))
        results.certificates = await generateDummyCertificates(
          options.userId,
          userData?.name || "Test Student",
          userData?.email || "test@example.com",
          passingAttempts,
          options.collegeId || "college_1",
          options.collegeName || "Test College"
        )

        // Generate streak data
        await generateDummyStreak(options.userId)

        return {
          success: true,
          message: `Generated ${results.attempts.length} attempts, ${results.certificates.length} certificates, and streak data`,
          data: results,
        }

      case "college-admin":
        // Generate students
        results.students = await generateDummyStudents(
          options.collegeId || "college_1",
          options.collegeName || "Test College",
          15
        )
        return {
          success: true,
          message: `Generated ${results.students.length} dummy students`,
          data: results,
        }

      case "recruiter":
        // Generate students with certificates and attempts for recruiter testing
        return await generateRecruiterTestData()

      default:
        return {
          success: false,
          message: `Dummy data generation not supported for role: ${options.userRole}`,
        }
    }
  } catch (error: any) {
    console.error("Error generating dummy data:", error)
    return {
      success: false,
      message: error.message || "Failed to generate dummy data",
    }
  }
}

