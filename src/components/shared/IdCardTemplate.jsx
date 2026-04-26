import React, { forwardRef } from "react";
import logoImg from "../../assets/logo.png";
import signatureImg from "../../assets/signature.png";

const IdCardTemplate = forwardRef(({ member }, ref) => {
  const {
    name = "OFFICER NAME",
    designation = "MEMBER",
    idNumber = "PENDING",
    phone = "N/A",
    validUntil = "OCT. 2026",
    address = "N/A",
    photo = "",
    qrCodeData = ""
  } = member || {};

  const colors = {
    navy: "#001F3F",
    red: "#8B0000",
    lightRed: "#faccc9",
    white: "#ffffff",
    borderGray: "#d1d5db",
    textGray: "#6b7280"
  };

  const cardContainerStyle = {
    width: "max-content", 
    display: "flex",
    flexDirection: "column",
    gap: "25px",
    padding: "40px", 
    backgroundColor: "#f3f4f6",
    boxSizing: "border-box" 
  };

  const cardStyle = {
    width: "600px",
    height: "380px",
    backgroundColor: colors.white,
    position: "relative",
    overflow: "hidden",
    borderRadius: "15px",
    border: `3px solid ${colors.navy}`,
    display: "flex",
    flexDirection: "column",
    fontFamily: "Arial, sans-serif",
    boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
    flexShrink: 0,
    boxSizing: "border-box"
  };

  return (
    <div ref={ref} style={cardContainerStyle}>
      {/* ────── FRONT SIDE ────── */}
      <div style={cardStyle}>
        <img 
          src={logoImg} 
          style={{ position: "absolute", inset: 0, margin: "auto", width: "280px", opacity: 0.06, pointerEvents: "none" }} 
          alt="watermark"
        />

        <div style={{ minHeight: "28px", backgroundColor: colors.red, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 15px 0 15px", color: colors.white, fontSize: "11px", fontWeight: "bold", boxSizing: "border-box" }}>
          <span>REGD. BY GOVT. OF INDIA</span>
          <span>543/12 ACT.1882</span>
        </div>

        {/* 🔥 FIX: height ko minHeight: "86px" kiya aur padding adjust ki */}
        <div style={{ minHeight: "86px", backgroundColor: colors.navy, display: "flex", alignItems: "center", padding: "10px 15px", boxSizing: "border-box" }}>
          <img src={logoImg} style={{ width: "60px", height: "60px", objectFit: "contain" }} alt="logo" />
          <div style={{ marginLeft: "15px", flex: 1 }}>
            <h1 style={{ color: colors.white, fontSize: "26px", fontWeight: "900", margin: 0, lineHeight: 1.1 }}>CRIME INFORMATION BUREAU</h1>
            {/* 🔥 FIX: margin: "4px 0 0 0" lagaya taaki bottom ka extra gap khatam ho jaye */}
            <p style={{ color: colors.lightRed, fontSize: "11px", fontWeight: "bold", margin: "4px 0 0 0", textTransform: "uppercase", letterSpacing: "1px" }}>Information Service of India</p>
          </div>
          <div style={{ backgroundColor: colors.red, border: `1px solid ${colors.lightRed}`, padding: "4px 12px", borderRadius: "6px", color: colors.white, fontSize: "10px", fontWeight: "bold" }}>
            RASHTRIYA SEVA
          </div>
        </div>
        <div style={{ height: "4px", backgroundColor: colors.lightRed }}></div>

        <div style={{ display: "flex", padding: "20px", gap: "25px", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
            <div style={{ width: "115px", height: "140px", border: `3px solid ${colors.navy}`, borderRadius: "10px", overflow: "hidden", backgroundColor: "#f9fafb" }}>
              <img 
                src={photo || "https://via.placeholder.com/150"} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                alt="officer" 
                crossOrigin="anonymous" 
              />
            </div>
            <div style={{ width: "115px", backgroundColor: colors.red, padding: "5px 0", borderRadius: "6px", textAlign: "center", color: colors.white }}>
              <p style={{ fontSize: "9px", fontWeight: "bold", margin: 0 }}>ID NUMBER</p>
              <p style={{ fontSize: "15px", fontWeight: "900", margin: 0 }}>{idNumber}</p>
            </div>
          </div>

          <div style={{ flex: 1, paddingTop: "5px" }}>
            <h2 style={{ color: colors.navy, fontSize: "30px", fontWeight: "900", textTransform: "uppercase", margin: 0, lineHeight: 1 }}>{name}</h2>
            <div style={{ height: "2.5px", backgroundColor: colors.red, width: "100%", margin: "10px 0" }}></div>
            
            <div style={{ fontSize: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex" }}>
                <span style={{ width: "110px", color: colors.textGray, fontWeight: "bold" }}>Designation</span>
                <span style={{ fontWeight: "bold", marginRight: "10px" }}>:</span>
                <span style={{ color: colors.red, fontWeight: "900", textTransform: "uppercase" }}>{designation}</span>
              </div>
              <div style={{ display: "flex" }}>
                <span style={{ width: "110px", color: colors.textGray, fontWeight: "bold" }}>Working Area</span>
                <span style={{ fontWeight: "bold", marginRight: "10px" }}>:</span>
                <span style={{ color: "#000", fontWeight: "bold", fontSize: "12px", flex: 1 }}>{address}</span>
              </div>
              <div style={{ display: "flex" }}>
                <span style={{ width: "110px", color: colors.textGray, fontWeight: "bold" }}>Mobile No.</span>
                <span style={{ fontWeight: "bold", marginRight: "10px" }}>:</span>
                <span style={{ color: "#000", fontWeight: "900" }}>{phone}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px" }}>
             <div style={{ width: "85px", height: "85px", border: `1px solid ${colors.borderGray}`, backgroundColor: colors.white, padding: "2px" }}>
                {qrCodeData ? (
                   <img src={qrCodeData} style={{ width: "100%", height: "100%" }} alt="QR" />
                ) : (
                   <div style={{ fontSize: "8px", textAlign: "center", paddingTop: "30px", color: "#ccc" }}>QR AREA</div>
                )}
             </div>
             <div style={{ textAlign: "center" }}>
                <img src={signatureImg} style={{ width: "90px", height: "35px", objectFit: "contain" }} alt="sign" />
                <div style={{ height: "1.5px", backgroundColor: colors.navy, width: "100px", margin: "2px auto" }}></div>
                <p style={{ fontSize: "10px", fontWeight: "900", color: colors.navy, margin: 0 }}>R.K. Upadhyay</p>
                <p style={{ fontSize: "8px", fontWeight: "bold", color: colors.textGray, margin: 0 }}>Director, C.I.B.</p>
             </div>
          </div>
        </div>

        <div style={{ height: "40px", backgroundColor: colors.navy, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", color: colors.white }}>
          <p style={{ fontSize: "9px", margin: 0 }}>Sitapur Eye Hospital, Park Road, Gorakhpur (U.P.) - 273001</p>
          <p style={{ color: colors.lightRed, fontSize: "13px", fontWeight: "900", margin: 0 }}>VALID TILL: {validUntil}</p>
        </div>
      </div>

      {/* ────── BACK SIDE ────── */}
      <div style={cardStyle}>
         <img src={logoImg} style={{ position: "absolute", inset: 0, margin: "auto", width: "250px", opacity: 0.05 }} alt="bg" />

         <div style={{ display: "flex", width: "100%", padding: "25px 40px", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ width: "155px", height: "55px", backgroundColor: colors.navy, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: `8px solid ${colors.red}` }}>
               <div style={{ textAlign: "center" }}>
                  <p style={{ color: colors.white, fontSize: "12px", fontWeight: "900", fontStyle: "italic", margin: 0 }}>POLICE</p>
                  <p style={{ color: colors.lightRed, fontSize: "22px", fontWeight: "900", lineHeight: 1, margin: 0 }}>112</p>
               </div>
            </div>

            <img src={logoImg} style={{ width: "85px", height: "85px", objectFit: "contain" }} alt="logo" />

            <div style={{ width: "155px", height: "55px", backgroundColor: colors.navy, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", borderRight: `8px solid ${colors.red}` }}>
               <div style={{ textAlign: "center" }}>
                  <p style={{ color: colors.white, fontSize: "10px", fontWeight: "900", fontStyle: "italic", margin: 0 }}>WOMEN CELL</p>
                  <p style={{ color: colors.lightRed, fontSize: "22px", fontWeight: "900", lineHeight: 1, margin: 0 }}>1090</p>
               </div>
            </div>
         </div>

         <div style={{ padding: "0 45px", fontSize: "14px", fontWeight: "bold", color: "#333", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", gap: "10px" }}>
               <span style={{ color: colors.red }}>1.</span>
               <p style={{ margin: 0 }}>Card authorized for government support in crime control.</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
               <span style={{ color: colors.red }}>2.</span>
               <p style={{ margin: 0 }}>Mandatory to inform nearest police station/DM about this card.</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
               <span style={{ color: colors.red }}>3.</span>
               <p style={{ margin: 0 }}>Follow the law and help in banning anti-national activities.</p>
            </div>
         </div>

         <div style={{ width: "100%", textAlign: "center", marginTop: "auto", paddingBottom: "15px" }}>
            <div style={{ backgroundColor: colors.lightRed, display: "inline-block", padding: "2px 30px", borderRadius: "20px", marginBottom: "8px" }}>
               <span style={{ color: colors.navy, fontWeight: "900", fontSize: "14px" }}>CENTRAL OFFICE</span>
            </div>
            <p style={{ color: colors.navy, fontSize: "12px", fontWeight: "bold", margin: "0 0 4px 0" }}>Beside SITAPUR EYE HOSPITAL, Park Road, Gorakhpur, 273001 (U.P.)</p>
            <p style={{ color: colors.red, fontSize: "11px", fontWeight: "bold", margin: 0 }}>
               E-Mail: <span style={{ color: colors.navy }}>cibindia11@gmail.com</span> | Website: <span style={{ color: colors.navy }}>crimeindia.in</span>
            </p>
            <p style={{ color: colors.red, fontSize: "14px", fontWeight: "900", marginTop: "5px" }}>Helpline No. - 9453591912</p>
         </div>
      </div>
    </div>
  );
});

IdCardTemplate.displayName = "IdCardTemplate";
export default IdCardTemplate;