/**
 * Seed Data for CIB Application
 * 
 * Use this file to create initial admin accounts.
 * Run this in a secure environment (e.g., a separate setup page or Firebase Console).
 * 
 * SECURITY NOTE: This is for DEMO/TESTING purposes only.
 * In production, admin creation should be handled through a secure backend.
 */

import { auth, db } from "../firebase/firebase";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Admin Hierarchy Levels:
 * super_admin = 5 (Full access to everything)
 */

export const SEED_ADMINS = [
  {
    name: "Super Admin",
    email: "superadmin@cib.gov.in",
    password: "SuperAdmin@123",
    role: "super_admin",
    permissions: ["all"]
  },
];

const HIERARCHY_LEVELS = {
  super_admin: 5,
};

/**
 * Create a single admin account
 */
export async function createSeedAdmin(adminData) {
  try {
    console.log(`Creating admin: ${adminData.email}...`);
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminData.email,
      adminData.password
    );
    
    const uid = userCredential.user.uid;
    
    // Create admin document in Firestore
    await setDoc(doc(db, "admins", uid), {
      uid,
      name: adminData.name,
      email: adminData.email,
      role: adminData.role,
      hierarchyLevel: HIERARCHY_LEVELS[adminData.role] || 0,
      permissions: adminData.permissions || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isSeedData: true
    });
    
    console.log(`✓ Created admin: ${adminData.email} (${adminData.role})`);
    
    // Sign out after creating
    await signOut(auth);
    
    return { success: true, uid, email: adminData.email };
  } catch (error) {
    console.error(`✗ Failed to create admin ${adminData.email}:`, error);
    return { success: false, email: adminData.email, error: error.message };
  }
}

/**
 * Create all seed admins
 * WARNING: Only run this once in a controlled environment
 */
export async function createAllSeedAdmins() {
  console.log("Starting seed admin creation...");
  console.log("WARNING: This will create Firebase Auth users");
  
  const results = [];
  
  for (const adminData of SEED_ADMINS) {
    try {
      // Small delay between creations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = await createSeedAdmin(adminData);
      results.push(result);
    } catch (error) {
      console.error(`Error creating ${adminData.email}:`, error);
      results.push({ success: false, email: adminData.email, error: error.message });
    }
  }
  
  console.log("Seed admin creation complete!");
  return results;
}

/**
 * Default credentials after seeding:
 * 
 * Super Admin:
 *   Email: superadmin@cib.gov.in
 *   Password: SuperAdmin@123
 */

export default {
  SEED_ADMINS,
  createSeedAdmin,
  createAllSeedAdmins
};
