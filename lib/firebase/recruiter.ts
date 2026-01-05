import { 
  collection, 
  getDocs, 
  query, 
  where,
  doc,
  getDoc,
  orderBy,
  limit as firestoreLimit,
  addDoc,
  deleteDoc,
  Timestamp
} from "firebase/firestore"
import { db } from "./client"

export interface StudentProfile {
  id: string
  name: string
  email: string
  collegeName: string
  collegeId: string
  verified: boolean
}

export interface ShortlistedCandidate {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  collegeName: string
  skills: string[]
  avgScore: number
  certificatesCount: number
  shortlistedBy: string
  shortlistedAt: any
  notes?: string
  status: 'new' | 'contacted' | 'interviewing' | 'hired' | 'rejected'
}

export interface CertificateRecord {
  id: string
  studentId: string
  studentName: string
  assessmentTitle: string
  skill: string
  score: number
  percentage: number
  issuedAt: string
  certificateId: string
  collegeName: string
  verified: boolean
}

export interface SkillData {
  skill: string
  studentsCount: number
  avgProficiency: number
  certificates: number
}

/**
 * Search students by skill and optionally filter by college
 * @param skillQuery - Skill to search for
 * @param collegeId - Optional college filter
 * @param minProficiency - Minimum proficiency percentage (default: 70)
 * @param maxResults - Maximum number of results
 * @returns Array of students with their skill data
 */
export async function searchStudentsBySkill(
  skillQuery: string,
  collegeId?: string,
  minProficiency: number = 70,
  maxResults: number = 50
): Promise<any[]> {
  try {
    // Get all attempts where the skill matches and score >= minProficiency
    let attemptsQuery = query(
      collection(db, "attempts"),
      where("status", "==", "completed"),
      where("percentage", ">=", minProficiency),
      orderBy("percentage", "desc"),
      firestoreLimit(maxResults * 2) // Get more to account for filtering
    )

    const attemptsSnapshot = await getDocs(attemptsQuery)
    const attemptsData = attemptsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]

    // Get assessment details to match skills
    const assessmentIds = [...new Set(attemptsData.map((a: any) => a.assessmentId))]
    const assessmentPromises = assessmentIds.map(id => getDoc(doc(db, "assessments", id)))
    const assessmentDocs = await Promise.all(assessmentPromises)
    
    const assessmentsMap = new Map()
    assessmentDocs.forEach(doc => {
      if (doc.exists()) {
        assessmentsMap.set(doc.id, { id: doc.id, ...doc.data() })
      }
    })

    // Filter attempts by skill
    const matchingAttempts = attemptsData.filter((attempt: any) => {
      const assessment = assessmentsMap.get(attempt.assessmentId)
      return assessment && assessment.skill.toLowerCase().includes(skillQuery.toLowerCase())
    })

    // Get unique student IDs
    const studentIds = [...new Set(matchingAttempts.map((a: any) => a.studentId))]
    
    // Fetch student profiles
    const studentProfiles = await Promise.all(
      studentIds.slice(0, maxResults).map(async (studentId) => {
        const userDoc = await getDoc(doc(db, "users", studentId))
        if (!userDoc.exists()) return null

        const userData = userDoc.data()
        
        // Filter by college if specified
        if (collegeId && userData.collegeId !== collegeId) {
          return null
        }

        // Get student's attempts for this skill
        const studentAttempts = matchingAttempts.filter((a: any) => a.studentId === studentId)
        const avgScore = studentAttempts.reduce((sum: number, a: any) => sum + a.percentage, 0) / studentAttempts.length
        const bestScore = Math.max(...studentAttempts.map((a: any) => a.percentage))
        const certificatesCount = studentAttempts.filter((a: any) => a.percentage >= 70).length

        return {
          id: userDoc.id,
          name: userData.name,
          email: userData.email,
          collegeName: userData.collegeName,
          collegeId: userData.collegeId,
          verified: userData.verified || false,
          skillData: {
            skill: skillQuery,
            avgScore: Math.round(avgScore),
            bestScore,
            totalAttempts: studentAttempts.length,
            certificatesEarned: certificatesCount
          }
        }
      })
    )

    return studentProfiles.filter(p => p !== null)
  } catch (error) {
    console.error("Error searching students by skill:", error)
    return []
  }
}

/**
 * Get all certificates for a student
 * @param studentId - Student's Firebase UID
 * @returns Array of certificate records
 */
