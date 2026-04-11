 import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CreditCard,
  Award,
  Activity,
  Settings,
  LogOut,
  Shield,
  Loader2,
  FileEdit,
  Newspaper,
  Users,
  KeyRound
} from "lucide-react";
import logo from "../../assets/logo.png";

import { auth, db } from "../../firebase/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Components
import AdminIdEngine from "./AdminIdEngine";
import AdminCertificate from "./AdminCertificate";
import AdminStatusTrack from "./AdminStatusTrack";
import AdminSiteConfig from "./AdminSiteConfig";
import AdminContentManager from "./AdminContentManager";
import AdminNewsManager from "./AdminNewsManager";
import AnchorManagement from "./AnchorManagement";
import AdminChangePassword from "./AdminChangePassword";
import OfficerManagement from "./OfficerManagement";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("id-gen");
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState(null);

  // ✅ Logout animation state
  const [showLogoutAnim, setShowLogoutAnim] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        localStorage.removeItem("adminAuth");
        navigate("/admin-login");
        return;
      }

      try {
        const savedAdmin = localStorage.getItem("adminAuth");
        const parsedAdmin = savedAdmin ? JSON.parse(savedAdmin) : null;

        if (parsedAdmin) {
          setCurrentAdmin({
            uid: parsedAdmin.uid || firebaseUser.uid,
            email: parsedAdmin.email || firebaseUser.email || "",
            name:
              parsedAdmin.role === "super_admin"
                ? "Super Admin"
                : parsedAdmin.name || "Admin",
            role: parsedAdmin.role || "admin",
            status: parsedAdmin.status || "active",
            state: parsedAdmin.state || "",
            district: parsedAdmin.district || ""
          });
        } else {
          setCurrentAdmin({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: "Admin",
            role: "admin",
            status: "active",
            state: "",
            district: ""
          });
        }

        const adminSnap = await getDoc(doc(db, "admins", firebaseUser.uid));

        if (adminSnap.exists()) {
          const adminData = adminSnap.data();
          const normalizedRole = adminData.role
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, "_");

          const finalAdmin = {
            uid: firebaseUser.uid,
            email: adminData.email || firebaseUser.email || "",
            name:
              normalizedRole === "super_admin"
                ? "Super Admin"
                : adminData.name || "Admin",
            role: normalizedRole || "admin",
            status: adminData.status || "active",
            state: adminData.state || "",
            district: adminData.district || ""
          };

          setCurrentAdmin(finalAdmin);
          localStorage.setItem("adminAuth", JSON.stringify(finalAdmin));
          setFirestoreError(null);
        } else {
          setFirestoreError("Admin record not found in database");
        }
      } catch (err) {
        console.error("Admin dashboard error:", err);
        setFirestoreError(err.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // ✅ Logout with animation
  const handleLogout = async () => {
    try {
      setShowLogoutAnim(true);

      setTimeout(async () => {
        localStorage.removeItem("adminAuth");
        await signOut(auth);
        navigate("/admin-login");
      }, 1800);
    } catch (e) {
      console.error(e);
      alert("Logout failed. Please try again.");
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: "bg-red-600",
      national_admin: "bg-blue-600",
      state_admin: "bg-green-600",
      district_admin: "bg-purple-600"
    };
    return colors[role] || "bg-gray-600";
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "super_admin": return "Super Admin";
      case "national_admin": return "National Admin";
      case "state_admin": return "State Admin";
      case "district_admin": return "District Admin";
      default: return "Admin";
    }
  };

  const getAvatarText = (role) => {
    switch (role) {
      case "super_admin": return "SA";
      case "national_admin": return "NA";
      case "state_admin": return "ST";
      case "district_admin": return "DA";
      default: return "AD";
    }
  };

  const menuItems = [
    { id: "id-gen", label: "ID Engine", icon: <CreditCard size={18} /> },
    { id: "anchors", label: "Anchor Management", icon: <Users size={18} /> },
    { id: "officers", label: "CIB Officers", icon: <Shield size={18} /> },
    { id: "certificate", label: "Certificates", icon: <Award size={18} /> },
    { id: "status-track", label: "Applications", icon: <Activity size={18} /> },
    { id: "news", label: "News Manager", icon: <Newspaper size={18} /> },
    { id: "content", label: "Content Manager", icon: <FileEdit size={18} /> },
    { id: "change-password", label: "Change Password", icon: <KeyRound size={18} /> },
    { id: "site-config", label: "Site Config", icon: <Settings size={18} /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9]">
        <Loader2 className="w-10 h-10 animate-spin text-red-700" />
      </div>
    );
  }

  if (!currentAdmin) return null;

  return (
    <div className="min-h-screen bg-[#f4f7f9] dark:bg-[#1e2128] flex flex-col lg:flex-row">

      {/* Logout Animation */}
      <AnimatePresence>
        {showLogoutAnim && (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center text-white"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-16 h-16 mx-auto mb-6 border-4 border-red-600 border-t-transparent rounded-full"
              />
              <h2 className="text-2xl font-black uppercase">Thank You Admin</h2>
              <p className="text-sm mt-2 text-gray-300">
                Logging Out Securely...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className="w-full lg:w-80 bg-[#002B5B] dark:bg-[#1e2128] text-white p-6 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6">
          <img src={logo} className="h-12 w-12 bg-white p-1 rounded-xl" />
          <div>
            <h2 className="font-black uppercase text-lg italic">
              Admin<span className="text-red-600">HQ</span>
            </h2>
            <p className="text-[8px] text-gray-400 uppercase tracking-widest">
              Control Panel
            </p>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <SidebarLink
              key={item.id}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </nav>

        {/* 🔥 PREMIUM LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="mt-4 relative overflow-hidden flex items-center justify-center gap-3 p-4 
          rounded-2xl font-black text-[11px] uppercase tracking-widest 
          border border-red-600/30 text-red-400 
          bg-gradient-to-r from-red-600/10 via-red-500/5 to-transparent
          hover:from-red-600 hover:to-red-700 hover:text-white 
          hover:shadow-xl hover:shadow-red-700/30 
          transition-all duration-300 group"
        >
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-red-700/10 blur-xl"></span>

          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            <LogOut size={18} />
          </span>

          <span className="relative z-10">Secure Logout</span>

          <span className="absolute right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
            →
          </span>
        </button>

      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "id-gen" && <AdminIdEngine />}
          {activeTab === "anchors" && <AnchorManagement />}
          {activeTab === "officers" && <OfficerManagement />}
          {activeTab === "certificate" && <AdminCertificate />}
          {activeTab === "status-track" && <AdminStatusTrack />}
          {activeTab === "content" && <AdminContentManager />}
          {activeTab === "news" && <AdminNewsManager adminUid={currentAdmin?.uid} />}
          {activeTab === "change-password" && <AdminChangePassword />}
          {activeTab === "site-config" && <AdminSiteConfig />}
        </AnimatePresence>
      </main>
    </div>
  );
};

const SidebarLink = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${
      active
        ? "bg-red-700 text-white shadow-xl translate-x-2"
        : "hover:bg-white/5 text-gray-400 hover:text-white"
    }`}
  >
    {icon} {label}
  </button>
);

export default AdminDashboard;