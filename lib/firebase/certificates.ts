import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "./client"

const CERTIFICATES_COLLECTION = "certificates"

export interface Certificate {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  collegeId: string
  collegeName: string
  assessmentId: string
  assessmentTitle: string
  skill: string
  score: number
  percentage: number
  passingGrade: number
  attemptId: string
  certificateId: string // Unique certificate ID for verification
  issuedDate: Date
  verificationUrl: string
  status: "active" | "revoked"
  createdAt: Date
  updatedAt: Date
}

/**
 * Generate a unique certificate ID
 */
function generateCertificateId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `CERT-${timestamp}-${randomStr}`.toUpperCase()
}

/**
 * Issue a certificate for a completed assessment
 */
export async function issueCertificate(data: {
  studentId: string
  studentName: string
  studentEmail: string
  collegeId: string
  collegeName: string
  assessmentId: string
  assessmentTitle: string
  skill: string
  score: number
  percentage: number
  passingGrade: number
  attemptId: string
}): Promise<{ success: boolean; certificateId?: string; documentId?: string; error?: string }> {
  try {
    // Check if certificate already exists for this attempt
    const existingQuery = query(
      collection(db, CERTIFICATES_COLLECTION),
      where("attemptId", "==", data.attemptId)
    )
    const existingSnapshot = await getDocs(existingQuery)

    if (!existingSnapshot.empty) {
      return {
        success: false,
        error: "Certificate already exists for this attempt",
      }
    }

    // Verify the score meets passing grade
    if (data.percentage < data.passingGrade) {
      return {
        success: false,
        error: "Score does not meet passing grade requirements",
      }
    }

    const certificateId = generateCertificateId()
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://skillvault.app"}/verify/${certificateId}`

    const certificateData = {
      ...data,
      certificateId,
      verificationUrl,
      issuedDate: serverTimestamp(),
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, CERTIFICATES_COLLECTION), certificateData)

    return {
      success: true,
      certificateId: certificateId, // Return the actual certificate ID (CERT-XXXXX), not the document ID
      documentId: docRef.id, // Also return document ID for reference
    }
  } catch (error) {
    console.error("Error issuing certificate:", error)
    return {
      success: false,
      error: "Failed to issue certificate",
    }
  }
}

/**
 * Get certificate by certificate ID (for verification)
 */
export async function getCertificateByCertificateId(
  certificateId: string
): Promise<Certificate | null> {
  try {
    const q = query(
      collection(db, CERTIFICATES_COLLECTION),
      where("certificateId", "==", certificateId)
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    const data = snapshot.docs[0].data()
    return {
      id: snapshot.docs[0].id,
      ...data,
      issuedDate: data.issuedDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Certificate
  } catch (error) {
    console.error("Error fetching certificate:", error)
    return null
  }
}

/**
 * Get certificate by attempt ID
 */
export async function getCertificateByAttemptId(
  attemptId: string
): Promise<Certificate | null> {
  try {
    const q = query(
      collection(db, CERTIFICATES_COLLECTION),
      where("attemptId", "==", attemptId)
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    const data = snapshot.docs[0].data()
    return {
      id: snapshot.docs[0].id,
      ...data,
      issuedDate: data.issuedDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Certificate
  } catch (error) {
    console.error("Error fetching certificate by attempt:", error)
    return null
  }
}

/**
 * Get all certificates for a student
 */
export async function getCertificatesByStudent(
  studentId: string
): Promise<Certificate[]> {
  try {
    const q = query(
      collection(db, CERTIFICATES_COLLECTION),
      where("studentId", "==", studentId),
      where("status", "==", "active")
    )
    const snapshot = await getDocs(q)

    const certificates = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        issuedDate: data.issuedDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Certificate
    })

    // Sort by issued date (newest first)
    return certificates.sort((a, b) => b.issuedDate.getTime() - a.issuedDate.getTime())
  } catch (error) {
    console.error("Error fetching student certificates:", error)
    return []
  }
}

/**
 * Get all certificates for a college
 */
export async function getCertificatesByCollege(
  collegeId: string
): Promise<Certificate[]> {
  try {
    const q = query(
      collection(db, CERTIFICATES_COLLECTION),
      where("collegeId", "==", collegeId)
    )
    const snapshot = await getDocs(q)

    const certificates = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        issuedDate: data.issuedDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Certificate
    })

    return certificates.sort((a, b) => b.issuedDate.getTime() - a.issuedDate.getTime())
  } catch (error) {
    console.error("Error fetching college certificates:", error)
    return []
  }
}

/**
 * Revoke a certificate
 */
export async function revokeCertificate(
  certificateId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const q = query(
      collection(db, CERTIFICATES_COLLECTION),
      where("certificateId", "==", certificateId)
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return {
        success: false,
        error: "Certificate not found",
      }
    }

    await updateDoc(doc(db, CERTIFICATES_COLLECTION, snapshot.docs[0].id), {
      status: "revoked",
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error revoking certificate:", error)
    return {
      success: false,
      error: "Failed to revoke certificate",
    }
  }
}

/**
 * Verify if a certificate is valid and active
 */
export async function verifyCertificate(
  certificateId: string
): Promise<{ isValid: boolean; certificate?: Certificate; error?: string }> {
  try {
    const certificate = await getCertificateByCertificateId(certificateId)

    if (!certificate) {
      return {
        isValid: false,
        error: "Certificate not found",
      }
    }

    if (certificate.status === "revoked") {
      return {
        isValid: false,
        certificate,
        error: "Certificate has been revoked",
      }
    }

    return {
      isValid: true,
      certificate,
    }
  } catch (error) {
    console.error("Error verifying certificate:", error)
    return {
      isValid: false,
      error: "Verification failed",
    }
  }
}
