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
  limit,
} from "firebase/firestore";

// ============ STUDENT MANAGEMENT ============

export interface Student {
  id?: string;
  name: string;
  email: string;
  collegeId: string;
  department: string;
  year: number;
  rollNumber: string;
  phone?: string;
  enrollmentDate: Date;
  isActive: boolean;
  skills: {
    skillName: string;
    proficiency: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export async function getStudentsByFaculty(
  collegeId: string
): Promise<Student[]> {
  try {
    const q = query(
      collection(db, "users"),
      where("collegeId", "==", collegeId),
      where("role", "==", "student"),
      where("isActive", "==", true),
      orderBy("name", "asc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        enrollmentDate: data.enrollmentDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Student;
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

export async function addStudent(
  studentData: Omit<Student, "id" | "createdAt" | "updatedAt">
): Promise<{ success: boolean; studentId?: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      ...studentData,
      role: "student",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      enrollmentDate: Timestamp.fromDate(studentData.enrollmentDate),
    });

    return {
      success: true,
      studentId: docRef.id,
    };
  } catch (error: any) {
    console.error("Error adding student:", error);
    return {
      success: false,
      error: error.message || "Failed to add student",
    };
  }
}

export async function updateStudent(
  studentId: string,
  updates: Partial<Omit<Student, "id" | "createdAt">>
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, "users", studentId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating student:", error);
    return {
      success: false,
      error: error.message || "Failed to update student",
    };
  }
}

export async function deleteStudent(
  studentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Soft delete - mark as inactive
    const docRef = doc(db, "users", studentId);
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting student:", error);
    return {
      success: false,
      error: error.message || "Failed to delete student",
    };
  }
}

// ============ FACULTY ANALYTICS ============

export interface FacultyStats {
  activeStudents: number;
  totalAssessments: number;
  averagePassRate: number;
  certificatesIssued: number;
  recentAssessments: {
    name: string;
    students: number;
    completed: number;
    avgScore: number;
    date: string;
  }[];
  performanceData: {
    skill: string;
    avg: number;
  }[];
  upcomingAssessments: {
    id: string;
    title: string;
    date: string;
    students: number;
  }[];
  topPerformers: {
    id: string;
    name: string;
    score: number;
    skills: number;
  }[];
  recentActivity: {
    action: string;
    detail: string;
    time: string;
  }[];
}

export async function getFacultyDashboardStats(
  facultyId: string,
  collegeId: string
): Promise<FacultyStats> {
  try {
    // Get active students count
    const studentsQuery = query(
      collection(db, "users"),
      where("collegeId", "==", collegeId),
      where("role", "==", "student")
    );
    const studentsSnapshot = await getDocs(studentsQuery);
    // Filter active students (isActive might not exist on all users)
    const activeStudents = studentsSnapshot.docs.filter(
      doc => doc.data().isActive !== false && doc.data().verified !== false
    ).length;

    // Get assessments created by faculty
    const assessmentsQuery = query(
      collection(db, "assessments"),
      where("createdBy", "==", facultyId),
      where("isActive", "==", true)
    );
    const assessmentsSnapshot = await getDocs(assessmentsQuery);
    const totalAssessments = assessmentsSnapshot.size;

    // Get recent assessments with stats
    const recentAssessmentsQuery = query(
      collection(db, "assessments"),
      where("createdBy", "==", facultyId),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const recentAssessmentsSnapshot = await getDocs(recentAssessmentsQuery);
    
    const recentAssessments = await Promise.all(
      recentAssessmentsSnapshot.docs.map(async (assessmentDoc) => {
        const assessmentData = assessmentDoc.data();
        
        // Get attempts for this assessment
        const attemptsQuery = query(
          collection(db, "attempts"),
          where("assessmentId", "==", assessmentDoc.id)
        );
        const attemptsSnapshot = await getDocs(attemptsQuery);
        
        const completed = attemptsSnapshot.docs.filter(
          (doc) => doc.data().status === "completed"
        ).length;
        
        const totalScore = attemptsSnapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().percentage || 0),
          0
        );
        const avgScore = attemptsSnapshot.size > 0 ? Math.round(totalScore / attemptsSnapshot.size) : 0;
        
        const createdAt = assessmentData.createdAt?.toDate();
        const daysAgo = Math.floor(
          (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        return {
          name: assessmentData.title,
          students: attemptsSnapshot.size,
          completed,
          avgScore,
          date: daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`,
        };
      })
    );

    // Calculate average pass rate
    const allAttemptsQuery = query(
      collection(db, "attempts"),
      where("collegeId", "==", collegeId)
    );
    const allAttemptsSnapshot = await getDocs(allAttemptsQuery);
    const passedAttempts = allAttemptsSnapshot.docs.filter(
      (doc) => doc.data().percentage >= 70
    ).length;
    const averagePassRate = allAttemptsSnapshot.size > 0
      ? Math.round((passedAttempts / allAttemptsSnapshot.size) * 100)
      : 0;

    // Count certificates issued
    const certificatesQuery = query(
      collection(db, "certificates"),
      where("collegeId", "==", collegeId)
    );
    const certificatesSnapshot = await getDocs(certificatesQuery);
    const certificatesIssued = certificatesSnapshot.size;

    // Get performance data by skill
    // We need to get assessment data to extract skills
    const assessmentIds = [...new Set(allAttemptsSnapshot.docs.map(doc => doc.data().assessmentId).filter(Boolean))];
    const assessmentDocs = await Promise.all(
      assessmentIds.map(id => getDoc(doc(db, "assessments", id))).filter(Boolean)
    );
    const assessmentsMap = new Map();
    assessmentDocs.forEach(doc => {
      if (doc.exists()) {
        assessmentsMap.set(doc.id, doc.data());
      }
    });

    const skillsMap = new Map<string, { total: number; count: number }>();
    allAttemptsSnapshot.docs.forEach((doc) => {
      const attemptData = doc.data();
      if (attemptData.percentage) {
        const assessment = assessmentsMap.get(attemptData.assessmentId);
        const skill = assessment?.skill || "Other";
        const existing = skillsMap.get(skill) || { total: 0, count: 0 };
        skillsMap.set(skill, {
          total: existing.total + attemptData.percentage,
          count: existing.count + 1,
        });
      }
    });

    const performanceData = Array.from(skillsMap.entries())
      .map(([skill, data]) => ({
        skill,
        avg: Math.round(data.total / data.count),
      }))
      .slice(0, 5);

    // Get upcoming assessments
    // Note: We can't use orderBy on scheduledDate if it might be null/undefined
    // So we'll fetch all active assessments and filter/sort in memory
    const now = new Date();
    const upcomingQuery = query(
      collection(db, "assessments"),
      where("createdBy", "==", facultyId),
      where("isActive", "==", true)
    );
    const upcomingSnapshot = await getDocs(upcomingQuery);
    
    const upcomingAssessments = upcomingSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        const scheduledDate = data.scheduledDate?.toDate();
        return {
          id: doc.id,
          title: data.title,
          scheduledDate,
          date: scheduledDate ? scheduledDate.toLocaleString() : "Not scheduled",
          students: data.allowedStudents?.length || activeStudents,
        };
      })
      .filter((assessment) => {
        // Only include assessments with scheduledDate in the future
        return assessment.scheduledDate && assessment.scheduledDate > now;
      })
      .sort((a, b) => {
        // Sort by scheduledDate ascending
        if (!a.scheduledDate) return 1;
        if (!b.scheduledDate) return -1;
        return a.scheduledDate.getTime() - b.scheduledDate.getTime();
      })
      .slice(0, 3)
      .map((assessment) => ({
        id: assessment.id,
        title: assessment.title,
        date: assessment.date,
        students: assessment.students,
      }));

    // Get top performers
    const topPerformersMap = new Map<string, { total: number; count: number; name: string; skills: Set<string> }>();
    
    allAttemptsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.percentage >= 70) {
        const existing = topPerformersMap.get(data.studentId) || {
          total: 0,
          count: 0,
          name: data.studentName || "Unknown",
          skills: new Set<string>(),
        };
        existing.total += data.percentage;
        existing.count += 1;
        if (data.skill) existing.skills.add(data.skill);
        topPerformersMap.set(data.studentId, existing);
      }
    });

    const topPerformers = Array.from(topPerformersMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        score: Math.round(data.total / data.count),
        skills: data.skills.size,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    // Generate recent activity
    const recentActivity = [
      {
        action: "Assessment completed",
        detail: recentAssessments[0]?.name || "Recent assessment",
        time: "2 hours ago",
      },
      {
        action: "Certificate issued",
        detail: `${topPerformers[0]?.name || "Student"} - ${recentAssessments[0]?.name || "Assessment"}`,
        time: "5 hours ago",
      },
      {
        action: "Question bank updated",
        detail: "Added new questions",
        time: "1 day ago",
      },
    ];

    return {
      activeStudents,
      totalAssessments,
      averagePassRate,
      certificatesIssued,
      recentAssessments,
      performanceData,
      upcomingAssessments,
      topPerformers,
      recentActivity,
    };
  } catch (error) {
    console.error("Error fetching faculty stats:", error);
    return {
      activeStudents: 0,
      totalAssessments: 0,
      averagePassRate: 0,
      certificatesIssued: 0,
      recentAssessments: [],
      performanceData: [],
      upcomingAssessments: [],
      topPerformers: [],
      recentActivity: [],
    };
  }
}

// ============ PROCTORING ALERTS ============

export interface ProctoringAlert {
  id: string;
  user: string;
  userId: string;
  reason: string;
  time: string;
  severity: "high" | "medium" | "low";
  assessmentId: string;
  assessmentName: string;
}

export async function getProctoringAlerts(
  facultyId: string,
  collegeId: string
): Promise<ProctoringAlert[]> {
  try {
    // Get assessments by faculty
    const assessmentsQuery = query(
      collection(db, "assessments"),
      where("createdBy", "==", facultyId)
    );
    const assessmentsSnapshot = await getDocs(assessmentsQuery);
    const assessmentIds = assessmentsSnapshot.docs.map((doc) => doc.id);

    if (assessmentIds.length === 0) return [];

    // Get attempts with proctoring flags
    // Use try-catch to handle index errors gracefully
    let attemptsSnapshot;
    try {
      const attemptsQuery = query(
        collection(db, "attempts"),
        where("collegeId", "==", collegeId),
        orderBy("startedAt", "desc"),
        limit(20)
      );
      attemptsSnapshot = await getDocs(attemptsQuery);
    } catch (indexError: any) {
      // If index doesn't exist, fetch without orderBy and sort in memory
      console.warn("Index not found, fetching without orderBy:", indexError);
      const attemptsQuery = query(
        collection(db, "attempts"),
        where("collegeId", "==", collegeId),
        limit(50) // Get more to account for filtering
      );
      attemptsSnapshot = await getDocs(attemptsQuery);
      // Sort in memory
      attemptsSnapshot.docs.sort((a, b) => {
        const aTime = a.data().startedAt?.toDate()?.getTime() || 0;
        const bTime = b.data().startedAt?.toDate()?.getTime() || 0;
        return bTime - aTime;
      });
    }

    const alerts: ProctoringAlert[] = [];
    
    attemptsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      
      if (assessmentIds.includes(data.assessmentId)) {
        const assessment = assessmentsSnapshot.docs.find(
          (a) => a.id === data.assessmentId
        )?.data();

        // Check for tab switches
        if (data.tabSwitches && data.tabSwitches > 0) {
          const severity = data.tabSwitches >= 3 ? "high" : data.tabSwitches >= 2 ? "medium" : "low";
          alerts.push({
            id: `${doc.id}-tab`,
            user: data.studentName || "Unknown Student",
            userId: data.studentId,
            reason: `Tab Switch (${data.tabSwitches}x)`,
            time: getTimeAgo(data.startedAt?.toDate()),
            severity,
            assessmentId: data.assessmentId,
            assessmentName: assessment?.title || "Unknown Assessment",
          });
        }

        // Check proctoring flags
        if (data.proctoringFlags && data.proctoringFlags.length > 0) {
          data.proctoringFlags.forEach((flag: any, index: number) => {
            alerts.push({
              id: `${doc.id}-flag-${index}`,
              user: data.studentName || "Unknown Student",
              userId: data.studentId,
              reason: flag.type || "Unusual activity",
              time: getTimeAgo(flag.timestamp?.toDate()),
              severity: "medium",
              assessmentId: data.assessmentId,
              assessmentName: assessment?.title || "Unknown Assessment",
            });
          });
        }
      }
    });

    return alerts.slice(0, 10); // Return top 10 most recent
  } catch (error) {
    console.error("Error fetching proctoring alerts:", error);
    return [];
  }
}

function getTimeAgo(date: Date | undefined): string {
  if (!date) return "Unknown";
  
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
