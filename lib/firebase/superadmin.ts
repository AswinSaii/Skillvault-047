import { db } from "./client";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { getVerifiedColleges, getPendingColleges } from "./colleges";

export interface SuperAdminStats {
  totalColleges: number;
  pendingRequests: number;
  totalUsers: number;
  monthlyCertificates: number;
  newCollegesThisMonth: number;
  certificatesGrowth: number;
}

export interface CollegeRequest {
  id: string;
  name: string;
  location: string;
  submittedAt: Date;
  status: "pending" | "reviewing" | "approved" | "rejected";
}

/**
 * Get super admin dashboard statistics
 */
export async function getSuperAdminStats(): Promise<SuperAdminStats> {
  try {
    // Get all colleges from colleges collection
    const allCollegesQuery = query(collection(db, "colleges"));
    const allCollegesSnapshot = await getDocs(allCollegesQuery);
    const totalColleges = allCollegesSnapshot.size;

    // Get pending colleges from colleges collection
    let pendingRequests = 0;
    try {
      const pendingResult = await getPendingColleges();
      if (pendingResult.success) {
        pendingRequests = pendingResult.colleges.length;
      }
    } catch (error) {
      console.error("Error fetching pending colleges:", error);
      // Fallback: try direct query
      try {
        const requestsQuery = query(
          collection(db, "colleges"),
          where("status", "==", "pending")
        );
        const requestsSnapshot = await getDocs(requestsQuery);
        pendingRequests = requestsSnapshot.size;
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
      }
    }

    // Get total users
    const usersQuery = query(collection(db, "users"));
    const usersSnapshot = await getDocs(usersQuery);
    const totalUsers = usersSnapshot.size;

    // Get certificates issued this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const certificatesQuery = query(
      collection(db, "certificates"),
      where("issuedDate", ">=", Timestamp.fromDate(startOfMonth))
    );
    const certificatesSnapshot = await getDocs(certificatesQuery);
    const monthlyCertificates = certificatesSnapshot.size;

    // Get new colleges this month from colleges collection
    // Filter in memory by createdAt to avoid needing composite index
    const newCollegesThisMonth = allCollegesSnapshot.docs.filter(doc => {
      const data = doc.data();
      const createdAt = data.createdAt ? new Date(data.createdAt) : null;
      return createdAt && createdAt >= startOfMonth;
    }).length;

    // Calculate certificates growth (compare with last month)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthCertificatesQuery = query(
      collection(db, "certificates"),
      where("issuedDate", ">=", Timestamp.fromDate(lastMonthStart)),
      where("issuedDate", "<=", Timestamp.fromDate(lastMonthEnd))
    );
    const lastMonthCertificatesSnapshot = await getDocs(lastMonthCertificatesQuery);
    const lastMonthCertificates = lastMonthCertificatesSnapshot.size;
    const certificatesGrowth = lastMonthCertificates > 0
      ? Math.round(((monthlyCertificates - lastMonthCertificates) / lastMonthCertificates) * 100)
      : 0;

    return {
      totalColleges,
      pendingRequests,
      totalUsers,
      monthlyCertificates,
      newCollegesThisMonth,
      certificatesGrowth,
    };
  } catch (error) {
    console.error("Error fetching super admin stats:", error);
    // Return default values on error
    return {
      totalColleges: 0,
      pendingRequests: 0,
      totalUsers: 0,
      monthlyCertificates: 0,
      newCollegesThisMonth: 0,
      certificatesGrowth: 0,
    };
  }
}

/**
 * Get pending college registration requests
 */
export async function getPendingCollegeRequests(): Promise<CollegeRequest[]> {
  try {
    // Get pending colleges from colleges collection
    const pendingResult = await getPendingColleges();
    
    if (pendingResult.success && pendingResult.colleges.length > 0) {
      return pendingResult.colleges.map((college) => {
        return {
          id: college.id,
          name: college.name,
          location: college.location,
          submittedAt: new Date(college.createdAt),
          status: college.status as "pending" | "reviewing" | "approved" | "rejected",
        };
      });
    }
    
    // Fallback: try direct query if helper function fails
    try {
      const requestsQuery = query(
        collection(db, "colleges"),
        where("status", "==", "pending")
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      
      if (requestsSnapshot.size > 0) {
        return requestsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "Unknown",
            location: data.location || "Unknown",
            submittedAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            status: (data.status || "pending") as "pending" | "reviewing" | "approved" | "rejected",
          };
        });
      }
    } catch (fallbackError) {
      console.error("Fallback query failed:", fallbackError);
    }
    
    // Return empty array if no requests found
    return [];
  } catch (error) {
    console.error("Error fetching pending college requests:", error);
    return [];
  }
}

