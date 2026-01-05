import { doc, getDoc } from "firebase/firestore"
import { db } from "./client"
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
