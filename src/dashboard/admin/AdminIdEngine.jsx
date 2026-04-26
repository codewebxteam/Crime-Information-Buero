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
  const [isDownloading, setIsDownloading] = useState(false);
  const [approvedMembers, setApprovedMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isDataSynced, setIsDataSynced] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [member, setMember] = useState({
    name: "", rank: "", idNumber: "", contact: "", validUntil: "OCT. 2026", address: "", photo: "",
  });

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
      validUntil: "OCT. 2026",
      address: s.address || "Gorakhpur Division : Head Quarter",
      photo: s.photoUrl || "",
    });
    setIsDataSynced(false);
  }, [selectedMemberId, approvedMembers]);

  // 3. Helper: Load Image for PDF
  const loadImage = (src) => {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 1.0));
      };
      img.onerror = () => resolve(null);
    });
  };

  // 4. Helper: Generate QR DataURI
  const generateQR = async (text) => {
    try {
      return await QRCode.toDataURL(text, {
        margin: 1,
        width: 200,
        color: { dark: "#001F3F", light: "#FFFFFF" }
      });
    } catch (err) { return null; }
  };

  // 5. THE MASTER DOWNLOAD LOGIC
  const downloadOfficialPDF = async () => {
    setIsDownloading(true);
    try {
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [600, 380] });
      const navy = [0, 31, 63];

      const [photoData, logoData, signData] = await Promise.all([
        loadImage(member.photo),
        loadImage(logoImg),
        loadImage(signatureImg)
      ]);
      
      const qrText = `CIB Verified\nName: ${member.name}\nID: ${member.idNumber}\nRank: ${member.rank}`;
      const qrData = await generateQR(qrText);

      pdf.setFillColor(255, 255, 255); pdf.rect(0, 0, 600, 380, "F");
      pdf.setDrawColor(...navy); pdf.setLineWidth(3); pdf.roundedRect(2, 2, 596, 376, 10, 10, "S");
      
      pdf.setFillColor(...navy); pdf.rect(3, 28, 594, 75, "F");
      if (logoData) pdf.addImage(logoData, "JPEG", 20, 38, 55, 55);
      pdf.setTextColor(255, 255, 255); pdf.setFontSize(26); pdf.text("CRIME INFORMATION BUREAU", 90, 65);
      
      if (photoData) {
        pdf.setDrawColor(...navy); pdf.setLineWidth(2);
        pdf.roundedRect(20, 125, 110, 130, 5, 5, "S");
        pdf.addImage(photoData, "JPEG", 21.5, 126.5, 107, 127);
      }

      pdf.setTextColor(...navy); pdf.setFontSize(24); pdf.text(member.name.toUpperCase(), 155, 155);
      pdf.setFontSize(14); pdf.setTextColor(80, 80, 80);
      pdf.text(`Designation : ${member.rank}`, 155, 190);
      pdf.text(`Working Area : ${member.address}`, 155, 220);
      pdf.text(`Mobile No. : ${member.contact}`, 155, 250);

      if (qrData) {
        pdf.addImage(qrData, "PNG", 490, 125, 75, 75);
        pdf.setTextColor(...navy); pdf.setFontSize(8);
        pdf.text("SCAN TO VERIFY", 527, 210, { align: "center" });
      }

      if (signData) pdf.addImage(signData, "PNG", 480, 275, 90, 35);
      pdf.setDrawColor(...navy); pdf.line(475, 312, 580, 312);
      pdf.setFontSize(10); pdf.text("Auth. Signatory", 527, 325, { align: "center" });

      pdf.addPage();
      pdf.setFillColor(255, 255, 255); pdf.rect(0, 0, 600, 380, "F");
      pdf.setDrawColor(...navy); pdf.roundedRect(2, 2, 596, 376, 10, 10, "S");
      if (logoData) pdf.addImage(logoData, "JPEG", 250, 20, 100, 100);
      pdf.setTextColor(...navy); pdf.setFontSize(18); pdf.text("CENTRAL OFFICE", 300, 140, { align: "center" });
      
      pdf.save(`CIB_ID_${member.idNumber}.pdf`);
    } catch (e) { alert("Download failed!"); } finally { setIsDownloading(false); }
  };

  const syncToDatabase = async () => {
    setIsProcessing(true);
    try {
      const appRef = doc(db, "membershipApplications", selectedMemberId);
      await updateDoc(appRef, { 
        fullName: member.name, designation: member.rank, mobile: member.contact,
        address: member.address, memberId: member.idNumber, updatedAt: new Date() 
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

      {/* 🔥 THE FIXED MODAL SECTION 🔥 */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 bg-black/95 backdrop-blur-sm">
            <div className="bg-[#0d0d0d] rounded-none sm:rounded-[2rem] w-full max-w-5xl h-[100dvh] sm:h-[90vh] flex flex-col overflow-hidden shadow-2xl relative border border-white/10">
              
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-white/10 flex justify-between items-center bg-[#111] z-20 shrink-0">
                <h2 className="font-black uppercase text-xs sm:text-sm tracking-widest text-white">
                  Visual <span className="text-red-600">Preview</span>
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all active:scale-95">
                  <X size={20}/>
                </button>
              </div>

              {/* 🔥 SCROLLABLE PREVIEW AREA 🔥 */}
              <div 
                className="flex-1 overflow-auto bg-[#1a1a1a] flex p-4 sm:p-8" 
                style={{ WebkitOverflowScrolling: "touch" }} // Smooth scroll on iOS
              >
                {/* 'm-auto' centering trick: Agar card screen se chota hai, to center rahega.
                  Agar card bada hai, to ye natural scroll allow karega aur edges nahi kaatega.
                */}
                <div className="m-auto w-max h-max transform scale-90 sm:scale-100 transition-all duration-300">
                  <IdCardTemplate member={member} />
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