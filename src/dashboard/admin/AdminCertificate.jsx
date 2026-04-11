import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Download,
  User,
  Calendar,
  PenTool,
  Globe,
  RefreshCcw,
  Info,
  Link2,
  Search,
  Loader2,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../assets/logo.png";

// Import the new shared component
import CertificateTemplate from "../../components/shared/CertificateTemplate";

import { uploadCertificatePdf } from "../../services/storage.service";
import { updateCertificateUrl } from "../../services/admin.service";
import { db } from "../../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const AdminCertificate = () => {
  const certRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [approvedMembers, setApprovedMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [meta, setMeta] = useState({
    certificateId: "",
    appId: "",
  });

  const [data, setData] = useState({
    name: "",
    level: "",
    date: new Date().toLocaleDateString("en-GB"),
    sign: "Director CIB Unit",
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
        const members = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApprovedMembers(members);
        if (members.length > 0) {
          setSelectedMemberId(members[0].id);
        }
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

    const levelLabel =
      selected.membershipLabel ||
      (selected.membershipLevel === "national"
        ? "National Level"
        : selected.membershipLevel === "state"
          ? "State Level"
          : "District Level");

    setMeta({
      certificateId: selected.certificateId || "",
      appId: selected.id,
    });

    setData((p) => ({
      ...p,
      name: selected.fullName || selected.name || "",
      level: levelLabel,
    }));
  }, [selectedMemberId, approvedMembers]);

  const filteredMembers = approvedMembers.filter(
    (m) =>
      (m.fullName || m.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (m.memberId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleInput = (e) => {
    const { name, value } = e.target;
    if (name === "name" && value.length > 30) return;
    setData((p) => ({ ...p, [name]: value }));
  };

  const handleMeta = (e) => {
    const { name, value } = e.target;
    setMeta((p) => ({ ...p, [name]: value }));
  };

  const handleMemberSelect = (e) => {
    setSelectedMemberId(e.target.value);
  };

  const generatePdfBlob = async () => {
    const element = certRef.current;
    const canvas = await html2canvas(element, { scale: 3, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    return pdf.output("blob");
  };

  const deployCertificate = async () => {
    if (!meta.certificateId || !meta.appId)
      return alert("Select member first.");
    setIsProcessing(true);
    try {
      const pdfBlob = await generatePdfBlob();
      try {
        const result = await uploadCertificatePdf({
          certificateId: meta.certificateId,
          pdfBlob,
        });
        await updateCertificateUrl({
          appId: meta.appId,
          certificateId: meta.certificateId,
          url: result.url,
        });
      } catch (e) {
        console.warn("Storage failed");
      }
      const fileName = `CIB_Certificate_${data.name.replace(/\s+/g, "_")}.pdf`;
      const localUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = localUrl;
      a.download = fileName;
      a.click();
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDFLocal = async () => {
    setIsProcessing(true);
    try {
      const pdfBlob = await generatePdfBlob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(pdfBlob);
      a.download = `CIB_Certificate_${data.name.replace(/\s+/g, "_")}.pdf`;
      a.click();
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-red-700" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
      {/* --- EDITOR SIDE --- */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="xl:col-span-2 space-y-6"
      >
        <div className="bg-white dark:bg-[#0d0d0d] p-8 rounded-[2rem] shadow-2xl border border-gray-200 dark:border-white/5 sticky top-10">
          <div className="flex items-center gap-3 mb-8 border-l-4 border-red-700 pl-4">
            <Award className="text-red-700" size={24} />
            <h3 className="text-[12px] font-black dark:text-white uppercase tracking-widest">
              Certificate Engine
            </h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 flex items-center gap-2">
                <Search size={12} className="text-red-700" /> Search & Filter
                Members
              </label>
              <input
                type="text"
                placeholder="Search by Name, ID, or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 rounded-2xl text-sm font-bold text-[#002B5B] dark:text-white focus:border-red-700 outline-none shadow-inner transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">
                Select from List
              </label>
              <select
                value={selectedMemberId}
                onChange={handleMemberSelect}
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 rounded-2xl text-sm font-bold text-[#002B5B] dark:text-white focus:border-red-700 outline-none shadow-inner transition-all"
              >
                <option value="">-- Click to choose member --</option>
                {filteredMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName || m.name} - {m.memberId}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2">
              <InputField
                label="Cert ID (System)"
                value={meta.certificateId}
                readOnly
                icon={<Link2 size={14} />}
              />
              <InputField
                label="App ID (System)"
                value={meta.appId}
                readOnly
                icon={<Link2 size={14} />}
              />
            </div>

            <div className="space-y-5 pt-4 border-t border-gray-100 dark:border-white/5">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Member Full Name
                  </label>
                  <span className="text-[9px] font-bold text-gray-400">
                    {data.name.length}/30
                  </span>
                </div>
                <input
                  name="name"
                  value={data.name}
                  onChange={handleInput}
                  maxLength={30}
                  placeholder="Full Legal Name"
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 rounded-2xl text-sm font-bold text-[#002B5B] dark:text-white focus:border-red-700 outline-none shadow-inner transition-all"
                />
              </div>

              <InputField
                label="Membership Level"
                name="level"
                value={data.level}
                onChange={handleInput}
                icon={<Globe size={14} />}
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Issue Date"
                  name="date"
                  value={data.date}
                  onChange={handleInput}
                  icon={<Calendar size={14} />}
                />
                <InputField
                  label="Director Sign"
                  name="sign"
                  value={data.sign}
                  onChange={handleInput}
                  icon={<PenTool size={14} />}
                />
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <button
                disabled={isProcessing || !selectedMemberId}
                onClick={deployCertificate}
                className="w-full bg-[#002B5B] dark:bg-red-700 hover:bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCcw className="animate-spin" />
                ) : (
                  <>
                    <Download size={18} /> Deploy Certificate
                  </>
                )}
              </button>
              <button
                disabled={isProcessing || !selectedMemberId}
                onClick={downloadPDFLocal}
                className="w-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 text-[#002B5B] dark:text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                Local PDF Export
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- PREVIEW SIDE (UPDATED TO USE TEMPLATE) --- */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="xl:col-span-3 flex justify-center items-start"
      >
        <div className="sticky top-10">
          <div className="mb-6 text-center opacity-40">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.5em] dark:text-white">
              Bureau A4 Document Preview
            </span>
          </div>

          {/* Replaced old div with shared component */}
          <CertificateTemplate ref={certRef} data={data} />
        </div>
      </motion.div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, icon, readOnly }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 flex items-center gap-2">
      {icon} {label}
    </label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`w-full ${readOnly ? "bg-gray-100/50 dark:bg-white/5 opacity-70 cursor-not-allowed" : "bg-gray-50 dark:bg-black"} border border-gray-200 dark:border-white/10 p-4 rounded-2xl text-sm font-bold text-[#002B5B] dark:text-white focus:border-red-700 outline-none shadow-inner transition-all`}
      placeholder={label}
    />
  </div>
);

export default AdminCertificate;
