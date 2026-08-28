import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";

const AuthContext = createContext(null);

// Store admin UID to prevent session loss during user creation
let preservedAdminUid = null;
let preservedAdminData = null;

export function preserveAdminSession(uid, adminData) {
  preservedAdminUid = uid;
  preservedAdminData = adminData;
}

export function clearAdminSession() {
  preservedAdminUid = null;
  preservedAdminData = null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isManualSet = useRef(false); // Flag to prevent race conditions

  // Function to fetch user role from Firestore
  const fetchUserRole = async (firebaseUser) => {
    if (!firebaseUser) return null;
    
    try {
      // Check anchors collection - query by uid field (not document ID)
      const anchorQuery = query(collection(db, "anchors"), where("uid", "==", firebaseUser.uid));
      const anchorSnap = await getDocs(anchorQuery);
      if (!anchorSnap.empty) {
        const anchorData = anchorSnap.docs[0].data();
        return {
          ...anchorData,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          isAdmin: false,
          isAnchor: true,
          role: "anchor"
        };
      }
      
      // Check admins collection first
      const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        const normalizedRole = adminData.role?.trim().toLowerCase().replace(" ", "_");
        // IMPORTANT: Spread adminData FIRST, then set correct values
        return {
          ...adminData,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          isAdmin: true,  // ALWAYS override to true for admins collection
          role: normalizedRole || "admin"
        };
      }
      
      // Check users collection
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Spread userData first, then set correct values to OVERWRITE any wrong values
        return {
          ...userData,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          isAdmin: false,  // ALWAYS override to false
          role: "member"  // ALWAYS set to member
        };
      }
      
      // Check membership applications
      const appDoc = await getDoc(doc(db, "membershipApplications", firebaseUser.uid));
      if (appDoc.exists()) {
        const appData = appDoc.data();
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          isAdmin: false,
          role: "pending",
          status: appData.status
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Skip if user was manually set by login (to prevent race condition)
      if (isManualSet.current) {
        isManualSet.current = false; // Reset for next time
        setLoading(false);
        return;
      }

      // Check if we have a preserved admin session (admin is approving a member)
      if (preservedAdminUid && preservedAdminData && firebaseUser && firebaseUser.uid === preservedAdminUid) {
        // Restore admin session
        setUser(preservedAdminData);
        setLoading(false);
        return;
      }

      if (!firebaseUser) {
        const memberSession = localStorage.getItem("memberAuth");
        if (memberSession) {
          try {
            const parsed = JSON.parse(memberSession);
            if (parsed && parsed.role === "member") {
              setUser({ ...parsed, isAdmin: false });
              setLoading(false);
              return;
            }
          } catch (_) { localStorage.removeItem("memberAuth"); }
        }
        setUser(null);
      } else {
        // Fetch user role from Firestore
        const userWithRole = await fetchUserRole(firebaseUser);
        if (userWithRole) {
          setUser(userWithRole);
        } else {
          // User exists in Auth but no Firestore record
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            isAdmin: false,
            role: null
          });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to set user role after checking Firestore
  const setUserRole = (roleData) => {
    setUser(prev => prev ? { ...prev, ...roleData } : roleData);
  };

  // Function to manually set user (for Firestore-based auth)
  // This prevents the onAuthStateChanged from overriding
  const setUserFromFirestore = (userData) => {
    // Always ensure correct values are set
    const cleanUserData = {
      ...userData,
      isAdmin: false,
      role: "member"
    };
    isManualSet.current = true; // Flag to skip onAuthStateChanged
    setUser(cleanUserData);
  };

  // Function to manually refresh user data
  const refreshUser = async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      isManualSet.current = true; // Prevent race condition
      const userWithRole = await fetchUserRole(firebaseUser);
      if (userWithRole) {
        setUser(userWithRole);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUserRole, refreshUser, setUserFromFirestore }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper hooks
export function useIsAdmin() {
  const { user, loading } = useAuth();
  return { isAdmin: user?.isAdmin === true, loading, user };
}

export function useIsMember() {
  const { user, loading } = useAuth();
  return { isMember: user?.role === "member" && !user?.isAdmin, loading, user };
}

export function useCurrentUser() {
  const { user, loading } = useAuth();
  return { user, loading };
}

// Helper hook for Anchor
export function useIsAnchor() {
  const { user, loading } = useAuth();
  return { isAnchor: user?.isAnchor === true, loading, user };
}
