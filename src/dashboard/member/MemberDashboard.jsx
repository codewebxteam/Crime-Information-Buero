import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  ShieldCheck,
  Mail,
  MapPin,
  CreditCard,
  Download,
  Clock,
  CheckCircle,
  Loader2,
  Award,
  Bell,
  LogOut,
  Calendar,
  Phone,
} from "lucide-react";
import logo from "../../assets/logo.png";

// Firebase imports
import { auth, db } from "../../firebase/firebase";
import { signOut } from "firebase/auth";
import {
  onSnapshot,
  collection,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

// Shared Templates
import IdCardTemplate from "../../components/shared/IdCardTemplate";
import CertificateTemplate from "../../components/shared/CertificateTemplate";

const MemberDashboard = ({ initialTab = "profile" }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);

  const [userData, setUserData] = useState(null);
  const [formattedDocsData, setFormattedDocsData] = useState(null);

  useEffect(() => {
    if (!authUser || !authUser.uid) {
      navigate("/member/login");
      return;
    }

    const q = query(
      collection(db, "membershipApplications"),
      where("email", "==", authUser.email),
      where("status", "==", "Approved")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const fetchedData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        processMemberData(fetchedData);
      } else {
        setIsLoading(false);
      }
    });

    const processMemberData = (fetchedData) => {
      setUserData(fetchedData);

      const levelLabel = fetchedData.membershipLabel || 
        (fetchedData.membershipLevel === "national" ? "National Level" : 
         fetchedData.membershipLevel === "state" ? "State Level" : "District Level");

      const finalDesignation = fetchedData.designation || levelLabel || "Member";

      const issueDateObj = fetchedData.createdAt?.toDate ? fetchedData.createdAt.toDate() : 
                          fetchedData.createdAt ? new Date(fetchedData.createdAt) : new Date();

      const validUntilObj = new Date(issueDateObj);
      validUntilObj.setFullYear(validUntilObj.getFullYear() + 2);

      setFormattedDocsData({
        name: fetchedData.fullName || fetchedData.name || "",
        designation: finalDesignation,
        idNumber: fetchedData.memberId || "PENDING",
        phone: fetchedData.mobile || fetchedData.phone || "N/A",
        joinedSince: issueDateObj.toLocaleDateString("en-GB"),
        validUntil: validUntilObj.toLocaleDateString("en-GB"),
        address: fetchedData.address || (fetchedData.district ? `${fetchedData.district}, ${fetchedData.state}` : "N/A"),
        photo: fetchedData.photoUrl || "",
      });
      setIsLoading(false);
    };

    return () => unsubscribe();
  }, [authUser, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("memberAuth");
      localStorage.removeItem("cib_member_data");
      localStorage.removeItem("anchorAuth");
      navigate("/", { replace: true });
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
      <Loader2 className="w-10 h-10 animate-spin text-red-700" />
    </div>
  );

  if (!userData || userData.status === "Pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center max-w-md">
          <Clock size={50} className="text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-black uppercase text-[#002B5B]">Application Under Review</h2>
          <p className="text-gray-500 mt-2 text-sm font-bold">Aapki membership approve hone ke baad yahan documents dikhenge.</p>
          <button onClick={handleLogout} className="mt-6 px-8 py-3 bg-[#002B5B] text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg hover:bg-red-700 transition-colors">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a]">
      {/* --- RESPONSIVE PREMIUM NAVBAR --- */}
      <header className="bg-[#002B5B] text-white px-4 md:px-6 py-3 md:py-4 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-white p-1 rounded-lg shadow-md">
              <img src={logo} className="h-8 w-8 md:h-10 md:w-10 object-contain" alt="logo" />
            </div>
            <h1 className="text-base md:text-lg font-black uppercase italic tracking-tighter">
              Member<span className="text-red-500">HQ</span>
            </h1>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all shadow-lg border border-red-500/50"
          >
            <LogOut size={16} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Tab Switcher - Responsive Scroll */}
        <div className="flex bg-white dark:bg-[#111] p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 mb-6 md:mb-8 overflow-x-auto no-scrollbar">
          <TabBtn active={activeTab === "profile"} onClick={() => setActiveTab("profile")} label="Profile" icon={<User size={14} />} />
          <TabBtn active={activeTab === "documents"} onClick={() => setActiveTab("documents")} label="Documents" icon={<Award size={14} />} />
          <TabBtn active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")} label="Updates" icon={<Bell size={14} />} />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div 
              key="p" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {/* Profile Card */}
              <div className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-[2rem] shadow-xl text-center border border-gray-100 dark:border-white/5 h-fit">
                <div className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-3xl border-4 border-[#002B5B] overflow-hidden mb-4 shadow-lg bg-gray-50">
                  <img 
                    src={formattedDocsData?.photo || `https://placehold.co/150x150?text=CIB`} 
                    className="w-full h-full object-cover" 
                    alt="User" 
                  />
                </div>
                <h2 className="text-lg md:text-xl font-black text-[#002B5B] dark:text-white uppercase truncate">
                  {formattedDocsData?.name}
                </h2>
                <span className="text-[9px] md:text-[10px] bg-red-700 text-white px-4 py-1.5 rounded-full font-black uppercase mt-3 inline-block tracking-widest">
                  {formattedDocsData?.designation}
                </span>
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bureau ID</p>
                  <p className="text-base md:text-lg font-black text-[#002B5B] dark:text-white">{formattedDocsData?.idNumber}</p>
                </div>
              </div>

              {/* Info Card */}
              <div className="lg:col-span-2 bg-white dark:bg-[#111] p-6 md:p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5">
                <h3 className="text-xs md:text-sm font-black text-[#002B5B] dark:text-white uppercase mb-6 md:mb-8 border-l-4 border-red-700 pl-4 tracking-widest">
                  Official Record
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  <InfoRow label="Registered Email" value={userData.email} icon={<Mail size={14} />} />
                  <InfoRow label="Contact Number" value={formattedDocsData?.phone} icon={<Phone size={14} />} />
                  <InfoRow label="Assigned Area" value={formattedDocsData?.address} icon={<MapPin size={14} />} />
                  <InfoRow label="Valid Period" value={`${formattedDocsData?.joinedSince} - ${formattedDocsData?.validUntil}`} icon={<Calendar size={14} />} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "documents" && (
            <motion.div 
              key="d" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8"
            >
              <DocCard title="Bureau Identity Card" icon={<CreditCard size={18} />}>
                 <IdCardTemplate member={formattedDocsData} />
              </DocCard>
              <DocCard title="Membership Certificate" icon={<Award size={18} />}>
                 <CertificateTemplate data={formattedDocsData} />
              </DocCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Sub-components for cleaner structure
const TabBtn = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap min-w-fit flex-1 sm:flex-none ${
      active 
        ? "bg-[#002B5B] text-white shadow-md scale-[1.02]" 
        : "text-gray-400 hover:text-[#002B5B] hover:bg-gray-50 dark:hover:bg-white/5"
    }`}
  >
    {icon} {label}
  </button>
);

const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-red-700">
      {icon}
    </div>
    <div className="overflow-hidden">
      <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-xs md:text-sm font-bold text-[#002B5B] dark:text-white truncate">{value || "N/A"}</p>
    </div>
  </div>
);

const DocCard = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-[#111] p-5 md:p-6 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-white/5 flex flex-col items-center w-full overflow-hidden">
    <div className="w-full mb-5">
      <h3 className="text-xs md:text-sm font-black text-[#002B5B] dark:text-white uppercase flex items-center gap-2 tracking-widest">
        {icon} {title}
      </h3>
    </div>
    <div className="w-full overflow-x-auto no-scrollbar flex justify-center py-4 bg-gray-50 dark:bg-black/40 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
      <div className="scale-[0.85] sm:scale-100 origin-center">
        {children}
      </div>
    </div>
  </div>
);

export default MemberDashboard;