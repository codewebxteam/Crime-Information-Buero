import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Shield, Lock, Eye, EyeOff, LogIn, Mail,
  AlertCircle, Loader2, Home, User, ChevronRight
} from "lucide-react";

// Firebase imports
import { auth, db } from "../../firebase/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
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
      const userCredential = await signInWithEmailAndPassword(
        auth, formData.email, formData.password
      );
      const uid = userCredential.user.uid;
      const adminDoc = await getDoc(doc(db, "admins", uid));

      if (!adminDoc.exists()) {
        await signOut(auth);
        throw new Error("Unauthorized Access Detected.");
      }

      const adminData = adminDoc.data();
      const normalizedRole = adminData.role?.trim().toLowerCase().replace(" ", "_");
      const allowedRoles = ["super_admin", "national_admin", "state_admin", "district_admin"];

      if (!allowedRoles.includes(normalizedRole)) {
        await signOut(auth);
        throw new Error("Insufficient Privileges.");
      }

      if (adminData.status === "inactive") {
        await signOut(auth);
        throw new Error("Account Suspended.");
      }

      navigate(from, { replace: true });
    } catch (err) {
      console.error("Admin login error:", err);
      if (err.code === "auth/invalid-credential") {
        setError("Invalid Credentials.");
      } else {
        setError(err.message || "Login sequence failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#f4f7f9] dark:bg-[#0a0a0a]">
      
      {/* 🔴 DEEP RED GRADIENT BLOBS (Non-Dark Background) */}
      <div className="absolute inset-0 z-0">
        {/* Deep Blood Red Gradient at top left */}
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-red-900/10 blur-[100px] rounded-full"></div>
        {/* Deep Maroon Gradient at bottom right */}
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-red-950/5 blur-[100px] rounded-full"></div>
      </div>

      {/* 🛰️ NAVBAR */}
      <nav className="relative z-20 w-full py-5 px-8 flex justify-between items-center bg-white/70 dark:bg-black/40 backdrop-blur-xl border-b border-gray-200 dark:border-white/5">
        <Link to="/" className="flex items-center gap-3 group">
           <div className="p-2 bg-red-700/5 rounded-lg border border-red-700/10 group-hover:bg-red-700 group-hover:text-white transition-all duration-300">
             <Shield className="text-red-700 group-hover:text-white" size={22} />
           </div>
           <div className="flex flex-col">
             <span className="font-black uppercase tracking-tighter text-[#002B5B] dark:text-white text-xl leading-none italic">
               Admin<span className="text-red-700">HQ</span>
             </span>
             <span className="text-[7px] text-gray-400 uppercase tracking-[0.4em] font-bold">Secure Command</span>
           </div>
        </Link>
        
        <Link to="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-700 hover:text-white hover:bg-red-700 px-5 py-2.5 rounded-xl border-2 border-red-700/20 transition-all duration-300 shadow-lg shadow-red-700/5">
          <Home size={14} /> Back to Home
        </Link>
      </nav>

      {/* 🔐 COMPACT LOGIN CARD */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-sm">
          
          <div className="bg-white/90 dark:bg-[#111]/90 backdrop-blur-2xl p-8 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white dark:border-white/5 relative group">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-800 rounded-2xl mb-4 shadow-xl shadow-red-900/20 transition-transform group-hover:scale-105">
                <Lock className="text-white" size={28} />
              </div>
              <h2 className="text-xl font-[1000] text-[#002B5B] dark:text-white uppercase tracking-tight italic">Bureau <span className="text-red-700">Login</span></h2>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Authorized Access Only</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Identity</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-red-700 transition-colors" size={16} />
                  <input
                    type="email" name="email" value={formData.email} onChange={handleInput}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 pl-12 rounded-2xl text-xs font-bold focus:border-red-700 outline-none transition-all dark:text-white"
                    placeholder="admin@cib.gov.in" required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-red-700 transition-colors" size={16} />
                  <input
                    type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInput}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 pl-12 pr-12 rounded-2xl text-xs font-bold focus:border-red-700 outline-none transition-all dark:text-white"
                    placeholder="••••••••" required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-700 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/20 rounded-2xl animate-shake">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={16} />
                  <p className="text-[10px] font-bold text-red-600 uppercase leading-tight">{error}</p>
                </div>
              )}

              <button
                type="submit" disabled={isLoading}
                className="w-full bg-[#002B5B] dark:bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white py-4.5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-red-900/20 group/btn"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Sign In <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 text-[9px] font-black text-gray-400 hover:text-[#002B5B] dark:hover:text-red-500 uppercase tracking-[0.2em] transition-all"
              >
                <User size={12} /> Member Access Portal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📝 FOOTER */}
      <footer className="relative z-10 w-full py-8 text-center bg-white/50 dark:bg-black/20 backdrop-blur-sm border-t border-gray-100 dark:border-white/5">
        <p className="text-[9px] text-gray-400 uppercase tracking-[0.4em] font-bold">
          Crime Information Bureau | Authorized Intelligence Personnel
        </p>
      </footer>
    </div>
  );
};

export default AdminLogin;