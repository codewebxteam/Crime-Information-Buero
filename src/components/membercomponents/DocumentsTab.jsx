import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Award, ChevronDown, ShieldCheck, Info } from "lucide-react";
import QRCode from "qrcode";

// Shared Templates & Generators
import IdCardTemplate from "../shared/IdCardTemplate";
import CertificateTemplate from "../shared/CertificateTemplate";
import IdCardGenerator from "../shared/IdCardGenerator";

const DocumentAccordion = ({ title, icon, children, isOpen, onClick }) => {
  return (
    <div className="bg-white dark:bg-[#111] rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden mb-4 transition-all duration-300">
      {/* Accordion Header */}
      <button 
        onClick={onClick}
        className="w-full p-5 md:p-8 flex items-center justify-between text-left border-l-4 border-red-700 focus:outline-none transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <div className="text-red-700">{icon}</div>
          <h3 className="text-xs md:text-sm font-black text-[#002B5B] dark:text-white uppercase tracking-widest">
            {title}
          </h3>
        </div>
        
        {/* Mobile Dropdown Indicator */}
        <div className="md:hidden">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={20} className="text-gray-400" />
          </motion.div>
        </div>
      </button>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {(isOpen || window.innerWidth >= 1280) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="px-4 pb-8 md:px-8 md:pb-10 flex flex-col items-center">
              {/* Responsive Container */}
              <div className="w-full overflow-x-auto no-scrollbar py-6 bg-gray-50 dark:bg-black/40 rounded-2xl md:rounded-3xl border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center">
                <div className="scale-[0.6] xs:scale-[0.75] sm:scale-90 md:scale-100 origin-center transition-transform duration-500">
                  {children}
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                 <ShieldCheck size={14} className="text-green-500" /> Bureau Authenticated Document
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DocumentsTab = ({ formattedData }) => {
  // 1. Ref create karo for exact design capture
  const idCardPrintRef = useRef(null);
  
  // Mobile section state
  const [openSection, setOpenSection] = useState("id-card");
  const [qrDataUrl, setQrDataUrl] = useState("");

  // 2. Generate Dynamic QR Code
  useEffect(() => {
    if (formattedData?.idNumber) {
      const generateQR = async () => {
        try {
          const text = `CIB VERIFIED\nName: ${formattedData.name}\nPost: ${formattedData.designation}\nID: ${formattedData.idNumber}`;
          const url = await QRCode.toDataURL(text, {
            width: 200,
            margin: 1,
            color: { dark: "#001F3F", light: "#FFFFFF" }
          });
          setQrDataUrl(url);
        } catch (err) {
          console.error("QR Error:", err);
        }
      };
      generateQR();
    }
  }, [formattedData]);

  const toggleSection = (section) => {
    if (window.innerWidth < 1280) {
      setOpenSection(openSection === section ? null : section);
    }
  };

  // Combine data with QR
  const memberWithQr = {
    ...formattedData,
    qrCodeData: qrDataUrl
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8"
    >
      {/* --- Identity Card Section --- */}
      <DocumentAccordion 
        title="Bureau Identity Card" 
        icon={<CreditCard size={20} />}
        isOpen={openSection === "id-card"}
        onClick={() => toggleSection("id-card")}
      >
        <div className="flex flex-col items-center">
          {/* 3. Is div ko capture karega Generator. Background white zaroori hai. */}
          <div ref={idCardPrintRef} className="bg-white rounded-lg">
            <IdCardTemplate member={memberWithQr} />
          </div>

          <div className="mt-10 w-full flex flex-col items-center gap-4">
            {/* 4. Generator ko Ref pass kar di taaki wahi design nikaley */}
            <IdCardGenerator 
              member={memberWithQr} 
              elementRef={idCardPrintRef} 
            />
            <p className="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1">
              <Info size={12} /> HD Export (Front & Back Side Included)
            </p>
          </div>
        </div>
      </DocumentAccordion>

      {/* --- Certificate Section --- */}
      <DocumentAccordion 
        title="Membership Certificate" 
        icon={<Award size={20} />}
        isOpen={openSection === "certificate"}
        onClick={() => toggleSection("certificate")}
      >
        <div className="flex flex-col items-center">
          <CertificateTemplate data={formattedData} />
          
          <div className="mt-8 text-center space-y-2">
            <p className="text-[10px] font-black text-[#001F3F] dark:text-gray-300 uppercase italic tracking-[0.2em]">
              Official Membership Certification
            </p>
            <div className="h-1 w-20 bg-red-700 mx-auto rounded-full opacity-30"></div>
          </div>
        </div>
      </DocumentAccordion>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
};

export default DocumentsTab;