export async function getStudentCertificates(studentId: string): Promise<CertificateRecord[]> {
  try {
    const attemptsQuery = query(
      collection(db, "attempts"),
      where("studentId", "==", studentId),
      where("status", "==", "completed"),
      where("percentage", ">=", 70),
      orderBy("submittedAt", "desc")
    )

    const attemptsSnapshot = await getDocs(attemptsQuery)
    const attempts = attemptsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Get assessment details
    const certificates: CertificateRecord[] = await Promise.all(
      attempts.map(async (attempt: any) => {
        const assessmentDoc = await getDoc(doc(db, "assessments", attempt.assessmentId))
        const assessment = assessmentDoc.exists() ? assessmentDoc.data() : null

        const userDoc = await getDoc(doc(db, "users", studentId))
        const user = userDoc.exists() ? userDoc.data() : null

        return {
          id: attempt.id,
          studentId: attempt.studentId,
          studentName: attempt.studentName,
          assessmentTitle: assessment?.title || "Unknown Assessment",
          skill: assessment?.skill || "Unknown",
          score: attempt.score,
          percentage: attempt.percentage,
          issuedAt: attempt.submittedAt,
          certificateId: `CERT-${attempt.id.slice(-8).toUpperCase()}`,
          collegeName: user?.collegeName || "Unknown College",
          verified: user?.verified || false
        }
      })
    )

    return certificates
  } catch (error) {
    console.error("Error getting student certificates:", error)
    return []
  }
}

/**
 * Verify a certificate by its ID
 * @param certificateId - Certificate ID to verify
 * @returns Certificate details if valid, null otherwise
 */
export async function verifyCertificate(certificateId: string): Promise<CertificateRecord | null> {
  try {
    // Extract attempt ID from certificate ID (format: CERT-XXXXXXXX)
    const attemptId = certificateId.replace("CERT-", "").toLowerCase()

    // Query attempts collection for matching ID
    const attemptsSnapshot = await getDocs(collection(db, "attempts"))
    const matchingAttempt = attemptsSnapshot.docs.find(doc => 
      doc.id.slice(-8).toLowerCase() === attemptId
    )

    if (!matchingAttempt) {
      return null
    }

    const attempt = matchingAttempt.data()
    
    // Verify it's a passing grade
    if (attempt.percentage < 70) {
      return null
    }

    // Get assessment and student details
    const assessmentDoc = await getDoc(doc(db, "assessments", attempt.assessmentId))
    const assessment = assessmentDoc.exists() ? assessmentDoc.data() : null

    const userDoc = await getDoc(doc(db, "users", attempt.studentId))
    const user = userDoc.exists() ? userDoc.data() : null

    return {
      id: matchingAttempt.id,
      studentId: attempt.studentId,
      studentName: attempt.studentName,
      assessmentTitle: assessment?.title || "Unknown Assessment",
      skill: assessment?.skill || "Unknown",
      score: attempt.score,
      percentage: attempt.percentage,
      issuedAt: attempt.submittedAt,
      certificateId,
      collegeName: user?.collegeName || "Unknown College",
      verified: user?.verified || false
    }
  } catch (error) {
    console.error("Error verifying certificate:", error)
    return null
  }
}

/**
 * Get skill statistics across all students
 * @param limit - Maximum number of skills to return
 * @returns Array of skill data with aggregated statistics
 */
export async function getSkillStatistics(limit: number = 20): Promise<SkillData[]> {
  try {
    const attemptsSnapshot = await getDocs(
      query(
        collection(db, "attempts"),
        where("status", "==", "completed")
      )
    )
    const attempts = attemptsSnapshot.docs.map(doc => doc.data())

    // Get all assessments to map skills
    const assessmentIds = [...new Set(attempts.map(a => a.assessmentId))]
    const assessmentPromises = assessmentIds.map(id => getDoc(doc(db, "assessments", id)))
    const assessmentDocs = await Promise.all(assessmentPromises)
    
    const assessmentsMap = new Map()
    assessmentDocs.forEach(doc => {
      if (doc.exists()) {
        assessmentsMap.set(doc.id, doc.data())
      }
    })

    // Aggregate by skill
    const skillsMap = new Map<string, { scores: number[], studentIds: Set<string>, certificates: number }>()

    attempts.forEach((attempt: any) => {
      const assessment = assessmentsMap.get(attempt.assessmentId)
      if (!assessment) return

      const skill = assessment.skill
      if (!skillsMap.has(skill)) {
        skillsMap.set(skill, { scores: [], studentIds: new Set(), certificates: 0 })
      }

      const skillData = skillsMap.get(skill)!
      skillData.scores.push(attempt.percentage)
      skillData.studentIds.add(attempt.studentId)
      if (attempt.percentage >= 70) {
        skillData.certificates++
      }
    })

    // Convert to array and calculate averages
    const skillStats: SkillData[] = Array.from(skillsMap.entries()).map(([skill, data]) => ({
      skill,
      studentsCount: data.studentIds.size,
      avgProficiency: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      certificates: data.certificates
    }))

    // Sort by students count and limit
    return skillStats
      .sort((a, b) => b.studentsCount - a.studentsCount)
      .slice(0, limit)
  } catch (error) {
    console.error("Error getting skill statistics:", error)
    return []
  }
}

