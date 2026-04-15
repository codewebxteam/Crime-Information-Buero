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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../assets/logo.png";

// Firebase imports
import { auth, db } from "../../firebase/firebase";
import { signOut } from "firebase/auth";
import {
  doc,
  onSnapshot,
  collection,
  getDocs,
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
  const [notifications, setNotifications] = useState([]);

  const idCardRef = useRef(null);
  const certificateRef = useRef(null);

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
        rank: finalDesignation,
        level: finalDesignation,
        idNumber: fetchedData.memberId || "PENDING",
        phone: fetchedData.mobile || fetchedData.phone || "N/A",
        joinedSince: issueDateObj.toLocaleDateString("en-GB"),
        issueDate: issueDateObj.toLocaleDateString("en-GB"),
        validUntil: validUntilObj.toLocaleDateString("en-GB"),
        address: fetchedData.address || (fetchedData.district ? `${fetchedData.district}, ${fetchedData.state}` : "N/A"),
        photo: fetchedData.photoUrl || "",
        signature: "Director CIB Unit",
      });
      setIsLoading(false);
    };

    return () => unsubscribe();
  }, [authUser, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
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
          <button onClick={handleLogout} className="mt-6 px-8 py-3 bg-[#002B5B] text-white rounded-xl font-bold uppercase text-xs tracking-widest">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a]">
      <header className="bg-[#002B5B] text-white px-6 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo} className="h-10 w-10 bg-white p-1 rounded-lg" alt="logo" />
            <h1 className="text-lg font-black uppercase italic tracking-tighter">Member<span className="text-red-500">HQ</span></h1>
          </div>
          <button onClick={handleLogout} className="p-2 bg-red-700 rounded-lg hover:bg-red-800 transition-all"><LogOut size={18} /></button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex bg-white dark:bg-[#111] p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 mb-8 overflow-x-auto">
          <TabBtn active={activeTab === "profile"} onClick={() => setActiveTab("profile")} label="Profile" icon={<User size={14} />} />
          <TabBtn active={activeTab === "documents"} onClick={() => setActiveTab("documents")} label="Documents" icon={<Award size={14} />} />
          <TabBtn active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")} label="Updates" icon={<Bell size={14} />} />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div key="p" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] shadow-xl text-center border border-gray-100">
                <div className="w-32 h-32 mx-auto rounded-3xl border-4 border-[#002B5B] overflow-hidden mb-4 shadow-lg">
                  <img src={formattedDocsData?.photo || `https://placehold.co/150x150?text=CIB`} className="w-full h-full object-cover" alt="User" />
                </div>
                <h2 className="text-xl font-black text-[#002B5B] dark:text-white uppercase">{formattedDocsData?.name}</h2>
                <span className="text-[10px] bg-red-700 text-white px-4 py-1 rounded-full font-black uppercase mt-2 inline-block tracking-widest">{formattedDocsData?.designation}</span>
                <div className="mt-6 pt-6 border-t border-gray-50 dark:border-white/5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bureau ID</p>
                  <p className="text-lg font-black text-[#002B5B] dark:text-white">{formattedDocsData?.idNumber}</p>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white dark:bg-[#111] p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
                <h3 className="text-sm font-black text-[#002B5B] dark:text-white uppercase mb-8 border-l-4 border-red-700 pl-4 tracking-widest">Official Record</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InfoRow label="Registered Email" value={userData.email} icon={<Mail size={14} />} />
                  <InfoRow label="Contact Number" value={formattedDocsData?.phone} icon={<Phone size={14} />} />
                  <InfoRow label="Assigned Area" value={formattedDocsData?.address} icon={<MapPin size={14} />} />
                  <InfoRow label="Valid Period" value={`${formattedDocsData?.joinedSince} - ${formattedDocsData?.validUntil}`} icon={<Calendar size={14} />} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "documents" && (
            <motion.div key="d" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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

const TabBtn = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? "bg-[#002B5B] text-white shadow-lg" : "text-gray-400 hover:text-[#002B5B]"}`}>{icon} {label}</button>
);

const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    <div className="text-red-700 mt-1">{icon}</div>
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-[#002B5B] dark:text-white">{value || "N/A"}</p>
    </div>
  </div>
);

// ✅ Updated DocCard: Removed the manual button and the extra wrapper div
const DocCard = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-[#111] p-6 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col items-center">
    <div className="w-full flex justify-between items-center mb-6">
      <h3 className="text-sm font-black text-[#002B5B] dark:text-white uppercase flex items-center gap-2">{icon} {title}</h3>
    </div>
    <div className="w-full overflow-hidden flex justify-center p-4 bg-gray-50 dark:bg-black/20 rounded-3xl border border-dashed border-gray-200">
      {children}
    </div>
  </div>
);

export default MemberDashboard;