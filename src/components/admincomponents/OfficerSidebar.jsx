import React from "react";
import { Search } from "lucide-react";

const OfficerSidebar = ({ searchTerm, setSearchTerm, filteredMembers, selectedMemberId, setSelectedMemberId }) => {
  return (
    <div className="xl:col-span-4 bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-xl h-[600px] flex flex-col border border-gray-100 dark:border-white/5">
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search Officer Name/ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-50 dark:bg-black border-2 border-transparent focus:border-red-700 p-4 pl-12 rounded-2xl text-xs font-bold outline-none transition-all"
        />
      </div>
      <div className="overflow-y-auto space-y-2 no-scrollbar flex-1">
        {filteredMembers.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMemberId(m.id)}
            className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 border-2 ${
              selectedMemberId === m.id 
                ? "bg-[#001F3F] border-[#001F3F] text-white shadow-lg" 
                : "bg-gray-50 dark:bg-black border-transparent hover:border-gray-200"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
              selectedMemberId === m.id ? "bg-white/20 text-white" : "bg-white text-red-600 shadow-sm"
            }`}>
              {m.fullName?.charAt(0) || "U"}
            </div>
            <div className="truncate">
              <p className="text-[11px] font-black uppercase">{m.fullName || m.name}</p>
              <p className="text-[9px] opacity-60 font-bold">{m.memberId}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OfficerSidebar;