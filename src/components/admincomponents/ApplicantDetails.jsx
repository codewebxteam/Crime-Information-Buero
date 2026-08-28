import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, MapPin, FileText, ExternalLink, RefreshCcw, ChevronDown, CheckCircle, XCircle, CreditCard, ShieldCheck } from "lucide-react";

const ApplicantDetails = ({ 
  selectedApp, isApproving, isRejecting, handleApprove, handleReject,
  isOpen, setIsOpen, trackStatus, setTrackStatus, statusOptions, 
  updateLiveDatabase, isUpdating 
}) => {
  if (!selectedApp) return null;

  const extendedStatusOptions = [
    { label: "Request Received", icon: <CheckCircle size={16} />, color: "text-blue-500" },
    { label: "Intelligence Verification", icon: <ShieldCheck size={16} />, color: "text-yellow-500" },
    { label: "Payment Pending", icon: <CreditCard size={16} />, color: "text-orange-500" }, 
    { label: "Approved", icon: <CheckCircle size={16} />, color: "text-green-500" },
    { label: "Rejected", icon: <XCircle size={16} />, color: "text-red-500" },
  ];

  // 🔥 Combine Photo and KYC images into one gallery
  const kycImages = selectedApp.kycUrls && selectedApp.kycUrls.length > 0 
    ? selectedApp.kycUrls 
    : (selectedApp.kycUrl ? [selectedApp.kycUrl] : []);
    
  const allDocuments = [];
  if (selectedApp.photoUrl) allDocuments.push({ url: selectedApp.photoUrl, label: "Profile Photo" });
  kycImages.forEach((url, i) => allDocuments.push({ url, label: `KYC Document ${i + 1}` }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-white dark:bg-[#111] rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/5 overflow-visible"
    >
      {/* Top Profile Header - Responsive Padding & Layout */}
      <div className="p-5 md:p-8 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gray-100 dark:bg-black overflow-hidden border-2 border-white dark:border-white/10 shadow-md">
            {selectedApp.photoUrl ? (
              <img src={selectedApp.photoUrl} alt="User" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <User size={40} />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-[#002B5B] dark:text-white uppercase leading-none">{selectedApp.fullName}</h3>
            <div className="mt-3 md:mt-2 flex justify-center md:justify-start">
              <span className="inline-block bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-3 py-1 rounded-md font-black text-[10px] md:text-xs uppercase tracking-widest border border-red-200 dark:border-red-800 shadow-sm">
                Applied For: {selectedApp.membershipLabel}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-bold flex items-center justify-center md:justify-start gap-1.5 mt-3 bg-gray-50 dark:bg-white/5 w-fit mx-auto md:mx-0 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-white/5">
              <MapPin size={14} className="text-blue-600 dark:text-blue-400" /> {selectedApp.district}, {selectedApp.state}
            </p>
          </div>
        </div>

        {/* Buttons - Mobile par full width stack */}
        <div className="flex flex-row md:flex-row gap-3 w-full md:w-auto">
          {selectedApp.status !== "Approved" && (
            <button 
              onClick={handleApprove} 
              disabled={isApproving} 
              className="flex-1 md:flex-none px-4 md:px-8 py-3 md:py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all active:scale-95 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isApproving ? <RefreshCcw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {isApproving ? "..." : "Approve"}
            </button>
          )}

          <button 
            onClick={handleReject} 
            disabled={isRejecting} 
            className="flex-1 md:flex-none px-4 md:px-8 py-3 md:py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all active:scale-95 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isRejecting ? <RefreshCcw size={14} className="animate-spin" /> : <XCircle size={14} />}
            {isRejecting ? "..." : "Reject"}
          </button>
        </div>
      </div>

      <div className="p-5 md:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 overflow-visible">
        {/* Info side */}
        <div className="space-y-6">
          {/* User Details Grid */}
          <div className="grid grid-cols-2 gap-4 p-5 md:p-6 bg-gray-50 dark:bg-black rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Email</p>
              <p className="text-[11px] md:text-sm font-bold text-[#002B5B] dark:text-white break-all">{selectedApp.email || "N/A"}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone Number</p>
              <p className="text-[11px] md:text-sm font-bold text-[#002B5B] dark:text-white">{selectedApp.phone || "N/A"}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 mt-2">
              <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Date of Birth</p>
              <p className="text-[11px] md:text-sm font-bold text-[#002B5B] dark:text-white">{selectedApp.dob || "N/A"}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 mt-2">
              <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Gender</p>
              <p className="text-[11px] md:text-sm font-bold text-[#002B5B] dark:text-white">{selectedApp.gender || "N/A"}</p>
            </div>
            <div className="col-span-2 mt-2 pt-3 border-t border-gray-200 dark:border-white/10">
              <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Address</p>
              <p className="text-[11px] md:text-sm font-bold text-[#002B5B] dark:text-white leading-relaxed">{selectedApp.address || "N/A"}</p>
            </div>
          </div>
          
          {/* Identity Proof & Photo Gallery */}
          <div className="flex flex-col gap-3 p-4 md:p-5 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-500 border-b border-gray-100 dark:border-white/5 pb-3">
              <FileText size={18} />
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                Identity & Documents {allDocuments.length > 0 ? `(${allDocuments.length})` : ''}
              </span>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-3 pt-2 custom-scrollbar">
              {allDocuments.length > 0 ? (
                allDocuments.map((doc, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 shrink-0">
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-white/10 group block shadow-md hover:border-red-500 transition-all"
                    >
                       <img src={doc.url} alt={doc.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                       <div className="absolute inset-0 bg-[#002B5B]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-[2px]">
                         <ExternalLink size={24} className="text-white mb-2" />
                         <span className="text-white text-[9px] font-black uppercase tracking-widest">View</span>
                       </div>
                    </a>
                    <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">{doc.label}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 font-bold italic">No documents available</p>
              )}
            </div>
          </div>
        </div>

        {/* Dropdown side */}
        <div className="space-y-4 relative z-30">
          <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Update Live Status</label>
          <div className="relative overflow-visible">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="w-full p-4 md:p-5 bg-white dark:bg-black border-2 border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-between text-[11px] md:text-xs font-black uppercase text-[#002B5B] dark:text-white shadow-sm"
            >
              <div className="flex items-center gap-3 truncate">
                {extendedStatusOptions.find(o => o.label === trackStatus)?.icon || <RefreshCcw size={16} />}
                <span className="truncate">{trackStatus}</span>
              </div>
              <ChevronDown size={18} className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 10 }} 
                  className="absolute left-0 right-0 z-[40] mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2"
                >
                  {extendedStatusOptions.map((opt) => (
                    <button 
                      key={opt.label} 
                      onClick={() => { setTrackStatus(opt.label); setIsOpen(false); }} 
                      className="w-full p-3 md:p-4 flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all text-left"
                    >
                      <span className={`${opt.color} flex-shrink-0`}>{opt.icon}</span>
                      <span className="text-[9px] md:text-[10px] font-black uppercase text-gray-600 dark:text-gray-300">{opt.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={updateLiveDatabase} 
            disabled={isUpdating} 
            className="w-full py-4 md:py-5 bg-[#002B5B] hover:bg-black text-white rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={isUpdating ? "animate-spin" : ""} />
            {isUpdating ? "..." : "Commit Status"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ApplicantDetails;