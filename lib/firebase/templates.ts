import { db, storage } from "./client"
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
  Timestamp
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

const TEMPLATES_COLLECTION = "certificateTemplates"

export interface CertificateTemplate {
  id?: string
  name: string
  description: string
  imageUrl: string
  category: "course" | "skill" | "achievement" | "general"
  department?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
  // Position coordinates for dynamic text (percentage from top-left)
  textPositions: {
    studentName: { x: number; y: number }
    courseName: { x: number; y: number }
    date: { x: number; y: number }
    grade?: { x: number; y: number }
  }
}

/**
 * Upload a certificate template image to Firebase Storage
 */
export async function uploadTemplateImage(
  file: File,
  templateName: string
): Promise<string> {
  try {
    const timestamp = Date.now()
    const fileName = `${templateName}-${timestamp}.${file.name.split('.').pop()}`
    const storageRef = ref(storage, `certificate-templates/${fileName}`)
    
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    
    return downloadURL
  } catch (error) {
    console.error("Error uploading template image:", error)
    throw new Error("Failed to upload template image")
  }
}

/**
 * Create a new certificate template
 */
export async function createTemplate(
  template: Omit<CertificateTemplate, "id" | "createdAt" | "updatedAt">
): Promise<{ success: boolean; templateId?: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), {
      ...template,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    return { success: true, templateId: docRef.id }
  } catch (error) {
    console.error("Error creating template:", error)
    return { success: false, error: "Failed to create template" }
  }
}

/**
 * Get all certificate templates
 */
export async function getAllTemplates(): Promise<CertificateTemplate[]> {
  try {
    const q = query(
      collection(db, TEMPLATES_COLLECTION),
      orderBy("createdAt", "desc")
    )
    
    const snapshot = await getDocs(q)
    const templates = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as CertificateTemplate
    })

    return templates
  } catch (error) {
    console.error("Error getting templates:", error)
    return []
  }
}

/**
 * Get active templates by category
 */
export async function getTemplatesByCategory(
  category: string
): Promise<CertificateTemplate[]> {
  try {
    const q = query(
      collection(db, TEMPLATES_COLLECTION),
      where("category", "==", category),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    )
    
    const snapshot = await getDocs(q)
    const templates = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as CertificateTemplate
    })

    return templates
  } catch (error) {
    console.error("Error getting templates by category:", error)
    return []
  }
}

/**
 * Get a single template by ID
 */
export async function getTemplateById(
  templateId: string
): Promise<CertificateTemplate | null> {
  try {
    const docRef = doc(db, TEMPLATES_COLLECTION, templateId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as CertificateTemplate
    }

    return null
  } catch (error) {
    console.error("Error getting template:", error)
    return null
  }
}

/**
 * Update a certificate template
 */
export async function updateTemplate(
  templateId: string,
  updates: Partial<CertificateTemplate>
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, TEMPLATES_COLLECTION, templateId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating template:", error)
    return { success: false, error: "Failed to update template" }
  }
}

/**
 * Delete a certificate template
 */
export async function deleteTemplate(
  templateId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get template to delete image from storage
    const template = await getTemplateById(templateId)
    
    if (template && template.imageUrl) {
      try {
        // Extract file path from URL and delete from storage
        const imageRef = ref(storage, template.imageUrl)
        await deleteObject(imageRef)
      } catch (storageError) {
        console.warn("Could not delete image from storage:", storageError)
        // Continue with template deletion even if image deletion fails
      }
    }

    // Delete template document
    const docRef = doc(db, TEMPLATES_COLLECTION, templateId)
    await deleteDoc(docRef)

    return { success: true }
  } catch (error) {
    console.error("Error deleting template:", error)
    return { success: false, error: "Failed to delete template" }
  }
}

/**
 * Toggle template active status
 */
export async function toggleTemplateStatus(
  templateId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, TEMPLATES_COLLECTION, templateId)
    await updateDoc(docRef, {
      isActive,
      updatedAt: Timestamp.now()
    })

    return { success: true }
  } catch (error) {
    console.error("Error toggling template status:", error)
    return { success: false, error: "Failed to update template status" }
  }
}
