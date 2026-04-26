import React, { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, Loader2 } from "lucide-react";

const IdCardGenerator = ({ member, elementRef }) => {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    const element = elementRef?.current;

    if (!element) {
      alert("Error: Card design nahi mila! Page refresh karein.");
      return;
    }

    setLoading(true);

    try {
      // 🛑 Saare zabardasti wale layout hacks hata diye hain
      // Sirf sabse clean aur safe settings rakhi hain
      const canvas = await html2canvas(element, {
        scale: 3, // HD Quality ke liye
        useCORS: true, // Images aur Logo load karne ke liye
        backgroundColor: "#f3f4f6", // Template ka background
        logging: false,
        // 🔥 Ye dono lines scroll hone par PDF ko katne se rokti hain
        scrollX: 0,
        scrollY: -window.scrollY, 
        
        onclone: (clonedDoc) => {
          const els = clonedDoc.getElementsByTagName("*");
          for (let el of els) {
            // 🔥 Sirf Color Crash (oklch) ko fix kar rahe hain. 
            // Text aur Width/Height ko bilkul chheda nahi gaya hai.
            const style = window.getComputedStyle(el);
            if (style.color && style.color.includes("oklch")) el.style.color = "#001F3F";
            if (style.backgroundColor && style.backgroundColor.includes("oklch")) el.style.backgroundColor = "#ffffff";
            
            // Mobile screen wali scaling ko reset karne ke liye
            if (el.style.transform && el.style.transform !== "none") {
              el.style.transform = "none";
            }
          }
        }
      });

      const imgData = canvas.toDataURL("image/png");

      // A4 Size PDF setup
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Aspect ratio set karo
      const pdfHeight = (canvasHeight * pdfWidth) / canvasWidth;

      // 🔥 Top se 10mm ka safe margin de raha hoon taaki "REGD. BY GOVT" wala red border upar printer se kate nahi
      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight, undefined, 'FAST');

      const fileName = `CIB_Official_ID_${member?.idNumber || "Member"}.pdf`;
      pdf.save(fileName);

    } catch (err) {
      console.error("PDF Generate Error:", err);
      alert("PDF Generate hone mein problem aayi hai. Console check karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={loading || !member}
      className="w-full sm:w-auto bg-[#001F3F] hover:bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <Download size={18} />
      )}
      {loading ? "Generating Perfect PDF..." : "Download Official ID"}
    </button>
  );
};

export default IdCardGenerator;