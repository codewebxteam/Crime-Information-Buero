import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Heart, Banknote, AlertCircle, Phone, 
  Building2, BadgeCheck, Landmark, Info, Upload, 
  Send, Loader2, CheckCircle2, User, Mail, X, QrCode
} from "lucide-react";
import { db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadImageToCloudinary } from "../services/cloudinary.service";

// ✅ QR Image Import
import QRImage from "../assets/donates.jpeg"; 

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
  viewport: { once: true },
};

const Donate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    file: null,
    preview: ""
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, file, preview: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file || !formData.name || !formData.email) {
      alert("Please fill all required fields and upload donation screenshot");
      return;
    }
    setIsSubmitting(true);
    try {
      const imageUrl = await uploadImageToCloudinary(formData.file, "donations");
      if (!imageUrl) {
        alert("Image upload failed. Please try again.");
        setIsSubmitting(false);
        return;
      }
      await addDoc(collection(db, "donations"), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        screenshotUrl: imageUrl,
        status: "pending", 
        createdAt: serverTimestamp()
      });
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: "", email: "", phone: "", file: null, preview: "" });
    } catch (err) {
      console.error("Donation submission error:", err);
      alert("Submission failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#f8f9fa] dark:bg-[#0a0a0a] px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl w-full p-10 bg-white dark:bg-[#111] rounded-[3rem] shadow-2xl text-center border-2 border-green-600/30">
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
          <h2 className="text-3xl font-black text-[#002B5B] dark:text-white uppercase italic tracking-tighter mb-4">Thank You <span className="text-red-700">Patriot</span></h2>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mb-8 leading-relaxed">Your contribution has been received. Our vigilance unit will verify the transaction shortly.</p>
          <button onClick={() => setIsSuccess(false)} className="bg-[#002B5B] dark:bg-red-700 text-white px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg">Back to Portal</button>
        </motion.div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-[#f8f9fa] dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden relative">
      <div className="max-w-[1300px] mx-auto px-6">
        {/* Header Section */}
        <motion.div className="flex flex-col items-center text-center mb-16 border-b-2 border-red-700/20 pb-10" {...fadeUp}>
          <div className="bg-[#002B5B] text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2 mx-auto"><BadgeCheck size={12} className="text-red-500" /> Bureau Support Portal</div>
          <h1 className="text-5xl md:text-7xl font-black text-[#002B5B] dark:text-white uppercase tracking-tighter mb-2 leading-none">Support <span className="text-red-700 italic">CIB</span></h1>
          <p className="text-sm md:text-lg font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest italic leading-none">Financial Cooperation / Donation</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
          
          {/* LEFT: QR Code & Bank Details */}
          <div className="space-y-8">
            {/* 📸 QR CODE CARD */}
            <motion.div className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/5 text-center relative overflow-hidden" {...fadeUp}>
              <h3 className="text-xl font-black uppercase mb-8 flex items-center justify-center gap-3 italic text-[#002B5B] dark:text-white">
                <QrCode className="text-red-600" /> Scan & Pay
              </h3>
              
              {/* QR Image Box */}
              <div className="bg-white p-4 rounded-3xl inline-block shadow-inner border border-gray-100 mb-2">
                <img 
                  src={QRImage} 
                  alt="CIB UPI QR" 
                  className="w-64 h-64 md:w-72 md:h-72 object-contain"
                />
              </div>

              {/* ✅ UPI ID Text - Fixed directly under QR */}
              <div className="mt-4 mb-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Official UPI ID</p>
                <p className="text-lg font-black text-[#002B5B] dark:text-red-500 tracking-wider select-all">
                  cibindia11-1@okaxis
                </p>
              </div>
              
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Scan to pay with any UPI App (GPay, PhonePe, Paytm)
              </p>
            </motion.div>

            {/* Bank Assets Card */}
            <motion.div className="bg-[#002B5B] text-white p-10 rounded-3xl shadow-xl relative overflow-hidden group" {...fadeUp}>
              <Landmark className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
              <h3 className="text-2xl font-black uppercase mb-8 flex items-center gap-3 italic"><Building2 className="text-red-500" /> Bank Assets</h3>
              <div className="space-y-5 relative z-10">
                <div className="border-b border-white/10 pb-3"><p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">Organization Name</p><p className="text-lg font-bold uppercase">Crime Information Bureau</p></div>
                <div className="border-b border-white/10 pb-3"><p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">Banking Partner</p><p className="text-lg font-bold">Indian Overseas Bank (IOB)</p></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div><p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">Account No.</p><p className="text-xl font-black tracking-widest text-red-500">04520200000452</p></div>
                  <div><p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">IFSC Code</p><p className="text-xl font-black tracking-widest">IOBA0000452</p></div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Verification Form */}
          <motion.div className="bg-white dark:bg-[#111] p-8 md:p-12 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl lg:sticky lg:top-10" {...fadeUp}>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-red-700/10 p-3 rounded-2xl text-red-700"><Shield size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-[#002B5B] dark:text-white uppercase italic leading-none">Verification</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Submit Proof of Transfer</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name *</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required className="w-full bg-gray-50 dark:bg-black border-2 border-transparent focus:border-red-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all dark:text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email *</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required className="w-full bg-gray-50 dark:bg-black border-2 border-transparent focus:border-red-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all dark:text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Donation Screenshot *</label>
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-black/20 hover:border-red-700 cursor-pointer group transition-all overflow-hidden">
                  {formData.preview ? (
                    <img src={formData.preview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <Upload className="text-gray-400 group-hover:text-red-700 mb-2" size={24} />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload Screenshot</span>
                    </>
                  )}
                  <input type="file" required accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#002B5B] dark:bg-red-700 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 transition-all">
                {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : <><Send size={18} /> Submit Verification</>}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Donate;