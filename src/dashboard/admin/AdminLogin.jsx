import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Mail,
  AlertCircle,
  Loader2,
} from "lucide-react";

// Firebase imports
import { auth } from "../../firebase/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const from = location.state?.from?.pathname || "/dashboard";

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      const uid = userCredential.user.uid;

      // Check if user exists in admins collection
      const adminDoc = await getDoc(doc(db, "admins", uid));

      if (!adminDoc.exists()) {
        // Not an admin, sign out and show error
        await signOut(auth);
        throw new Error("You are not authorized to access admin panel");
      }

      const adminData = adminDoc.data();

      // Verify role - allow all admin roles (super_admin, national_admin, state_admin, district_admin)
      const normalizedRole = adminData.role
        ?.trim()
        .toLowerCase()
        .replace(" ", "_");
      const allowedRoles = [
        "super_admin",
        "national_admin",
        "state_admin",
        "district_admin",
      ];

      if (!allowedRoles.includes(normalizedRole)) {
        await signOut(auth);
        throw new Error("You are not authorized to access admin panel");
      }

      // Check status
      if (adminData.status === "inactive") {
        await signOut(auth);
        throw new Error("Your admin account is inactive");
      }

      // Success - navigate to admin dashboard
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Admin login error:", err);

      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password");
      } else if (err.code === "auth/user-not-found") {
        setError("No admin account found with this email");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format");
      } else {
        setError(err.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#002B5B] rounded-3xl mb-4">
            <Shield className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-black text-[#002B5B] dark:text-white uppercase italic tracking-tighter">
            Admin <span className="text-red-700">HQ</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">
            Admin Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#111] p-8 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5">
          <h2 className="text-xl font-black text-[#002B5B] dark:text-white uppercase mb-6 text-center">
            Super Admin Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                Admin Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInput}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 pl-12 rounded-2xl text-sm font-bold focus:border-red-700 outline-none"
                  placeholder="admin@cib.gov.in"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInput}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 pl-12 pr-12 rounded-2xl text-sm font-bold focus:border-red-700 outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl">
                <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
                <p className="text-xs font-bold text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#002B5B] hover:bg-red-700 disabled:opacity-50 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <LogIn size={18} /> Admin Login
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xs text-gray-400 hover:text-red-700 font-bold"
            >
              Member Login →
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-400 mt-8 uppercase tracking-widest">
          Authorized Admin Access Only
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
