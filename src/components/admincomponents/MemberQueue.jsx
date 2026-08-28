import React, { useState, useEffect } from "react";
import { Search, Users, ChevronLeft, ChevronRight } from "lucide-react";

const MemberQueue = ({ applications, selectedId, onSelect, filterType }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search logic
  const filteredList = applications.filter((app) =>
    app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

  // --- AUTO SELECT FIRST MEMBER LOGIC ---
  useEffect(() => {
    if (filteredList.length > 0 && !selectedId && searchTerm === "") {
      onSelect(filteredList[0].id);
    }
  }, [filteredList, selectedId, onSelect, searchTerm]);

  return (
    <div className="col-span-12 lg:col-span-4 bg-white dark:bg-[#111] p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-lg border border-gray-100 dark:border-white/5 flex flex-col">
      
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

      {/* Member List Area without Scrollbar */}
      <div className="space-y-2 sm:space-y-3 flex-1 flex flex-col justify-start">
        {paginatedList.length > 0 ? (
          paginatedList.map((app) => (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-white/10 text-[#002B5B] dark:text-white'}`}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-[10px] font-black uppercase text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-white/10 text-[#002B5B] dark:text-white'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberQueue;