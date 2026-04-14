import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Mail,
  BadgeCheck,
  AlertCircle,
  Loader2,
  ArrowRight
} from "lucide-react";

// Firebase imports
import { auth } from "../firebase/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  setDoc
} from "firebase/firestore";

import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { refreshUser, setUserFromFirestore } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const loginType = "member";

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleInput = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let uid = null;

      // MEMBER LOGIN
      // First check if user is an anchor - try Firebase sign in
      try {
        const testCredential = await signInWithEmailAndPassword(
          auth,
          formData.email.trim(),
          formData.password
        );
        console.log("Firebase login successful, user:", testCredential.user.uid);
        
        // If Firebase sign-in succeeds, check if user is an anchor
        const anchorQuery = query(
          collection(db, "anchors"),
          where("uid", "==", testCredential.user.uid)
        );
        const anchorSnap = await getDocs(anchorQuery);
        console.log("Anchor query result:", anchorSnap.size);
        
        if (!anchorSnap.empty) {
          // User is an anchor - store in localStorage and redirect
          const anchorData = anchorSnap.docs[0].data();
          localStorage.setItem("anchorAuth", JSON.stringify({
            uid: testCredential.user.uid,
            email: anchorData.email,
            name: anchorData.name,
            role: "anchor",
            isAnchor: true
          }));
          console.log("Anchor found, redirecting to dashboard");
          navigate("/anchor/dashboard", { replace: true });
          return;
        }
        
        console.log("User is not an anchor, continuing...");
        // Not an anchor, sign out and continue to member check
        await signOut(auth);
      } catch (firebaseError) {
        console.log("Firebase auth failed:", firebaseError.message);
        // Firebase auth failed - continue to check membership
        // This is expected for non-Firebase member accounts
      }

      // Clear any old auth session, especially old admin session
      if (auth.currentUser) {
        await signOut(auth);
      }

      const emailLower = formData.email.toLowerCase().trim();
      const passwordHash = btoa(formData.password);

      const approvedQuery = query(
        collection(db, "membershipApplications"),
        where("email", "==", emailLower),
        where("status", "==", "Approved")
      );

      const approvedSnapshot = await getDocs(approvedQuery);

      if (approvedSnapshot.empty) {
        const anyAppQuery = query(
          collection(db, "membershipApplications"),
          where("email", "==", emailLower)
        );

        const anyAppSnapshot = await getDocs(anyAppQuery);

        if (anyAppSnapshot.empty) {
          // Check if user might be an anchor before showing error
          const anchorQuery = query(
            collection(db, "anchors"),
            where("email", "==", emailLower)
          );
          const anchorSnapshot = await getDocs(anchorQuery);
          
          if (!anchorSnapshot.empty) {
            // User is an anchor - redirect to anchor login
            navigate("/anchor/dashboard", { replace: true });
            return;
          }
          
          throw new Error("No account found with this email.");
        }

        const appData = anyAppSnapshot.docs[0].data();

        if (appData.status === "Pending") {
          throw new Error("Your application is still pending approval.");
        } else if (appData.status === "Rejected") {
          throw new Error("Your application has been rejected.");
        } else {
          throw new Error("Unable to login. Please contact admin.");
        }
      }

      const appDoc = approvedSnapshot.docs[0];
      const appData = appDoc.data();

      if (!appData.tempPasswordHash || appData.tempPasswordHash !== passwordHash) {
        throw new Error("Invalid password.");
      }

      uid = appDoc.id;

      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      let memberData = null;

      if (!userSnap.exists()) {
        memberData = {
          uid: uid,
          email: appData.email || "",
          name: appData.fullName || appData.name || "",
          phone: appData.phone || "",
          address: appData.address || "",
          state: appData.state || "",
          district: appData.district || "",
          role: "member",
          status: "active",
          memberId: appData.memberId || "",
          certificateId: appData.certificateId || "",
          photoUrl: appData.photoUrl || "",
          applicationId: appDoc.id,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await setDoc(userRef, memberData);
      } else {
        memberData = userSnap.data();
      }

      if (!memberData) {
        throw new Error("Member account data not found.");
      }

      if (memberData.role !== "member") {
        throw new Error("Invalid account type.");
      }

      if (memberData.status === "inactive") {
        throw new Error("Your account is inactive. Contact admin.");
      }

      // Store member session in localStorage
      localStorage.setItem("memberAuth", JSON.stringify({ ...memberData, uid, role: "member", isAdmin: false }));

      // Explicitly set member in auth context
      setUserFromFirestore({
        ...memberData,
        uid,
        role: "member",
        isAdmin: false
      });

      navigate("/member/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);

      if (err.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid credentials.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err.message || "Login failed! Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#080808] px-6 py-12 transition-colors duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-700/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#002B5B]/5 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-[#111] rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden relative">
          <div className="h-2 bg-gradient-to-r from-[#002B5B] via-red-700 to-[#002B5B]" />

          <div className="p-10">
            <div className="text-center mb-8">
              <div className="bg-red-50 dark:bg-red-950/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border-b-4 border-red-700">
                <Shield size={40} className="text-red-700" />
              </div>

              <div className="inline-flex items-center gap-2 bg-[#002B5B] text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.4em] mb-4">
                <BadgeCheck size={12} className="text-red-500" />
                Member Access
              </div>

              <h2 className="text-3xl font-black text-[#002B5B] dark:text-white uppercase tracking-tighter">
                Member{" "}
                <span className="text-red-700 italic">Login</span>
              </h2>

              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
                Approved Members Only
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl">
                <p className="text-xs font-bold text-red-600 dark:text-red-400 text-center">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-700 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    autoComplete="username"
                    value={formData.email}
                    onChange={handleInput}
                    required
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 pl-12 rounded-2xl focus:border-red-700 transition-all outline-none text-sm font-bold text-[#002B5B] dark:text-white"
                    placeholder="Enter member email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-700 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInput}
                    required
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 pl-12 pr-12 rounded-2xl focus:border-red-700 transition-all outline-none text-sm font-bold text-[#002B5B] dark:text-white"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                disabled={isLoading}
                type="submit"
                className="w-full bg-[#002B5B] hover:bg-red-700 text-white font-black uppercase tracking-[0.3em] py-5 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>

              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/user")}
                  className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:text-red-700 transition-colors"
                >
                  <ArrowRight size={12} />
                  Apply for Membership
                </button>
              </div>

              <div className="pt-4 text-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  <AlertCircle size={10} className="text-red-700" />
                  IP Address is being logged for security
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default LoginPage;