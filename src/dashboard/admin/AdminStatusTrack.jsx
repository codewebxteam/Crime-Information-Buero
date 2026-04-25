import React, { useEffect, useMemo, useState } from "react";
import { Activity, RefreshCcw, CheckCircle2, ShieldCheck, BadgeCheck, XCircle } from "lucide-react";

import StatCard from "../../components/admincomponents/StatCard";
import MemberQueue from "../../components/admincomponents/MemberQueue";
import ApplicantDetails from "../../components/admincomponents/ApplicantDetails";

import { 
  fetchAllApplications, 
  approveApplication, 
  rejectApplication, 
  updateApplicationTrackStatus 
} from "../../services/admin.service";

const AdminStatusTrack = ({ adminUid = "", currentAdmin = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [trackStatus, setTrackStatus] = useState("Intelligence Verification");
  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState(""); 
  const [isUpdating, setIsUpdating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [filterType, setFilterType] = useState("Total");

  const statusOptions = [
    { label: "Request Received", icon: <CheckCircle2 size={16} />, color: "text-blue-500" },
    { label: "Intelligence Verification", icon: <ShieldCheck size={16} />, color: "text-yellow-500" },
    { label: "Approved", icon: <BadgeCheck size={16} />, color: "text-green-500" },
    { label: "Rejected", icon: <XCircle size={16} />, color: "text-red-500" },
  ];

  const counters = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(a => a.status === "Pending").length,
    approved: applications.filter(a => a.status === "Approved").length,
    rejected: applications.filter(a => a.status === "Rejected").length,
  }), [applications]);

  const filteredApps = useMemo(() => 
    filterType === "Total" ? applications : applications.filter(a => a.status === filterType)
  , [applications, filterType]);

  const selectedApp = useMemo(() => 
    applications.find(a => a.id === selectedAppId) || null
  , [applications, selectedAppId]);

  const loadApplications = async () => {
    try {
      const data = await fetchAllApplications();
      setApplications(data);
    } catch (e) { 
      console.error("Error loading applications:", e); 
    }
  };

  useEffect(() => { 
    loadApplications(); 
  }, []);

  const handleApprove = async () => {
    const finalAdminUid = adminUid || currentAdmin?.uid || currentAdmin?.id;
    if (!selectedApp || !finalAdminUid) return;
    
    setIsApproving(true);
    try {
      const res = await approveApplication({ 
        appId: selectedApp.id, 
        adminUid: finalAdminUid, 
        applicant: selectedApp 
      });
      alert(`Approved! Member ID: ${res?.memberId}`);
      await loadApplications(); 
    } catch (e) { 
      alert("Approval failed: " + e.message); 
    } finally { 
      setIsApproving(false); 
    }
  };

  const handleReject = async () => {
    const finalAdminUid = adminUid || currentAdmin?.uid || currentAdmin?.id;
    if (!selectedApp || !finalAdminUid) return;

    const remarks = window.prompt("Reason for rejection:");
    if (remarks === null) return;

    setIsRejecting(true);
    try {
      await rejectApplication(selectedApp.id, finalAdminUid, remarks || "");
      alert("Rejected.");
      await loadApplications(); 
    } catch (e) { 
      alert("Rejection failed: " + e.message); 
    } finally { 
      setIsRejecting(false); 
    }
  };

  const updateLiveDatabase = async () => {
    if (!selectedAppId) return;
    setIsUpdating(true);
    try {
      await updateApplicationTrackStatus(selectedAppId, trackStatus);
      alert(`Updated: ${trackStatus}`);
      await loadApplications();
    } catch (err) { 
      alert("Update failed."); 
    } finally { 
      setIsUpdating(false); 
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-black p-3 sm:p-6 lg:p-8">
      {/* Header - Optimized for mobile wrap */}
      <div className="w-full bg-[#002B5B] p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] text-white shadow-lg mb-6 sm:mb-8 flex flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-3xl font-black uppercase italic text-white leading-none">Terminal <span className="text-red-500">Status</span></h2>
          <p className="text-[8px] sm:text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-2">Master Control Panel</p>
        </div>
        <button 
          onClick={loadApplications} 
          className="p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all text-white shrink-0"
        >
          <RefreshCcw size={20} className={`${isUpdating ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard label="Total" count={counters.total} color="text-blue-600" status="Total" activeFilter={filterType} onClick={setFilterType} />
        <StatCard label="Pending" count={counters.pending} color="text-yellow-500" status="Pending" activeFilter={filterType} onClick={setFilterType} />
        <StatCard label="Approved" count={counters.approved} color="text-green-600" status="Approved" activeFilter={filterType} onClick={setFilterType} />
        <StatCard label="Rejected" count={counters.rejected} color="text-red-600" status="Rejected" activeFilter={filterType} onClick={setFilterType} />
      </div>

      {/* Main Terminal Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">
        {/* Queue Section */}
        <div className="xl:col-span-4">
          <MemberQueue 
            applications={filteredApps} 
            selectedId={selectedAppId} 
            onSelect={(id) => { 
              setSelectedAppId(id); 
              const app = applications.find(a => a.id === id);
              setTrackStatus(app?.trackStatus || "Intelligence Verification");
            }} 
            filterType={filterType} 
          />
        </div>
        
        {/* Detail Section */}
        <div className="xl:col-span-8">
          {selectedApp ? (
            <ApplicantDetails 
              selectedApp={selectedApp} 
              isApproving={isApproving} 
              isRejecting={isRejecting} 
              handleApprove={handleApprove} 
              handleReject={handleReject}
              isOpen={isOpen} 
              setIsOpen={setIsOpen} 
              trackStatus={trackStatus} 
              setTrackStatus={setTrackStatus} 
              statusOptions={statusOptions}
              updateLiveDatabase={updateLiveDatabase} 
              isUpdating={isUpdating}
            />
          ) : (
            <div className="h-[300px] sm:h-[520px] bg-white dark:bg-[#111] rounded-2xl sm:rounded-[2rem] flex flex-col items-center justify-center text-center p-6 sm:p-10 border-2 border-dashed border-gray-200">
               <Activity size={32} className="text-gray-300 mb-4 sm:mb-6" />
               <h4 className="text-sm sm:text-xl font-black text-[#002B5B] dark:text-white uppercase italic">Queue Waiting</h4>
               <p className="text-[10px] text-gray-400 uppercase mt-2">Select a member to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStatusTrack;