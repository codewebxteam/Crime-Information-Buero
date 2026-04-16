import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
import { auth, db } from "../firebase/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
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

      try {
        const testCredential = await signInWithEmailAndPassword(
          auth,
          formData.email.trim(),
          formData.password
        );
        
        const anchorQuery = query(
          collection(db, "anchors"),
          where("uid", "==", testCredential.user.uid)
        );
        const anchorSnap = await getDocs(anchorQuery);
        
        if (!anchorSnap.empty) {
          const anchorData = anchorSnap.docs[0].data();
          localStorage.setItem("anchorAuth", JSON.stringify({
            uid: testCredential.user.uid,
            email: anchorData.email,
            name: anchorData.name,
            role: "anchor",
            isAnchor: true
          }));
          navigate("/anchor/dashboard", { replace: true });
          return;
        }
        await signOut(auth);
      } catch (firebaseError) {
        // Expected for non-Firebase member accounts
      }

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
          const anchorQuery = query(
            collection(db, "anchors"),
            where("email", "==", emailLower)
          );
          const anchorSnapshot = await getDocs(anchorQuery);
          
          if (!anchorSnapshot.empty) {
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

      localStorage.setItem("memberAuth", JSON.stringify({ ...memberData, uid, role: "member", isAdmin: false }));

      setUserFromFirestore({
        ...memberData,
        uid,
        role: "member",
        isAdmin: false
      });

      navigate("/member/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed! Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#080808] px-6 py-8 transition-colors duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-700/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#002B5B]/5 rounded-full blur-[100px] -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm" // Reduced from max-w-md to max-w-sm
      >
        <div className="bg-white dark:bg-[#111] rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden relative">
          <div className="h-1.5 bg-gradient-to-r from-[#002B5B] via-red-700 to-[#002B5B]" />

          <div className="p-7"> {/* Reduced padding from p-10 to p-7 */}
            <div className="text-center mb-6">
              <div className="bg-red-50 dark:bg-red-950/20 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 border-b-2 border-red-700">
                <Shield size={28} className="text-red-700" />
              </div>

              <div className="inline-flex items-center gap-2 bg-[#002B5B] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.3em] mb-3">
                <BadgeCheck size={10} className="text-red-500" />
                Member Access
              </div>

              <h2 className="text-2xl font-black text-[#002B5B] dark:text-white uppercase tracking-tighter">
                Member <span className="text-red-700 italic">Login</span>
              </h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-[10px] font-bold text-red-600 dark:text-red-400 text-center uppercase">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 pl-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-700 transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInput}
                    required
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-3.5 pl-11 rounded-xl focus:border-red-700 transition-all outline-none text-xs font-bold text-[#002B5B] dark:text-white"
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 pl-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-700 transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInput}
                    required
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-3.5 pl-11 pr-11 rounded-xl focus:border-red-700 transition-all outline-none text-xs font-bold text-[#002B5B] dark:text-white"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                disabled={isLoading}
                type="submit"
                className="w-full bg-[#002B5B] hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] py-4 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><LogIn size={16} /> Sign In</>}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100 dark:border-white/5"></span></div>
                <div className="relative flex justify-center text-[8px] uppercase font-bold tracking-widest"><span className="bg-white dark:bg-[#111] px-2 text-gray-400">New User?</span></div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/user")}
                className="w-full bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-500 font-black text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-red-700 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                Apply for Membership <ArrowRight size={12} />
              </button>

              <div className="pt-2 text-center">
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight flex items-center justify-center gap-1.5 opacity-60">
                  <AlertCircle size={9} />
                  Security: IP logged for verification
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