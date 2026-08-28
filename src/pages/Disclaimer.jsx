import React from 'react';
import { AlertTriangle, Users, MapPin, Building2, UserCheck, ShieldAlert } from 'lucide-react';

const Disclaimer = () => {
  const stats = [
    { label: "Public Relationship Officers", value: "502", icon: <Users size={20} /> },
    { label: "Number of States Active", value: "29", icon: <MapPin size={20} /> },
    { label: "Branch / Camp Offices", value: "222", icon: <Building2 size={20} /> },
    { label: "Number of CIB Members", value: "49,552", icon: <UserCheck size={20} /> },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#f1f3f5] dark:bg-[#0a0a0a] transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        
        {/* Stats Grid with Shadow */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-[#151515] p-6 md:p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/5 text-center transition-transform hover:-translate-y-2">
              <div className="text-red-700 mb-4 flex justify-center opacity-80">{stat.icon}</div>
              <h4 className="text-3xl md:text-5xl font-[1000] text-[#002B5B] dark:text-white tracking-tighter mb-2">
                {stat.value}
              </h4>
              <p className="text-[9px] md:text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-[0.2em] leading-tight">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Disclaimer Content Box */}
        <div className="bg-white dark:bg-[#111] rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 border-2 border-dashed border-gray-200 dark:border-white/10 relative overflow-hidden">
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-red-700/10 p-4 rounded-full text-red-700">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-[#002B5B] dark:text-white uppercase italic tracking-tighter">
                Official <span className="text-red-700">Disclaimer.</span>
              </h2>
              <p className="text-xs md:text-sm font-black uppercase text-red-700 tracking-[0.3em]">
                A Public Movement for Crime and Corruption Free Nation
              </p>
            </div>

            <div className="max-w-4xl space-y-6 text-gray-600 dark:text-gray-400 font-bold text-xs md:text-base leading-relaxed">
              <p>
                CIB is registered under the Indian Trust Act as an NGO working as a criminal information provider agency. 
                <span className="text-red-700 dark:text-red-500"> We are not an investigation agency</span> and we have no formal tie-up with any Central/State Government Department, CBI, Police, MHA or similar bodies. 
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <ul className="space-y-3">
                  <li className="flex gap-3 items-start italic">
                    <span className="text-red-700">•</span> The information provided by CIB is intended to aid public awareness and community action.
                  </li>
                  <li className="flex gap-3 items-start italic">
                    <span className="text-red-700">•</span> Information shared through our channels does not replace official investigation processes.
                  </li>
                </ul>
                <ul className="space-y-3">
                  <li className="flex gap-3 items-start italic">
                    <span className="text-red-700">•</span> Individuals and organizations should verify facts with competent authorities before taking legal action.
                  </li>
                  <li className="flex gap-3 items-start italic">
                    <span className="text-red-700">•</span> Membership & volunteering follow our internal verification and code-of-conduct procedures.
                  </li>
                </ul>
              </div>
            </div>

            {/* Slogan Pill */}
            <div className="inline-block bg-[#002B5B] dark:bg-red-700 text-white px-8 py-4 rounded-full shadow-xl">
              <p className="text-sm md:text-lg font-black uppercase tracking-widest italic">
                “Ekta mein Shakti — Apradhmukt Samaj ke liye humara Sankalp”
              </p>
            </div>
          </div>

          {/* Background Decor */}
          <ShieldAlert size={300} className="absolute -bottom-20 -right-20 text-gray-50 dark:text-white/[0.02] -rotate-12 pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default Disclaimer;