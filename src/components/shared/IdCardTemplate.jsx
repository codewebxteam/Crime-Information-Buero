import React, { useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import logoImg from "../../assets/logo.png";
import signatureImg from "../../assets/signature.png";
import { Download, Loader2 } from "lucide-react";

const IdCardGenerator = ({ member }) => {
  const [loading, setLoading] = useState(false);

  // ── Helper 1: Load Images properly for PDF ──
  const loadImage = (src) => {
    return new Promise((resolve) => {
      if (!src) {
        resolve(null);
        return;
      }
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.95));
      };
      img.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
        resolve(null);
      };
    });
  };

  // ── Helper 2: Generate Valid QR Code dynamically ──
  const generateValidQR = async (dataText) => {
    try {
      return await QRCode.toDataURL(dataText, {
        margin: 1,
        width: 150,
        color: {
          dark: "#001F3F", // Navy Blue QR Code
          light: "#FFFFFF",
        },
      });
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // ── Helper 3: Fallback Photo Maker (Initials) ──
  const getPhotoPlaceholder = (name) => {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 250;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#E5E7EB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#555555";
    ctx.font = "bold 100px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name ? name.charAt(0).toUpperCase() : "M", 100, 125);
    return canvas.toDataURL("image/jpeg");
  };

  // ── MAIN PDF GENERATOR FUNCTION ──
  const generatePDF = async () => {
    setLoading(true);
    try {
      // Create PDF measuring EXACTLY 600px by 380px
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [600, 380],
      });

      // --- Define Colors to match Front and Back ---
      const navyBlue = [0, 31, 63];
      const darkRed = [139, 0, 0];
      const yellow = [250, 204, 21];
      const white = [255, 255, 255];
      const black = [0, 0, 0];
      const grayText = [85, 85, 85];

      // --- Load All Assets ---
      const photoSrc = member?.photo || getPhotoPlaceholder(member?.name);
      const photoData = await loadImage(photoSrc);
      const logoData = await loadImage(logoImg);
      const signatureData = await loadImage(signatureImg);

      // Create a valid QR containing Member ID and Name
      const qrDataText = `CIB Verified Member\nName: ${member?.name || "SRIJAN PANDEY"}\nID: ${member?.idNumber || "90414"}\nRank: ${member?.rank || "Crime Reporter"}`;
      const qrData = await generateValidQR(qrDataText);

      // =====================================================================
      // PAGE 1: FRONT SIDE (Dynamic)
      // =====================================================================

      pdf.setFillColor(...white);
      pdf.rect(0, 0, 600, 380, "F");

      // Outer Thick Navy Blue Border (Radius 12px)
      pdf.setDrawColor(...navyBlue);
      pdf.setLineWidth(3);
      pdf.roundedRect(1.5, 1.5, 597, 377, 12, 12, "S");

      // Watermark
      if (logoData) {
        pdf.saveGraphicsState();
        pdf.setGState(new pdf.GState({ opacity: 0.08 }));
        pdf.addImage(logoData, "JPEG", 160, 25, 280, 280);
        pdf.restoreGraphicsState();
      }

      // Top Red Strip
      pdf.setFillColor(...darkRed);
      pdf.roundedRect(3, 3, 594, 25, 10, 10, "F");
      pdf.rect(3, 15, 594, 13, "F");

      pdf.setTextColor(...white);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("REGD. BY GOVT. OF INDIA", 20, 19);
      pdf.text("543/12 ACT.1882", 580, 19, { align: "right" });

      // Main Header
      pdf.setFillColor(...navyBlue);
      pdf.rect(3, 28, 594, 75, "F");
      pdf.setFillColor(...yellow);
      pdf.rect(3, 103, 594, 4, "F");

      if (logoData) {
        pdf.addImage(logoData, "PNG", 20, 38, 55, 55);
      }

      pdf.setTextColor(...white);
      pdf.setFont("times", "bold");
      pdf.setFontSize(28);
      pdf.text("CRIME INFORMATION BUREAU", 90, 65);

      pdf.setTextColor(...yellow);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(
        "I N F O R M A T I O N   S E R V I C E   O F   I N D I A",
        90,
        85,
      );

      pdf.setFillColor(...darkRed);
      pdf.setDrawColor(...yellow);
      pdf.setLineWidth(1);
      pdf.roundedRect(475, 45, 105, 30, 4, 4, "FD");
      pdf.setTextColor(...white);
      pdf.setFontSize(11);
      pdf.text("RASHTRIYA SEVA", 527.5, 64, { align: "center" });

      // Photo & ID
      pdf.setDrawColor(...navyBlue);
      pdf.setLineWidth(3);
      pdf.roundedRect(20, 125, 110, 130, 6, 6, "S");
      if (photoData) {
        pdf.addImage(photoData, "JPEG", 21.5, 126.5, 107, 127);
      }

      pdf.setFillColor(...darkRed);
      pdf.roundedRect(20, 265, 110, 45, 4, 4, "F");
      pdf.setTextColor(...white);
      pdf.setFontSize(10);
      pdf.text("ID NUMBER", 75, 283, { align: "center" });
      pdf.setFontSize(15);
      pdf.text(member?.idNumber || "90414", 75, 300, { align: "center" });

      // Name & Details
      pdf.setTextColor(...navyBlue);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(28);
      const nameText = (member?.name || "SRIJAN PANDEY").toUpperCase();
      pdf.text(nameText, 155, 155);

      const nameWidth = pdf.getTextWidth(nameText);
      pdf.setDrawColor(...darkRed);
      pdf.setLineWidth(2);
      pdf.line(155, 162, 155 + nameWidth, 162);

      const detailStartY = 195;
      const lineHeight = 30;

      const drawRow = (label, value, yPos, isRed = false) => {
        pdf.setFontSize(14);
        pdf.setTextColor(...grayText);
        pdf.text(label, 155, yPos);
        pdf.setTextColor(...black);
        pdf.text(":", 255, yPos);

        if (isRed) {
          pdf.setTextColor(...darkRed);
          pdf.text((value || "").toUpperCase(), 270, yPos);
        } else {
          pdf.setTextColor(...black);
          pdf.text(value || "-", 270, yPos);
        }
      };

      drawRow(
        "Designation",
        member?.rank || "Crime Reporter",
        detailStartY,
        true,
      );
      drawRow(
        "Working Area",
        member?.address || "Gorakhpur Division : Head Quarter",
        detailStartY + lineHeight,
      );
      drawRow(
        "Mobile No.",
        member?.contact || "+91 9453591912",
        detailStartY + lineHeight * 2,
      );

      // QR & Signature
      if (qrData) {
        pdf.addImage(qrData, "PNG", 490, 125, 75, 75);
      }
      pdf.setTextColor(...navyBlue);
      pdf.setFontSize(9);
      pdf.text("SCAN TO VERIFY", 527.5, 212, { align: "center" });

      if (signatureData) {
        pdf.addImage(signatureData, "PNG", 482.5, 275, 90, 35);
      }
      pdf.setDrawColor(...navyBlue);
      pdf.setLineWidth(1.5);
      pdf.line(475, 312, 580, 312);

      pdf.setFontSize(11);
      pdf.text("R.K. Upadhyay", 527.5, 325, { align: "center" });

      pdf.setTextColor(...grayText);
      pdf.setFontSize(9);
      pdf.text("Director, C.I.B.", 527.5, 337, { align: "center" });

      // Footer Bar
      pdf.setFillColor(...navyBlue);
      pdf.roundedRect(3, 340, 594, 37, 10, 10, "F");
      pdf.rect(3, 340, 594, 20, "F");

      pdf.setTextColor(...white);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.text(
        "Sitapur Eye Hospital, Park Road, Gorakhpur (U.P.) - 273001",
        20,
        363,
      );

      pdf.setTextColor(...yellow);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.text(`VALID TILL: ${member?.validUntil || "OCT. 2026"}`, 580, 363, {
        align: "right",
      });

      // =====================================================================
      // PAGE 2: BACK SIDE (Static & Matched Theme)
      // =====================================================================

      pdf.addPage();

      // Background & Border
      pdf.setFillColor(...white);
      pdf.rect(0, 0, 600, 380, "F");
      pdf.setDrawColor(...navyBlue);
      pdf.setLineWidth(3);
      pdf.roundedRect(1.5, 1.5, 597, 377, 12, 12, "S");

      // Watermark
      if (logoData) {
        pdf.saveGraphicsState();
        pdf.setGState(new pdf.GState({ opacity: 0.08 }));
        pdf.addImage(logoData, "JPEG", 160, 25, 280, 280);
        pdf.restoreGraphicsState();
      }

      // -- Emergency Top Boxes --
      // Police 112
      pdf.setFillColor(...navyBlue);
      pdf.roundedRect(20, 20, 160, 55, 6, 6, "F");
      pdf.setFillColor(...darkRed);
      pdf.roundedRect(20, 20, 12, 55, 6, 6, "F"); // Red side-accent
      pdf.rect(26, 20, 6, 55, "F");

      pdf.setTextColor(...white);
      pdf.setFont("helvetica", "bolditalic");
      pdf.setFontSize(18);
      pdf.text("POLICE", 100, 43, { align: "center" });
      pdf.setTextColor(...yellow);
      pdf.setFontSize(22);
      pdf.text("112", 100, 65, { align: "center" });

      // Center Logo
      if (logoData) {
        pdf.addImage(logoData, "PNG", 250, 15, 100, 100);
      }

      // Women Cell 1090
      pdf.setFillColor(...navyBlue);
      pdf.roundedRect(420, 20, 160, 55, 6, 6, "F");
      pdf.setFillColor(...darkRed);
      pdf.roundedRect(568, 20, 12, 55, 6, 6, "F"); // Red side-accent right
      pdf.rect(568, 20, 6, 55, "F");

      pdf.setTextColor(...white);
      pdf.setFont("helvetica", "bolditalic");
      pdf.setFontSize(16);
      pdf.text("WOMEN CELL", 495, 43, { align: "center" });
      pdf.setTextColor(...yellow);
      pdf.setFontSize(22);
      pdf.text("1090", 495, 65, { align: "center" });

      // -- Rules Section --
      const ruleY = 135;
      const lineGap = 24;
      pdf.setFont("times", "bold");
      pdf.setFontSize(17);

      // Rule 1
      pdf.setTextColor(...darkRed);
      pdf.text("1.", 40, ruleY);
      pdf.setTextColor(...black);
      pdf.text(
        "The use of this card is authorized to support the government and",
        70,
        ruleY,
      );
      pdf.text("administration for crime control.", 70, ruleY + lineGap);

      // Rule 2
      pdf.setTextColor(...darkRed);
      pdf.text("2.", 40, ruleY + lineGap * 2.5);
      pdf.setTextColor(...black);
      pdf.text(
        "It is mandatory to give the information of this card to the nearest",
        70,
        ruleY + lineGap * 2.5,
      );
      pdf.text(
        "police station, District Magistrate.",
        70,
        ruleY + lineGap * 3.5,
      );

      // Rule 3
      pdf.setTextColor(...darkRed);
      pdf.text("3.", 40, ruleY + lineGap * 5);
      pdf.setTextColor(...black);
      pdf.text(
        "It is the responsibility of this card to comply with the law and",
        70,
        ruleY + lineGap * 5,
      );
      pdf.text("ban anti-national activities.", 70, ruleY + lineGap * 6);

      // -- Footer Details --
      // Central Office Banner
      pdf.setFillColor(...yellow);
      pdf.roundedRect(180, 285, 240, 28, 6, 6, "F");
      pdf.setTextColor(...navyBlue);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("CENTRAL OFFICE", 300, 305, { align: "center" });

      // Address
      pdf.setTextColor(...navyBlue);
      pdf.setFont("times", "bold");
      pdf.setFontSize(15);
      pdf.text(
        "Beside Of SITAPUR EYE HOSPITAL, Park Road, Gorakhpur, 273001 (U.P.)",
        300,
        335,
        { align: "center" },
      );

      // Email & Website
      pdf.setFontSize(13);
      pdf.setTextColor(...darkRed);
      pdf.text("E-Mail: ", 120, 355);
      pdf.setTextColor(...navyBlue);
      pdf.text("cibindia11@gmail.com, ", 170, 355);

      pdf.setTextColor(...darkRed);
      pdf.text("Website: ", 360, 355);
      pdf.setTextColor(...navyBlue);
      pdf.text("crimeindia.in", 420, 355);

      // Helpline
      pdf.setTextColor(...darkRed);
      pdf.setFontSize(16);
      pdf.text("Helpline No. - 9453591912", 300, 372, { align: "center" });

      // ───────────────────────────────────────────────
      // SAVE 2-PAGE PDF
      // ───────────────────────────────────────────────
      pdf.save(`ID_Card_${member?.name?.replace(/\s+/g, "_") || "Member"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Something went wrong while generating the ID Card.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow border border-gray-100 flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold text-gray-800">CIB 2-Sided ID Card</h2>
      <p className="text-sm text-gray-500 text-center max-w-md">
        Generates a High-Resolution Vector PDF (Front & Back Pages) with
        matching professional designs.
      </p>

      <button
        onClick={generatePDF}
        disabled={loading}
        className="px-6 py-3 bg-[#001F3F] text-white font-bold rounded-lg shadow-lg hover:bg-blue-900 transition flex items-center justify-center gap-2 w-full max-w-xs"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <Download size={20} />
        )}
        {loading ? "Generating..." : "Download 2-Page ID Card"}
      </button>
    </div>
  );
};

export default IdCardGenerator;
