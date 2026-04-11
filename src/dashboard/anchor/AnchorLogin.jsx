import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Loader2, Mail, Lock, Eye, EyeOff, Shield, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

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
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Check if user is an anchor (anchors stored by auto-id, query by uid)
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

      // Store anchor info in localStorage
      localStorage.setItem("anchorAuth", JSON.stringify({
        uid,
        email: anchorData.email,
        name: anchorData.name,
        role: "anchor",
        isAnchor: true
      }));

      console.log("Anchor login successful, navigating to dashboard...");
      
      // Navigate to anchor dashboard
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
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9] dark:bg-[#0f0f0f] p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23002B5B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#002B5B] rounded-2xl mb-4 shadow-xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-[#002B5B] dark:text-white uppercase italic">
            CIB <span className="text-red-600">Anchor</span>
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">News Management Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-[#111] rounded-3xl shadow-2xl p-8">
          <h2 className="text-xl font-black text-[#002B5B] dark:text-white uppercase mb-6 text-center">
            Anchor Login
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#002B5B] focus:border-transparent outline-none transition-all text-gray-900 dark:text-white font-medium"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-14 py-3.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#002B5B] focus:border-transparent outline-none transition-all text-gray-900 dark:text-white font-medium"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#002B5B] hover:bg-[#001d40] text-white font-black uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link 
              to="/" 
              className="text-sm text-gray-500 hover:text-[#002B5B] dark:hover:text-white font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          © 2024 CIB News Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AnchorLogin;