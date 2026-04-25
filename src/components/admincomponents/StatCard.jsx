import React from "react";

const StatCard = ({ label, count, color, status, activeFilter, onClick }) => (
  <button
    onClick={() => onClick(status)}
    className={`p-6 rounded-[1.5rem] bg-white dark:bg-[#111] text-left transition-all border-b-4 h-[130px] overflow-y-auto no-scrollbar flex flex-col justify-between shadow-sm ${
      activeFilter === status ? "border-[#002B5B] shadow-xl" : "border-transparent opacity-70"
    }`}
  >
    <div className="w-full">
      <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">{label} Members</p>
      <h4 className={`text-4xl font-black ${color} leading-none`}>{count}</h4>
      <p className="text-[8px] font-bold text-gray-400 mt-2 uppercase opacity-50">Click to filter</p>
    </div>
  </button>
);

export default StatCard;