import React, { forwardRef } from "react";
import logoImg from "../../assets/logo.png";
import signatureImg from "../../assets/signature.png";

const IdCardTemplate = forwardRef(({ member }, ref) => {
  const {
    name = "OFFICER NAME",
    rank = "CRIME REPORTER",
    idNumber = "90414",
    contact = "+91 9453591912",
    validUntil = "OCT. 2026",
    address = "Gorakhpur Division : Head Quarter",
    photo = "",
  } = member || {};

  // Exact PDF dimensions scaled for web preview
  const cardContainerStyle = {
    width: "600px",
    height: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "20px",
    backgroundColor: "#f3f4f6",
  };

  const cardStyle = {
    width: "600px",
    height: "380px",
    backgroundColor: "white",
    position: "relative",
    overflow: "hidden",
    borderRadius: "12px",
    border: "3px solid #001F3F",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    flexShrink: 0,
  };

  return (
    <div ref={ref} style={cardContainerStyle}>
      {/* ────── FRONT SIDE ────── */}
      <div style={cardStyle} className="relative bg-white">
        {/* Watermark Logo */}
        <img 
          src={logoImg} 
          className="absolute inset-0 m-auto w-[280px] opacity-[0.08] pointer-events-none" 
          alt="watermark"
        />

        {/* Top Red Strip */}
        <div className="h-[25px] bg-[#8B0000] flex items-center justify-between px-4 text-white text-[11px] font-bold">
          <span>REGD. BY GOVT. OF INDIA</span>
          <span>543/12 ACT.1882</span>
        </div>

        {/* Main Navy Header */}
        <div className="h-[75px] bg-[#001F3F] flex items-center px-4 relative">
          <img src={logoImg} className="w-[55px] h-[55px] object-contain" alt="logo" />
          <div className="ml-4 flex-1">
            <h1 className="text-white text-[26px] font-serif font-bold leading-none">CRIME INFORMATION BUREAU</h1>
            <p className="text-[#faccc9] text-[11px] font-bold mt-1 tracking-wider uppercase">
              Information Service of India
            </p>
          </div>
          <div className="bg-[#8B0000] border border-[#faccc9] px-3 py-1 rounded-md text-white text-[10px] font-bold">
            RASHTRIYA SEVA
          </div>
        </div>
        <div className="h-[4px] bg-[#faccc9]"></div>

        {/* Details Section */}
        <div className="flex p-5 gap-6">
          {/* Photo & ID */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-[110px] h-[130px] border-[3px] border-[#001F3F] rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={photo || "https://via.placeholder.com/150"} 
                className="w-full h-full object-cover" 
                alt="officer"
                crossOrigin="anonymous" 
              />
            </div>
            <div className="w-[110px] bg-[#8B0000] py-1 rounded-md text-center text-white">
              <p className="text-[9px] font-bold mb-0 leading-none">ID NUMBER</p>
              <p className="text-[14px] font-black">{idNumber}</p>
            </div>
          </div>

          {/* Text Details */}
          <div className="flex-1">
            <h2 className="text-[#001F3F] text-[28px] font-black uppercase mb-0 leading-none">
              {name}
            </h2>
            <div className="h-[2px] bg-[#8B0000] w-full mt-2 mb-4"></div>
            
            <div className="space-y-3 text-[14px]">
              <div className="flex">
                <span className="w-[100px] text-gray-500 font-bold">Designation</span>
                <span className="font-bold mr-2">:</span>
                <span className="text-[#8B0000] font-black uppercase">{rank}</span>
              </div>
              <div className="flex">
                <span className="w-[100px] text-gray-500 font-bold">Working Area</span>
                <span className="font-bold mr-2">:</span>
                <span className="text-black font-bold uppercase text-[12px] leading-tight">{address}</span>
              </div>
              <div className="flex">
                <span className="w-[100px] text-gray-500 font-bold">Mobile No.</span>
                <span className="font-bold mr-2">:</span>
                <span className="text-black font-black">{contact}</span>
              </div>
            </div>
          </div>

          {/* Signature & QR Placeholder */}
          <div className="flex flex-col items-center justify-between py-2">
            <div className="w-[75px] h-[75px] bg-white border border-gray-200 flex items-center justify-center p-1">
               {/* QR Placeholder */}
               <div className="text-[8px] text-center font-bold text-[#001F3F]">QR CODE<br/>AREA</div>
            </div>
            <p className="text-[8px] font-bold text-[#001F3F] mt-1">SCAN TO VERIFY</p>

            <div className="mt-4 text-center">
              <img src={signatureImg} className="w-[90px] h-[35px] object-contain mb-1" alt="sign" />
              <div className="w-[100px] h-[1.5px] bg-[#001F3F]"></div>
              <p className="text-[10px] font-black text-[#001F3F] mt-1">R.K. Upadhyay</p>
              <p className="text-[8px] font-bold text-gray-400">Director, C.I.B.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 w-full h-[40px] bg-[#001F3F] flex items-center justify-between px-5 text-white">
          <p className="text-[10px] font-medium opacity-90">
            Sitapur Eye Hospital, Park Road, Gorakhpur (U.P.) - 273001
          </p>
          <p className="text-[#faccc9] text-[12px] font-black">
            VALID TILL: {validUntil}
          </p>
        </div>
      </div>

      {/* ────── BACK SIDE ────── */}
      <div style={cardStyle} className="relative bg-white flex flex-col items-center justify-between py-6">
         {/* Background Watermark */}
         <img src={logoImg} className="absolute inset-0 m-auto w-[250px] opacity-[0.05]" alt="bg" />

         <div className="flex w-full px-10 justify-between items-center">
            {/* Police Emergency Box */}
            <div className="w-[160px] h-[55px] bg-[#001F3F] rounded-lg flex items-center justify-center gap-3 relative overflow-hidden">
               <div className="absolute left-0 w-[12px] h-full bg-[#8B0000]"></div>
               <div className="text-center ml-2">
                  <p className="text-white text-[14px] font-black italic italic-bold">POLICE</p>
                  <p className="text-[#faccc9] text-[22px] font-black leading-none">112</p>
               </div>
            </div>

            {/* Back Logo */}
            <img src={logoImg} className="w-[90px] h-[90px] object-contain" alt="center-logo" />

            {/* Women Cell Box */}
            <div className="w-[160px] h-[55px] bg-[#001F3F] rounded-lg flex items-center justify-center gap-3 relative overflow-hidden">
               <div className="absolute right-0 w-[12px] h-full bg-[#8B0000]"></div>
               <div className="text-center mr-2">
                  <p className="text-white text-[12px] font-black italic">WOMEN CELL</p>
                  <p className="text-[#faccc9] text-[22px] font-black leading-none">1090</p>
               </div>
            </div>
         </div>

         {/* Rules Section */}
         <div className="px-12 w-full text-[15px] font-bold space-y-3 z-10">
            <div className="flex items-start gap-4">
               <span className="text-[#8B0000]">1.</span>
               <p>The use of this card is authorized to support the government and administration for crime control.</p>
            </div>
            <div className="flex items-start gap-4">
               <span className="text-[#8B0000]">2.</span>
               <p>It is mandatory to give the information of this card to the nearest police station, District Magistrate.</p>
            </div>
            <div className="flex items-start gap-4">
               <span className="text-[#8B0000]">3.</span>
               <p>It is the responsibility of this card to comply with the law and ban anti-national activities.</p>
            </div>
         </div>

         {/* Footer Area */}
         <div className="w-full px-10 text-center mb-2">
            <div className="bg-[#faccc9] inline-block px-8 py-1 rounded-full mb-3">
               <span className="text-[#001F3F] font-black text-[16px]">CENTRAL OFFICE</span>
            </div>
            <p className="text-[#001F3F] text-[13px] font-black mb-1">Beside Of SITAPUR EYE HOSPITAL, Park Road, Gorakhpur, 273001 (U.P.)</p>
            <p className="text-[#8B0000] text-[12px] font-bold">
               E-Mail: <span className="text-[#001F3F]">cibindia11@gmail.com</span> | Website: <span className="text-[#001F3F]">crimeindia.in</span>
            </p>
            <p className="text-[#8B0000] text-[15px] font-black mt-1">Helpline No. - 9453591912</p>
         </div>
      </div>
    </div>
  );
});

IdCardTemplate.displayName = "IdCardTemplate";
export default IdCardTemplate;