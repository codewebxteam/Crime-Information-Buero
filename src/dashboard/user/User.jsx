import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon, ShieldCheck, Mail, MapPin, Phone, Calendar,
  CreditCard, Upload, CheckCircle, Loader2, AlertTriangle,
  Globe, Landmark, Award, Star, ArrowRight, X, FileText, Search, Clock
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
  const [activeTab, setActiveTab] = useState('membership'); // membership, track
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [showStatus, setShowStatus] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Form state
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
    membershipLevel: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [kycFile, setKycFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setFormErrors({ ...formErrors, photo: "" });
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleKycChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setKycFile(file);
      setFormErrors({ ...formErrors, kyc: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.dob) errors.dob = "Date of birth is required";
    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.state) errors.state = "State is required";
    if (!formData.district.trim()) errors.district = "District is required";
    if (!selectedPlan) errors.plan = "Please select a membership level";
    if (!photoFile) errors.photo = "Photo is required";
    if (!kycFile) errors.kyc = "KYC document is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const uploadFile = async (file, folder) => {
    if (!file) return "";
    try {
      return await uploadImageToCloudinary(file, folder);
    } catch (error) {
      console.error("Upload failed (continuing without file):", error);
      return ""; // Return empty string on failure - application will still be saved
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Check if email already exists
    try {
      const q = query(collection(db, "membershipApplications"), where("email", "==", formData.email));
      const existing = await getDocs(q);
      if (!existing.empty) {
        setFormErrors({ ...formErrors, email: "An application with this email already exists" });
        return;
      }
    } catch (err) {
      console.error("Error checking existing application:", err);
    }

    setIsSubmitting(true);
    try {
      // Upload files (required)
      let photoUrl = "";
      let kycUrl = "";
      
      // Upload photo
      if (!photoFile) {
        setIsSubmitting(false);
        alert("Please upload a photo");
        return;
      }
      try {
        photoUrl = await uploadFile(photoFile, 'photos');
      } catch (err) {
        console.error("Photo upload failed:", err);
        setIsSubmitting(false);
        alert("Photo upload failed. Please try again.");
        return;
      }
      
      // Upload KYC
      if (!kycFile) {
        setIsSubmitting(false);
        alert("Please upload KYC document");
        return;
      }
      try {
        kycUrl = await uploadFile(kycFile, 'kyc');
      } catch (err) {
        console.error("KYC upload failed:", err);
        setIsSubmitting(false);
        alert("KYC upload failed. Please try again.");
        return;
      }

      // Submit application - ALWAYS saves even if uploads failed
      await addDoc(collection(db, "membershipApplications"), {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        dob: formData.dob,
        gender: formData.gender,
        state: formData.state,
        district: formData.district.trim(),
        membershipLevel: selectedPlan.value,
        membershipLabel: selectedPlan.label,
        photoUrl, // Will be empty string if upload failed
        kycUrl, // Will be empty string if upload failed
        
        // Status - initially Pending
        status: "Pending",
        
        // Store password temporarily (NOTE: In production, use secure backend)
        // Using base64 encoding - NOT secure for production
        tempPasswordHash: btoa(formData.password),
        
        // Tracking
        trackStatus: "Application Received",
        submittedAt: serverTimestamp(),
        approvedAt: null,
        rejectedAt: null,
        approvedBy: null,
        rejectedBy: null,
        remarks: "",
        memberId: "",
        certificateId: "",
      });

      setSubmitSuccess(true);
    } catch (err) {
      console.error("Error submitting application:", err);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackApplication = async () => {
    if (!trackingId.trim()) {
      setSearchError("Please enter an email or application ID");
      return;
    }
    
    setSearchError("");
    setShowStatus(false);
    setIsSearching(true);
    
    try {
      const searchTerm = trackingId.toLowerCase().trim();
      
      // First try to find by document ID (application ID)
      let appDoc = await getDoc(doc(db, "membershipApplications", searchTerm));
      
      if (!appDoc.exists()) {
        // Try searching by email
        const q = query(
          collection(db, "membershipApplications"), 
          where("email", "==", searchTerm)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          appDoc = snapshot.docs[0];
        }
      }
      
      if (appDoc && appDoc.exists()) {
        const appData = appDoc.data();
        setApplicationStatus({ id: appDoc.id, ...appData });
        setShowStatus(true);
      } else {
        setSearchError("No application found. Please check your email or application ID.");
      }
    } catch (err) {
      console.error("Error tracking application:", err);
      // Fallback: try to search by email without index
      try {
        const searchTerm = trackingId.toLowerCase().trim();
        const allApps = await getDocs(collection(db, "membershipApplications"));
        const found = allApps.docs.find(d => 
          d.data().email?.toLowerCase() === searchTerm ||
          d.id.toLowerCase() === searchTerm
        );
        
        if (found) {
          const appData = found.data();
          setApplicationStatus({ id: found.id, ...appData });
          setShowStatus(true);
        } else {
          setSearchError("No application found with this details.");
        }
      } catch (fallbackErr) {
        console.error("Fallback search error:", fallbackErr);
        setSearchError("Failed to track application. Please try again.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "", email: "", password: "", confirmPassword: "",
      phone: "", address: "", dob: "", gender: "",
      state: "", district: "", membershipLevel: ""
    });
    setPhotoFile(null);
    setKycFile(null);
    setPhotoPreview(null);
    setFormErrors({});
    setSelectedPlan(null);
  };

  return (
    <section className="min-h-screen pt-28 pb-20 bg-[#f8f9fa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-[#002B5B] dark:text-white uppercase tracking-tighter italic">
            Member <span className="text-red-700">Terminal</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">Official Intelligence Unit Portal</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-white dark:bg-[#111] p-1.5 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5">
            <TabBtn active={activeTab === 'membership'} onClick={() => setActiveTab('membership')} label="Apply for Membership" icon={<Star size={14} />} />
            <TabBtn active={activeTab === 'track'} onClick={() => setActiveTab('track')} label="Track Application" icon={<Search size={14} />} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Membership Tab */}
          {activeTab === 'membership' && (
            <motion.div key="membership" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {submitSuccess ? (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white dark:bg-[#111] p-12 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5 text-center">
                    <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle size={48} className="text-green-600" />
                    </div>
                    <h2 className="text-3xl font-black text-[#002B5B] dark:text-white uppercase mb-4">Application Submitted!</h2>
                    <p className="text-gray-500 font-bold mb-2">Your membership application has been received.</p>
                    <p className="text-sm text-gray-400 mb-8">
                      Application ID: <span className="text-[#002B5B] font-black">{formData.email}</span>
                    </p>
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-2xl mb-8">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <AlertTriangle size={20} className="text-yellow-600" />
                        <p className="font-black text-yellow-700 dark:text-yellow-400 uppercase text-sm">Important</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        You can <span className="font-black">login only after admin approval</span>. 
                        You will receive an email once your application is reviewed.
                      </p>
                    </div>
                    <button
                      onClick={() => { setSubmitSuccess(false); resetForm(); }}
                      className="px-8 py-4 bg-[#002B5B] hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-wider transition-all"
                    >
                      Submit Another Application
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Plans */}
                  <div className="xl:col-span-1 space-y-4">
                    <h3 className="text-xl font-black text-[#002B5B] dark:text-white uppercase mb-6">Select Membership Level</h3>
                    {MEMBERSHIP_LEVELS.map((plan, i) => (
                      <div 
                        key={plan.value}
                        onClick={() => { setSelectedPlan(plan); setFormErrors({...formErrors, plan: ""}); }}
                        className={`bg-white dark:bg-[#111] p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                          selectedPlan?.value === plan.value 
                            ? "border-red-700 shadow-xl" 
                            : "border-gray-100 dark:border-white/5 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${selectedPlan?.value === plan.value ? "bg-red-700" : "bg-gray-100"} flex items-center justify-center`}>
                              {plan.value === 'district' ? <Landmark size={18} className={selectedPlan?.value === plan.value ? "text-white" : "text-gray-600"} /> :
                               plan.value === 'state' ? <ShieldCheck size={18} className={selectedPlan?.value === plan.value ? "text-white" : "text-gray-600"} /> :
                               <Globe size={18} className={selectedPlan?.value === plan.value ? "text-white" : "text-gray-600"} />}
                            </div>
                            <div>
                              <p className="font-black text-[#002B5B] dark:text-white uppercase text-sm">{plan.label}</p>
                              <p className="text-xs text-gray-400">{plan.description}</p>
                            </div>
                          </div>
                          {selectedPlan?.value === plan.value && <CheckCircle size={20} className="text-red-700" />}
                        </div>
                        <p className="text-2xl font-black text-[#002B5B] dark:text-white">{plan.price}</p>
                      </div>
                    ))}
                    {formErrors.plan && <p className="text-red-600 text-sm font-bold">{formErrors.plan}</p>}
                  </div>

                  {/* Form */}
                  <div className="xl:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111] p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5">
                      <h3 className="text-xl font-black text-[#002B5B] dark:text-white uppercase mb-6">Application Form</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Full Name *</label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInput}
                            className={`w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none ${formErrors.fullName ? 'border-red-500' : 'border-gray-200 dark:border-white/10 focus:border-red-700'}`}
                            placeholder="Enter your full name"
                          />
                          {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Email *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInput}
                            className={`w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none ${formErrors.email ? 'border-red-500' : 'border-gray-200 dark:border-white/10 focus:border-red-700'}`}
                            placeholder="your@email.com"
                          />
                          {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Password *</label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInput}
                            className={`w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none ${formErrors.password ? 'border-red-500' : 'border-gray-200 dark:border-white/10 focus:border-red-700'}`}
                            placeholder="Min 6 characters"
                          />
                          {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Confirm Password *</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInput}
                            className={`w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-white/10 focus:border-red-700'}`}
                            placeholder="Re-enter password"
                          />
                          {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Phone Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInput}
                            className={`w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none ${formErrors.phone ? 'border-red-500' : 'border-gray-200 dark:border-white/10 focus:border-red-700'}`}
                            placeholder="+91 9876543210"
                          />
                          {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                        </div>

                        {/* DOB */}
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Date of Birth *</label>
                          <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleInput}
                            className={`w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none ${formErrors.dob ? 'border-red-500' : 'border-gray-200 dark:border-white/10 focus:border-red-700'}`}
                          />
                          {formErrors.dob && <p className="text-red-500 text-xs mt-1">{formErrors.dob}</p>}
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Gender *</label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInput}
                            className={`w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none ${formErrors.gender ? 'border-red-500' : 'border-gray-200 dark:border-white/10 focus:border-red-700'}`}
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          {formErrors.gender && <p className="text-red-500 text-xs mt-1">{formErrors.gender}</p>}
                        </div>

                        {/* State */}
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">State *</label>
                          <select
                            name="state"
                            value={formData.state}
                            onChange={handleInput}
                            className={`w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none ${formErrors.state ? 'border-red-500' : 'border-gray-200 dark:border-white/10 focus:border-red-700'}`}
                          >
                            <option value="">Select State</option>
                            {INDIAN_STATES.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                          {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                        </div>

                        {/* District */}
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">District *</label>
                          <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleInput}
                            className={`w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none ${formErrors.district ? 'border-red-500' : 'border-gray-200 dark:border-white/10 focus:border-red-700'}`}
                            placeholder="Your district"
                          />
                          {formErrors.district && <p className="text-red-500 text-xs mt-1">{formErrors.district}</p>}
                        </div>

                        {/* Full Address */}
                        <div className="md:col-span-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Full Address *</label>
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInput}
                            rows={2}
                            className={`w-full bg-gray-50 dark:bg-black border p-4 rounded-2xl text-sm font-bold focus:outline-none ${formErrors.address ? 'border-red-500' : 'border-gray-200 dark:border-white/10 focus:border-red-700'}`}
                            placeholder="Your complete address"
                          />
                          {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                        </div>

                        {/* Photo Upload - Required */}
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Photo *</label>
                          <div className="flex items-center gap-4">
                            <label className={`flex-1 flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-2xl cursor-pointer hover:border-red-700 bg-gray-50 dark:bg-black transition-all ${formErrors.photo ? 'border-red-500' : 'border-gray-200 dark:border-white/10'}`}>
                              <Upload size={20} className="text-gray-400 mb-1" />
                              <span className="text-[9px] font-bold text-gray-400 uppercase">
                                {photoFile ? photoFile.name : "Upload Photo"}
                              </span>
                              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                            </label>
                            {photoPreview && (
                              <img src={photoPreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl" />
                            )}
                          </div>
                          {formErrors.photo && <p className="text-red-500 text-xs mt-1">{formErrors.photo}</p>}
                        </div>

                        {/* KYC Upload - Required */}
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">KYC Document *</label>
                          <label className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-2xl cursor-pointer hover:border-red-700 bg-gray-50 dark:bg-black transition-all ${formErrors.kyc ? 'border-red-500' : 'border-gray-200 dark:border-white/10'}`}>
                            <FileText size={20} className="text-gray-400 mb-1" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase">
                              {kycFile ? kycFile.name : "Upload ID (Aadhar/Voter)"}
                            </span>
                            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleKycChange} />
                          </label>
                          {formErrors.kyc && <p className="text-red-500 text-xs mt-1">{formErrors.kyc}</p>}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-8 bg-[#002B5B] hover:bg-red-700 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <><CheckCircle size={18} /> Submit Application</>}
                      </button>

                      <p className="text-center text-xs text-gray-400 mt-4">
                        Already have an account? <button type="button" onClick={() => navigate('/login?type=member')} className="text-red-700 font-black hover:underline">Login here</button>
                      </p>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Track Tab */}
          {activeTab === 'track' && (
            <motion.div key="track" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto">
              <div className="bg-white dark:bg-[#111] p-10 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto bg-[#002B5B]/10 rounded-2xl flex items-center justify-center mb-4">
                    <CreditCard size={40} className="text-[#002B5B]" />
                  </div>
                  <h2 className="text-2xl font-black text-[#002B5B] dark:text-white uppercase">Track Application</h2>
                  <p className="text-xs text-gray-400 mt-2">Enter your email to check status</p>
                </div>

                <div className="space-y-4">
                  <input
                    type="email"
                    value={trackingId}
                    onChange={(e) => { setTrackingId(e.target.value); setSearchError(""); }}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 rounded-2xl text-sm font-bold focus:border-red-700 outline-none"
                    placeholder="Enter your email or application ID"
                    disabled={isSearching}
                  />
                  {searchError && <p className="text-red-600 text-sm font-bold">{searchError}</p>}
                  
                  <button
                    onClick={handleTrackApplication}
                    disabled={isSearching || !trackingId.trim()}
                    className="w-full bg-[#002B5B] hover:bg-red-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    {isSearching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Searching...
                      </>
                    ) : (
                      "Check Status"
                    )}
                  </button>
                </div>

                {showStatus && applicationStatus && (
                  <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
                    <div className={`p-6 rounded-2xl ${applicationStatus?.status === 'Approved' ? 'bg-green-50 dark:bg-green-950/20 border border-green-200' : applicationStatus?.status === 'Rejected' ? 'bg-red-50 dark:bg-red-950/20 border border-red-200' : 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        {applicationStatus?.status === 'Approved' ? <CheckCircle className="text-green-600" size={24} /> :
                         applicationStatus?.status === 'Rejected' ? <AlertTriangle className="text-red-600" size={24} /> :
                         <Clock className="text-yellow-600" size={24} />}
                        <span className={`font-black uppercase ${applicationStatus?.status === 'Approved' ? 'text-green-700' : applicationStatus?.status === 'Rejected' ? 'text-red-700' : 'text-yellow-700'}`}>
                          {applicationStatus?.status || 'Pending'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p><span className="font-black text-gray-400">Name:</span> <span className="font-bold">{applicationStatus?.fullName || applicationStatus?.name || 'N/A'}</span></p>
                        <p><span className="font-black text-gray-400">Level:</span> <span className="font-bold">{applicationStatus?.membershipLabel || applicationStatus?.level || 'N/A'}</span></p>
                        <p><span className="font-black text-gray-400">Tracking:</span> <span className="font-bold">{applicationStatus?.trackStatus || 'Under Review'}</span></p>
                        {applicationStatus?.memberId && (
                          <p><span className="font-black text-gray-400">Member ID:</span> <span className="font-bold text-red-700">{applicationStatus.memberId}</span></p>
                        )}
                        {applicationStatus?.remarks && (
                          <p><span className="font-black text-gray-400">Remarks:</span> <span className="font-bold">{applicationStatus.remarks}</span></p>
                        )}
                      </div>

                      {applicationStatus.status === 'Approved' && (
                        <button
                          onClick={() => navigate('/login?type=member')}
                          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-black uppercase text-sm transition-all"
                        >
                          Login to Dashboard
                        </button>
                      )}
                    </div>
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
