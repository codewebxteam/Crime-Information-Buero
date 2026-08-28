import React from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";

const UpdatesTab = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-white dark:bg-[#111] p-8 md:p-12 rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5 text-center"
    >
      <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
        <Bell size={32} className="text-gray-300" />
      </div>
      <h3 className="text-sm font-black text-[#002B5B] dark:text-white uppercase tracking-widest">No New Notifications</h3>
      <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase mt-2 tracking-wider">
        Official updates from the HQ will appear here.
      </p>
    </motion.div>
  );
};

export default UpdatesTab;