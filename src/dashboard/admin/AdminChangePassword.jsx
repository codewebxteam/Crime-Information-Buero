import React, { useState } from "react";
import { auth } from "../../firebase/firebase";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Save, Loader2, CheckCircle, XCircle, KeyRound } from "lucide-react";

const AdminChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: "", text: "" });
  };

  const togglePassword = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters" });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage({ type: "error", text: "No user logged in" });
        setLoading(false);
        return;
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, formData.newPassword);

      setMessage({ type: "success", text: "Password changed successfully!" });
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error changing password:", error);
      
      if (error.code === "auth/wrong-password") {
        setMessage({ type: "error", text: "Current password is incorrect" });
      } else if (error.code === "auth/requires-recent-login") {
        setMessage({ type: "error", text: "Please log out and log in again to change password" });
      } else {
        setMessage({ type: "error", text: "Failed to change password: " + error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white dark:bg-[#111] p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5"
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h3 className="text-lg sm:text-xl font-[1000] text-[#002B5B] dark:text-white uppercase italic flex items-center gap-3">
            <KeyRound size={24} className="text-red-700 shrink-0" /> Change Password
          </h3>
          <div className="flex items-center gap-2 bg-red-700/10 text-red-700 px-3 py-1 rounded-full w-fit">
            <Lock size={12} className="shrink-0" />
            <span className="text-[8px] font-black uppercase tracking-widest">Secure</span>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === "success" 
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" 
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
          }`}>
            {message.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span className="text-sm font-bold">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
              Current Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                className="w-full bg-gray-50 dark:bg-black pl-12 pr-12 p-4 rounded-2xl text-sm font-bold outline-none border border-gray-200 dark:border-white/10 focus:border-red-700 dark:focus:border-red-700 transition-all text-[#002B5B] dark:text-gray-200"
                required
              />
              <button 
                type="button"
                onClick={() => togglePassword('current')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
              New Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full bg-gray-50 dark:bg-black pl-12 pr-12 p-4 rounded-2xl text-sm font-bold outline-none border border-gray-200 dark:border-white/10 focus:border-red-700 dark:focus:border-red-700 transition-all text-[#002B5B] dark:text-gray-200"
                required
              />
              <button 
                type="button"
                onClick={() => togglePassword('new')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-[8px] text-gray-400 ml-1">Minimum 6 characters</p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="w-full bg-gray-50 dark:bg-black pl-12 pr-12 p-4 rounded-2xl text-sm font-bold outline-none border border-gray-200 dark:border-white/10 focus:border-red-700 dark:focus:border-red-700 transition-all text-[#002B5B] dark:text-gray-200"
                required
              />
              <button 
                type="button"
                onClick={() => togglePassword('confirm')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-red-700 hover:bg-[#002B5B] dark:hover:bg-red-800 text-white py-4 sm:py-5 rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] group disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Save size={18} className="group-hover:rotate-12 transition-transform" /> 
                Update Password
              </>
            )}
          </button>

          {/* Security Note */}
          <p className="text-center text-[8px] sm:text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest pt-2">
            Authorized Personnel Only • Secure Authentication
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminChangePassword;
