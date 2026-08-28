import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileWarning, MapPin, Upload, Send, ShieldAlert, CheckCircle2, 
  Info, Loader2, FileText, AlertTriangle, ChevronDown, Check, ShieldCheck 
} from 'lucide-react';

const FileReport = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDropOpen, setIsDropOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const dropdownRef = useRef(null);

  const categories = [
    "Cyber Crime / Online Fraud",
    "Corruption / Bribery Case",
    "Suspicious Activity Report",
    "Financial & Bank Fraud",
    "Public Safety Threat"
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!selectedCategory) return alert("Please select a category.");
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] dark:bg-[#0a0a0a] px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl w-full p-8 md:p-12 bg-white dark:bg-[#111] rounded-[2.5rem] shadow-2xl text-center border-2 border-green-600/30">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl md:text-4xl font-black text-[#002B5B] dark:text-white uppercase italic tracking-tighter mb-4">Transmission Complete</h2>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">Case encrypted & uploaded.</p>
          <button onClick={() => {setIsSuccess(false); setSelectedCategory("");}} className="w-full bg-red-700 text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.3em]">File New Case</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pt-20 md:pt-32 pb-10 bg-[#f0f2f5] dark:bg-[#0a0a0a] transition-colors duration-500 overflow-x-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Responsive Header */}
        <div className="mb-10 md:mb-16 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-red-700/10 text-red-700 px-4 py-1.5 rounded-full border border-red-700/20">
            <ShieldAlert size={14} className="animate-pulse" />
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Secure Bureau Uplink</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-[1000] text-[#002B5B] dark:text-white uppercase tracking-tighter italic leading-none break-words">
            File <span className="text-red-700">Report</span>
          </h1>
        </div>

        {/* Main Grid: Responsive Stacking */}
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
          
          {/* Form Side - Takes full width on mobile, 2/3 on desktop */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full lg:w-2/3 bg-white dark:bg-[#111] rounded-[2rem] shadow-xl border border-gray-200 dark:border-white/5 p-5 sm:p-8 md:p-12"
          >
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Category Dropdown */}
                <div className="space-y-2" ref={dropdownRef}>
                  <label className="text-[9px] font-black text-[#002B5B] dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle size={12} className="text-red-700" /> Category
                  </label>
                  <div className="relative">
                    <div 
                      onClick={() => setIsDropOpen(!isDropOpen)}
                      className="w-full bg-white dark:bg-black border-2 border-gray-200 dark:border-white/10 rounded-xl py-4 pl-11 pr-4 text-xs sm:text-sm font-bold cursor-pointer transition-all flex items-center justify-between"
                    >
                      <FileWarning className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <span className="truncate pr-2">{selectedCategory || "Select Type"}</span>
                      <ChevronDown size={18} className={`shrink-0 transition-transform ${isDropOpen ? 'rotate-180' : ''}`} />
                    </div>
                    <AnimatePresence>
                      {isDropOpen && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute z-[100] w-full mt-2 bg-white dark:bg-[#151515] border-2 border-gray-100 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden">
                          {categories.map((cat, i) => (
                            <div key={i} onClick={() => {setSelectedCategory(cat); setIsDropOpen(false);}} className="px-5 py-4 hover:bg-red-700/5 dark:hover:bg-red-900/20 cursor-pointer border-b last:border-none border-gray-50 dark:border-white/5 text-[10px] font-black uppercase text-gray-600 dark:text-gray-300">
                              {cat}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[#002B5B] dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={12} className="text-red-700" /> Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="State/City" required className="w-full bg-white dark:bg-black border-2 border-gray-200 dark:border-white/10 rounded-xl py-4 pl-11 text-xs sm:text-sm font-bold outline-none focus:border-red-700 dark:text-white transition-all" />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#002B5B] dark:text-gray-400 uppercase tracking-widest">Case Headline</label>
                <input type="text" placeholder="Summary" required className="w-full bg-white dark:bg-black border-2 border-gray-200 dark:border-white/10 rounded-xl py-4 px-5 text-xs sm:text-sm font-bold outline-none focus:border-red-700 dark:text-white transition-all" />
              </div>

              {/* Details */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#002B5B] dark:text-gray-400 uppercase tracking-widest">Full Statement</label>
                <textarea rows={6} placeholder="Describe the incident..." required className="w-full bg-white dark:bg-black border-2 border-gray-200 dark:border-white/10 rounded-xl py-4 px-5 text-xs sm:text-sm font-bold outline-none focus:border-red-700 dark:text-white transition-all resize-none" />
              </div>

              {/* Upload Dropzone */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#002B5B] dark:text-gray-400 uppercase tracking-widest">Evidence</label>
                <label className="flex flex-col items-center justify-center min-h-[120px] border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-white/5 hover:border-red-700 transition-all cursor-pointer p-4">
                  <Upload className="text-gray-400 mb-2" size={24} />
                  <span className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Attach Official Proofs</span>
                  <input type="file" className="hidden" />
                </label>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-red-700 text-white py-5 rounded-xl font-black uppercase text-[10px] sm:text-[12px] tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl">
                {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : <><Send size={18} /> Transmit Report</>}
              </button>
            </form>
          </motion.div>

          {/* Sidebar - Stacks below on mobile, Right side on desktop */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-[#002B5B] p-8 md:p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
              <ShieldAlert className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 -rotate-12" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-4">Warning</h4>
              <p className="text-xl md:text-2xl font-black italic tracking-tighter leading-tight mb-8">False declarations are punishable by law.</p>
              <ul className="space-y-4">
                {['Accurate Timeline', 'Clear Evidence'].map((t, i) => (
                  <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase opacity-70">
                    <div className="w-1.5 h-1.5 bg-red-700 rounded-full" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-200 dark:border-white/10 flex items-center gap-4">
              <div className="bg-green-500/10 p-3 rounded-xl text-green-500 shrink-0"><ShieldCheck size={28} /></div>
              <div>
                <p className="text-[10px] font-black text-[#002B5B] dark:text-white uppercase leading-tight">Secured Uplink</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">AES-256 Verified</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FileReport;