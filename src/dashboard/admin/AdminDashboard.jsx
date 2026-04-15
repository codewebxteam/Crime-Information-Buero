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
  KeyRound,
  Menu,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Menu State

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
            name: parsedAdmin.role === "super_admin" ? "Super Admin" : parsedAdmin.name || "Admin",
            role: parsedAdmin.role || "admin",
            status: parsedAdmin.status || "active",
            state: parsedAdmin.state || "",
            district: parsedAdmin.district || ""
          });
        }

        const adminSnap = await getDoc(doc(db, "admins", firebaseUser.uid));
        if (adminSnap.exists()) {
          const adminData = adminSnap.data();
          const normalizedRole = adminData.role?.trim().toLowerCase().replace(/\s+/g, "_");
          const finalAdmin = {
            uid: firebaseUser.uid,
            email: adminData.email || firebaseUser.email || "",
            name: normalizedRole === "super_admin" ? "Super Admin" : adminData.name || "Admin",
            role: normalizedRole || "admin",
            status: adminData.status || "active",
            state: adminData.state || "",
            district: adminData.district || ""
          };
          setCurrentAdmin(finalAdmin);
          localStorage.setItem("adminAuth", JSON.stringify(finalAdmin));
        }
      } catch (err) {
        console.error(err);
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
      {/* Logout Animation */}
      <AnimatePresence>
        {showLogoutAnim && (
          <motion.div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="text-center text-white">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="w-16 h-16 mx-auto mb-6 border-4 border-red-600 border-t-transparent rounded-full" />
              <h2 className="text-2xl font-black uppercase">Thank You Admin</h2>
              <p className="text-sm mt-2 text-gray-300">Logging Out Securely...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FULL NAVBAR --- */}
      <header className="sticky top-0 z-50 w-full h-20 bg-[#002B5B] dark:bg-[#111317] border-b border-white/10 flex items-center justify-between px-6 lg:px-10 shadow-xl">
        <div className="flex items-center gap-4">
          {/* Hamburger Menu Trigger */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>

          <img src={logo} className="h-10 w-10 bg-white p-1 rounded-lg hidden xs:block" alt="logo" />
          <div>
            <h2 className="font-black uppercase text-lg italic text-white leading-tight">
              Admin<span className="text-red-600">HQ</span>
            </h2>
            <p className="text-[7px] text-gray-400 uppercase tracking-[0.2em] hidden sm:block">Command Center</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{currentAdmin?.name}</span>
            <span className="text-[9px] text-red-500 font-black uppercase">{currentAdmin?.role?.replace('_', ' ')}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-red-900/20"
          >
            <LogOut size={14} />
            <span className="hidden xs:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* --- MOBILE SIDEBAR DRAWER --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[280px] bg-[#002B5B] dark:bg-[#111317] z-[70] p-6 shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                 <div className="flex items-center gap-3">
                    <img src={logo} className="h-8 w-8 bg-white p-1 rounded-md" alt="logo" />
                    <span className="text-white font-black italic">Admin<span className="text-red-600">HQ</span></span>
                 </div>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/50 hover:text-white">
                    <X size={24} />
                 </button>
              </div>
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <SidebarLink 
                    key={item.id} 
                    active={activeTab === item.id} 
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    icon={item.icon} 
                    label={item.label} 
                  />
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        
        {/* DESKTOP SIDEBAR (Hidden on mobile) */}
        <aside className="hidden lg:flex w-80 bg-[#002B5B] dark:bg-[#111317] p-6 flex-col border-r border-white/5">
          <nav className="space-y-2 sticky top-24">
            {menuItems.map((item) => (
              <SidebarLink 
                key={item.id} 
                active={activeTab === item.id} 
                onClick={() => {
                  setActiveTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                icon={item.icon} 
                label={item.label} 
              />
            ))}
          </nav>
        </aside>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "id-gen" && <AdminIdEngine />}
                {activeTab === "anchors" && <AnchorManagement />}
                {activeTab === "officers" && <OfficerManagement />}
                {activeTab === "certificate" && <AdminCertificate />}
                {activeTab === "status-track" && <AdminStatusTrack />}
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