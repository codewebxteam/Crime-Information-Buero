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

/* -------------------- ID helpers -------------------- */
function pad4(n) {
  return String(n).padStart(4, "0");
}

function makeMemberId(counter) {
  const year = new Date().getFullYear();
  return `CIB-${year}-${pad4(counter)}`;
}

function makeCertificateId(counter) {
  const year = new Date().getFullYear();
  return `CERT-${year}-${pad4(counter)}`;
}

/* -------------------- READ: Applications -------------------- */

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

export async function fetchApplicationById(appId) {
  const ref = doc(db, "membershipApplications", appId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function fetchApplicationsByUserId(userId) {
  const q = query(
    collection(db, "membershipApplications"),
    where("userId", "==", userId),
    orderBy("submittedAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* -------------------- WRITE: Tracking status -------------------- */

export async function updateApplicationTrackStatus(appId, trackStatus) {
  if (!appId) throw new Error("appId missing");

  await updateDoc(doc(db, "membershipApplications", appId), {
    trackStatus,
    updatedAt: serverTimestamp(),
  });
}

/* -------------------- WRITE: Approve / Reject -------------------- */

export async function approveApplication({ appId, adminUid, applicant }) {
  if (!appId) throw new Error("appId missing");
  if (!adminUid) throw new Error("adminUid missing");

  const applicantName = applicant?.fullName || applicant?.name;
  if (!applicantName) throw new Error("applicant.name or fullName missing");
  if (!applicant?.email) throw new Error("applicant.email missing");

  let password = "";
  if (applicant.tempPasswordHash) {
    try {
      password = atob(applicant.tempPasswordHash);
    } catch (e) {
      console.warn("Could not decode tempPasswordHash, using fallback password");
      password = "CIB" + appId.substring(0, 6);
    }
  } else {
    password = "CIB" + appId.substring(0, 6);
  }

  const settingsRef = doc(db, "settings", "app");
  const appRef = doc(db, "membershipApplications", appId);

  const result = await runTransaction(db, async (tx) => {
    const settingsSnap = await tx.get(settingsRef);

    if (!settingsSnap.exists()) {
      throw new Error("settings/app document is missing");
    }

    const s = settingsSnap.data();

    const nextMemberCounter = Number(s.lastMemberCounter || 0) + 1;
    const nextCertCounter = Number(s.lastCertificateCounter || 0) + 1;

    const memberId = makeMemberId(nextMemberCounter);
    const certificateId = makeCertificateId(nextCertCounter);

    tx.update(settingsRef, {
      lastMemberCounter: nextMemberCounter,
      lastCertificateCounter: nextCertCounter,
      updatedAt: serverTimestamp(),
    });

    tx.update(appRef, {
      status: "Approved",
      memberId,
      certificateId,
      certificateUrl: "",
      remarks: "",
      approvedBy: adminUid,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      uid: "",
    });

    const certRef = doc(db, "certificates", certificateId);
    tx.set(certRef, {
      certificateId,
      memberId,
      appId,
      userId: applicant.userId || appId,
      name: applicantName,
      level:
        applicant.levelRequested ||
        applicant.membershipLevel ||
        applicant.level ||
        "",
      certificateUrl: "",
      issuedAt: serverTimestamp(),
      issuedBy: adminUid,
    });

    return { memberId, certificateId };
  });

  let newUid = "";

  try {
    // Secondary auth use kar rahe hain, isliye super admin session change nahi hoga
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      applicant.email,
      password
    );

    newUid = userCredential.user.uid;

    await updateDoc(appRef, {
      uid: newUid,
      updatedAt: serverTimestamp(),
    });

    // Secondary created session ko immediately logout
    await signOut(secondaryAuth);
  } catch (authError) {
    if (authError.code === "auth/email-already-in-use") {
      console.log("User already exists in Firebase Auth:", applicant.email);
      newUid = appId;
    } else {
      console.warn("Firebase Auth create failed:", authError.message);
      newUid = appId;
    }

    await updateDoc(appRef, {
      uid: newUid,
      updatedAt: serverTimestamp(),
    });
  }

  try {
    await setDoc(doc(db, "users", newUid), {
      uid: newUid,
      email: applicant.email,
      name: applicantName,
      phone: applicant.phone || "",
      address: applicant.address || "",
      state: applicant.state || "",
      district: applicant.district || "",
      role: "member",
      status: "active",
      memberId: result.memberId,
      certificateId: result.certificateId,
      photoUrl: applicant.photoUrl || "",
      applicationId: appId,
      idCardUrl: "",
      certificateUrl: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("User created in users collection:", applicant.email);
  } catch (userError) {
    console.error("Error creating user document:", userError);
  }

  return result;
}

export async function rejectApplication(appId, adminUid, remarks = "") {
  if (!appId) throw new Error("appId missing");
  if (!adminUid) throw new Error("adminUid missing");

  await updateDoc(doc(db, "membershipApplications", appId), {
    status: "Rejected",
    remarks,
    approvedBy: adminUid,
    approvedAt: serverTimestamp(),
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

export async function updateCertificateUrl({ appId, certificateId, url }) {
  if (!appId) throw new Error("appId missing");
  if (!certificateId) throw new Error("certificateId missing");
  if (!url) throw new Error("url missing");

  await updateDoc(doc(db, "certificates", certificateId), {
    certificateUrl: url,
  });

  await updateDoc(doc(db, "membershipApplications", appId), {
    certificateUrl: url,
    updatedAt: serverTimestamp(),
  });
}