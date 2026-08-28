import React from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react";

const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-red-700 shrink-0">
      {icon}
    </div>
    <div className="overflow-hidden">
      <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-xs md:text-sm font-bold text-[#002B5B] dark:text-white truncate">{value || "N/A"}</p>
    </div>
  </div>
);

const ProfileTab = ({ userData, formattedData }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8"
    >
      {/* Identity Summary Card */}
      <div className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-[2rem] shadow-xl text-center border border-gray-100 dark:border-white/5 h-fit">
        <div className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-3xl border-4 border-[#002B5B] overflow-hidden mb-4 shadow-lg bg-gray-50">
          <img src={formattedData?.photo} className="w-full h-full object-cover" alt="User" />
        </div>
        <h2 className="text-lg md:text-xl font-black text-[#002B5B] dark:text-white uppercase truncate">{formattedData?.name}</h2>
        <span className="text-[9px] md:text-[10px] bg-red-700 text-white px-4 py-1.5 rounded-full font-black uppercase mt-3 inline-block tracking-widest">
          {formattedData?.designation}
        </span>
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bureau ID</p>
          <p className="text-base md:text-lg font-black text-[#002B5B] dark:text-white">{formattedData?.idNumber}</p>
        </div>
      </div>

      {/* Official Details Card */}
      <div className="lg:col-span-2 bg-white dark:bg-[#111] p-6 md:p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5">
        <h3 className="text-xs md:text-sm font-black text-[#002B5B] dark:text-white uppercase mb-6 md:mb-8 border-l-4 border-red-700 pl-4 tracking-widest">
          Official Record
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          <InfoRow label="Registered Email" value={userData?.email} icon={<Mail size={14} />} />
          <InfoRow label="Contact Number" value={formattedData?.phone} icon={<Phone size={14} />} />
          <InfoRow label="Assigned Area" value={formattedData?.address} icon={<MapPin size={14} />} />
          <InfoRow label="Valid Period" value={`${formattedData?.joinedSince} - ${formattedData?.validUntil}`} icon={<Calendar size={14} />} />
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileTab;