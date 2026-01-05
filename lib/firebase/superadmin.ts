import { db } from "./client";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";

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
    // Get total colleges
    const collegesQuery = query(collection(db, "users"), where("role", "==", "college-admin"));
    const collegesSnapshot = await getDocs(collegesQuery);
    const totalColleges = collegesSnapshot.size;

    // Get pending college registration requests
    // Try collegeRegistrations collection, fallback to checking users with pending status
    let pendingRequests = 0
    try {
      const requestsQuery = query(
        collection(db, "collegeRegistrations"),
        where("status", "==", "pending")
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      pendingRequests = requestsSnapshot.size;
    } catch (error) {
      // Collection might not exist, use 0 as default
      console.log("collegeRegistrations collection not found, using default")
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

    // Get new colleges this month
    const newCollegesQuery = query(
      collection(db, "users"),
      where("role", "==", "college-admin"),
      where("createdAt", ">=", Timestamp.fromDate(startOfMonth))
    );
    const newCollegesSnapshot = await getDocs(newCollegesQuery);
    const newCollegesThisMonth = newCollegesSnapshot.size;

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
    // Try to get from collegeRegistrations collection
    const requestsQuery = query(
      collection(db, "collegeRegistrations"),
      where("status", "==", "pending")
    );
    const requestsSnapshot = await getDocs(requestsQuery);
    
    if (requestsSnapshot.size > 0) {
      return requestsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.collegeName || data.name || "Unknown",
          location: data.location || data.address || "Unknown",
          submittedAt: data.submittedAt?.toDate() || data.createdAt?.toDate() || new Date(),
          status: data.status || "pending",
        };
      });
    }
    
    // Fallback: return empty array if no requests found
    return [];
  } catch (error) {
    // Collection might not exist, return empty array
    console.log("collegeRegistrations collection not found")
    return [];
  }
}

