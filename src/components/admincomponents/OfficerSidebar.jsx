import React from "react";
import { Search, UserCircle } from "lucide-react";

const OfficerSidebar = ({ searchTerm, setSearchTerm, filteredMembers, selectedMemberId, setSelectedMemberId }) => {
  return (
    <div className="col-span-12 lg:col-span-4 xl:col-span-3 bg-white dark:bg-[#111] p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl h-[500px] lg:h-[700px] flex flex-col border border-gray-100 dark:border-white/5 transition-all duration-300">
      
      {/* Header Label */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <UserCircle size={18} className="text-red-700" />
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Officer Directory</h3>
      </div>

      {/* --- Search Box --- */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center bg-gray-50 dark:bg-black border-2 border-transparent focus-within:border-red-700 rounded-xl sm:rounded-2xl px-4 shadow-inner transition-all">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent p-3 sm:p-4 text-[11px] sm:text-xs font-bold outline-none dark:text-white border-none"
          />
        </div>
      </div>

      {/* --- Scrollable List Section --- */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-sidebar-scroll">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedMemberId(m.id);
                // Mobile par selection ke baad halka sa haptic feel dene ke liye
              }}
              className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all flex items-center gap-3 sm:gap-4 border-2 group ${
                selectedMemberId === m.id 
                  ? "bg-[#001F3F] border-[#001F3F] text-white shadow-lg translate-x-1" 
                  : "bg-gray-50 dark:bg-black border-transparent hover:border-gray-200 dark:hover:border-white/10"
              }`}
            >
              {/* Profile Initial */}
              <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex-shrink-0 flex items-center justify-center font-black text-sm sm:text-base ${
                selectedMemberId === m.id 
                  ? "bg-white/20 text-white" 
                  : "bg-white text-red-600 shadow-sm border border-gray-100"
              }`}>
                {m.fullName?.charAt(0) || "U"}
              </div>

              {/* Info */}
              <div className="truncate flex-1">
                <p className={`text-[10px] sm:text-[12px] font-black uppercase truncate ${
                  selectedMemberId === m.id ? "text-white" : "text-[#001F3F] dark:text-gray-200"
                }`}>
                  {m.fullName || m.name}
                </p>
                <p className={`text-[8px] sm:text-[9px] font-bold truncate tracking-wider ${
                  selectedMemberId === m.id ? "text-white/60" : "text-gray-400"
                }`}>
                  ID: {m.memberId || "N/A"}
                </p>
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-40">
            <Search size={30} className="mb-2 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">No matching records</p>
          </div>
        )}
      </div>

      {/* --- Styling for Scrollbar --- */}
      <style>{`
        .custom-sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-sidebar-scroll::-webkit-scrollbar-thumb {
          background: #1f2937;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #ef4444;
        }
      `}</style>
    </div>
  );
};

export default OfficerSidebar;