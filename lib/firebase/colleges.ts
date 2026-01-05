import { db } from "./client"
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where,
  orderBy,
  Timestamp
} from "firebase/firestore"

export interface College {
  id: string
  name: string
  email: string
  location: string
  website?: string
  status: "pending" | "verified" | "rejected"
  createdAt: string
  updatedAt: string
  verifiedAt?: string
  rejectedReason?: string
}

// Create a new college registration
export async function createCollegeRegistration(data: {
  name: string
  email: string
  location: string
  website?: string
}) {
  try {
    const collegeData = {
      name: data.name,
      email: data.email,
      location: data.location,
      website: data.website || null,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await addDoc(collection(db, "colleges"), collegeData)
    
    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error("[Firebase] Error creating college:", error)
    return { success: false, error: error.message }
  }
}

// Get all colleges
export async function getAllColleges() {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, "colleges"), orderBy("createdAt", "desc"))
    )
    
    const colleges: College[] = []
    querySnapshot.forEach((doc) => {
      colleges.push({ id: doc.id, ...doc.data() } as College)
    })
    
    return { success: true, colleges }
  } catch (error: any) {
    console.error("[Firebase] Error fetching colleges:", error)
    return { success: false, error: error.message, colleges: [] }
  }
}

// Get verified colleges only
export async function getVerifiedColleges() {
  try {
    const q = query(
      collection(db, "colleges"), 
      where("status", "==", "verified")
    )
    const querySnapshot = await getDocs(q)
    
    const colleges: College[] = []
    querySnapshot.forEach((doc) => {
      colleges.push({ id: doc.id, ...doc.data() } as College)
    })
    
    // Sort by name in memory to avoid needing a composite index
    colleges.sort((a, b) => a.name.localeCompare(b.name))
    
    return { success: true, colleges }
  } catch (error: any) {
    console.error("[Firebase] Error fetching verified colleges:", error)
    return { success: false, error: error.message, colleges: [] }
  }
}

// Get pending colleges
export async function getPendingColleges() {
  try {
    const q = query(
      collection(db, "colleges"), 
      where("status", "==", "pending")
    )
    const querySnapshot = await getDocs(q)
    
    const colleges: College[] = []
    querySnapshot.forEach((doc) => {
      colleges.push({ id: doc.id, ...doc.data() } as College)
    })
    
    // Sort by createdAt in memory to avoid needing a composite index
    colleges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return { success: true, colleges }
  } catch (error: any) {
    console.error("[Firebase] Error fetching pending colleges:", error)
    return { success: false, error: error.message, colleges: [] }
  }
}

// Get college by ID
export async function getCollegeById(collegeId: string) {
  try {
    const docRef = doc(db, "colleges", collegeId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { 
        success: true, 
        college: { id: docSnap.id, ...docSnap.data() } as College 
      }
    } else {
      return { success: false, error: "College not found" }
    }
  } catch (error: any) {
    console.error("[Firebase] Error fetching college:", error)
    return { success: false, error: error.message }
  }
}

// Approve college
export async function approveCollege(collegeId: string) {
  try {
    const docRef = doc(db, "colleges", collegeId)
    await updateDoc(docRef, {
      status: "verified",
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    
    return { success: true }
  } catch (error: any) {
    console.error("[Firebase] Error approving college:", error)
    return { success: false, error: error.message }
  }
}

// Reject college
export async function rejectCollege(collegeId: string, reason?: string) {
  try {
    const docRef = doc(db, "colleges", collegeId)
    await updateDoc(docRef, {
      status: "rejected",
      rejectedReason: reason || "Did not meet verification criteria",
      updatedAt: new Date().toISOString(),
    })
    
    return { success: true }
  } catch (error: any) {
    console.error("[Firebase] Error rejecting college:", error)
    return { success: false, error: error.message }
  }
}

// Check if college is verified
export async function isCollegeVerified(collegeId: string): Promise<{ isVerified: boolean; error?: string }> {
  try {
    const result = await getCollegeById(collegeId)
    if (result.success && result.college) {
      return { isVerified: result.college.status === "verified" }
    }
    return { isVerified: false }
  } catch (error: any) {
    console.error("[Firebase] Error checking college verification:", error)
    return { isVerified: false, error: error.message }
  }
}
