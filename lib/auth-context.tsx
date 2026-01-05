"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/client"

export type UserRole = "student" | "faculty" | "college-admin" | "recruiter" | "super-admin"

interface User {
  uid: string  // Firebase UID
  id: string
  name: string
  email: string
  role: UserRole
  verified?: boolean
  collegeName?: string
  collegeId?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, name: string, role: UserRole, collegeName?: string, collegeId?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const fetchUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const data = userDoc.data()
        setUser({
          uid: firebaseUser.uid,  // Firebase authentication UID
          id: firebaseUser.uid,   // Duplicate for backward compatibility
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          verified: data.verified,
          collegeName: data.collegeName,
          collegeId: data.collegeId,
        })
      }
    } catch (error) {
      console.error("[Firebase] Error fetching user profile:", error)
    }
  }

  const redirectByRole = (role: UserRole) => {
    switch (role) {
      case "student":
        router.push("/dashboard/student")
        break
      case "faculty":
        router.push("/dashboard/faculty")
        break
      case "college-admin":
        router.push("/dashboard/college-admin")
        break
      case "recruiter":
        router.push("/dashboard/recruiter")
        break
      case "super-admin":
        router.push("/dashboard/super-admin")
        break
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Fetch user profile from Firestore
      const userDocRef = doc(db, "users", firebaseUser.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        return { success: false, error: "User profile not found" }
      }

      const userData = userDoc.data()
      const userProfile: User = {
        uid: firebaseUser.uid,  // Add Firebase UID
        id: firebaseUser.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role as UserRole,
        verified: userData.verified,
        collegeName: userData.collegeName,
        collegeId: userData.collegeId,
      }

      setUser(userProfile)
      redirectByRole(userProfile.role)

      return { success: true }
    } catch (error: any) {
      console.error("[Firebase] Login error:", error)
      
      // Handle specific Firebase auth errors
      let errorMessage = "An unexpected error occurred"
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email"
          break
        case "auth/wrong-password":
          errorMessage = "Incorrect password"
          break
        case "auth/invalid-email":
          errorMessage = "Invalid email address"
          break
        case "auth/user-disabled":
          errorMessage = "This account has been disabled"
          break
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password"
          break
        default:
          errorMessage = error.message || "Authentication failed"
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole, 
    collegeName?: string,
    collegeId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Create user profile in Firestore
      const userDocRef = doc(db, "users", firebaseUser.uid)
      await setDoc(userDocRef, {
        email,
        name,
        role,
        verified: false,
        collegeName: collegeName || null,
        collegeId: collegeId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const userProfile: User = {
        uid: firebaseUser.uid,  // Add Firebase UID
        id: firebaseUser.uid,
        name,
        email,
        role,
        verified: false,
        collegeName,
        collegeId,
      }

      setUser(userProfile)
      redirectByRole(role)

      return { success: true }
    } catch (error: any) {
      console.error("[Firebase] Signup error:", error)
      
      // Handle specific Firebase auth errors
      let errorMessage = "An unexpected error occurred"
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists"
          break
        case "auth/invalid-email":
          errorMessage = "Invalid email address"
          break
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters"
          break
        default:
          errorMessage = error.message || "Signup failed"
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("[Firebase] Logout error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
