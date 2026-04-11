import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Map, Flag, Users, Scale, Eye, 
  Network, Globe, ShieldAlert, Building2,
  Fingerprint, Briefcase, Landmark, Gavel
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: "easeOut" },
  viewport: { once: true }
};

const Rules = () => {
  return (
    <section className="py-20 bg-[#f8f9fa] dark:bg-[#080808] transition-colors duration-500 overflow-hidden relative font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-700/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#002B5B]/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* --- Main Header --- */}
        <motion.div className="flex flex-col items-center text-center mb-20 border-b-4 border-red-700/10 pb-12" {...fadeUp}>
          <div className="bg-[#002B5B] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-6 shadow-xl flex items-center gap-3">
            <ShieldCheck size={14} className="text-red-500 animate-pulse" /> Bureau Regulatory Framework
          </div>
          <h1 className="text-5xl md:text-8xl font-[1000] text-[#002B5B] dark:text-white uppercase tracking-tighter mb-4 italic leading-none">
            Rules & <span className="text-red-700">Protocol</span>
          </h1>
          <p className="text-xs md:text-sm font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.5em]">
            Official Analysis of Crime Information Bureau
          </p>
        </motion.div>

        <div className="space-y-12">
          
          {/* --- BIG CARD 1: Informant & District Protocol --- */}
          <motion.div className="bg-white dark:bg-[#111] rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col md:flex-row" {...fadeUp}>
            <div className="md:w-1/3 bg-[#002B5B] p-12 flex flex-col justify-center items-center text-center text-white relative">
                <div className="absolute top-6 left-6 text-6xl font-black opacity-10 italic">01</div>
                <div className="bg-red-700 p-5 rounded-[2rem] mb-6 shadow-2xl shadow-red-900/40">
                    <Eye size={40} />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Informant & District Level</h3>
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-2 underline">Tier 1 Operations</p>
            </div>
            <div className="md:w-2/3 p-10 md:p-14 space-y-6">
                <p className="text-lg font-bold text-[#002B5B] dark:text-white italic leading-relaxed border-l-4 border-red-700 pl-6">
                    The primary responsibility at this level is to identify anti-social elements, violence-mongers, or corrupt individuals within the local community.
                </p>
                <div className="space-y-4 text-gray-600 dark:text-gray-400 font-bold text-sm md:text-base">
                    <p>Members must collect evidence-based information regarding any irregularities and report them to the local administration to ensure prevention. These operations are conducted at the sub-district and district levels.</p>
                    <p className="text-red-700 text-[10px] uppercase tracking-widest bg-red-50 dark:bg-red-900/10 p-3 rounded-xl inline-block">Requirement: Minimum Intermediate Education (10+2)</p>
                </div>
            </div>
          </motion.div>

          {/* --- BIG CARD 2: State Level Authority --- */}
          <motion.div className="bg-white dark:bg-[#111] rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse" {...fadeUp}>
            <div className="md:w-1/3 bg-[#002B5B] p-12 flex flex-col justify-center items-center text-center text-white relative">
                <div className="absolute top-6 right-6 text-6xl font-black opacity-10 italic">02</div>
                <div className="bg-red-700 p-5 rounded-[2rem] mb-6 shadow-2xl shadow-red-900/40">
                    <Network size={40} />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">State Level Authority</h3>
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-2 underline">Tier 2 Operations</p>
            </div>
            <div className="md:w-2/3 p-10 md:p-14 space-y-6">
                <p className="text-lg font-bold text-[#002B5B] dark:text-white italic leading-relaxed border-r-4 border-red-700 pr-6 text-right md:text-left">
                    State Level Officers serve as the responsible authority for crime control within their respective states. 
                </p>
                <div className="space-y-4 text-gray-600 dark:text-gray-400 font-bold text-sm md:text-base">
                    <p>Their duty involves investigating evidence, coordinating with state administrations, and providing justice through systematic information collection. They are also tasked with monitoring criminal activities during major festivals to assist the police force.</p>
                    <p className="text-red-700 text-[10px] uppercase tracking-widest bg-red-50 dark:bg-red-900/10 p-3 rounded-xl inline-block">Requirement: Experienced State Leadership Role</p>
                </div>
            </div>
          </motion.div>

          {/* --- BIG CARD 3: National Operations --- */}
          <motion.div className="bg-white dark:bg-[#111] rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col md:flex-row" {...fadeUp}>
            <div className="md:w-1/3 bg-[#002B5B] p-12 flex flex-col justify-center items-center text-center text-white relative">
                <div className="absolute top-6 left-6 text-6xl font-black opacity-10 italic">03</div>
                <div className="bg-red-700 p-5 rounded-[2rem] mb-6 shadow-2xl shadow-red-900/40">
                    <Flag size={40} />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">National Leadership</h3>
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-2 underline">Tier 3 Operations</p>
            </div>
            <div className="md:w-2/3 p-10 md:p-14 space-y-6">
                <p className="text-lg font-bold text-[#002B5B] dark:text-white italic leading-relaxed border-l-4 border-red-700 pl-6">
                    National Level Officers have a pan-India operational scope, reporting directly to Central Authorities.
                </p>
                <div className="space-y-4 text-gray-600 dark:text-gray-400 font-bold text-sm md:text-base">
                    <p>This includes reporting major cases to the Central Government, CBI, or Central Commissions. They have the authority to organize national-level training programs, monitoring meetings, and large-scale awareness campaigns across India.</p>
                    <p className="text-red-700 text-[10px] uppercase tracking-widest bg-red-50 dark:bg-red-900/10 p-3 rounded-xl inline-block">Requirement: Permission from Central HQ</p>
                </div>
            </div>
          </motion.div>

          {/* --- BIG CARD 4: Constitutional Scope & Work Area --- */}
          <motion.div className="bg-[#002B5B] rounded-[3rem] shadow-2xl overflow-hidden p-10 md:p-16 text-white relative group" {...fadeUp}>
            <Landmark className="absolute -right-10 -bottom-10 w-64 h-64 opacity-5 group-hover:rotate-6 transition-transform duration-700" />
            <div className="flex items-center gap-6 mb-10">
                <div className="bg-red-700 p-4 rounded-2xl shadow-xl">
                    <Gavel size={32} />
                </div>
                <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">Work Area & <span className="text-red-600">Legal Scope</span></h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                <div className="space-y-6">
                    <h4 className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/10 pb-2">Bureau Reach</h4>
                    <p className="text-sm md:text-base font-bold italic leading-relaxed text-blue-50">
                        CIB operates nationwide, working as an auxiliary support wing to the police and administration. Our members use their authorized credentials to assist in maintaining peace and stopping criminal activities at local police outposts and station levels.
                    </p>
                </div>
                <div className="space-y-6">
                    <h4 className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/10 pb-2">Operational Focus</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {["Cyber Crime", "Corruption", "Domestic Violence", "Financial Fraud", "Public Safety", "Communal Harmony"].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/70">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" /> {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <p className="mt-12 text-sm font-bold text-white/60 italic border-t border-white/10 pt-8">
                The Indian Constitution empowers common citizens to cooperate with the administration. When reliable information is transmitted through an organized 'Unity', the government acts with higher credibility and speed.
            </p>
          </motion.div>

        </div>

        {/* --- Footer Note --- */}
        <div className="text-center mt-20">
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-700 uppercase tracking-[0.5em] flex items-center justify-center gap-4">
            <ShieldAlert size={14} className="text-red-700" /> OFFICIAL CIB REGULATORY PROTOCOL 2026 <ShieldAlert size={14} className="text-red-700" />
          </p>
        </div>
      </div>
    </section>
  );
};

export default Rules;