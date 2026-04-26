import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Loader2, ShieldAlert } from "lucide-react";
import html2canvas from "html2canvas";
// 🔥 jsPDF ko hata diya gaya hai kyunki ab hum iframe use nahi karenge
import IdCardTemplate from "../shared/IdCardTemplate";

const IdPreviewModal = ({ isOpen, onClose, member }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [status, setStatus] = useState("initializing"); 
  const cardRef = useRef(null);

  useEffect(() => {
    if (isOpen && member) {
      generatePreview();
    } else {
      setPreviewImage(null);
      setStatus("initializing");
    }
  }, [isOpen, member]);

  const generatePreview = async () => {
    setStatus("capturing");
    try {
      await new Promise((r) => setTimeout(r, 1000));

      if (!cardRef.current) throw new Error("Template not found");

      // Card ka HD Screenshot capture kar rahe hain
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // HD Quality Preview
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#f3f4f6",
      });

      // 🔥 PDF ki jagah sirf Image save kar rahe hain
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      setPreviewImage(imgData);
      setStatus("done");
      
    } catch (error) {
      console.error("Preview Engine Error:", error);
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 bg-black sm:bg-black/90 backdrop-blur-sm"
    >
      <div className="bg-white dark:bg-[#0d0d0d] rounded-none sm:rounded-[2rem] w-full max-w-5xl h-[100dvh] sm:h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Header - Download icon removed, only Close (X) remains */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-[#111] z-20 shrink-0">
          <h2 className="font-black uppercase italic text-xs sm:text-sm tracking-widest text-[#001F3F] dark:text-white">
            Security <span className="text-red-600">ID Preview</span>
          </h2>
          
          <div className="flex items-center">
            {/* Sirf Close Button (Admin ke dekhne aur band karne ke liye) */}
            <button 
              onClick={onClose} 
              className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-700 hover:text-white transition-all active:scale-90"
              title="Close Preview"
            >
              <X size={20} className="sm:w-5 sm:h-5"/>
            </button>
          </div>
        </div>

        {/* Viewer Area */}
        <div className="flex-1 bg-[#1a1a1a] relative flex items-center justify-center overflow-hidden z-10 p-4">
          {status === "capturing" && (
            <div className="flex flex-col items-center text-white gap-4 p-4 text-center">
              <Loader2 className="animate-spin text-red-600 w-10 h-10 sm:w-12 sm:h-12" />
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] animate-pulse">
                Generating Secure Preview...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center text-red-500 gap-4 p-4 text-center">
              <ShieldAlert size={36} className="sm:w-10 sm:h-10" />
              <p className="text-xs sm:text-sm font-black uppercase tracking-widest">Preview Modulation Failed</p>
              <button 
                onClick={generatePreview} 
                className="px-5 py-2 bg-red-600 text-white rounded-lg text-xs font-bold active:scale-95 transition-all"
              >
                RETRY PREVIEW
              </button>
            </div>
          )}

          {/* 🔥 Main Change: Iframe PDF hatakar HTML <img> lagaya gaya hai */}
          {status === "done" && previewImage && (
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              <img 
                src={previewImage} 
                alt="ID Card Preview" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          )}

          {/* Hidden Capture Target - Template background ke hisaab se scale hoga */}
          <div className="absolute opacity-0 pointer-events-none" style={{ left: "-9999px" }}>
            <div ref={cardRef}>
              <IdCardTemplate member={member} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default IdPreviewModal;