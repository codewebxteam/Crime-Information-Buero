import React, { useState } from 'react';
import { Linkedin, Mail, Target, RotateCw, Undo2, ExternalLink } from 'lucide-react';
// Assets import
import f1 from '../../assets/f1.png';
import f2 from '../../assets/f2.png';
import f3 from '../../assets/f3.png';
import f4 from '../../assets/f4.png';

const Founders = () => {
  const [flippedId, setFlippedId] = useState(null);

  const toggleFlip = (index) => {
    setFlippedId(flippedId === index ? null : index);
  };

  const founders = [
    {
      name: "RK Upadhyay",
      role: "Director, CIB",
      message: "In today's era, where society is divided by caste and politics, we must return to the vision of 'Unity in Diversity.' It is time for the youth to step forward, transcend self-interest, and reform our system to ensure justice and prosperity for every citizen. The government machinery often serves only the powerful, leaving common citizens to bear the burden of law alone. We must restore the essence of India.",
      specialization: "Administration",
      image: f1
    },
    {
      name: "Mahesh Verma",
      role: "Managing Director",
      message: "In today's world, corruption and violence spread rapidly via technology. Founded in 2012 by Director RK Upadhyay, CIB now spans 29 states with a resolve to end this cycle. I urge every citizen to step forward and contribute their time to build a secure, empowered, and legally aware nation. Our collective effort is the only way to build a strong and resilient India.",
      specialization: "Management",
      image: f2
    },
    {
      name: "Dr. B.B. Mishra",
      role: "Deputy Director",
      message: "Since 2012, CIB has been a national pillar in supporting governments against corruption and crime. With a network across 29 states and the guidance of former IPS & IAS officers, we collect vital intelligence to ensure justice and eliminate anti-constitutional activities. Our goal is to provide humanity with a new direction through institutional support and legal literacy.",
      specialization: "Legal Counsel",
      image: f3
    },
    {
      name: "Virendra Nath",
      role: "P.R.O.",
      message: "For a bright future, every citizen must be aware, educated, and transparent. Progress happens only when every individual contributes at their own level. It is our collective duty to serve the nation and ask how much we can give back to our motherland. This is the only path for India to truly reclaim its position as the 'Vishwaguru.' Jai Hind!",
      specialization: "Public Relations",
      image: f4
    }
  ];

  return (
    <section className="py-16 md:py-28 bg-[#fdfdfd] dark:bg-[#080808] transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-5 md:px-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end mb-16 md:mb-24 gap-8">
          <div className="space-y-4 text-center lg:text-left">
            <div className="inline-block px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50">
              <h2 className="text-red-700 dark:text-red-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">Founding Council</h2>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-[1000] text-[#002B5B] dark:text-white uppercase italic tracking-tighter leading-[0.85]">
              The Strategic <span className="text-red-700 not-italic">Four.</span>
            </h1>
          </div>
          <p className="max-w-sm text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm uppercase tracking-widest leading-relaxed text-center lg:text-right border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 pt-4 lg:pt-0 lg:pl-8">
            National Security through Digital Transparency and Legal Literacy.
          </p>
        </div>

        {/* Founders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 xl:gap-10">
          {founders.map((founder, index) => {
            const isFlipped = flippedId === index;

            return (
              <div key={index} className="group h-[480px] [perspective:1000px]">
                <div className={`relative h-full w-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                  
                  {/* --- FRONT SIDE --- */}
                  <div className="absolute inset-0 [backface-visibility:hidden] flex flex-col bg-white dark:bg-[#0f0f0f] rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden">
                    
                    {/* Profile Image - Grayscale removed, always colored */}
                    <div className="relative h-64 shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center">
                      <img 
                        src={founder.image} 
                        alt={founder.name} 
                        className="w-full h-full object-contain transition-all duration-500 scale-100 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/40 via-transparent to-transparent opacity-60"></div>
                      <div className="absolute top-5 right-5 backdrop-blur-md bg-white/10 border border-white/20 text-white text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                        {founder.specialization}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-7 flex flex-col flex-grow">
                      <div className="mb-4">
                        <h3 className="text-2xl font-black text-[#002B5B] dark:text-white uppercase italic leading-none mb-2">
                          {founder.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-[2px] bg-red-600"></span>
                          <p className="text-red-600 font-bold text-[10px] uppercase tracking-[0.2em]">
                            {founder.role}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-500 dark:text-gray-400 text-[11px] font-medium leading-relaxed italic line-clamp-3 mb-6">
                        "{founder.message}"
                      </p>

                      <button 
                        onClick={() => toggleFlip(index)}
                        className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-700 hover:text-[#002B5B] dark:hover:text-white transition-all cursor-pointer"
                      >
                        <RotateCw size={14} className="animate-spin-slow" /> Engage Story
                      </button>
                    </div>
                  </div>

                  {/* --- BACK SIDE (Flipped) --- */}
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col bg-[#002B5B] dark:bg-red-950/20 rounded-[2.5rem] border-2 border-red-700/30 p-8 text-white">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-black uppercase italic tracking-tighter">Founder's <br /> <span className="text-red-500">Vision.</span></h3>
                      <button 
                        onClick={() => toggleFlip(index)}
                        className="p-2 rounded-full bg-white/10 hover:bg-red-700 transition-all cursor-pointer"
                      >
                        <Undo2 size={16} />
                      </button>
                    </div>

                    <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                      <p className="text-sm font-bold leading-relaxed italic opacity-90">
                        "{founder.message}"
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                      <div className="flex gap-4">
                        <Linkedin size={18} className="text-gray-400 hover:text-red-500 cursor-pointer transition-all" />
                        <Mail size={18} className="text-gray-400 hover:text-red-500 cursor-pointer transition-all" />
                      </div>
                      <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-gray-400 hover:text-white transition-all group/dossier">
                        Dossier <ExternalLink size={14} className="group-hover/dossier:translate-x-1 group-hover/dossier:-translate-y-1 transition-transform" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Founders;