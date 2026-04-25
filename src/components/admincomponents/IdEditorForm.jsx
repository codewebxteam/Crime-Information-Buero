import React, { useState, useEffect } from "react";
import { User, ShieldCheck, Hash, Phone, MapPin, Calendar, Eye, Database, Loader2, PenTool } from "lucide-react";

const InputField = ({ label, name, value, onChange, icon }) => (
  <div className="space-y-1.5 sm:space-y-2">
    <label className="text-[8px] sm:text-[9px] font-black uppercase text-gray-400 pl-2 tracking-widest">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-700 transition-colors">
        {icon}
      </div>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-50 dark:bg-black border-2 border-transparent focus:border-[#001F3F] rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 text-[10px] sm:text-xs font-bold outline-none shadow-inner transition-all"
      />
    </div>
  </div>
);

const IdEditorForm = ({ member, handleInput, syncToDatabase, onPreviewClick, isProcessing, isDataSynced, updateSuccess }) => {
  const [hasSyncedOnce, setHasSyncedOnce] = useState(false);

  // Jab sync success ho, preview enable lock kar do
  useEffect(() => {
    if (isDataSynced || updateSuccess) setHasSyncedOnce(true);
  }, [isDataSynced, updateSuccess]);

  // Member badalne par sync state reset
  useEffect(() => {
    setHasSyncedOnce(false);
  }, [member.idNumber]);

  return (
    <div className="col-span-12 lg:col-span-8 xl:col-span-8 bg-white dark:bg-[#111] p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5">
      <h3 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mb-6 sm:mb-8 pb-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-2">
        <PenTool size={14} className="text-red-700" /> Data Modulation
      </h3>

      {/* Grid Layout: 1 column on mobile, 2 on medium screens and up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <InputField label="Officer Name" name="name" value={member.name} onChange={handleInput} icon={<User size={16}/>} />
        <InputField label="Designation" name="rank" value={member.rank} onChange={handleInput} icon={<ShieldCheck size={16}/>} />
        <InputField label="Bureau ID" name="idNumber" value={member.idNumber} onChange={handleInput} icon={<Hash size={16}/>} />
        <InputField label="Contact Line" name="contact" value={member.contact} onChange={handleInput} icon={<Phone size={16}/>} />
        <div className="md:col-span-2">
          <InputField label="Assigned Area" name="address" value={member.address} onChange={handleInput} icon={<MapPin size={16}/>} />
        </div>
        <InputField label="Valid Duration" name="validUntil" value={member.validUntil} onChange={handleInput} icon={<Calendar size={16}/>} />
        <InputField label="Photo URL" name="photo" value={member.photo} onChange={handleInput} icon={<Eye size={16}/>} />
      </div>

      {/* Button Section: Vertical on mobile, Horizontal on tablet/PC */}
      <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4">
        <button
          onClick={syncToDatabase}
          disabled={isProcessing}
          className="flex-1 bg-[#8B0000] hover:bg-red-700 text-white p-4 sm:p-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-[11px] flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 disabled:opacity-50"
        >
          {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />} 
          <span>Sync Details</span>
        </button>

        <button
          onClick={onPreviewClick}
          disabled={!hasSyncedOnce}
          className={`flex-1 p-4 sm:p-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95 ${
            hasSyncedOnce ? "bg-gray-800 text-white shadow-lg" : "bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200"
          }`}
        >
          <Eye size={18} /> 
          <span>{hasSyncedOnce ? "Review Final PDF" : "Sync Required"}</span>
        </button>
      </div>
      
      {updateSuccess && (
        <div className="mt-4 text-center text-green-600 font-black text-[9px] sm:text-[10px] uppercase italic animate-pulse">
          Database Updated Successfully!
        </div>
      )}
    </div>
  );
};

export default IdEditorForm;