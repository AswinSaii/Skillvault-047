import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore"
import { db } from "./client"

export interface Skill {
  id: string
  name: string
  description?: string
  category: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy?: string
}

export interface SkillEnrollment {
  id: string
  studentId: string
  skillId: string
  skillName: string
  enrolledAt: Date
  status: "enrolled" | "completed" | "certified"
  completedAt?: Date
  certificateId?: string
}

/**
 * Create a new skill
 */
export async function createSkill(data: {
  name: string
  description?: string
  category: string
  createdBy?: string
}): Promise<{ success: boolean; skillId?: string; error?: string }> {
  try {
    const skillData = {
      name: data.name,
      description: data.description || "",
      category: data.category,
      isActive: true,
      createdBy: data.createdBy || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "skills"), skillData)
    return { success: true, skillId: docRef.id }
  } catch (error: any) {
    console.error("Error creating skill:", error)
    return { success: false, error: error.message || "Failed to create skill" }
  }
}

/**
 * Get all skills
 */
export async function getAllSkills(): Promise<Skill[]> {
  try {
    const q = query(collection(db, "skills"), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        category: data.category,
        isActive: data.isActive !== false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        createdBy: data.createdBy,
      } as Skill
    })
  } catch (error) {
    console.error("Error fetching skills:", error)
    return []
  }
}

/**
 * Get active skills only
 */
export async function getActiveSkills(): Promise<Skill[]> {
  try {
    const q = query(
      collection(db, "skills"),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        category: data.category,
        isActive: true,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        createdBy: data.createdBy,
      } as Skill
    })
  } catch (error) {
    console.error("Error fetching active skills:", error)
    // Fallback: get all and filter in memory
    try {
      const allSkills = await getAllSkills()
      return allSkills.filter(skill => skill.isActive)
    } catch (fallbackError) {
      return []
    }
  }
}

/**
 * Update a skill
 */
export async function updateSkill(
  skillId: string,
  data: Partial<Skill>
): Promise<{ success: boolean; error?: string }> {
  try {
    const skillRef = doc(db, "skills", skillId)
    await updateDoc(skillRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
    return { success: true }
  } catch (error: any) {
    console.error("Error updating skill:", error)
    return { success: false, error: error.message || "Failed to update skill" }
  }
}

/**
 * Delete a skill
 */
export async function deleteSkill(skillId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, "skills", skillId))
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting skill:", error)
    return { success: false, error: error.message || "Failed to delete skill" }
  }
}

/**
 * Enroll student in a skill course
 */
export async function enrollInSkill(
  studentId: string,
  skillId: string,
  skillName: string
): Promise<{ success: boolean; enrollmentId?: string; error?: string }> {
  try {
    // Check if already enrolled
    const existingQuery = query(
      collection(db, "skillEnrollments"),
      where("studentId", "==", studentId),
      where("skillId", "==", skillId)
    )
    const existingSnapshot = await getDocs(existingQuery)
    
    if (!existingSnapshot.empty) {
      return { success: false, error: "Already enrolled in this skill" }
    }

    const enrollmentData = {
      studentId,
      skillId,
      skillName,
      enrolledAt: serverTimestamp(),
      status: "enrolled",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "skillEnrollments"), enrollmentData)
    return { success: true, enrollmentId: docRef.id }
  } catch (error: any) {
    console.error("Error enrolling in skill:", error)
    return { success: false, error: error.message || "Failed to enroll in skill" }
  }
}

/**
 * Get student's skill enrollments
 */
export async function getStudentEnrollments(studentId: string): Promise<SkillEnrollment[]> {
  try {
    const q = query(
      collection(db, "skillEnrollments"),
      where("studentId", "==", studentId),
      orderBy("enrolledAt", "desc")
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        studentId: data.studentId,
        skillId: data.skillId,
        skillName: data.skillName,
        enrolledAt: data.enrolledAt?.toDate() || new Date(),
        status: data.status || "enrolled",
        completedAt: data.completedAt?.toDate(),
        certificateId: data.certificateId,
      } as SkillEnrollment
    })
  } catch (error) {
    console.error("Error fetching student enrollments:", error)
    // Fallback: get all and filter in memory
    try {
      const allQuery = query(collection(db, "skillEnrollments"), orderBy("enrolledAt", "desc"))
      const allSnapshot = await getDocs(allQuery)
      return allSnapshot.docs
        .filter(doc => doc.data().studentId === studentId)
        .map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            studentId: data.studentId,
            skillId: data.skillId,
            skillName: data.skillName,
            enrolledAt: data.enrolledAt?.toDate() || new Date(),
            status: data.status || "enrolled",
            completedAt: data.completedAt?.toDate(),
            certificateId: data.certificateId,
          } as SkillEnrollment
        })
    } catch (fallbackError) {
      return []
    }
  }
}

/**
 * Update enrollment status (e.g., when student completes assessment and gets certificate)
 */
export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: "enrolled" | "completed" | "certified",
  certificateId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const enrollmentRef = doc(db, "skillEnrollments", enrollmentId)
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    }
    
    if (status === "completed" || status === "certified") {
      updateData.completedAt = serverTimestamp()
    }
    
    if (certificateId) {
      updateData.certificateId = certificateId
    }
    
    await updateDoc(enrollmentRef, updateData)
    return { success: true }
  } catch (error: any) {
    console.error("Error updating enrollment status:", error)
    return { success: false, error: error.message || "Failed to update enrollment" }
  }
}

