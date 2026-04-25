import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CreditCard, Award, Activity, Settings, LogOut, Shield,
  Loader2, FileEdit, Newspaper, Users, KeyRound, ChevronRight, Menu, X
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
          setCurrentAdmin({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: "Admin",
            role: "admin"
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
    { id: "anchors", label: "Anchors", icon: <Users size={18} /> },
    { id: "officers", label: "Officers", icon: <Shield size={18} /> },
    { id: "certificate", label: "Certificates", icon: <Award size={18} /> },
    { id: "status-track", label: "Applications", icon: <Activity size={18} /> },
    { id: "news", label: "News", icon: <Newspaper size={18} /> },
    { id: "content", label: "Content", icon: <FileEdit size={18} /> },
    { id: "change-password", label: "Password", icon: <KeyRound size={18} /> },
    { id: "site-config", label: "Config", icon: <Settings size={18} /> },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9]">
      <Loader2 className="w-10 h-10 animate-spin text-red-700" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7f9] dark:bg-[#0f1115]">
      {/* Logout Animation Overlay */}
      <AnimatePresence>
        {showLogoutAnim && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[999] flex items-center justify-center bg-[#002B5B]/90 backdrop-blur-md">
            <div className="text-center text-white p-10">
              <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-6" />
              <h2 className="text-3xl font-black uppercase tracking-tighter">Terminating <span className="text-red-600">Session...</span></h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar/Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] lg:hidden"
            />
            <motion.aside 
              initial={{ x: "-100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[280px] bg-[#002B5B] z-[90] lg:hidden p-6 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <img src={logo} className="h-8 w-8 bg-white p-1 rounded-lg" alt="logo" />
                  <h2 className="font-black text-white uppercase italic">Admin<span className="text-red-600">HQ</span></h2>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/60 hover:text-white p-2">
                  <X size={24} />
                </button>
              </div>
              
              <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all
                      ${activeTab === item.id ? "bg-red-700 text-white shadow-lg" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="pt-6 border-t border-white/10">
                <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-xl font-black text-[11px] uppercase text-red-500 hover:bg-red-500/10 transition-all">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Top Header */}
      <header className="sticky top-0 z-[60] w-full bg-[#002B5B] border-b border-white/10 px-4 lg:px-10 h-20 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          {/* Hamburger only on mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-3">
            <img src={logo} className="h-10 w-10 bg-white p-1 rounded-xl shadow-lg hidden xs:block" alt="logo" />
            <div>
              <h2 className="font-black uppercase text-xl italic text-white leading-none">Admin<span className="text-red-600">HQ</span></h2>
              <p className="text-[9px] font-bold text-red-500 uppercase tracking-[0.3em] mt-1 hidden sm:block">Command Center</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end pr-4 border-r border-white/10">
            <span className="text-[11px] font-black text-white uppercase tracking-wider">{currentAdmin?.name}</span>
            <span className="text-[9px] text-green-500 font-bold uppercase">System Online</span>
          </div>
          <button onClick={handleLogout} className="p-3 rounded-xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-inner border border-red-600/20">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Desktop Navigation Navbar (Hidden on Mobile) */}
      <nav className="hidden lg:block sticky top-20 z-50 w-full bg-white dark:bg-[#161920] border-b border-gray-200 dark:border-white/5 shadow-md overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-1 p-2 min-w-max">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap
                ${activeTab === item.id 
                  ? "bg-[#002B5B] text-white shadow-lg scale-105" 
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#002B5B] dark:text-gray-400"
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content Area */}
      <main className="w-full min-h-[calc(100vh-140px)]">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10">
          {/* Breadcrumbs - Responsive text */}
          <div className="mb-6 sm:mb-8 flex items-center gap-2 text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-white/5 w-max px-3 sm:px-4 py-2 rounded-lg border border-gray-100 dark:border-white/5 shadow-sm">
            <span>Dashboard</span> <ChevronRight size={12} /> <span className="text-red-600">{menuItems.find(i => i.id === activeTab)?.label}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full"
            >
              {activeTab === "id-gen" && <AdminIdEngine />}
              {activeTab === "anchors" && <AnchorManagement />}
              {activeTab === "officers" && <OfficerManagement />}
              {activeTab === "certificate" && <AdminCertificate />}
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

      <footer className="py-8 border-t border-gray-200 dark:border-white/5 text-center px-6">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
          Crime Information Bureau <span className="mx-2">•</span> Secure Admin Protocol <span className="mx-2">•</span> 2026
        </p>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;