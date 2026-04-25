import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2, X, ShieldAlert, Database, Eye, Download } from "lucide-react";
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
      const navy = [0, 31, 63], red = [139, 0, 0], yellow = [250, 204, 21];

      // Prepare Data
      const [photoData, logoData, signData] = await Promise.all([
        loadImage(member.photo),
        loadImage(logoImg),
        loadImage(signatureImg)
      ]);
      
      const qrText = `CIB Verified\nName: ${member.name}\nID: ${member.idNumber}\nRank: ${member.rank}`;
      const qrData = await generateQR(qrText);

      // --- PAGE 1: FRONT ---
      pdf.setFillColor(255, 255, 255); pdf.rect(0, 0, 600, 380, "F");
      pdf.setDrawColor(...navy); pdf.setLineWidth(3); pdf.roundedRect(2, 2, 596, 376, 10, 10, "S");
      
      // Header
      pdf.setFillColor(...navy); pdf.rect(3, 28, 594, 75, "F");
      if (logoData) pdf.addImage(logoData, "JPEG", 20, 38, 55, 55);
      pdf.setTextColor(255, 255, 255); pdf.setFontSize(26); pdf.text("CRIME INFORMATION BUREAU", 90, 65);
      
      // Photo Area
      if (photoData) {
        pdf.setDrawColor(...navy); pdf.setLineWidth(2);
        pdf.roundedRect(20, 125, 110, 130, 5, 5, "S");
        pdf.addImage(photoData, "JPEG", 21.5, 126.5, 107, 127);
      }

      // Member Details
      pdf.setTextColor(...navy); pdf.setFontSize(24); pdf.text(member.name.toUpperCase(), 155, 155);
      pdf.setFontSize(14); pdf.setTextColor(80, 80, 80);
      pdf.text(`Designation : ${member.rank}`, 155, 190);
      pdf.text(`Working Area : ${member.address}`, 155, 220);
      pdf.text(`Mobile No. : ${member.contact}`, 155, 250);

      // QR Placement (FIXED)
      if (qrData) {
        pdf.addImage(qrData, "PNG", 490, 125, 75, 75);
        pdf.setTextColor(...navy); pdf.setFontSize(8);
        pdf.text("SCAN TO VERIFY", 527, 210, { align: "center" });
      }

      // Signature
      if (signData) pdf.addImage(signData, "PNG", 480, 275, 90, 35);
      pdf.setDrawColor(...navy); pdf.line(475, 312, 580, 312);
      pdf.setFontSize(10); pdf.text("Auth. Signatory", 527, 325, { align: "center" });

      // --- PAGE 2: BACK SIDE ---
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
    <div className="max-w-7xl mx-auto space-y-6 pb-10 px-4">
      <div className="bg-[#001F3F] p-8 rounded-[2.5rem] text-white flex justify-between items-center shadow-2xl border-b-4 border-red-700">
        <div className="flex items-center gap-5 italic font-black text-3xl">CIB ADMIN TERMINAL</div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <OfficerSidebar 
            searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
            filteredMembers={approvedMembers.filter(m => m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()))} 
            selectedMemberId={selectedMemberId} setSelectedMemberId={setSelectedMemberId} 
        />
        <IdEditorForm 
            member={member} handleInput={(e) => setMember({...member, [e.target.name]: e.target.value})}
            syncToDatabase={syncToDatabase} onPreviewClick={() => setShowModal(true)} 
            isProcessing={isProcessing} isDataSynced={isDataSynced} updateSuccess={updateSuccess} 
        />
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
            <div className="bg-[#f3f4f6] rounded-[2.5rem] w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-white">
                <h2 className="font-black uppercase text-sm tracking-widest text-[#001F3F]">Visual Verification Preview</h2>
                <button onClick={() => setShowModal(false)} className="p-2 bg-red-100 text-red-600 rounded-full"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center no-scrollbar">
                <IdCardTemplate member={member} />
              </div>

              <div className="p-6 border-t flex justify-between items-center bg-white">
                 <span className="text-[10px] font-black text-gray-400">ENCRYPTION ACTIVE • SECURE PDF ENGINE</span>
                 <button 
                  onClick={downloadOfficialPDF}
                  disabled={isDownloading}
                  className="px-10 py-3 bg-[#001F3F] text-white rounded-xl font-black uppercase text-xs flex items-center gap-2 shadow-xl active:scale-95 transition-all"
                 >
                   {isDownloading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                   {isDownloading ? "Generating QR & PDF..." : "Download 2-Page PDF"}
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminIdEngine;