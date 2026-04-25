import React, { useState, useEffect } from "react";
import { Search, Users } from "lucide-react";

const MemberQueue = ({ applications, selectedId, onSelect, filterType }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Search logic
  const filteredList = applications.filter((app) =>
    app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- AUTO SELECT FIRST MEMBER LOGIC ---
  useEffect(() => {
    if (filteredList.length > 0 && !selectedId && searchTerm === "") {
      onSelect(filteredList[0].id);
    }
  }, [filteredList, selectedId, onSelect, searchTerm]);

  return (
    <div className="col-span-12 lg:col-span-4 bg-white dark:bg-[#111] p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-lg border border-gray-100 dark:border-white/5 flex flex-col h-[450px] lg:h-[550px]">
      
      {/* Header - Responsive Spacing */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 px-1 sm:px-2">
        <h5 className="text-[10px] sm:text-xs font-black uppercase text-gray-400 flex items-center gap-2 tracking-widest">
          <Users size={14} className="text-red-700" /> {filterType} Queue
        </h5>
        <span className="text-[9px] sm:text-[10px] bg-[#002B5B] text-white px-2 sm:px-3 py-1 rounded-full font-black whitespace-nowrap">
          {filteredList.length} Active
        </span>
      </div>

      {/* --- FIXED SEARCH BAR (No overlap) --- */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center bg-gray-50 dark:bg-black border border-gray-100 dark:border-white/5 px-4 rounded-xl sm:rounded-2xl shadow-inner focus-within:border-red-700 transition-all">
          <Search className="text-gray-400 shrink-0" size={16} />
          <input
            type="text"
            placeholder="Search member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent p-3 sm:p-4 text-[11px] sm:text-xs font-bold outline-none text-[#002B5B] dark:text-white border-none"
          />
        </div>
      </div>

      {/* Member List Area with Visible Scrollbar */}
      <div className="space-y-2 sm:space-y-3 overflow-y-auto pr-2 custom-queue-scroll flex-1">
        {filteredList.length > 0 ? (
          filteredList.map((app) => (
            <button
              key={app.id}
              onClick={() => onSelect(app.id)}
              className={`w-full p-3 sm:p-5 rounded-xl sm:rounded-2xl text-left transition-all flex items-center gap-3 sm:gap-4 border-2 ${
                selectedId === app.id 
                ? "bg-[#002B5B] border-[#002B5B] text-white shadow-xl translate-x-1" 
                : "bg-gray-50 dark:bg-black border-transparent hover:border-gray-200 dark:hover:border-white/10"
              }`}
            >
              {/* Profile Initial */}
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-black shrink-0 text-sm sm:text-base ${
                selectedId === app.id ? "bg-white/20 text-white" : "bg-white text-red-600 shadow-sm border border-gray-100"
              }`}>
                {app.fullName?.charAt(0) || "U"}
              </div>

              {/* Name Details */}
              <div className="flex-1 overflow-hidden">
                <p className={`text-[11px] sm:text-xs font-black uppercase truncate ${selectedId === app.id ? "text-white" : "text-[#002B5B] dark:text-white"}`}>
                  {app.fullName || "Unnamed Member"}
                </p>
                <p className={`text-[8px] sm:text-[9px] font-bold uppercase opacity-60 truncate ${selectedId === app.id ? "text-blue-100" : "text-gray-400"}`}>
                  {app.membershipLabel || "Standard Personnel"}
                </p>
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center opacity-30">
            <Search size={24} className="mb-2" />
            <p className="text-[9px] font-black uppercase tracking-widest">No matching records</p>
          </div>
        )}
      </div>

      {/* Style for Visible & Professional Scrollbar */}
      <style>{`
        .custom-queue-scroll::-webkit-scrollbar {
          width: 6px;
          display: block !important;
        }
        .custom-queue-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-queue-scroll::-webkit-scrollbar-thumb {
          background: #002B5B;
          border-radius: 10px;
        }
        .custom-queue-scroll::-webkit-scrollbar-thumb:hover {
          background: #ef4444;
        }
        .dark .custom-queue-scroll::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        .dark .custom-queue-scroll::-webkit-scrollbar-thumb {
          background: #333;
        }
        .custom-queue-scroll {
          scrollbar-width: thin;
          scrollbar-color: #002B5B #f1f1f1;
        }
      `}</style>
    </div>
  );
};

export default MemberQueue;