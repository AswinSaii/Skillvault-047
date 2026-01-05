import { db } from "./client";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  arrayUnion,
  increment,
} from "firebase/firestore";

export interface Assessment {
  id?: string;
  title: string;
  description: string;
  type: "mcq" | "coding" | "practical" | "mixed";
  skill: string;
  difficulty: "easy" | "medium" | "hard";
  duration: number; // in minutes
  totalMarks: number;
  passingMarks: number;
  questions: string[]; // question IDs
  createdBy: string; // faculty userId
  collegeId: string;
  isActive: boolean;
  scheduledDate?: Date;
  dueDate?: Date;
  allowedStudents?: string[]; // if empty, open to all
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Attempt {
  id?: string;
  assessmentId: string;
  studentId: string;
  collegeId: string;
  answers: {
    questionId: string;
    answer: any;
    isCorrect?: boolean;
    pointsEarned?: number;
  }[];
  score: number;
  totalMarks: number;
  percentage: number;
  status: "in-progress" | "completed" | "submitted" | "evaluated";
  startedAt: Date;
  submittedAt?: Date;
  timeSpent: number; // in seconds
  tabSwitches: number;
  proctoringFlags: {
    type: string;
    timestamp: Date;
  }[];
  evaluatedBy?: string;
  evaluatedAt?: Date;
  feedback?: string;
}

export interface DailyQuiz {
  id?: string;
  date: string; // YYYY-MM-DD
  questions: string[]; // 5 questions
  skill: string;
  difficulty: "easy" | "medium";
  createdAt: Date;
}

export interface UserStreak {
  id?: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastQuizDate: string; // YYYY-MM-DD
  totalQuizzesTaken: number;
  streakHistory: {
    date: string;
    completed: boolean;
  }[];
  updatedAt: Date;
}

const ASSESSMENTS_COLLECTION = "assessments";
const ATTEMPTS_COLLECTION = "attempts";
const DAILY_QUIZZES_COLLECTION = "dailyQuizzes";
const USER_STREAKS_COLLECTION = "userStreaks";

// ============ ASSESSMENTS ============

export async function createAssessment(
  assessmentData: Omit<Assessment, "id" | "createdAt" | "updatedAt">
): Promise<{ success: boolean; assessmentId?: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, ASSESSMENTS_COLLECTION), {
      ...assessmentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
      assessmentId: docRef.id,
    };
  } catch (error: any) {
    console.error("Error creating assessment:", error);
    return {
      success: false,
      error: error.message || "Failed to create assessment",
    };
  }
}

export async function updateAssessment(
  assessmentId: string,
  updates: Partial<Omit<Assessment, "id" | "createdAt" | "updatedAt">>
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, ASSESSMENTS_COLLECTION, assessmentId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating assessment:", error);
    return {
      success: false,
      error: error.message || "Failed to update assessment",
    };
  }
}

export async function deleteAssessment(
  assessmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, ASSESSMENTS_COLLECTION, assessmentId);
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting assessment:", error);
    return {
      success: false,
      error: error.message || "Failed to delete assessment",
    };
  }
}

export async function getAssessmentsByFaculty(
  facultyId: string,
  collegeId?: string
): Promise<Assessment[]> {
  try {
    const queryConstraints = [
      where("createdBy", "==", facultyId)
    ];
    
    // Only add collegeId filter if it's provided
    if (collegeId) {
      queryConstraints.push(where("collegeId", "==", collegeId));
    }
    
    const q = query(
      collection(db, ASSESSMENTS_COLLECTION),
      ...queryConstraints
    );

    const snapshot = await getDocs(q);
    const assessments = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        scheduledDate: data.scheduledDate?.toDate(),
        dueDate: data.dueDate?.toDate(),
      } as Assessment;
    });

    return assessments.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error("Error fetching assessments by faculty:", error);
    return [];
  }
}

export async function getAssessmentsByCollege(
  collegeId: string
): Promise<Assessment[]> {
  try {
    const q = query(
      collection(db, ASSESSMENTS_COLLECTION),
      where("collegeId", "==", collegeId)
    );

    const snapshot = await getDocs(q);
    const assessments = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        scheduledDate: data.scheduledDate?.toDate(),
        dueDate: data.dueDate?.toDate(),
      } as Assessment;
    });

    return assessments.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return [];
  }
}

export async function getActiveAssessmentsForStudent(
  collegeId: string,
  studentId: string
): Promise<Assessment[]> {
  try {
    const q = query(
      collection(db, ASSESSMENTS_COLLECTION),
      where("collegeId", "==", collegeId),
      where("isActive", "==", true)
    );

    const snapshot = await getDocs(q);
    const now = new Date();
    
    const assessments = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          scheduledDate: data.scheduledDate?.toDate(),
          dueDate: data.dueDate?.toDate(),
        } as Assessment;
      })
      .filter((assessment) => {
        // Filter by allowed students if specified
        if (assessment.allowedStudents && assessment.allowedStudents.length > 0) {
          return assessment.allowedStudents.includes(studentId);
        }
        // Filter by due date
        if (assessment.dueDate && assessment.dueDate < now) {
          return false;
        }
        return true;
      });

    return assessments.sort((a, b) => {
      if (a.scheduledDate && b.scheduledDate) {
        return a.scheduledDate.getTime() - b.scheduledDate.getTime();
      }
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  } catch (error) {
    console.error("Error fetching active assessments:", error);
    return [];
  }
}

