import React, { useState } from "react";
import jsPDF from "jspdf";
import logo from "../../assets/logo.png";
import bharatmata from "../../assets/bharatmata.webp";
import bhagatsingh from "../../assets/bhagatsingh.webp";
import signature from "../../assets/signature.png";

const CertificateTemplate = React.forwardRef(({ data }, ref) => {
  const [status, setStatus] = useState("idle");

  const name = data?.name || "Recipient Name";

  // ─── PURE jsPDF GENERATOR (EXACTLY LIKE YOUR BILLING.JSX) ───
  const handleDownload = async () => {
    setStatus("loading");
    try {
      // 1. Initialize A4 PDF (210 x 297 mm)
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // 2. Solid Image Loader (From your Billing.jsx)
      const loadImage = (src) => {
        return new Promise((resolve) => {
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
          img.onerror = () => resolve(null);
        });
      };

      // Load Assets
      const logoData = await loadImage(logo);
      const mataData = await loadImage(bharatmata);
      const bhagatData = await loadImage(bhagatsingh);
      const signData = await loadImage(signature);

      // Colors
      const creamColor = [255, 253, 232];
      const goldColor = [184, 136, 42];
      const navyColor = [13, 26, 107];
      const redColor = [192, 24, 26];

      // --- DRAW BACKGROUND & BORDERS ---
      pdf.setFillColor(...creamColor);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // Outer Gold Border
      pdf.setDrawColor(...goldColor);
      pdf.setLineWidth(2);
      pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);

      // Inner Navy Border
      pdf.setDrawColor(...navyColor);
      pdf.setLineWidth(0.5);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // --- DRAW HEADER ---
      // Red Top Half
      pdf.setFillColor(...redColor);
      pdf.rect(10, 10, pageWidth - 20, 14, "F");
      // Navy Bottom Half
      pdf.setFillColor(...navyColor);
      pdf.rect(10, 24, pageWidth - 20, 14, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("times", "bold");
      pdf.setFontSize(22);
      pdf.text("CRIME INFORMATION BUREAU", pageWidth / 2, 20, {
        align: "center",
      });

      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(10);
      pdf.text("Rastriya Seva  * National Service", pageWidth / 2, 33, {
        align: "center",
      });

      // --- DRAW IMAGES ---
      const imgY = 45;
      if (mataData) pdf.addImage(mataData, "JPEG", 20, imgY, 28, 36);
      if (logoData)
        pdf.addImage(logoData, "JPEG", pageWidth / 2 - 20, imgY - 5, 40, 40);
      if (bhagatData)
        pdf.addImage(bhagatData, "JPEG", pageWidth - 48, imgY, 28, 36);

      // --- TITLE ---
      const titleY = 110;
      pdf.setTextColor(...redColor);
      pdf.setFont("times", "bold");
      pdf.setFontSize(26);
      pdf.text("CERTIFICATE OF HONOUR", pageWidth / 2, titleY, {
        align: "center",
      });

      // Gold Line under title
      pdf.setDrawColor(...goldColor);
      pdf.setLineWidth(1);
      pdf.line(50, titleY + 5, pageWidth - 50, titleY + 5);

      // --- BODY CONTENT ---
      const bodyY = 135;
      pdf.setTextColor(80, 80, 80);
      pdf.setFont("times", "italic");
      pdf.setFontSize(16);
      pdf.text("This is to certify that", pageWidth / 2, bodyY, {
        align: "center",
      });

      // Member Name
      const nameY = 155;
      pdf.setTextColor(...navyColor);
      pdf.setFont("times", "bold");
      pdf.setFontSize(32);
      pdf.text(name, pageWidth / 2, nameY, { align: "center" });

      // Line under name
      pdf.setDrawColor(...navyColor);
      pdf.setLineWidth(0.5);
      pdf.line(40, nameY + 3, pageWidth - 40, nameY + 3);

      // Paragraph
      const textY = 180;
      pdf.setTextColor(30, 30, 30);
      pdf.setFont("times", "normal");
      pdf.setFontSize(16);

      pdf.text(
        "has been honoured by Crime Information Bureau (C.I.B)",
        pageWidth / 2,
        textY,
        { align: "center" },
      );
      pdf.text(
        "for outstanding social service and exemplary contribution",
        pageWidth / 2,
        textY + 10,
        { align: "center" },
      );
      pdf.text(
        "to the community. We extend our heartfelt best wishes",
        pageWidth / 2,
        textY + 20,
        { align: "center" },
      );

      pdf.setFont("times", "bolditalic");
      pdf.text(
        "for a bright and prosperous future.",
        pageWidth / 2,
        textY + 32,
        { align: "center" },
      );

      // --- SIGNATURE AREA ---
      const signY = 235;
      if (signData) {
        pdf.addImage(signData, "JPEG", pageWidth - 70, signY, 40, 15);
      }

      pdf.setDrawColor(...navyColor);
      pdf.line(pageWidth - 75, signY + 18, pageWidth - 25, signY + 18);

      pdf.setTextColor(...navyColor);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("R. K. Upadhyay", pageWidth - 50, signY + 24, {
        align: "center",
      });

      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text("Director, C.I.B.", pageWidth - 50, signY + 29, {
        align: "center",
      });

      // --- FOOTER ---
      pdf.setFillColor(...navyColor);
      pdf.rect(10, pageHeight - 30, pageWidth - 20, 20, "F");

      pdf.setTextColor(...goldColor);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(
        "Sitapur Eye Hospital, Park Road, Gorakhpur",
        pageWidth / 2,
        pageHeight - 20,
        { align: "center" },
      );

      pdf.setTextColor(200, 200, 200);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(
        "Helpline: 9453591912  |  Uttar Pradesh – 273001",
        pageWidth / 2,
        pageHeight - 14,
        { align: "center" },
      );

      // 3. Output PDF
      const safeName = name.trim().replace(/\s+/g, "_");
      pdf.save(`CIB_Certificate_${safeName}.pdf`);

      setStatus("done");
      setTimeout(() => setStatus("idle"), 3500);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF Error! Check console.");
      setStatus("idle");
    }
  };

  return (
    <div
      ref={ref}
      style={{
        fontFamily: "Georgia, serif",
        width: "100%",
        maxWidth: "650px",
        margin: "0 auto",
        padding: "0 10px 24px",
        userSelect: "none",
      }}
    >
      {/* ── VISUAL PREVIEW UI ── */}
      <div
        style={{
          width: "100%",
          aspectRatio: "210 / 297",
          background: "#FFFDE8",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          border: `4px solid #B8882A`,
          boxShadow: `inset 0 0 0 6px #FFFDE8, inset 0 0 0 8px rgba(242, 204, 96, 0.5), 0 12px 44px rgba(13,26,107,0.26)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: `linear-gradient(115deg, #C0181A 52%, #0D1A6B 52%)`,
            padding: "16px 20px",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              color: "#FFF",
              fontSize: "24px",
              fontWeight: "bold",
              letterSpacing: "1.5px",
              textShadow: "0 2px 6px rgba(0,0,0,0.4)",
              marginBottom: "6px",
            }}
          >
            CRIME INFORMATION BUREAU
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "11px",
              fontStyle: "italic",
              fontFamily: "sans-serif",
            }}
          >
            Rastriya Seva ✦ National Service
          </div>
        </div>

        <div
          style={{
            height: "3px",
            flexShrink: 0,
            background: `linear-gradient(90deg, #B8882A, #F2CC60 50%, #B8882A)`,
          }}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            padding: "24px 32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <img
              src={bharatmata}
              alt="Bharat Mata"
              style={{
                width: "74px",
                height: "90px",
                borderRadius: "8px",
                border: `3px solid #B8882A`,
                objectFit: "cover",
              }}
            />
            <img
              src={logo}
              alt="CIB Logo"
              style={{
                width: "105px",
                height: "105px",
                borderRadius: "50%",
                border: `4px solid #B8882A`,
                objectFit: "contain",
                background: "#fff",
              }}
            />
            <img
              src={bhagatsingh}
              alt="Bhagat Singh"
              style={{
                width: "85px",
                height: "85px",
                borderRadius: "50%",
                border: `3px solid #B8882A`,
                objectFit: "cover",
              }}
            />
          </div>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "26px",
                fontWeight: "bold",
                color: "#C0181A",
                letterSpacing: "2.5px",
                marginBottom: "6px",
              }}
            >
              CERTIFICATE OF HONOUR
            </div>
            <div
              style={{
                height: "2px",
                margin: "0 auto",
                width: "60%",
                background: `linear-gradient(90deg, transparent, #B8882A 30%, #F2CC60 50%, #B8882A 70%, transparent)`,
              }}
            />
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: "15px",
              color: "#444",
              fontStyle: "italic",
            }}
          >
            This is to certify that
          </div>

          <div style={{ textAlign: "center" }}>
            <span
              style={{
                display: "inline-block",
                fontSize: name ? "34px" : "24px",
                fontWeight: "bold",
                color: "#0D1A6B",
                borderBottom: `2px solid #0D1A6B`,
                paddingBottom: "4px",
                minWidth: "65%",
              }}
            >
              {name || <span style={{ color: "#bbb" }}>Recipient Name</span>}
            </span>
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: "16px",
              color: "#1A1A1A",
              lineHeight: 1.9,
            }}
          >
            has been honoured by Crime Information Bureau (C.I.B) <br />
            for outstanding social service and exemplary contribution <br />
            to the community. We extend our heartfelt best wishes <br />
            <em style={{ color: "#333", fontWeight: "bold" }}>
              for a bright and prosperous future.
            </em>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "10px",
            }}
          >
            <div style={{ textAlign: "center", minWidth: "170px" }}>
              <img
                src={signature}
                alt="Signature"
                style={{
                  height: "55px",
                  objectFit: "contain",
                  display: "block",
                  margin: "0 auto 4px",
                }}
              />
              <div
                style={{ borderTop: `1.5px solid #0D1A6B`, paddingTop: "6px" }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: "#0D1A6B",
                    fontFamily: "sans-serif",
                  }}
                >
                  R. K. Upadhyay
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#555",
                    fontStyle: "italic",
                    fontFamily: "sans-serif",
                    marginTop: "2px",
                  }}
                >
                  Director, C.I.B.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#0D1A6B",
            padding: "12px 20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "#F2CC60",
              fontWeight: "bold",
              fontSize: "13px",
              marginBottom: "3px",
              fontFamily: "sans-serif",
            }}
          >
            Sitapur Eye Hospital, Park Road, Gorakhpur
          </div>
          <div
            style={{
              color: "#ccc",
              fontSize: "11px",
              fontFamily: "sans-serif",
            }}
          >
            Helpline: 9453591912 | Uttar Pradesh – 273001
          </div>
        </div>
      </div>

      {/* ── DOWNLOAD BUTTON ── */}
      <button
        onClick={handleDownload}
        disabled={status === "loading"}
        style={{
          display: "block",
          width: "100%",
          marginTop: "20px",
          padding: "16px 0",
          background:
            status === "done"
              ? "linear-gradient(135deg, #2E7D32, #43A047)"
              : status === "loading"
                ? "#9E9E9E"
                : `linear-gradient(135deg, #0D1A6B 0%, #1a2ea6 100%)`,
          color: "#FFF",
          fontSize: "15px",
          fontWeight: "bold",
          fontFamily: "sans-serif",
          letterSpacing: "1px",
          border: "none",
          borderRadius: "10px",
          cursor: status === "loading" ? "not-allowed" : "pointer",
          boxShadow:
            status === "loading" ? "none" : "0 6px 24px rgba(13,26,107,0.3)",
          transition: "all 0.3s ease",
        }}
      >
        {status === "loading"
          ? "⏳ Generating True PDF..."
          : status === "done"
            ? "✅ Certificate Downloaded!"
            : "⬇ Download Certificate (A4 PDF)"}
      </button>
    </div>
  );
});

CertificateTemplate.displayName = "CertificateTemplate";
export default CertificateTemplate;
