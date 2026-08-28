import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Loader2, Mail, Lock, Eye, EyeOff, Shield, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const CRIME_SACH_LOGO = 'https://res.cloudinary.com/daj1kyrzf/image/upload/v1787938859/general/mwt0x23ao8feo7nuv8kt.jpg';

const AnchorLogin = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if already logged in as anchor - redirect to dashboard
  useEffect(() => {
    const anchorAuth = localStorage.getItem('anchorAuth');
    if (anchorAuth) {
      const parsed = JSON.parse(anchorAuth);
      if (parsed.role === 'anchor') {
        navigate('/anchor/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const anchorQuery = query(collection(db, "anchors"), where("uid", "==", uid));
      const anchorSnap = await getDocs(anchorQuery);

      if (anchorSnap.empty) {
        await signOut(auth);
        setError("Access denied. Anchor credentials required.");
        setLoading(false);
        return;
      }

      const anchorData = anchorSnap.docs[0].data();
      
      if (anchorData.status === "inactive") {
        await signOut(auth);
        setError("Your account has been deactivated. Please contact administrator.");
        setLoading(false);
        return;
      }

      localStorage.setItem("anchorAuth", JSON.stringify({
        uid,
        email: anchorData.email,
        name: anchorData.name,
        role: "anchor",
        isAnchor: true
      }));

      navigate("/anchor/dashboard", { replace: true });
    } catch (err) {
      console.error("Anchor login error:", err);
      if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#001a3a] p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.02]">
          <img src={CRIME_SACH_LOGO} className="w-full h-full object-contain" alt="" />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img src={CRIME_SACH_LOGO} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white/10 shadow-2xl shadow-red-900/20" alt="Crime Sach News" />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-[#0d1526] flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-[1000] text-white uppercase italic tracking-tight mt-5">
            Crime Sach <span className="text-red-500">News</span>
          </h1>
          <p className="text-white/30 text-[10px] mt-1 uppercase tracking-[0.4em] font-bold">Anchor Portal • News Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10">
          <h2 className="text-lg font-black text-white uppercase text-center mb-6 tracking-wider">
            Anchor <span className="text-red-500">Sign In</span>
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-[0.2em]">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-white/20" />
                </div>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all text-white font-medium placeholder-white/20"
                  placeholder="Enter your email" required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-[0.2em]">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-white/20" />
                </div>
                <input
                  type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-14 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all text-white font-medium placeholder-white/20"
                  placeholder="Enter your password" required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  {showPassword ? <EyeOff className="h-4 w-4 text-white/30 hover:text-white/60" /> : <Eye className="h-4 w-4 text-white/30 hover:text-white/60" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-red-900/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]">
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /><span>Signing In...</span></>
              ) : (
                <><span>Sign In</span><ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          {/* Back Link */}
          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-white/30 hover:text-white/60 font-medium transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/15 text-[10px] mt-6 font-bold uppercase tracking-widest">
          © 2026 Crime Sach News. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AnchorLogin;