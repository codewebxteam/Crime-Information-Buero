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
    // Agar list empty nahi hai aur abhi tak koi select nahi hua hai
    if (filteredList.length > 0 && !selectedId && searchTerm === "") {
      onSelect(filteredList[0].id);
    }
  }, [filteredList, selectedId, onSelect, searchTerm]);

  return (
    <div className="xl:col-span-4 bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-lg border border-gray-100 dark:border-white/5 flex flex-col h-[520px]">
      
      {/* Header - Classic Style */}
      <div className="flex items-center justify-between mb-6 px-2">
        <h5 className="text-xs font-black uppercase text-gray-400 flex items-center gap-2 tracking-widest">
          <Users size={14} className="text-red-700" /> {filterType} Queue
        </h5>
        <span className="text-[10px] bg-[#002B5B] text-white px-3 py-1 rounded-full font-black">
          {filteredList.length} Active
        </span>
      </div>

      {/* Search Bar - Fixed at top */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search member name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-50 dark:bg-black border border-gray-100 dark:border-white/5 p-4 pl-12 rounded-2xl text-xs font-bold focus:border-red-700 outline-none transition-all text-[#002B5B] dark:text-white shadow-inner"
        />
      </div>

      {/* Member List Area - 4 members visible limit */}
      <div className="space-y-3 overflow-y-auto pr-2 no-scrollbar flex-1 max-h-[350px]">
        {filteredList.length > 0 ? (
          filteredList.map((app) => (
            <button
              key={app.id}
              onClick={() => onSelect(app.id)}
              className={`w-full p-5 rounded-2xl text-left transition-all flex items-center gap-4 border-2 ${
                selectedId === app.id 
                ? "bg-[#002B5B] border-[#002B5B] text-white shadow-xl translate-x-1" 
                : "bg-gray-50 dark:bg-black border-transparent hover:border-gray-200 dark:hover:border-white/10"
              }`}
            >
              {/* Profile Initial */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${
                selectedId === app.id ? "bg-white/20 text-white" : "bg-white text-red-600 shadow-sm border border-gray-100"
              }`}>
                {app.fullName?.charAt(0) || "U"}
              </div>

              {/* Name Details */}
              <div className="flex-1 overflow-hidden">
                <p className={`text-xs font-black uppercase truncate ${selectedId === app.id ? "text-white" : "text-[#002B5B] dark:text-white"}`}>
                  {app.fullName || "Unnamed Member"}
                </p>
                <p className={`text-[9px] font-bold uppercase opacity-60 ${selectedId === app.id ? "text-blue-100" : "text-gray-400"}`}>
                  {app.membershipLabel || "Standard Personnel"}
                </p>
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center opacity-30">
            <Search size={32} className="mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest">No matching records</p>
          </div>
        )}
      </div>

      {/* Style for hidden custom scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .no-scrollbar::-webkit-scrollbar-thumb {
          background: #002B5B;
          border-radius: 10px;
        }
        .no-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #002B5B transparent;
        }
      `}</style>
    </div>
  );
};

export default MemberQueue;