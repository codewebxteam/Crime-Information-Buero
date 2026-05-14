import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2, X, ShieldAlert, Database, Eye, Download, Menu } from "lucide-react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";

// Engines
import jsPDF from "jspdf";
import QRCode from "qrcode";

// Components
import IdCardTemplate from "../../components/shared/IdCardTemplate";
import OfficerSidebar from "../../components/admincomponents/OfficerSidebar";
import IdEditorForm from "../../components/admincomponents/IdEditorForm";

// Assets
import logoImg from "../../assets/logo.png";
import signatureImg from "../../assets/signature.png";

const AdminIdEngine = () => {
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [approvedMembers, setApprovedMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isDataSynced, setIsDataSynced] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [member, setMember] = useState({
    name: "", rank: "", idNumber: "", contact: "", validUntil: "OCT. 2026", address: "", photo: "",
  });

  // Preview ke liye QR Code ka naya state
  const [qrPreview, setQrPreview] = useState("");

  // 1. Fetch Approved Members
  useEffect(() => {
    const fetchApprovedMembers = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "membershipApplications"), where("status", "==", "Approved"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApprovedMembers(list);
        if (list.length > 0) setSelectedMemberId(list[0].id);
      } catch (err) { console.error("Fetch Error:", err); } finally { setLoading(false); }
    };
    fetchApprovedMembers();
  }, []);

  // 2. Sync Selected Member
  useEffect(() => {
    if (!selectedMemberId || approvedMembers.length === 0) return;
    const s = approvedMembers.find(m => m.id === selectedMemberId);
    if (!s) return;

    setMember({
      name: s.fullName || s.name || "",
      rank: s.designation || s.membershipLabel || "Crime Reporter",
      idNumber: s.memberId || "",
      contact: s.mobile || s.phone || s.contact || "",
      validUntil: s.validUntil || "OCT. 2026",
      address: s.address || "Gorakhpur Division : Head Quarter",
      photo: s.photoUrl || "",
    });
    setIsDataSynced(false);
  }, [selectedMemberId, approvedMembers]);

  // 3. Live QR Code Generator for Preview Modal
  useEffect(() => {
    const generatePreviewQR = async () => {
      if (member.name || member.idNumber) {
        try {
          const qrText = `CIB Verified\nName: ${member.name}\nID: ${member.idNumber}\nRank: ${member.rank}`;
          const url = await QRCode.toDataURL(qrText, {
            margin: 1, width: 200, color: { dark: "#001F3F", light: "#FFFFFF" }
          });
          setQrPreview(url);
        } catch (err) {
          console.error("Preview QR Error:", err);
        }
      }
    };
    generatePreviewQR();
  }, [member.name, member.idNumber, member.rank]); // Jab bhi ye change honge, QR update hoga

  // 4. Update Database
  const syncToDatabase = async () => {
    setIsProcessing(true);
    try {
      const appRef = doc(db, "membershipApplications", selectedMemberId);
      await updateDoc(appRef, { 
        fullName: member.name, designation: member.rank, mobile: member.contact,
        address: member.address, memberId: member.idNumber, validUntil: member.validUntil, updatedAt: new Date() 
      });
      setIsDataSynced(true); setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) { alert("Sync Error!"); } finally { setIsProcessing(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black">BOOTING SYSTEM...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-10 px-2 sm:px-4">
      {/* Responsive Header */}
      <div className="bg-[#001F3F] p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] text-white flex flex-col sm:flex-row justify-between items-center shadow-2xl border-b-4 border-red-700 gap-4">
        <div className="flex items-center gap-3 sm:gap-5 italic font-black text-xl sm:text-3xl text-center sm:text-left">
          CIB ADMIN TERMINAL
        </div>
        <div className="hidden sm:block text-xs font-bold uppercase tracking-widest opacity-60">
          Engine Active v2.0
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
        <div className="lg:col-span-4 order-2 lg:order-1">
          <OfficerSidebar 
              searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
              filteredMembers={approvedMembers.filter(m => m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()))} 
              selectedMemberId={selectedMemberId} setSelectedMemberId={setSelectedMemberId} 
          />
        </div>
        <div className="lg:col-span-8 order-1 lg:order-2">
          <IdEditorForm 
              member={member} handleInput={(e) => setMember({...member, [e.target.name]: e.target.value})}
              syncToDatabase={syncToDatabase} onPreviewClick={() => setShowModal(true)} 
              isProcessing={isProcessing} isDataSynced={isDataSynced} updateSuccess={updateSuccess} 
          />
        </div>
      </div>

      {/* THE FIXED MODAL SECTION */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 bg-black/95 backdrop-blur-sm">
            <div className="bg-[#0d0d0d] rounded-none sm:rounded-[2rem] w-full max-w-5xl h-[100dvh] sm:h-[90vh] flex flex-col overflow-hidden shadow-2xl relative border border-white/10">
              
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-white/10 flex justify-between items-center bg-[#111] z-20 shrink-0">
                <h2 className="font-black uppercase text-xs sm:text-sm tracking-widest text-white">
                  Visual <span className="text-red-600">Preview</span>
                </h2>
                <div className="flex items-center gap-4">
                  {/* Yaha se Download Button hata diya gaya hai */}
                  <button onClick={() => setShowModal(false)} className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all active:scale-95">
                    <X size={20}/>
                  </button>
                </div>
              </div>

              {/* SCROLLABLE PREVIEW AREA */}
              <div className="flex-1 overflow-auto bg-[#1a1a1a] flex p-4 sm:p-8" style={{ WebkitOverflowScrolling: "touch" }}>
                <div className="m-auto w-max h-max transform scale-90 sm:scale-100 transition-all duration-300">
                  {/* Mapping Data Correctly for IdCardTemplate */}
                  <IdCardTemplate 
                    member={{ 
                      ...member, 
                      designation: member.rank, // rank ko designation bana diya
                      phone: member.contact,    // contact ko phone bana diya
                      qrCodeData: qrPreview     // Live QR code yaha pass ho raha hai
                    }} 
                  />
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminIdEngine;