import { auth, db } from "../firebase/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc
} from "firebase/firestore";

/**
 * Admin Hierarchy Levels:
 * super_admin = 5 (Full access to everything)
 * member = 0
 */

export const HIERARCHY_LEVELS = {
  super_admin: 5,
  member: 0
};

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry"
];

/**
 * Check if current admin can approve target based on hierarchy
 * @param {string} currentAdminRole - current admin's role
 * @param {string} targetRole - role to be approved
 * @param {string} targetState - applicant's state (for geographic filtering)
 * @param {string} currentAdminState - current admin's assigned state
 * @param {string} targetDistrict - applicant's district
 * @param {string} currentAdminDistrict - current admin's assigned district
 */
export function canApprove(currentAdminRole, targetRole, targetState = "", currentAdminState = "", targetDistrict = "", currentAdminDistrict = "") {
  const currentLevel = HIERARCHY_LEVELS[currentAdminRole] || 0;
  const targetLevel = HIERARCHY_LEVELS[targetRole] || 0;

  // Can't approve equal or higher level
  if (currentLevel <= targetLevel) {
    return { allowed: false, reason: `Cannot approve users at your level or above` };
  }

  // Super admin can approve everything
  if (currentAdminRole === "super_admin") {
    return { allowed: true, reason: "Approved" };
  }

  return { allowed: true, reason: "Approved" };
}

/**
 * Get user role from Firestore
 */
export async function getUserRole(uid) {
  try {
    // Check in admins collection first
    const adminDoc = await getDoc(doc(db, "admins", uid));
    if (adminDoc.exists()) {
      return { role: adminDoc.data().role, data: adminDoc.data(), isAdmin: true };
    }

    // Check in users collection
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return { role: userDoc.data().role, data: userDoc.data(), isAdmin: false };
    }

    // Check if there's a pending application
    const appsSnapshot = await getDoc(doc(db, "membershipApplications", uid));
    if (appsSnapshot.exists()) {
      const appData = appsSnapshot.data();
      return { 
        role: "pending_applicant", 
        data: appData, 
        isAdmin: false,
        status: appData.status 
      };
    }

    return { role: null, data: null, isAdmin: false };
  } catch (error) {
    console.error("Error getting user role:", error);
    return { role: null, data: null, isAdmin: false, error: error.message };
  }
}

/**
 * Login user with email and password
 * Returns user data along with auth result
 */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Get user role and data from Firestore
    const roleInfo = await getUserRole(uid);

    if (!roleInfo.role) {
      // User exists in Auth but not in Firestore - sign them out
      await signOut(auth);
      throw new Error("Account not found. Please contact administrator.");
    }

    if (roleInfo.role === "pending_applicant") {
      await signOut(auth);
      if (roleInfo.status === "Pending") {
        throw new Error("Your membership application is still pending approval.");
      } else if (roleInfo.status === "Rejected") {
        throw new Error("Your membership application was rejected. Contact administrator for details.");
      }
    }

    return {
      uid,
      email: userCredential.user.email,
      ...roleInfo
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Login for admin users only
 */
export async function loginAdmin(email, password) {
  const result = await loginUser(email, password);
  
  if (!result.isAdmin) {
    await signOut(auth);
    throw new Error("Access denied. Admin credentials required.");
  }

  return result;
}

/**
 * Login for members only (after approval)
 */
export async function loginMember(email, password) {
  const result = await loginUser(email, password);
  
  if (result.isAdmin) {
    await signOut(auth);
    throw new Error("Please use admin login.");
  }

  if (result.role !== "member") {
    await signOut(auth);
    throw new Error("Invalid member account.");
  }

  return result;
}

/**
 * Create Firebase Auth user and member record (called on approval)
 * This function should ONLY be called from admin approval workflow
 */
export async function createApprovedMember(appData, password) {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      appData.email, 
      password
    );
    
    const uid = userCredential.user.uid;

    // Create user document in users collection
    await setDoc(doc(db, "users", uid), {
      uid,
      name: appData.name,
      email: appData.email,
      phone: appData.phone || "",
      address: appData.address || "",
      dob: appData.dob || "",
      gender: appData.gender || "",
      state: appData.state || "",
      district: appData.district || "",
      level: appData.levelRequested || appData.level || "",
      role: "member",
      status: "Active",
      memberId: appData.memberId || "",
      certificateId: appData.certificateId || "",
      photoUrl: appData.photoUrl || "",
      kycUrl: appData.kycUrl || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Sign out after creating (user will login separately with credentials)
    await signOut(auth);

    return { uid, success: true };
  } catch (error) {
    console.error("Error creating approved member:", error);
    throw error;
  }
}

/**
 * Logout current user
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

/**
 * Check auth state and get user info
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    const roleInfo = await getUserRole(firebaseUser.uid);
    callback({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      ...roleInfo
    });
  });
}

/**
 * Create admin account (called during setup/seed)
 */
export async function createAdmin(adminData) {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminData.email,
      adminData.password
    );
    
    const uid = userCredential.user.uid;

    // Create admin document
    await setDoc(doc(db, "admins", uid), {
      uid,
      name: adminData.name,
      email: adminData.email,
      role: adminData.role,
      hierarchyLevel: HIERARCHY_LEVELS[adminData.role] || 0,
      state: adminData.state || "",
      district: adminData.district || "",
      permissions: adminData.permissions || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Sign out after creating
    await signOut(auth);

    return { uid, success: true };
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
}

/**
 * Log action to audit logs
 */
export async function logAuditEvent(actorId, actorRole, action, targetId, targetType, details = {}) {
  try {
    await addDoc(collection(db, "auditLogs"), {
      actorId,
      actorRole,
      action,
      targetId,
      targetType,
      details,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error logging audit event:", error);
    // Don't throw - audit logging should not break main flow
  }
}

/**
 * Add notification for user
 */
export async function addNotification(userId, title, message, type = "info") {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error adding notification:", error);
  }
}
