import React, { useState } from 'react';
import { Flag, Star, Award, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const NationalMessage = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="relative py-12 md:py-24 bg-white dark:bg-[#0f0f0f] overflow-hidden transition-colors duration-500">
      {/* Background Flag Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <Flag size={600} strokeWidth={0.5} />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 relative z-10">
        <div className="bg-[#f8f9fa] dark:bg-[#151515] rounded-[2.5rem] md:rounded-[3.5rem] border-2 border-gray-100 dark:border-white/5 p-6 md:p-16 shadow-2xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">
            
            {/* Left: Section Title */}
            <div className="lg:col-span-4 space-y-4 md:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/20 text-orange-700 px-4 py-2 rounded-full shadow-sm">
                <Star size={16} className="animate-pulse" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">National Service</span>
              </div>
              
              <h2 className="text-4xl md:text-7xl font-[1000] text-[#002B5B] dark:text-white uppercase italic tracking-tighter leading-none">
                National <br />
                <span className="text-red-700 not-italic">Message.</span>
              </h2>
              
              <div className="flex justify-center lg:justify-start gap-2">
                <div className="w-12 h-2 bg-orange-500 rounded-full"></div>
                <div className="w-12 h-2 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div className="w-12 h-2 bg-green-600 rounded-full"></div>
              </div>
            </div>

            {/* Right: Detailed Message Content */}
            <div className="lg:col-span-8 space-y-8">
              <div className="relative">
                <div className="space-y-6 border-l-4 border-red-700 pl-6 md:pl-10">
                  <h3 className="text-xl md:text-3xl font-black text-[#002B5B] dark:text-white uppercase italic tracking-tight">
                    A warm welcome to all patriots in the service of the Nation.
                  </h3>
                  
                  <p className="text-sm md:text-lg font-bold text-gray-600 dark:text-gray-400 leading-relaxed italic">
                    "Crime Information Bureau considers the common public as its voice and strength. Organizational unity is the true power of the nation to eliminate crime and corruption. Let us come together and contribute to the building of a strong, secure, and crime-free India."
                  </p>

                  <div className={`transition-all duration-700 overflow-hidden ${isExpanded ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pt-6 space-y-8 border-t border-gray-200 dark:border-white/10 mt-6">
                      
                      <p className="text-sm md:text-base font-bold text-gray-700 dark:text-gray-300">
                        Thousands of patriots are serving by joining the organization. You can also become a part of it if you possess the following qualifications:
                      </p>

                      {/* Criteria Grid with Enhanced Shadows */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {[
                          "A dedicated mindset towards the Nation and Constitution.",
                          "Must be a citizen of India.",
                          "Aadhar, Voter ID, Passport, or PAN Card.",
                          "Electricity bill, Ration card, or Bank Passbook.",
                          "₹10 Notary Affidavit (Shapat Patra).",
                          "Minimum educational qualification of 10+2."
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-2xl">
                            <CheckCircle className="text-green-600 shrink-0 mt-1" size={18} />
                            <span className="text-[11px] md:text-xs font-black uppercase tracking-tight text-gray-600 dark:text-gray-400">{item}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-red-700 text-white p-6 rounded-2xl text-center shadow-2xl">
                        <h4 className="text-lg md:text-xl font-black uppercase italic tracking-widest">
                          "Strength in Unity – Our pledge towards a Crime-Free India"
                        </h4>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 mt-4 text-xs md:text-sm font-black uppercase text-red-700 hover:text-black dark:hover:text-white transition-all underline underline-offset-8 decoration-2 cursor-pointer"
                  >
                    {isExpanded ? (
                      <>Hide Mandatory Information <ChevronUp size={16} /></>
                    ) : (
                      <>Read Full National Message <ChevronDown size={16} /></>
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default NationalMessage;