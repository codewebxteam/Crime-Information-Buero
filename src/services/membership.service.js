import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { uploadImageToCloudinary, uploadToCloudinary } from "./cloudinary.service";

/**
 * Upload file to Cloudinary
 */
export async function uploadFile(file, folder) {
  if (!file) return "";
  
  try {
    // Determine resource type based on file type
    const resourceType = file.type.startsWith('image/') ? 'image' : 'auto';
    const url = await uploadToCloudinary(file, folder, resourceType);
    return url;
  } catch (error) {
    console.error("Error uploading file:", error);
    return "";
  }
}

/**
 * Submit membership application
 * Password is stored temporarily (in production, use secure backend)
 * Status is set to "Pending"
 */
export async function submitMembershipApplication(payload) {
  const {
    fullName,
    email,
    password, // Stored temporarily - should be encrypted in production
    phone,
    address,
    dob,
    gender,
    state,
    district,
    membershipLevel,
    photoFile,
    kycFile
  } = payload;

  // Upload photo if provided
  let photoUrl = "";
  if (photoFile) {
    photoUrl = await uploadFile(photoFile, 'photos');
  }

  // Upload KYC document if provided
  let kycUrl = "";
  if (kycFile) {
    kycUrl = await uploadFile(kycFile, 'kyc');
  }

  // Create application document
  const docRef = await addDoc(collection(db, "membershipApplications"), {
    // Personal Information
    fullName,
    email,
    phone,
    address,
    dob,
    gender,
    state,
    district,
    
    // Membership Details
    membershipLevel,
    
    // Documents
    photoUrl,
    kycUrl,
    
    // Status (default: Pending)
    status: "Pending",
    
    // Temporary password reference (NOTE: In production, encrypt this or use secure backend)
    // SECURITY NOTE: This is for demo purposes only. In production, use Firebase Cloud Functions
    // to create the user account only after admin approval
    tempPasswordHash: btoa(password), // Simple encoding - NOT secure for production
    
    // Tracking
    remarks: "",
    memberId: "",
    certificateId: "",
    idCardUrl: "",
    certificateUrl: "",
    
    // Timestamps
    submittedAt: serverTimestamp(),
    approvedAt: null,
    rejectedAt: null,
    approvedBy: null,
    rejectedBy: null,
    
    // Tracking status
    trackStatus: "Application Received",
  });

  return docRef.id;
}

/**
 * Get all membership applications
 */
export async function getAllApplications() {
  const q = query(
    collection(db, "membershipApplications"),
    orderBy("submittedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get applications by status
 */
export async function getApplicationsByStatus(status) {
  const q = query(
    collection(db, "membershipApplications"),
    where("status", "==", status),
    orderBy("submittedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get single application by ID
 */
export async function getApplicationById(appId) {
  const docRef = doc(db, "membershipApplications", appId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

/**
 * Get application by email (for checking if already applied)
 */
export async function getApplicationByEmail(email) {
  const q = query(
    collection(db, "membershipApplications"),
    where("email", "==", email)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

/**
 * Update application status to Approved
 */
export async function approveApplication(appId, adminUid, memberId, certificateId) {
  const docRef = doc(db, "membershipApplications", appId);
  await updateDoc(docRef, {
    status: "Approved",
    memberId,
    certificateId,
    approvedBy: adminUid,
    approvedAt: serverTimestamp(),
    trackStatus: "Approved - Account Created",
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update application status to Rejected
 */
export async function rejectApplication(appId, adminUid, remarks = "") {
  const docRef = doc(db, "membershipApplications", appId);
  await updateDoc(docRef, {
    status: "Rejected",
    rejectedBy: adminUid,
    rejectedAt: serverTimestamp(),
    remarks,
    trackStatus: "Application Rejected",
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update tracking status
 */
export async function updateTrackStatus(appId, trackStatus) {
  const docRef = doc(db, "membershipApplications", appId);
  await updateDoc(docRef, {
    trackStatus,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get applications by state (for state admins)
 */
export async function getApplicationsByState(state) {
  const q = query(
    collection(db, "membershipApplications"),
    where("state", "==", state),
    orderBy("submittedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get applications by district (for district admins)
 */
export async function getApplicationsByDistrict(state, district) {
  const q = query(
    collection(db, "membershipApplications"),
    where("state", "==", state),
    where("district", "==", district),
    orderBy("submittedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Search applications by name or email
 */
export async function searchApplications(searchTerm) {
  const allApps = await getAllApplications();
  const term = searchTerm.toLowerCase();
  return allApps.filter(app => 
    (app.fullName && app.fullName.toLowerCase().includes(term)) ||
    (app.email && app.email.toLowerCase().includes(term)) ||
    (app.phone && app.phone.includes(term)) ||
    (app.memberId && app.memberId.toLowerCase().includes(term))
  );
}
