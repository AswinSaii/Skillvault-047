import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc
} from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "./client"
import { isCollegeVerified } from "./colleges"

export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  verified?: boolean
  collegeName?: string
  collegeId?: string
  createdAt: string
  updatedAt: string
}

/**
 * Check if a user belongs to a verified college
 */
export async function isUserCollegeVerified(userId: string): Promise<{
  isVerified: boolean
  collegeName?: string
  error?: string
}> {
  try {
    // Get user document
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return { isVerified: false, error: "User not found" }
    }

    const userData = userSnap.data()
    const collegeId = userData.collegeId

    // If user doesn't have a college, they're not verified
    if (!collegeId) {
      return { isVerified: false }
    }

    // Check if the college is verified
    const collegeVerification = await isCollegeVerified(collegeId)
    
    return {
      isVerified: collegeVerification.isVerified,
      collegeName: userData.collegeName,
    }
  } catch (error) {
    console.error("Error checking user college verification:", error)
    return { isVerified: false, error: "Failed to verify college" }
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<{
  success: boolean
  user?: UserProfile
  error?: string
}> {
  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return { success: false, error: "User not found" }
    }

    const data = userSnap.data()
    return {
      success: true,
      user: {
        id: userId,
        name: data.name,
        email: data.email,
        role: data.role,
        verified: data.verified,
        collegeName: data.collegeName,
        collegeId: data.collegeId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return { success: false, error: "Failed to fetch user profile" }
  }
}

/**
 * Get all users (for superadmin)
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        verified: data.verified || false,
        collegeName: data.collegeName,
        collegeId: data.collegeId,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      } as UserProfile
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

/**
 * Create a new user (for superadmin)
 */
export async function createUser(data: {
  email: string
  password: string
  name: string
  role: "student" | "faculty" | "college-admin" | "recruiter" | "super-admin"
  collegeName?: string
  collegeId?: string
  verified?: boolean
}): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
    const userId = userCredential.user.uid

    // Create user profile in Firestore
    const userDocRef = doc(db, "users", userId)
    await setDoc(userDocRef, {
      email: data.email,
      name: data.name,
      role: data.role,
      verified: data.verified !== undefined ? data.verified : false,
      collegeName: data.collegeName || null,
      collegeId: data.collegeId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return { success: true, userId }
  } catch (error: any) {
    console.error("Error creating user:", error)
    let errorMessage = "Failed to create user"
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "Email already in use"
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address"
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password should be at least 6 characters"
    }
    return { success: false, error: errorMessage }
  }
}

/**
 * Update user (for superadmin)
 */
export async function updateUser(
  userId: string,
  data: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
    return { success: true }
  } catch (error: any) {
    console.error("Error updating user:", error)
    return { success: false, error: error.message || "Failed to update user" }
  }
}

/**
 * Delete user (for superadmin)
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, "users", userId))
    // Note: Firebase Auth user deletion should be handled separately via Admin SDK
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return { success: false, error: error.message || "Failed to delete user" }
  }
}
