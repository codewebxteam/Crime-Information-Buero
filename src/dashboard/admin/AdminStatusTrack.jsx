import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  RefreshCcw,
  ChevronDown,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  AlertCircle,
  BadgeCheck,
  XCircle,
  User,
  FileText,
  Image,
} from "lucide-react";

// Services
import {
  fetchAllApplications,
  approveApplication,
  rejectApplication,
  updateApplicationTrackStatus,
} from "../../services/admin.service";

const AdminStatusTrack = ({ adminUid = "", currentAdmin = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [trackStatus, setTrackStatus] = useState("Intelligence Verification");

  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const counters = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === "Pending").length;
    const approved = applications.filter((a) => a.status === "Approved").length;
    const rejected = applications.filter((a) => a.status === "Rejected").length;
    return { total, pending, approved, rejected };
  }, [applications]);

  const statusOptions = [
    { label: "Request Received", icon: <CheckCircle2 size={16} />, color: "text-blue-500" },
    { label: "Intelligence Verification", icon: <ShieldCheck size={16} />, color: "text-yellow-500" },
    { label: "ID Embossing Stage", icon: <Clock size={16} />, color: "text-purple-500" },
    { label: "Approved & Dispatched", icon: <Truck size={16} />, color: "text-green-500" },
    { label: "Request Rejected", icon: <AlertCircle size={16} />, color: "text-red-500" },
  ];

  const selectedApplication = useMemo(
    () => applications.find((a) => a.id === selectedAppId) || null,
    [applications, selectedAppId]
  );

  const loadApplications = async (keepSelectedId = "") => {
    try {
      const data = await fetchAllApplications();
      setApplications(data);

      const preferredId = keepSelectedId || selectedAppId;

      if (preferredId) {
        const matched = data.find((item) => item.id === preferredId);
        if (matched) {
          setSelectedAppId(matched.id);
          setTrackStatus(matched.trackStatus || "Intelligence Verification");
          return;
        }
      }

      if (data.length > 0) {
        setSelectedAppId(data[0].id);
        setTrackStatus(data[0].trackStatus || "Intelligence Verification");
      } else {
        setSelectedAppId("");
        setTrackStatus("Intelligence Verification");
      }
    } catch (e) {
      console.error(e);
      alert("Applications fetch failed. Console check karo.");
    }
  };

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (label) => {
    setTrackStatus(label);
    setIsOpen(false);
  };

  const handleSelectApplication = (appId) => {
    setSelectedAppId(appId);
    const found = applications.find((a) => a.id === appId);
    setTrackStatus(found?.trackStatus || "Intelligence Verification");
  };

  const updateLiveDatabase = async () => {
    if (!selectedAppId) {
      alert("Pehle application select karo");
      return;
    }

    setIsUpdating(true);
    try {
      await updateApplicationTrackStatus(selectedAppId, trackStatus);
      alert(`Tracking Updated: ${trackStatus}`);
      await loadApplications(selectedAppId);
    } catch (err) {
      console.error(err);
      alert("Update failed. Console check karo.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApplication) {
      alert("Pehle application select karo");
      return;
    }

    if (!adminUid) {
      alert("Admin UID missing. Login again.");
      return;
    }

    setIsApproving(true);

    try {
      const res = await approveApplication({
        appId: selectedApplication.id,
        adminUid,
        applicant: selectedApplication,
        currentAdmin,
      });

      localStorage.setItem(
        "cib_last_approved",
        JSON.stringify({
          appId: selectedApplication.id,
          certificateId: res?.certificateId || "",
          memberId: res?.memberId || "",
          name: selectedApplication.fullName || selectedApplication.name || "",
          level:
            selectedApplication.membershipLabel ||
            selectedApplication.levelRequested ||
            selectedApplication.level ||
            "",
        })
      );

      alert(
        `Approved!\nMemberId: ${res?.memberId || "Generated"}\nCertificate: ${
          res?.certificateId || "Generated"
        }`
      );

      await loadApplications(selectedApplication.id);
    } catch (e) {
      console.error(e);
      alert("Approve failed. Console check karo.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) {
      alert("Pehle application select karo");
      return;
    }

    if (!adminUid) {
      alert("Admin UID missing. Login again.");
      return;
    }

    const remarks = window.prompt("Reason / remarks (optional):", "");
    setIsRejecting(true);

    try {
      await rejectApplication(selectedApplication.id, adminUid, remarks || "");
      alert("Rejected!");
      await loadApplications(selectedApplication.id);
    } catch (e) {
      console.error(e);
      alert("Reject failed. Console check karo.");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#111] p-10 md:p-14 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5 text-center relative overflow-visible"
      >
        <div className="bg-red-700/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 border-b-4 border-red-700">
          <Activity size={40} className="text-red-700" />
        </div>

        <h3 className="text-3xl font-black text-[#002B5B] dark:text-white uppercase tracking-tighter italic mb-2">
          Status <span className="text-red-700">Terminal</span>
        </h3>

        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6">
          Authorized Member Tracking System
        </p>

        <div className="grid grid-cols-4 gap-3 mb-8">
          <div className="bg-[#002B5B] dark:bg-white/10 p-3 rounded-xl">
            <p className="text-2xl font-black text-white">{counters.total}</p>
            <p className="text-[8px] font-black text-gray-300 uppercase">Total</p>
          </div>
          <div className="bg-yellow-500 p-3 rounded-xl">
            <p className="text-2xl font-black text-white">{counters.pending}</p>
            <p className="text-[8px] font-black text-yellow-100 uppercase">Pending</p>
          </div>
          <div className="bg-green-600 p-3 rounded-xl">
            <p className="text-2xl font-black text-white">{counters.approved}</p>
            <p className="text-[8px] font-black text-green-100 uppercase">Approved</p>
          </div>
          <div className="bg-red-600 p-3 rounded-xl">
            <p className="text-2xl font-black text-white">{counters.rejected}</p>
            <p className="text-[8px] font-black text-red-100 uppercase">Rejected</p>
          </div>
        </div>

        <div className="space-y-6 text-left relative">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
            Select Applicant (Application)
          </label>

          <div className="relative">
            <select
              value={selectedAppId}
              onChange={(e) => handleSelectApplication(e.target.value)}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-5 rounded-2xl text-sm font-bold text-[#002B5B] dark:text-white hover:border-red-700 transition-all shadow-inner"
            >
              {applications.length === 0 && <option value="">No applications found</option>}

              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.fullName || app.name || "Unnamed"} •{" "}
                  {app.membershipLabel || app.levelRequested || app.level || "Level?"} •{" "}
                  {app.status || "Pending"}
                </option>
              ))}
            </select>
          </div>

          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
            Select Tracking Step
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-5 rounded-2xl flex items-center justify-between text-sm font-bold text-[#002B5B] dark:text-white hover:border-red-700 transition-all shadow-inner relative z-10"
            >
              <div className="flex items-center gap-3">
                <span className="text-red-700">
                  {statusOptions.find((opt) => opt.label === trackStatus)?.icon}
                </span>
                {trackStatus}
              </div>
              <ChevronDown
                size={18}
                className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 z-[999] mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
                >
                  {statusOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelect(option.label)}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors border-b border-gray-100 dark:border-white/5 last:border-none text-left"
                    >
                      <span className={option.color}>{option.icon}</span>
                      <span className="text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-tight">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {selectedApplication && (
            <div className="pt-6 border-t border-gray-200 dark:border-white/10">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-3 block">
                Applicant Details
              </label>

              <div className="bg-gray-50 dark:bg-black p-4 rounded-2xl space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase">Name</p>
                    <p className="text-sm font-bold text-[#002B5B] dark:text-white">
                      {selectedApplication.fullName || selectedApplication.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase">Email</p>
                    <p className="text-xs font-bold text-[#002B5B] dark:text-white">
                      {selectedApplication.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase">Phone</p>
                    <p className="text-sm font-bold text-[#002B5B] dark:text-white">
                      {selectedApplication.phone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase">Membership Level</p>
                    <p className="text-sm font-bold text-red-700 uppercase">
                      {selectedApplication.membershipLabel ||
                        selectedApplication.levelRequested ||
                        selectedApplication.membershipLevel ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase">Address</p>
                    <p className="text-xs font-bold text-[#002B5B] dark:text-white">
                      {selectedApplication.address || "N/A"},{" "}
                      {selectedApplication.district || ""},{" "}
                      {selectedApplication.state || ""}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-white/10">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2 flex items-center gap-1">
                      <Image size={12} /> Photo
                    </p>
                    {selectedApplication.photoUrl ? (
                      <div className="relative">
                        <img
                          src={selectedApplication.photoUrl}
                          alt="Applicant Photo"
                          className="w-20 h-20 object-cover rounded-xl border-2 border-[#002B5B]"
                        />
                        <a
                          href={selectedApplication.photoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute -bottom-2 -right-2 bg-[#002B5B] text-white p-1 rounded-lg text-[8px] font-black uppercase"
                        >
                          View
                        </a>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center">
                        <User size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2 flex items-center gap-1">
                      <FileText size={12} /> KYC Document
                    </p>
                    {selectedApplication.kycUrl ? (
                      <div className="relative">
                        <img
                          src={selectedApplication.kycUrl}
                          alt="KYC Document"
                          className="w-20 h-20 object-cover rounded-xl border-2 border-[#002B5B]"
                          onError={(e) => {
                            e.target.style.display = "none";
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = "flex";
                            }
                          }}
                        />
                        <div
                          className="w-20 h-20 bg-gray-100 rounded-xl flex-col items-center justify-center hidden"
                          style={{
                            display: selectedApplication.kycUrl?.endsWith(".pdf")
                              ? "flex"
                              : "none",
                          }}
                        >
                          <FileText size={24} className="text-red-600" />
                          <span className="text-[8px] font-black text-gray-500">PDF</span>
                        </div>
                        <a
                          href={selectedApplication.kycUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute -bottom-2 -right-2 bg-[#002B5B] text-white p-1 rounded-lg text-[8px] font-black uppercase"
                        >
                          View
                        </a>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center">
                        <FileText size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-6">
            <button
              onClick={updateLiveDatabase}
              disabled={isUpdating}
              className="w-full bg-[#002B5B] hover:bg-red-700 disabled:opacity-60 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl border-b-4 border-black/20"
            >
              <RefreshCcw size={18} className={isUpdating ? "animate-spin" : ""} />
              {isUpdating ? "Updating..." : "Update Tracking"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
            <button
              onClick={handleApprove}
              disabled={isApproving || !selectedApplication}
              className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white py-4 rounded-2xl font-black uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
            >
              <BadgeCheck size={18} className={isApproving ? "animate-pulse" : ""} />
              {isApproving ? "Approving..." : "Approve"}
            </button>

            <button
              onClick={handleReject}
              disabled={isRejecting || !selectedApplication}
              className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white py-4 rounded-2xl font-black uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
            >
              <XCircle size={18} className={isRejecting ? "animate-pulse" : ""} />
              {isRejecting ? "Rejecting..." : "Reject"}
            </button>
          </div>

          {selectedApplication && (
            <div className="pt-4 text-[10px] font-bold text-gray-500 dark:text-gray-400">
              Current Membership Status:{" "}
              <span className="text-[#002B5B] dark:text-white">
                {selectedApplication.status || "Pending"}
              </span>
              {selectedApplication.memberId ? (
                <>
                  {" "}• MemberId: <span className="text-red-700">{selectedApplication.memberId}</span>
                </>
              ) : null}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminStatusTrack;