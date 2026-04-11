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
  AlertTriangle,
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
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

// Shared Templates Import (Ensure paths are correct)
import IdCardTemplate from "../../components/shared/IdCardTemplate";
import CertificateTemplate from "../../components/shared/CertificateTemplate";

const MemberDashboard = ({ initialTab = "profile" }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth(); // Logged in user
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);

  // States
  const [userData, setUserData] = useState(null);
  const [formattedDocsData, setFormattedDocsData] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const idCardRef = useRef(null);
  const certificateRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!authUser || !authUser.uid) {
          navigate("/member/login");
          return;
        }

        const uid = authUser.uid;
        let fetchedData = null;

        // Fetch from 'users'
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          fetchedData = { id: userDoc.id, ...userDoc.data() };
        } else {
          // Fetch from 'membershipApplications' if not in users
          const appQ = query(
            collection(db, "membershipApplications"),
            where("email", "==", authUser.email),
            where("status", "==", "Approved"),
          );
          const appSnap = await getDocs(appQ);

          if (!appSnap.empty) {
            fetchedData = { id: appSnap.docs[0].id, ...appSnap.docs[0].data() };
          }
        }

        if (!fetchedData) {
          console.error("User data not found in database.");
          navigate("/member/login");
          return;
        }

        setUserData(fetchedData);

        // Membership Level formatting
        const levelLabel =
          fetchedData.membershipLabel ||
          (fetchedData.membershipLevel === "national"
            ? "National Level"
            : fetchedData.membershipLevel === "state"
              ? "State Level"
              : fetchedData.membershipLevel === "district"
                ? "District Level"
                : "");

        // EXACT LOGIC: Designation ya Rank fetch karo. Agar kuch na mile toh 'Member' dikhao
        const finalDesignation =
          fetchedData.designation || fetchedData.rank || levelLabel || "Member";

        // Date Calculations (Join Date & 1-Year Expiry)
        const issueDateObj = fetchedData.createdAt?.toDate
          ? fetchedData.createdAt.toDate()
          : fetchedData.createdAt
            ? new Date(fetchedData.createdAt)
            : new Date();

        const validUntilObj = new Date(issueDateObj);
        validUntilObj.setFullYear(validUntilObj.getFullYear() + 1); // Exactly 1 year from Active Date

        // Formatting data to pass into your imported templates
        setFormattedDocsData({
          name: fetchedData.fullName || fetchedData.name || "",
          designation: finalDesignation,
          rank: finalDesignation, // ID Card Component jisko use karta hai wahi yahan set hoga
          level: finalDesignation, // Certificate Component jisko use karta hai
          idNumber: fetchedData.memberId || "PENDING",
          phone: fetchedData.phone || fetchedData.mobile || "N/A", // Mobile No
          joinedSince: issueDateObj.toLocaleDateString("en-GB"), // Join Date
          issueDate: issueDateObj.toLocaleDateString("en-GB"),
          validUntil: validUntilObj.toLocaleDateString("en-GB"), // Expiry format DD/MM/YYYY
          bloodGroup: fetchedData.bloodGroup || "N/A",
          address:
            fetchedData.district && fetchedData.state
              ? `${fetchedData.district}, ${fetchedData.state}`
              : fetchedData.address || "",
          photo: fetchedData.photoUrl || "",
          signature: "Director CIB Unit",
          date: issueDateObj.toLocaleDateString("en-GB"),
        });

        // Fetch Notifications
        try {
          const notifQuery = query(
            collection(db, "notifications"),
            where("userId", "==", uid),
          );
          const notifSnap = await getDocs(notifQuery);
          const notifs = notifSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setNotifications(
            notifs.sort(
              (a, b) =>
                (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
            ),
          );
        } catch (e) {
          console.log("No notifications");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, authUser]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("cib_member_data");
      localStorage.removeItem("memberAuth");
      await signOut(auth);
      navigate("/login", { replace: true });
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Download ID Card as PDF
  const downloadIdCard = async () => {
    if (!idCardRef.current || !formattedDocsData) return;
    try {
      const canvas = await html2canvas(idCardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CIB_ID_${formattedDocsData.name.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download ID card");
    }
  };

  // Download Certificate as PDF
  const downloadCertificate = async () => {
    if (!certificateRef.current || !formattedDocsData) return;
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `CIB_CERTIFICATE_${formattedDocsData.name.replace(/\s+/g, "_")}.pdf`,
      );
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download certificate");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="w-10 h-10 animate-spin text-red-700" />
      </div>
    );
  }

  if (!userData) return null;

  if (userData.isPending || userData.status === "Pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#0a0a0a]">
        <div className="bg-white dark:bg-[#111] p-12 rounded-[3rem] shadow-2xl text-center max-w-md">
          <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <Clock size={40} className="text-yellow-600" />
          </div>
          <h2 className="text-2xl font-black text-[#002B5B] dark:text-white uppercase mb-4">
            Application Pending
          </h2>
          <p className="text-gray-500 font-bold mb-4">
            Aapki membership application abhi review me hai. Approve hone ke
            baad hi aap ID aur Certificate access kar payenge.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Email:{" "}
            <span className="text-[#002B5B] font-black">{userData.email}</span>
          </p>
          <button
            onClick={handleLogout}
            className="px-8 py-4 bg-[#002B5B] hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-wider transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a] transition-colors duration-500">
      {/* Header */}
      <header className="bg-[#002B5B] text-white px-4 md:px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="CIB"
              className="h-10 w-10 bg-white p-1 rounded-lg"
            />
            <div>
              <h1 className="text-xl font-black uppercase italic">
                Member Portal
              </h1>
              <p className="text-[10px] text-red-400 uppercase tracking-widest hidden sm:block">
                Crime Information Bureau
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("notifications")}
              className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bell size={20} />
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 rounded-lg transition-colors text-sm font-bold"
            >
              <LogOut size={16} />{" "}
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Navigation Tabs */}
        <div className="flex bg-white dark:bg-[#111] p-2 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 mb-8 overflow-x-auto">
          <TabBtn
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            label="My Profile"
            icon={<User size={14} />}
          />
          <TabBtn
            active={activeTab === "documents"}
            onClick={() => setActiveTab("documents")}
            label="My Documents"
            icon={<Award size={14} />}
          />
          <TabBtn
            active={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
            label="Notifications"
            icon={<Bell size={14} />}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Profile Card */}
                <div className="bg-white dark:bg-[#111] p-6 lg:p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto rounded-3xl border-4 border-[#002B5B] shadow-lg overflow-hidden mb-4 bg-gray-100">
                      <img
                        src={
                          formattedDocsData?.photo ||
                          `https://placehold.co/150x150/002B5B/white?text=${formattedDocsData?.name?.charAt(0).toUpperCase()}`
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-2xl font-black text-[#002B5B] dark:text-white uppercase">
                      {formattedDocsData?.name}
                    </h2>
                    <span className="inline-block bg-red-700 text-white text-[9px] font-black px-4 py-1 rounded-full mt-2 uppercase">
                      {formattedDocsData?.designation}
                    </span>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Bureau ID
                      </p>
                      <p className="text-lg font-black text-[#002B5B] dark:text-white">
                        {formattedDocsData?.idNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info Details */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-[#111] p-6 lg:p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5">
                    <h3 className="text-lg font-black text-[#002B5B] dark:text-white uppercase mb-6 border-l-4 border-red-700 pl-4">
                      Personal Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InfoRow
                        icon={<Mail size={14} />}
                        label="Email"
                        value={userData.email}
                      />
                      <InfoRow
                        icon={<Phone size={14} />}
                        label="Mobile No."
                        value={formattedDocsData?.phone}
                      />
                      <InfoRow
                        icon={<ShieldCheck size={14} />}
                        label="Designation"
                        value={formattedDocsData?.designation}
                      />
                      <InfoRow
                        icon={<MapPin size={14} />}
                        label="Address"
                        value={formattedDocsData?.address || "N/A"}
                      />
                      <InfoRow
                        icon={<Calendar size={14} />}
                        label="Joined Since"
                        value={formattedDocsData?.joinedSince}
                      />
                      <InfoRow
                        icon={<Calendar size={14} />}
                        label="Valid Until"
                        value={formattedDocsData?.validUntil}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === "documents" && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
                {/* ID Card */}
                <div className="bg-white dark:bg-[#111] p-6 lg:p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5 flex flex-col items-center">
                  <h3 className="text-lg font-black text-[#002B5B] dark:text-white uppercase mb-6 flex items-center gap-3 w-full">
                    <CreditCard size={20} className="text-red-700" /> Digital ID
                    Card
                  </h3>

                  <div className="w-full overflow-x-auto flex justify-center pb-4 hide-scrollbar">
                    <div ref={idCardRef} className="bg-white rounded-xl">
                      {/* DONO PROPS PASS KAR DIYE (member OR data - ID Card mostly member use karta hai) */}
                      <IdCardTemplate
                        member={formattedDocsData}
                        data={formattedDocsData}
                      />
                    </div>
                  </div>

                  <button
                    onClick={downloadIdCard}
                    className="w-full max-w-sm mt-6 bg-[#002B5B] hover:bg-black text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg"
                  >
                    <Download size={18} /> Download ID Card
                  </button>
                </div>

                {/* Certificate */}
                <div className="bg-white dark:bg-[#111] p-6 lg:p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5 flex flex-col items-center">
                  <h3 className="text-lg font-black text-[#002B5B] dark:text-white uppercase mb-6 flex items-center gap-3 w-full">
                    <Award size={20} className="text-red-700" /> Membership
                    Certificate
                  </h3>

                  <div className="w-full overflow-x-auto flex justify-center pb-4 hide-scrollbar">
                    <div ref={certificateRef} className="bg-white rounded-xl">
                      <CertificateTemplate
                        data={formattedDocsData}
                        member={formattedDocsData}
                      />
                    </div>
                  </div>

                  <button
                    onClick={downloadCertificate}
                    className="w-full max-w-sm mt-6 bg-red-700 hover:bg-black text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg"
                  >
                    <Download size={18} /> Download Certificate
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white dark:bg-[#111] p-6 lg:p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5">
                <h3 className="text-lg font-black text-[#002B5B] dark:text-white uppercase mb-6 flex items-center gap-3">
                  <Bell size={20} className="text-red-700" /> My Notifications
                </h3>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 font-bold">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-4 rounded-xl border bg-gray-50 dark:bg-gray-900 border-gray-100"
                      >
                        <h4 className="font-black text-[#002B5B] dark:text-white uppercase text-sm">
                          {notif.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {notif.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Helper Components ---
const TabBtn = ({ active, onClick, label, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? "bg-[#002B5B] dark:bg-red-700 text-white shadow-lg" : "text-gray-400 hover:text-red-700"}`}
  >
    {icon} {label}
  </button>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-gray-400 mt-1">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-sm font-bold text-[#002B5B] dark:text-white">
        {value}
      </p>
    </div>
  </div>
);

export default MemberDashboard;
