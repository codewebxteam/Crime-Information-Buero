import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon, ShieldCheck, Mail, MapPin, Phone, Calendar,
  CreditCard, Upload, CheckCircle, Loader2, AlertTriangle,
  Globe, Landmark, Award, Star, ArrowRight, X, FileText, Search, Clock,
  Eye, EyeOff
} from 'lucide-react';

import { db } from "../../firebase/firebase";
import { addDoc, collection, serverTimestamp, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { uploadImageToCloudinary } from "../../services/cloudinary.service";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir"
];

const MEMBERSHIP_LEVELS = [
  { value: "district", label: "District Level", price: "₹1,500", description: "Local networking and monthly reports" },
  { value: "state", label: "State Level", price: "₹3,000", description: "State-wide networking and quarterly reports" },
  { value: "national", label: "National Level", price: "₹6,000", description: "National networking and official certificate" },
];

const User = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('membership');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [showStatus, setShowStatus] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    dob: "",
    gender: "",
    state: "",
    district: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [kycFile, setKycFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const isFormValid = 
    formData.fullName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.password !== "" &&
    formData.password === formData.confirmPassword &&
    formData.phone.length === 10 &&
    formData.address.trim() !== "" &&
    formData.dob !== "" &&
    formData.gender !== "" &&
    formData.state !== "" &&
    formData.district.trim() !== "" &&
    selectedPlan !== null &&
    photoFile !== null &&
    kycFile !== null;

  const handleInput = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setFormErrors({ ...formErrors, [name]: "" });
  };

  // 🔥 FIX 1: Any Image Format, Max 2MB, No PDFs allowed for photo
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Bhai, photo sirf image format (JPG, PNG, etc.) mein upload karein!");
        e.target.value = null;
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("Photo ka size 2MB se zyada nahi hona chahiye!");
        e.target.value = null;
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleKycChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("KYC document sirf .pdf format mein hona chahiye!");
        e.target.value = null;
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("KYC file 2MB se badi hai!");
        e.target.value = null;
        return;
      }
      setKycFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const q = query(collection(db, "membershipApplications"), where("email", "==", formData.email.trim().toLowerCase()));
      const existing = await getDocs(q);
      if (!existing.empty) {
        alert("An application with this email already exists");
        setIsSubmitting(false);
        return;
      }

      const photoUrl = await uploadImageToCloudinary(photoFile, 'photos');
      const kycUrl = await uploadImageToCloudinary(kycFile, 'kyc');
      
      await addDoc(collection(db, "membershipApplications"), {
        ...formData,
        email: formData.email.trim().toLowerCase(),
        membershipLevel: selectedPlan.value,
        membershipLabel: selectedPlan.label,
        photoUrl,
        kycUrl,
        status: "Pending",
        tempPasswordHash: btoa(formData.password),
        trackStatus: "Application Received",
        submittedAt: serverTimestamp(),
      });
      setSubmitSuccess(true);
    } catch (err) {
      alert("Failed to submit application.");
    } finally { setIsSubmitting(false); }
  };

  const handleTrackApplication = async () => {
    if (!trackingId.trim()) return;
    setIsSearching(true);
    setSearchError(""); // Purana error clear karo
    try {
      const searchTerm = trackingId.toLowerCase().trim();
      let appDoc = await getDoc(doc(db, "membershipApplications", searchTerm));
      if (!appDoc.exists()) {
        const q = query(collection(db, "membershipApplications"), where("email", "==", searchTerm));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) appDoc = snapshot.docs[0];
      }
      
      if (appDoc && appDoc.exists()) {
        setApplicationStatus({ id: appDoc.id, ...appDoc.data() });
        setShowStatus(true);
      } else { 
        // 🔥 FIX 2: Tracking alert auto-hide after 3 seconds
        setSearchError("No application found."); 
        setTimeout(() => setSearchError(""), 3000);
      }
    } catch (err) { 
      // 🔥 Tracking alert auto-hide after 3 seconds
      setSearchError("Tracking error."); 
      setTimeout(() => setSearchError(""), 3000);
    } finally { 
      setIsSearching(false); 
    }
  };

  const resetForm = () => {
    setFormData({ fullName: "", email: "", password: "", confirmPassword: "", phone: "", address: "", dob: "", gender: "", state: "", district: "" });
    setPhotoFile(null); setKycFile(null); setPhotoPreview(null); setSelectedPlan(null); setSubmitSuccess(false);
  };

  return (
    <section className="min-h-screen pt-28 pb-20 bg-[#f8f9fa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-[#002B5B] dark:text-white uppercase tracking-tighter italic">
            Member <span className="text-red-700">Terminal</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">Official Intelligence Unit Portal</p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex bg-white dark:bg-[#111] p-1.5 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5">
            <TabBtn active={activeTab === 'membership'} onClick={() => setActiveTab('membership')} label="Apply for Membership" icon={<Star size={14} />} />
            <TabBtn active={activeTab === 'track'} onClick={() => setActiveTab('track')} label="Track Application" icon={<Search size={14} />} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'membership' && (
            <motion.div key="membership" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {submitSuccess ? (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white dark:bg-[#111] p-12 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5 text-center">
                    <CheckCircle size={48} className="text-green-600 mx-auto mb-6" />
                    <h2 className="text-3xl font-black uppercase mb-4">Submitted!</h2>
                    <button onClick={resetForm} className="px-8 py-4 bg-[#002B5B] text-white rounded-2xl font-black uppercase transition-all">Apply Again</button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-1 space-y-4">
                    <h3 className="text-xl font-black uppercase mb-6">Select Level</h3>
                    {MEMBERSHIP_LEVELS.map((plan) => (
                      <div key={plan.value} onClick={() => setSelectedPlan(plan)} className={`bg-white dark:bg-[#111] p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlan?.value === plan.value ? "border-red-700 shadow-xl" : "border-gray-100 dark:border-white/5"}`}>
                        <p className="font-black text-sm uppercase">{plan.label}</p>
                        <p className="text-2xl font-black">{plan.price}</p>
                      </div>
                    ))}
                  </div>

                  <div className="xl:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111] p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Full Name *</label>
                          <input type="text" name="fullName" value={formData.fullName} onChange={handleInput} className="w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none border-gray-200 dark:border-white/10" placeholder="Enter your full name" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Email *</label>
                          <input type="email" name="email" value={formData.email} onChange={handleInput} className="w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none border-gray-200 dark:border-white/10" placeholder="your@email.com" />
                        </div>

                        <div className="relative">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Create Password *</label>
                          <div className="relative">
                            <input type={showPass ? "text" : "password"} name="password" value={formData.password} onChange={handleInput} className="w-full bg-gray-50 dark:bg-black border p-4 pr-12 rounded-2xl text-sm font-bold focus:outline-none border-gray-200 dark:border-white/10" placeholder="Min 6 characters" />
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPass ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                          </div>
                        </div>

                        <div className="relative">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Confirm Password *</label>
                          <div className="relative">
                            <input type={showConfirmPass ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInput} className="w-full bg-gray-50 dark:bg-black border p-4 pr-12 rounded-2xl text-sm font-bold focus:outline-none border-gray-200 dark:border-white/10" placeholder="Re-enter password" />
                            <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showConfirmPass ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Phone Number *</label>
                          <input type="tel" name="phone" value={formData.phone} onChange={handleInput} className="w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none border-gray-200 dark:border-white/10" maxLength="10" placeholder="+91 0000000000" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Date of Birth *</label>
                          <input type="date" name="dob" value={formData.dob} onChange={handleInput} className="w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none border-gray-200 dark:border-white/10" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Gender *</label>
                          <select name="gender" value={formData.gender} onChange={handleInput} className="w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none border-gray-200 dark:border-white/10">
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">State *</label>
                          <select name="state" value={formData.state} onChange={handleInput} className="w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none border-gray-200 dark:border-white/10">
                            <option value="">Select State</option>
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">District *</label>
                          <input type="text" name="district" value={formData.district} onChange={handleInput} className="w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none border-gray-200 dark:border-white/10" placeholder="Your district" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Full Address *</label>
                          <textarea name="address" value={formData.address} onChange={handleInput} rows={2} className="w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none border-gray-200 dark:border-white/10" placeholder="Complete address"></textarea>
                        </div>

                        <div>
                          {/* 🔥 Update Label: Any Image Allowed */}
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Photo (Image Only) *</label>
                          <div className="flex items-center gap-4">
                            <label className="flex-1 flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-2xl cursor-pointer bg-gray-50 dark:bg-black border-gray-200 dark:border-white/10">
                              <Upload size={20} className="text-gray-400 mb-1" />
                              <span className="text-[9px] font-bold text-gray-400 uppercase">{photoFile ? photoFile.name : "Upload Photo"}</span>
                              {/* 🔥 strict accept="image/*" added */}
                              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                            </label>
                            {photoPreview && <img src={photoPreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl" />}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">KYC (.pdf only) *</label>
                          <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-2xl cursor-pointer bg-gray-50 dark:bg-black border-gray-200 dark:border-white/10">
                            <FileText size={20} className="text-gray-400 mb-1" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase">{kycFile ? kycFile.name : "Upload KYC"}</span>
                            <input type="file" className="hidden" accept=".pdf" onChange={handleKycChange} />
                          </label>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={!isFormValid || isSubmitting} 
                        className={`w-full mt-8 py-5 rounded-2xl font-black uppercase text-sm transition-all flex items-center justify-center gap-3 
                        ${isFormValid && !isSubmitting ? 'bg-[#002B5B] hover:bg-red-700 text-white shadow-lg' : 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed'}`}
                      >
                        {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Submit Application"}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'track' && (
            <motion.div key="track" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto">
              <div className="bg-white dark:bg-[#111] p-10 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5">
                <h2 className="text-2xl font-black uppercase text-center mb-8">Track Application</h2>
                <div className="space-y-4">
                  <input type="email" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} className="w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold border-gray-200 dark:border-white/10 outline-none" placeholder="Enter Registered Email" />
                  <button onClick={handleTrackApplication} className="w-full bg-[#002B5B] hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase transition-all">Check Status</button>
                  
                  {/* 🔥 Tracking Error Message 🔥 */}
                  {searchError && (
                    <div className="flex items-center justify-center gap-2 text-red-600 bg-red-100 p-3 rounded-xl">
                      <AlertTriangle size={18} />
                      <p className="text-sm font-bold uppercase">{searchError}</p>
                    </div>
                  )}
                </div>

                {showStatus && applicationStatus && !searchError && (
                  <div className="mt-8 p-6 bg-gray-50 dark:bg-black rounded-2xl border border-gray-200 dark:border-white/10">
                    <p className="font-black text-[#002B5B] dark:text-white uppercase mb-2">Status: <span className="text-red-700">{applicationStatus.status}</span></p>
                    <p className="text-sm font-bold uppercase">Update: {applicationStatus.trackStatus}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

const TabBtn = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-[#002B5B] dark:bg-red-700 text-white shadow-lg' : 'text-gray-400 hover:text-red-700'}`}>
    {icon} {label}
  </button>
);

export default User;