import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CreditCard, Award, Activity, Settings, LogOut, Shield,
  Loader2, FileEdit, Newspaper, Users, KeyRound, Menu, X
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
  const [showLogoutAnim, setShowLogoutAnim] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        localStorage.removeItem("adminAuth");
        navigate("/admin-login");
        return;
      }

      try {
        const adminSnap = await getDoc(doc(db, "admins", firebaseUser.uid));
        if (adminSnap.exists()) {
          const adminData = adminSnap.data();
          const finalAdmin = {
            uid: firebaseUser.uid,
            email: adminData.email || firebaseUser.email || "",
            name: adminData.name || "Admin",
            role: adminData.role || "admin",
            status: adminData.status || "active",
          };
          setCurrentAdmin(finalAdmin);
          localStorage.setItem("adminAuth", JSON.stringify(finalAdmin));
        } else {
            // Fallback agar Firestore doc na mile
            setCurrentAdmin({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: "Admin"
            });
        }
      } catch (err) {
        console.error("Dashboard Auth Error:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      setShowLogoutAnim(true);
      setTimeout(async () => {
        localStorage.removeItem("adminAuth");
        await signOut(auth);
        navigate("/admin-login");
      }, 1800);
    } catch (e) {
      alert("Logout failed.");
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9]">
      <Loader2 className="w-10 h-10 animate-spin text-red-700" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7f9] dark:bg-[#1e2128]">
      <AnimatePresence>
        {showLogoutAnim && (
          <motion.div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="text-center text-white">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="w-16 h-16 mx-auto mb-6 border-4 border-red-600 border-t-transparent rounded-full" />
              <h2 className="text-2xl font-black uppercase">Logging Out...</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-50 w-full h-20 bg-[#002B5B] border-b border-white/10 flex items-center justify-between px-6 lg:px-10 shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg"><Menu size={24} /></button>
          <img src={logo} className="h-10 w-10 bg-white p-1 rounded-lg" alt="logo" />
          <h2 className="font-black uppercase text-lg italic text-white leading-tight">Admin<span className="text-red-600">HQ</span></h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{currentAdmin?.name}</span>
            <span className="text-[9px] text-red-500 font-black uppercase">{currentAdmin?.role}</span>
          </div>
          <button onClick={handleLogout} className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all">
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Logic ... (kept as you had it) */}

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        <aside className="hidden lg:flex w-80 bg-[#002B5B] p-6 flex-col border-r border-white/5">
          <nav className="space-y-2 sticky top-24">
            {menuItems.map((item) => (
              <SidebarLink 
                key={item.id} 
                active={activeTab === item.id} 
                onClick={() => { setActiveTab(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                icon={item.icon} label={item.label} 
              />
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                
                {/* --- IMPORTANT FIX HERE: Pass props to components --- */}
                {activeTab === "id-gen" && <AdminIdEngine />}
                {activeTab === "anchors" && <AnchorManagement />}
                {activeTab === "officers" && <OfficerManagement />}
                {activeTab === "certificate" && <AdminCertificate />}
                
                {/* Pass currentAdmin and uid properly */}
                {activeTab === "status-track" && (
                  <AdminStatusTrack 
                    adminUid={currentAdmin?.uid} 
                    currentAdmin={currentAdmin} 
                  />
                )}

                {activeTab === "content" && <AdminContentManager />}
                {activeTab === "news" && <AdminNewsManager adminUid={currentAdmin?.uid} />}
                {activeTab === "change-password" && <AdminChangePassword />}
                {activeTab === "site-config" && <AdminSiteConfig />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarLink = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${active ? "bg-red-700 text-white shadow-xl translate-x-2" : "hover:bg-white/5 text-gray-400 hover:text-white"}`}>
    {icon} {label}
  </button>
);

export default AdminDashboard;