import { db, secondaryAuth } from "../firebase/firebase";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  getDoc,
  orderBy,
  query,
  where,
  doc,
  runTransaction,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

/* -------------------- ID Helpers -------------------- */

// Updated: 5 digits handle karne ke liye pad5 function
function pad5(n) {
  return String(n).padStart(5, "0");
}

function makeMemberId(counter) {
  const year = new Date().getFullYear();
  // Example Result: CIB-2026-90350
  return `CIB-${year}-${pad5(counter)}`;
}

function makeCertificateId(counter) {
  const year = new Date().getFullYear();
  // Certificate ID ko bhi uniform rakhne ke liye pad5 use kar rahe hain
  return `CERT-${year}-${pad5(counter)}`;
}

/* -------------------- READ Functions -------------------- */

export async function fetchAllApplications() {
  const q = query(
    collection(db, "membershipApplications"),
    orderBy("submittedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchPendingApplications() {
  const q = query(
    collection(db, "membershipApplications"),
    where("status", "==", "Pending"),
    orderBy("submittedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* -------------------- WRITE Functions -------------------- */

export async function approveApplication({ appId, adminUid, applicant }) {
  if (!appId || !adminUid) throw new Error("Missing appId or adminUid");

  const applicantName = applicant?.fullName || applicant?.name || "Member";
  const email = applicant?.email;
  const password = "CIB" + appId.substring(0, 6);

  const appRef = doc(db, "membershipApplications", appId);

  try {
    const result = await runTransaction(db, async (tx) => {
      // Path: settings (small) -> App (Capital)
      let settingsRef = doc(db, "settings", "App");
      let settingsSnap = await tx.get(settingsRef);

      if (!settingsSnap.exists()) {
        settingsRef = doc(db, "settings", "app");
        settingsSnap = await tx.get(settingsRef);
      }

      if (!settingsSnap.exists()) {
        throw new Error("Settings document 'App' not found in Firestore.");
      }

      const s = settingsSnap.data();
      
      // Counters calculation
      const nextMemberCounter = Number(s.lastMemberIdCounter || 0) + 1;
      const nextCertCounter = Number(s.lastCertificateIdCounter || 0) + 1;

      const memberId = makeMemberId(nextMemberCounter);
      const certificateId = makeCertificateId(nextCertCounter);

      // 1. Update Settings Counters
      tx.update(settingsRef, {
        lastMemberIdCounter: nextMemberCounter,
        lastCertificateIdCounter: nextCertCounter,
        updatedAt: serverTimestamp(),
      });

      // 2. Update Application Record
      tx.update(appRef, {
        status: "Approved",
        memberId,
        certificateId,
        approvedBy: adminUid,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        remarks: "" 
      });

      // 3. Create Certificate Entry
      const certRef = doc(db, "certificates", certificateId);
      tx.set(certRef, {
        certificateId,
        memberId,
        appId,
        userId: applicant.userId || appId,
        name: applicantName,
        level: applicant.membershipLevel || applicant.levelRequested || "Standard",
        issuedAt: serverTimestamp(),
        issuedBy: adminUid,
        certificateUrl: "",
      });

      return { memberId, certificateId };
    });

    // Handle User Creation in Secondary Auth
    let newUid = appId;
    try {
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      newUid = userCred.user.uid;
      await signOut(secondaryAuth);
    } catch (e) {
      console.warn("Auth creation skipped/failed:", e.message);
    }

    await updateDoc(appRef, { uid: newUid });

    // Create User Document
    await setDoc(doc(db, "users", newUid), {
      uid: newUid,
      email,
      name: applicantName,
      role: "member",
      status: "active",
      memberId: result.memberId,
      certificateId: result.certificateId,
      applicationId: appId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return result;
  } catch (error) {
    console.error("Approve Transaction Failed:", error);
    throw error;
  }
}

export async function rejectApplication(appId, adminUid, remarks = "") {
  if (!appId || !adminUid) throw new Error("Missing appId or adminUid");
  const appRef = doc(db, "membershipApplications", appId);

  await updateDoc(appRef, {
    status: "Rejected",
    remarks: remarks,
    rejectedBy: adminUid,
    rejectedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateApplicationTrackStatus(appId, trackStatus) {
  if (!appId) throw new Error("appId missing");
  await updateDoc(doc(db, "membershipApplications", appId), {
    trackStatus,
    updatedAt: serverTimestamp(),
  });
}

export async function updateCertificateUrl({ appId, certificateId, url }) {
  if (!appId || !certificateId || !url) throw new Error("Missing required fields");

  await updateDoc(doc(db, "certificates", certificateId), {
    certificateUrl: url,
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "membershipApplications", appId), {
    certificateUrl: url,
    updatedAt: serverTimestamp(),
  });
}

export async function setApplicationDecisionStatus(appId, status) {
  if (!appId) throw new Error("appId missing");
  await updateDoc(doc(db, "membershipApplications", appId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function fetchApplicationById(appId) {
  const ref = doc(db, "membershipApplications", appId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}