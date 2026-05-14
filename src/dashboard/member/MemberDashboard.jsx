import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { User, Award, Bell, Loader2, LogOut, Heart } from "lucide-react";

// Assets
import logo from "../../assets/logo.png"; 

// Firebase/Context
import { auth, db } from "../../firebase/firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

// Components
import ProfileTab from "../../components/membercomponents/ProfileTab";
import DocumentsTab from "../../components/membercomponents/DocumentsTab";
import UpdatesTab from "../../components/membercomponents/UpdatesTab";

const MemberDashboard = ({ initialTab = "profile" }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [showThanks, setShowThanks] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formattedDocsData, setFormattedDocsData] = useState(null);

  useEffect(() => {
    if (!authUser?.email) {
      navigate("/member/login");
      return;
    }

    const q = query(
      collection(db, "membershipApplications"),
      where("email", "==", authUser.email.trim().toLowerCase()),
      where("status", "==", "Approved")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const fetchedData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        
        const issueDateObj = fetchedData.createdAt?.toDate ? fetchedData.createdAt.toDate() : 
                            fetchedData.createdAt ? new Date(fetchedData.createdAt) : new Date();

        const validUntilObj = new Date(issueDateObj);
        validUntilObj.setFullYear(validUntilObj.getFullYear() + 2);

        setFormattedDocsData({
          name: fetchedData.fullName || fetchedData.name || "",
          designation: fetchedData.designation || fetchedData.membershipLabel || "Member",
          idNumber: fetchedData.memberId || "PENDING",
          phone: fetchedData.mobile || fetchedData.phone || "N/A",
          joinedSince: issueDateObj.toLocaleDateString("en-GB"),
          
          // 🔥 FIXED LOGIC: Ab ye database (admin update) ki date uthayega
          validUntil: fetchedData.validUntil 
            ? (typeof fetchedData.validUntil === 'string' 
                ? fetchedData.validUntil 
                : fetchedData.validUntil.toDate 
                  ? fetchedData.validUntil.toDate().toLocaleDateString("en-GB") 
                  : new Date(fetchedData.validUntil).toLocaleDateString("en-GB"))
            : validUntilObj.toLocaleDateString("en-GB"),

          address: fetchedData.address || (fetchedData.district ? `${fetchedData.district}, ${fetchedData.state}` : "N/A"),
          photo: fetchedData.photoUrl || "",
        });
        setUserData(fetchedData);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [authUser, navigate]);

  const handleLogout = async () => {
    setShowThanks(true);
    setTimeout(async () => {
      try {
        await signOut(auth);
        localStorage.clear();
        navigate("/", { replace: true });
        window.location.reload();
      } catch (err) {
        console.error("Logout Error:", err);
      }
    }, 2000);
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#0a0a0a]">
      <Loader2 className="w-10 h-10 animate-spin text-red-700" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a]">
      {/* Thank You Overlay */}
      <AnimatePresence>
        {showThanks && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#002B5B] flex items-center justify-center text-center p-4">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-[#111] p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl max-w-sm w-full">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={30} className="text-red-600 fill-red-600 sm:w-10 sm:h-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#002B5B] dark:text-white uppercase italic mb-2 leading-tight">Thank <span className="text-red-700">You!</span></h2>
              <p className="text-gray-500 font-bold text-xs sm:text-sm uppercase tracking-widest">For your service to the bureau.</p>
              <div className="mt-8 flex justify-center"><Loader2 className="animate-spin text-red-700" size={24} /></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-[#002B5B] text-white px-4 sm:px-6 md:px-10 py-3 sm:py-4 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white p-1 rounded-lg">
              <img src={logo} className="h-8 w-8 sm:h-10 sm:w-10 object-contain" alt="logo" />
            </div>
            <h1 className="text-sm sm:text-lg font-black uppercase italic tracking-tighter">Member<span className="text-red-500">HQ</span></h1>
          </div>
          <button onClick={handleLogout} className="p-2 sm:p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-lg active:scale-95">
            <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        {/* Navigation Tabs - Added overflow-x-auto for small screens */}
        <div className="flex bg-white dark:bg-[#111] p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 mb-6 sm:mb-8 overflow-x-auto no-scrollbar gap-1">
          <TabBtn active={activeTab === "profile"} onClick={() => setActiveTab("profile")} label="Profile" icon={<User size={14} />} />
          <TabBtn active={activeTab === "documents"} onClick={() => setActiveTab("documents")} label="Documents" icon={<Award size={14} />} />
          <TabBtn active={activeTab === "updates"} onClick={() => setActiveTab("updates")} label="Updates" icon={<Bell size={14} />} />
        </div>

        {/* Dynamic Tab Content */}
        <div className="w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "profile" && (
                <ProfileTab userData={userData} formattedData={formattedDocsData} />
              )}
              {activeTab === "documents" && (
                <DocumentsTab formattedData={formattedDocsData} />
              )}
              {activeTab === "updates" && (
                <UpdatesTab />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Styles for hidden scrollbar on tabs */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const TabBtn = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick} 
    className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all min-w-max ${
      active ? "bg-[#002B5B] text-white shadow-lg scale-[1.02]" : "text-gray-400 hover:text-[#002B5B]"
    }`}
  >
    {icon} {label}
  </button>
);

export default MemberDashboard;