export async function getAssessmentById(
  assessmentId: string
): Promise<Assessment | null> {
  try {
    const docRef = doc(db, ASSESSMENTS_COLLECTION, assessmentId);
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
      scheduledDate: data.scheduledDate?.toDate(),
      dueDate: data.dueDate?.toDate(),
    } as Assessment;
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return null;
  }
}

// ============ ATTEMPTS ============

export async function createAttempt(
  attemptData: Omit<Attempt, "id" | "startedAt">
): Promise<{ success: boolean; attemptId?: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, ATTEMPTS_COLLECTION), {
      ...attemptData,
      startedAt: Timestamp.now(),
    });

    return {
      success: true,
      attemptId: docRef.id,
    };
  } catch (error: any) {
    console.error("Error creating attempt:", error);
    return {
      success: false,
      error: error.message || "Failed to create attempt",
    };
  }
}

export async function updateAttempt(
  attemptId: string,
  updates: Partial<Omit<Attempt, "id" | "startedAt">>
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, ATTEMPTS_COLLECTION, attemptId);
    
    const updateData: any = { ...updates };
    if (updates.submittedAt) {
      updateData.submittedAt = Timestamp.fromDate(updates.submittedAt);
    }
    if (updates.evaluatedAt) {
      updateData.evaluatedAt = Timestamp.fromDate(updates.evaluatedAt);
    }
    
    await updateDoc(docRef, updateData);

    return { success: true };
  } catch (error: any) {
    console.error("Error updating attempt:", error);
    return {
      success: false,
      error: error.message || "Failed to update attempt",
    };
  }
}

export async function getAttemptsByStudent(
  studentId: string
): Promise<Attempt[]> {
  try {
    const q = query(
      collection(db, ATTEMPTS_COLLECTION),
      where("studentId", "==", studentId)
    );

    const snapshot = await getDocs(q);
    const attempts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startedAt: data.startedAt?.toDate(),
        submittedAt: data.submittedAt?.toDate(),
        evaluatedAt: data.evaluatedAt?.toDate(),
      } as Attempt;
    });

    return attempts.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  } catch (error) {
    console.error("Error fetching attempts:", error);
    return [];
  }
}

export async function getAttemptsByAssessment(
  assessmentId: string
): Promise<Attempt[]> {
  try {
    const q = query(
      collection(db, ATTEMPTS_COLLECTION),
      where("assessmentId", "==", assessmentId)
    );

    const snapshot = await getDocs(q);
    const attempts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startedAt: data.startedAt?.toDate(),
        submittedAt: data.submittedAt?.toDate(),
        evaluatedAt: data.evaluatedAt?.toDate(),
      } as Attempt;
    });

    return attempts.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  } catch (error) {
    console.error("Error fetching attempts:", error);
    return [];
  }
}

// ============ DAILY QUIZ & STREAKS ============

export async function getTodayQuiz(): Promise<DailyQuiz | null> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const q = query(
      collection(db, DAILY_QUIZZES_COLLECTION),
      where("date", "==", today)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...data,
      createdAt: data.createdAt?.toDate(),
    } as DailyQuiz;
  } catch (error) {
    console.error("Error fetching today's quiz:", error);
    return null;
  }
}

export async function getUserStreak(userId: string): Promise<UserStreak | null> {
  try {
    const q = query(
      collection(db, USER_STREAKS_COLLECTION),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...data,
      updatedAt: data.updatedAt?.toDate(),
    } as UserStreak;
  } catch (error) {
    console.error("Error fetching user streak:", error);
    return null;
  }
}

export async function updateUserStreak(
  userId: string,
  completed: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const streakData = await getUserStreak(userId);

    if (!streakData) {
      // Create new streak record
      await addDoc(collection(db, USER_STREAKS_COLLECTION), {
        userId,
        currentStreak: completed ? 1 : 0,
        longestStreak: completed ? 1 : 0,
        lastQuizDate: completed ? today : "",
        totalQuizzesTaken: completed ? 1 : 0,
        streakHistory: [{ date: today, completed }],
        updatedAt: Timestamp.now(),
      });
      return { success: true };
    }

    // Update existing streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = streakData.currentStreak;

    if (completed) {
      if (streakData.lastQuizDate === yesterdayStr) {
        // Continue streak
        newStreak = streakData.currentStreak + 1;
      } else if (streakData.lastQuizDate === today) {
        // Already completed today
        newStreak = streakData.currentStreak;
      } else {
        // Streak broken, start new
        newStreak = 1;
      }
    }

    const docRef = doc(db, USER_STREAKS_COLLECTION, streakData.id!);
    await updateDoc(docRef, {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streakData.longestStreak),
      lastQuizDate: completed ? today : streakData.lastQuizDate,
      totalQuizzesTaken: completed
        ? increment(1)
        : streakData.totalQuizzesTaken,
      streakHistory: arrayUnion({ date: today, completed }),
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating user streak:", error);
    return {
      success: false,
      error: error.message || "Failed to update streak",
    };
  }
}
