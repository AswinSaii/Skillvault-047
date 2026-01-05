import { db } from "./client";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from "firebase/firestore";

export interface Question {
  id?: string;
  title: string;
  description: string;
  type: "mcq" | "coding" | "practical";
  difficulty: "easy" | "medium" | "hard";
  skill: string;
  points: number;
  timeLimit: number; // in minutes
  // MCQ specific
  options?: string[];
  correctAnswer?: number; // index of correct option
  // Coding specific
  testCases?: {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }[];
  starterCode?: string;
  language?: string[];
  // Common metadata
  createdBy: string; // faculty userId
  collegeId: string;
  tags: string[];
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const QUESTIONS_COLLECTION = "questions";

/**
 * Create a new question
 */
export async function createQuestion(
  questionData: Omit<Question, "id" | "createdAt" | "updatedAt" | "usageCount">
): Promise<{ success: boolean; questionId?: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, QUESTIONS_COLLECTION), {
      ...questionData,
      usageCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
      questionId: docRef.id,
    };
  } catch (error: any) {
    console.error("Error creating question:", error);
    return {
      success: false,
      error: error.message || "Failed to create question",
    };
  }
}

/**
 * Get all questions for a college
 */
export async function getQuestionsByCollege(
  collegeId: string
): Promise<Question[]> {
  try {
    const q = query(
      collection(db, QUESTIONS_COLLECTION),
      where("collegeId", "==", collegeId)
    );

    const snapshot = await getDocs(q);
    const questions = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Question;
    });

    // Sort in memory by updatedAt descending
    return questions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
}

/**
 * Get questions created by a specific faculty member
 */
export async function getQuestionsByFaculty(
  facultyId: string,
  collegeId: string
): Promise<Question[]> {
  try {
    const q = query(
      collection(db, QUESTIONS_COLLECTION),
      where("createdBy", "==", facultyId),
      where("collegeId", "==", collegeId)
    );

    const snapshot = await getDocs(q);
    const questions = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Question;
    });

    return questions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error("Error fetching faculty questions:", error);
    return [];
  }
}

/**
 * Get a single question by ID
 */
export async function getQuestionById(
  questionId: string
): Promise<Question | null> {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Question;
  } catch (error) {
    console.error("Error fetching question:", error);
    return null;
  }
}

/**
 * Update a question
 */
export async function updateQuestion(
  questionId: string,
  updates: Partial<Omit<Question, "id" | "createdAt" | "createdBy" | "collegeId">>
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating question:", error);
    return {
      success: false,
      error: error.message || "Failed to update question",
    };
  }
}

/**
 * Delete a question
 */
export async function deleteQuestion(
  questionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting question:", error);
    return {
      success: false,
      error: error.message || "Failed to delete question",
    };
  }
}

/**
 * Toggle question active status
 */
export async function toggleQuestionStatus(
  questionId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await updateDoc(docRef, {
      isActive,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error toggling question status:", error);
    return {
      success: false,
      error: error.message || "Failed to update question status",
    };
  }
}

/**
 * Increment usage count when question is used in an assessment
 */
export async function incrementQuestionUsage(
  questionId: string
): Promise<void> {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentUsage = docSnap.data().usageCount || 0;
      await updateDoc(docRef, {
        usageCount: currentUsage + 1,
      });
    }
  } catch (error) {
    console.error("Error incrementing question usage:", error);
  }
}

/**
 * Bulk delete questions
 */
export async function bulkDeleteQuestions(
  questionIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const batch = writeBatch(db);
    
    questionIds.forEach((id) => {
      const docRef = doc(db, QUESTIONS_COLLECTION, id);
      batch.delete(docRef);
    });

    await batch.commit();
    return { success: true };
  } catch (error: any) {
    console.error("Error bulk deleting questions:", error);
    return {
      success: false,
      error: error.message || "Failed to delete questions",
    };
  }
}

/**
 * Get questions filtered by skill
 */
export async function getQuestionsBySkill(
  collegeId: string,
  skill: string
): Promise<Question[]> {
  try {
    const q = query(
      collection(db, QUESTIONS_COLLECTION),
      where("collegeId", "==", collegeId),
      where("skill", "==", skill)
    );

    const snapshot = await getDocs(q);
    const questions = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Question;
    });

    return questions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error("Error fetching questions by skill:", error);
    return [];
  }
}

/**
 * Get multiple questions by their IDs
 */
export async function getQuestionsByIds(
  questionIds: string[]
): Promise<Question[]> {
  try {
    if (questionIds.length === 0) return []
    
    const questions: Question[] = []
    
    // Firestore 'in' queries are limited to 10 items, so we need to batch
    for (let i = 0; i < questionIds.length; i += 10) {
      const batch = questionIds.slice(i, i + 10)
      const promises = batch.map(id => getQuestionById(id))
      const results = await Promise.all(promises)
      questions.push(...results.filter((q): q is Question => q !== null))
    }
    
    return questions
  } catch (error) {
    console.error("Error fetching questions by IDs:", error)
    return []
  }
}

/**
 * Batch create multiple questions (for AI-generated questions)
 */
export async function createQuestionsBatch(
  questions: Omit<Question, "id" | "createdAt" | "updatedAt" | "usageCount">[],
  assessmentId?: string
): Promise<{ success: boolean; questionIds?: string[]; error?: string }> {
  try {
    const batch = writeBatch(db);
    const questionIds: string[] = [];

    for (const questionData of questions) {
      const docRef = doc(collection(db, QUESTIONS_COLLECTION));
      batch.set(docRef, {
        ...questionData,
        usageCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      questionIds.push(docRef.id);
    }

    await batch.commit();

    console.log(`✓ Created ${questionIds.length} questions in batch`);

    return {
      success: true,
      questionIds,
    };
  } catch (error: any) {
    console.error("Error creating questions batch:", error);
    return {
      success: false,
      error: error.message || "Failed to create questions",
    };
  }
}
