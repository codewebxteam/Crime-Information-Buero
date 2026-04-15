import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  User,
  ShieldCheck,
  Calendar,
  PenTool,
  Mail,
  MapPin,
  Phone,
  Search,
  Loader2,
  Hash,
  Eye,
  X,
  CheckCircle,
} from "lucide-react";
// Removed unused html2canvas and jsPDF imports to keep it clean

import { db } from "../../firebase/firebase";
// Added 'doc' and 'updateDoc' for the synchronization logic
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import IdCardTemplate from "../../components/shared/IdCardTemplate";

const AdminIdEngine = () => {
  const cardRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [approvedMembers, setApprovedMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  // Added state for success message
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [member, setMember] = useState({
    name: "",
    rank: "",
    idNumber: "",
    contact: "",
    validUntil: "Oct. 2026",
    address: "",
    photo: "",
  });

  useEffect(() => {
    const fetchApprovedMembers = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "membershipApplications"),
          where("status", "==", "Approved"),
        );
        const snapshot = await getDocs(q);
        const membersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApprovedMembers(membersList);
        if (membersList.length > 0) setSelectedMemberId(membersList[0].id);
      } catch (error) {
        console.error("Error fetching approved members:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovedMembers();
  }, []);

  useEffect(() => {
    if (!selectedMemberId || approvedMembers.length === 0) return;
    const selected = approvedMembers.find((m) => m.id === selectedMemberId);
    if (!selected) return;

    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 2);
    const validMonth = validUntil.toLocaleString("en-US", { month: "short" });
    const validFormatted = `${validMonth.toUpperCase()}. ${validUntil.getFullYear()}`;

    const formattedAddress =
      selected.district && selected.state
        ? `${selected.district} : ${selected.state}`
        : selected.address || "Gorakhpur Division : Head Quarter";

    setMember({
      name: selected.fullName || selected.name || "",
      rank:
        selected.designation || selected.membershipLabel || "Crime Reporter",
      idNumber: selected.memberId || "CIB-90414",
      contact: selected.mobile || selected.phone || selected.contact || "",
      validUntil: validFormatted,
      address: formattedAddress,
      photo: selected.photoUrl || "",
    });
  }, [selectedMemberId, approvedMembers]);

  const filteredMembers = approvedMembers.filter(
    (m) =>
      (m.fullName || m.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (m.memberId || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleInput = (e) => {
    setMember({ ...member, [e.target.name]: e.target.value });
  };

  // --- UPDATED LOGIC: No PDF download, only Database Update ---
  const downloadCardPDF = async () => {
    if (!selectedMemberId) return;

    setIsProcessing(true);
    setUpdateSuccess(false);

    try {
      // Reference to the specific member document
      const memberDocRef = doc(db, "membershipApplications", selectedMemberId);
      
      // Update fields in Firestore
      await updateDoc(memberDocRef, {
        fullName: member.name,
        designation: member.rank,
        mobile: member.contact,
        address: member.address,
      });

      // Show success message
      setUpdateSuccess(true);
      
      // Optional: Auto-hide success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);

    } catch (error) {
      console.error("Error updating member data:", error);
      alert("Failed to update database. Check console.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-red-700" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">
            Loading Target Database...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-4 border-b pb-6 border-gray-200 dark:border-white/10">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-900/30 shadow-inner">
          <ShieldCheck className="text-[#001F3F] dark:text-blue-400 w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#001F3F] dark:text-white uppercase tracking-tight">
            Tactical ID Engine
          </h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
            Generate High-Security Police Theme Cards
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-12 gap-8"
      >
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#111] p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-white/5">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Search size={14} className="text-[#001F3F] dark:text-blue-400" />{" "}
              Target Selection
            </h3>

            <div className="space-y-5">
              <input
                type="text"
                placeholder="Search by Name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 px-5 py-4 rounded-2xl text-sm font-bold text-[#001F3F] dark:text-white focus:border-[#001F3F] outline-none transition-all placeholder:text-gray-400"
              />

              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 px-5 py-4 rounded-2xl text-sm font-bold text-[#001F3F] dark:text-white focus:border-[#001F3F] outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="" disabled>
                  -- Select Approved Officer --
                </option>
                {filteredMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName || m.name} ({m.memberId})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 bg-white dark:bg-[#111] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-4">
              <PenTool
                size={14}
                className="text-[#001F3F] dark:text-blue-400"
              />{" "}
              Card Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Officer Name"
                name="name"
                value={member.name}
                onChange={handleInput}
                icon={<User size={16} />}
              />
              <InputField
                label="Designation"
                name="rank"
                value={member.rank}
                onChange={handleInput}
                icon={<ShieldCheck size={16} />}
              />
              <InputField
                label="Bureau ID"
                name="idNumber"
                value={member.idNumber}
                onChange={handleInput}
                icon={<Hash size={16} />}
              />
              <InputField
                label="Mobile Number"
                name="contact"
                value={member.contact}
                onChange={handleInput}
                icon={<Phone size={16} />}
              />
              <InputField
                label="Working Area"
                name="address"
                value={member.address}
                onChange={handleInput}
                icon={<MapPin size={16} />}
              />
              <InputField
                label="Valid Until"
                name="validUntil"
                value={member.validUntil}
                onChange={handleInput}
                icon={<Calendar size={16} />}
              />
              <div className="md:col-span-2">
                <InputField
                  label="Photo URL (Optional)"
                  name="photo"
                  value={member.photo}
                  onChange={handleInput}
                  icon={<Mail size={16} />}
                />
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 dark:border-white/10">
            <button
              disabled={!selectedMemberId}
              onClick={() => setShowModal(true)}
              className="w-full bg-[#001F3F] dark:bg-white dark:text-black hover:bg-blue-900 dark:hover:bg-gray-200 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Eye size={18} /> Preview Official ID
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#0d0d0d] rounded-[2rem] shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden border border-gray-200 dark:border-white/10"
            >
              <div className="px-8 py-5 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-black/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-[#001F3F] dark:text-white uppercase tracking-widest">
                      ID Ready for Deployment
                    </h2>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">
                      Verify visual integrity
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 bg-gray-200 dark:bg-white/10 hover:bg-red-100 hover:text-red-700 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 py-12 px-8 bg-gray-200 dark:bg-[#1a1a1a] flex justify-center items-center">
                <IdCardTemplate ref={cardRef} member={member} />
              </div>

              <div className="px-8 py-6 bg-white dark:bg-[#0d0d0d] border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row justify-end items-center gap-4">
                {updateSuccess && (
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-green-600 font-bold text-xs uppercase"
                  >
                    Update Successful!
                  </motion.p>
                )}
                <button
                  disabled={isProcessing}
                  onClick={downloadCardPDF}
                  className="w-full sm:w-auto px-10 py-4 bg-[#8B0000] hover:bg-red-900 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle size={16} /> Update & Synchronize
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, icon }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] pl-2 flex items-center gap-2">
      {label}
    </label>
    <div className="relative group">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#001F3F] transition-colors">
          {icon}
        </div>
      )}
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={`Enter ${label}...`}
        className={`w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-2xl py-4 pr-4 ${icon ? "pl-12" : "pl-4"} text-sm font-bold text-[#001F3F] dark:text-white focus:border-[#001F3F] outline-none transition-all shadow-inner`}
      />
    </div>
  </div>
);

export default AdminIdEngine;