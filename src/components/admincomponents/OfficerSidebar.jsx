import React, { useState, useEffect } from "react";
import { Search, UserCircle, ChevronLeft, ChevronRight } from "lucide-react";

const OfficerSidebar = ({ searchTerm, setSearchTerm, filteredMembers, selectedMemberId, setSelectedMemberId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="col-span-12 lg:col-span-4 xl:col-span-3 bg-white dark:bg-[#111] p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl flex flex-col border border-gray-100 dark:border-white/5 transition-all duration-300">
      
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

      {/* --- List Section without Scrollbar --- */}
      <div className="flex-1 space-y-2 flex flex-col justify-start">
        {paginatedMembers.length > 0 ? (
          paginatedMembers.map((m) => (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-white/10 text-[#001F3F] dark:text-white'}`}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-[10px] font-black uppercase text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-white/10 text-[#001F3F] dark:text-white'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default OfficerSidebar;