/**
 * Get top performing students across all skills
 * @param limit - Maximum number of students to return
 * @returns Array of top students with their best performances
 */
export async function getTopStudents(limit: number = 10): Promise<any[]> {
  try {
    const attemptsSnapshot = await getDocs(
      query(
        collection(db, "attempts"),
        where("status", "==", "completed"),
        orderBy("percentage", "desc"),
        firestoreLimit(limit * 5)
      )
    )
    const attempts = attemptsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]

    // Group by student
    const studentMap = new Map<string, any>()
    
    for (const attempt of attempts) {
      if (!studentMap.has(attempt.studentId)) {
        const userDoc = await getDoc(doc(db, "users", attempt.studentId))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          studentMap.set(attempt.studentId, {
            id: attempt.studentId,
            name: userData.name,
            email: userData.email,
            collegeName: userData.collegeName,
            verified: userData.verified || false,
            bestScore: attempt.percentage,
            certificatesCount: 0,
            skillsCount: new Set()
          })
        }
      }

      const student = studentMap.get(attempt.studentId)
      if (student) {
        student.bestScore = Math.max(student.bestScore, attempt.percentage)
        if (attempt.percentage >= 70) {
          student.certificatesCount++
        }
        
        // Get skill from assessment
        const assessmentDoc = await getDoc(doc(db, "assessments", attempt.assessmentId))
        if (assessmentDoc.exists()) {
          student.skillsCount.add(assessmentDoc.data().skill)
        }
      }
    }

    const topStudents = Array.from(studentMap.values())
      .map(s => ({ ...s, skillsCount: s.skillsCount.size }))
      .sort((a, b) => b.certificatesCount - a.certificatesCount)
      .slice(0, limit)

    return topStudents
  } catch (error) {
    console.error("Error getting top students:", error)
    return []
  }
}

/**
 * Add a student to shortlist
 * @param studentData - Student information to shortlist
 * @param recruiterId - ID of the recruiter adding to shortlist
 * @returns Success status
 */
export async function addToShortlist(
  studentData: {
    studentId: string
    studentName: string
    studentEmail: string
    collegeName: string
    skills: string[]
    avgScore: number
    certificatesCount: number
    notes?: string
  },
  recruiterId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if already shortlisted
    const existing = await getDocs(
      query(
        collection(db, "shortlist"),
        where("studentId", "==", studentData.studentId),
        where("shortlistedBy", "==", recruiterId)
      )
    )

    if (!existing.empty) {
      return { success: false, error: "Student already shortlisted" }
    }

    await addDoc(collection(db, "shortlist"), {
      ...studentData,
      shortlistedBy: recruiterId,
      shortlistedAt: Timestamp.now(),
      status: 'new'
    })

    return { success: true }
  } catch (error: any) {
    console.error("Error adding to shortlist:", error)
    return { success: false, error: error.message || "Failed to add to shortlist" }
  }
}

/**
 * Get shortlisted candidates for a recruiter
 * @param recruiterId - ID of the recruiter
 * @returns Array of shortlisted candidates
 */
export async function getShortlistedCandidates(recruiterId: string): Promise<ShortlistedCandidate[]> {
  try {
    const shortlistQuery = query(
      collection(db, "shortlist"),
      where("shortlistedBy", "==", recruiterId),
      orderBy("shortlistedAt", "desc")
    )

    const snapshot = await getDocs(shortlistQuery)
    const candidates = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        studentId: data.studentId,
        studentName: data.studentName,
        studentEmail: data.studentEmail,
        collegeName: data.collegeName,
        skills: data.skills || [],
        avgScore: data.avgScore || 0,
        certificatesCount: data.certificatesCount || 0,
        shortlistedBy: data.shortlistedBy,
        shortlistedAt: data.shortlistedAt,
        notes: data.notes,
        status: data.status || 'new'
      } as ShortlistedCandidate
    })

    return candidates
  } catch (error) {
    console.error("Error getting shortlisted candidates:", error)
    return []
  }
}

/**
 * Remove a candidate from shortlist
 * @param shortlistId - ID of the shortlist entry
 * @returns Success status
 */
export async function removeFromShortlist(shortlistId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, "shortlist", shortlistId))
    return { success: true }
  } catch (error: any) {
    console.error("Error removing from shortlist:", error)
    return { success: false, error: error.message || "Failed to remove from shortlist" }
  }
}
