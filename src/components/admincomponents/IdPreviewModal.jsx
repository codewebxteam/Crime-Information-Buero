import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Loader2, ShieldAlert } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import IdCardTemplate from "../shared/IdCardTemplate";

const IdPreviewModal = ({ isOpen, onClose, member }) => {
  const [pdfDataUri, setPdfDataUri] = useState(null);
  const [status, setStatus] = useState("initializing"); // initializing, capturing, done, error
  const cardRef = useRef(null);

  useEffect(() => {
    if (isOpen && member) {
      generatePdf();
    } else {
      setPdfDataUri(null);
      setStatus("initializing");
    }
  }, [isOpen, member]);

  const generatePdf = async () => {
    setStatus("capturing");
    try {
      // 1. Wait for DOM to settle
      await new Promise((r) => setTimeout(r, 1000));

      if (!cardRef.current) throw new Error("Template not found");

      // 2. High precision capture
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [100, 65],
      });

      pdf.addImage(imgData, "JPEG", 0, 0, 100, 65);
      setPdfDataUri(pdf.output("datauristring"));
      setStatus("done");
    } catch (error) {
      console.error("PDF Engine Error:", error);
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-sm"
    >
      <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl sm:rounded-[2rem] w-full max-w-5xl h-[95vh] sm:h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header - Made Padding smaller for mobile */}
        <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-gray-50/50 dark:bg-black/50">
          <h2 className="font-black uppercase italic text-[10px] sm:text-sm tracking-widest text-[#001F3F] dark:text-white">
            Security <span className="text-red-600">ID Preview</span>
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 sm:p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-700 hover:text-white transition-all"
          >
            <X size={18} className="sm:w-5 sm:h-5"/>
          </button>
        </div>

        {/* PDF Viewer Area - Flexible Height */}
        <div className="flex-1 bg-[#1a1a1a] relative flex items-center justify-center overflow-hidden">
          {status === "capturing" && (
            <div className="flex flex-col items-center text-white gap-4 p-4 text-center">
              <Loader2 className="animate-spin text-red-600 w-10 h-10 sm:w-12 sm:h-12" />
              <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] animate-pulse">
                Generating Secure Document...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center text-red-500 gap-4 p-4 text-center">
              <ShieldAlert size={36} className="sm:w-10 sm:h-10" />
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Preview Modulation Failed</p>
              <button 
                onClick={generatePdf} 
                className="px-5 py-2 bg-red-600 text-white rounded-lg text-[10px] font-bold active:scale-95"
              >
                RETRY CAPTURE
              </button>
            </div>
          )}

          {status === "done" && pdfDataUri && (
            <iframe 
              src={`${pdfDataUri}#view=FitH&toolbar=0`} 
              className="w-full h-full border-none" 
              title="Official ID" 
            />
          )}

          {/* Hidden Capture Target - Optimized for off-screen rendering */}
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