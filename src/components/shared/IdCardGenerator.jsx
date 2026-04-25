import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { Download, Loader2 } from "lucide-react";

import logoImg from "../../assets/logo.png";
import signatureImg from "../../assets/signature.png";

const IdCardGenerator = ({ member }) => {
  const [loading, setLoading] = useState(false);

  // 🔥 ALWAYS LATEST DATA
  const memberRef = useRef(member);

  useEffect(() => {
    memberRef.current = member;
  }, [member]);

  const loadImage = (src) => {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = src;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const maxWidth = 500;
        const scale = Math.min(1, maxWidth / img.width);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };

      img.onerror = () => resolve(null);
    });
  };

  const generatePDF = async () => {
    const currentMember = memberRef.current;

    if (!currentMember) {
      alert("Member data not ready!");
      return;
    }

    setLoading(true);

    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [600, 380],
      });

      const navy = [0, 31, 63];

      // 🔥 ALWAYS LATEST VALUES
      const name = currentMember.name || "N/A";
      const designation = currentMember.designation || "MEMBER";
      const idNumber = currentMember.idNumber || "PENDING";
      const address = currentMember.address || "N/A";
      const photo = currentMember.photo || "";
      const validUntil = currentMember.validUntil || "OCT. 2026";
      const phone = currentMember.phone || currentMember.contact || "N/A";

      console.log("PDF DATA:", currentMember); // DEBUG

      const [pData, lData, sData] = await Promise.all([
        loadImage(photo),
        loadImage(logoImg),
        loadImage(signatureImg),
      ]);

      const qrText = `CIB VERIFIED\nName: ${name}\nPost: ${designation}\nID: ${idNumber}`;
      const qrData = await QRCode.toDataURL(qrText);

      // FRONT
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, 600, 380, "F");

      pdf.setDrawColor(...navy);
      pdf.setLineWidth(3);
      pdf.roundedRect(2, 2, 596, 376, 10, 10, "S");

      pdf.setFillColor(...navy);
      pdf.rect(3, 28, 594, 75, "F");

      if (lData) pdf.addImage(lData, "JPEG", 20, 38, 55, 55);

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.text("CRIME INFORMATION BUREAU", 90, 65);

      if (pData) {
        pdf.roundedRect(20, 125, 110, 130, 5, 5, "S");
        pdf.addImage(pData, "JPEG", 22, 127, 106, 126);
      }

      pdf.setTextColor(...navy);
      pdf.setFontSize(20);
      pdf.text(name.toUpperCase(), 155, 150);

      pdf.setTextColor(139, 0, 0);
      pdf.setFontSize(15);
      pdf.text(`Designation: ${designation.toUpperCase()}`, 155, 180);

      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(12);
      pdf.text(`Working Area: ${address}`, 155, 205);

      pdf.text(`Mobile: ${phone}`, 155, 230);

      if (qrData) pdf.addImage(qrData, "PNG", 490, 125, 75, 75);
      if (sData) pdf.addImage(sData, "PNG", 480, 275, 90, 35);

      pdf.line(475, 312, 580, 312);
      pdf.setFontSize(10);
      pdf.text("Auth. Signatory", 527, 325, { align: "center" });

      pdf.setFillColor(...navy);
      pdf.rect(3, 345, 594, 32, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.text(`VALID UNTIL: ${validUntil}`, 580, 365, {
        align: "right",
      });

      // BACK
      pdf.addPage();
      pdf.text("CENTRAL OFFICE", 300, 160, { align: "center" });

      pdf.save(`CIB_ID_${idNumber}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={loading}
      className="bg-[#002B5B] text-white px-6 py-3 rounded-xl flex items-center gap-2"
    >
      {loading ? <Loader2 className="animate-spin" /> : <Download />}
      {loading ? "Generating..." : "Download ID"}
    </button>
  );
};

export default IdCardGenerator;