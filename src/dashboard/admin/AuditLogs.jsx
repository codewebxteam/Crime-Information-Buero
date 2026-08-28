import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Search, Download, ChevronDown, ChevronUp, 
  Shield, User, CheckCircle, XCircle, Clock, Filter
} from "lucide-react";
import { db } from "../../../firebase/firebase";
import { 
  collection, getDocs, query, orderBy, limit 
} from "firebase/firestore";

const ACTION_TYPES = {
  APPLICATION_APPROVED: { label: "Application Approved", color: "text-green-600", bg: "bg-green-100" },
  APPLICATION_REJECTED: { label: "Application Rejected", color: "text-red-600", bg: "bg-red-100" },
  APPLICATION_SUBMITTED: { label: "Application Submitted", color: "text-blue-600", bg: "bg-blue-100" },
  ADMIN_CREATED: { label: "Admin Created", color: "text-purple-600", bg: "bg-purple-100" },
  ADMIN_DELETED: { label: "Admin Deleted", color: "text-red-600", bg: "bg-red-100" },
  LOGIN: { label: "Login", color: "text-gray-600", bg: "bg-gray-100" },
  LOGOUT: { label: "Logout", color: "text-gray-600", bg: "bg-gray-100" },
  PROFILE_UPDATED: { label: "Profile Updated", color: "text-yellow-600", bg: "bg-yellow-100" },
  DOCUMENT_GENERATED: { label: "Document Generated", color: "text-cyan-600", bg: "bg-cyan-100" },
};

const AuditLogs = ({ currentAdmin }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [expandedLog, setExpandedLog] = useState(null);

  // Fetch audit logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "auditLogs"),
        orderBy("createdAt", "desc"),
        limit(200)
      );
      const snapshot = await getDocs(q);
      const logList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setLogs(logList);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.actorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !filterAction || log.action === filterAction;
    
    return matchesSearch && matchesFilter;
  });

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get action info
  const getActionInfo = (action) => {
    return ACTION_TYPES[action] || { 
      label: action || "Unknown", 
      color: "text-gray-600", 
      bg: "bg-gray-100" 
    };
  };

  // Get unique actions for filter
  const uniqueActions = [...new Set(logs.map(log => log.action).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[#002B5B] dark:text-white uppercase italic">
          Audit <span className="text-red-700">Logs</span>
        </h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
          Track all administrative activities
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by actor, target, or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-4 pl-12 rounded-2xl text-sm font-bold focus:border-red-700 outline-none shadow-lg"
            />
          </div>
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full md:w-64 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-4 pl-12 rounded-2xl text-sm font-bold focus:border-red-700 outline-none shadow-lg appearance-none"
          >
            <option value="">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{getActionInfo(action).label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111] p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FileText size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase">Total Logs</p>
              <p className="text-xl font-black text-[#002B5B] dark:text-white">{logs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111] p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase">Approved</p>
              <p className="text-xl font-black text-[#002B5B] dark:text-white">
                {logs.filter(l => l.action === "APPLICATION_APPROVED").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111] p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <XCircle size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase">Rejected</p>
              <p className="text-xl font-black text-[#002B5B] dark:text-white">
                {logs.filter(l => l.action === "APPLICATION_REJECTED").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111] p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Shield size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase">Admins</p>
              <p className="text-xl font-black text-[#002B5B] dark:text-white">
                {logs.filter(l => l.actorRole?.includes("admin")).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-black/50">
              <tr>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actor</th>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target</th>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <FileText size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 font-bold">No audit logs found</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, 50).map(log => {
                  const actionInfo = getActionInfo(log.action);
                  return (
                    <React.Fragment key={log.id}>
                      <tr 
                        className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                      >
                        <td className="p-4">
                          <p className="text-xs font-bold text-gray-500">{formatDate(log.createdAt)}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-gray-400" />
                            <div>
                              <p className="text-sm font-bold text-[#002B5B] dark:text-white">
                                {log.actorRole?.replace("_", " ") || "Unknown"}
                              </p>
                              <p className="text-[10px] text-gray-400">{log.actorId?.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${actionInfo.bg} ${actionInfo.color}`}>
                            {actionInfo.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-xs font-bold text-gray-500">{log.targetType || "-"}</p>
                          <p className="text-[10px] text-gray-400">{log.targetId?.substring(0, 12)}...</p>
                        </td>
                        <td className="p-4">
                          {expandedLog === log.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </td>
                      </tr>
                      {expandedLog === log.id && log.details && (
                        <tr className="bg-gray-50 dark:bg-black/30">
                          <td colSpan="5" className="p-4">
                            <div className="bg-white dark:bg-[#111] p-4 rounded-xl border border-gray-200 dark:border-white/5">
                              <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Details</p>
                              <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filteredLogs.length > 50 && (
          <div className="p-4 text-center border-t border-gray-100 dark:border-white/5">
            <p className="text-xs text-gray-400">Showing first 50 of {filteredLogs.length} logs</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
