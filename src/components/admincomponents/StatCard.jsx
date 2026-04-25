import React from "react";

const StatCard = ({ label, count, color, status, activeFilter, onClick }) => (
  <button
    onClick={() => onClick(status)}
    className={`p-4 sm:p-6 rounded-[1.2rem] sm:rounded-[1.5rem] bg-white dark:bg-[#111] text-left transition-all border-b-4 h-[100px] sm:h-[130px] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
      activeFilter === status 
        ? "border-[#002B5B] shadow-xl opacity-100 scale-[1.02]" 
        : "border-transparent opacity-70 hover:opacity-100"
    }`}
  >
    <div className="w-full">
      {/* Label: Smaller on mobile */}
      <p className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400 mb-0.5 sm:mb-1 tracking-widest truncate">
        {label} Members
      </p>
      
      {/* Count: Scaled for mobile */}
      <h4 className={`text-2xl sm:text-4xl font-black ${color} leading-none`}>
        {count}
      </h4>
      
      {/* Hint: Hidden on very small screens or just made smaller */}
      <p className="text-[7px] sm:text-[8px] font-bold text-gray-400 mt-1 sm:mt-2 uppercase opacity-50 truncate">
        Click to filter
      </p>
    </div>
  </button>
);

export default StatCard;