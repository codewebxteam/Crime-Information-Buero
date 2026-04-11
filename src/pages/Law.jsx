import React from 'react';
import { 
  FileText, Gavel, ShieldAlert, BookOpen, ExternalLink, 
  Scale, ShieldCheck, Users, Lock, Landmark, Dog, AlertOctagon 
} from 'lucide-react';

const Law = () => {
  const laws = [
    { 
      id: "IPC", 
      title: "Indian Penal Code", 
      desc: "India's primary criminal penal code.", 
      icon: <Gavel size={22} />,
      pdfUrl: "https://crimeindia.in/pdf/indian-penal-code.pdf" 
    },
    { 
      id: "CrPC", 
      title: "Criminal Procedure Code", 
      desc: "Investigation, arrest, bail and trial procedures.", 
      icon: <FileText size={22} />,
      pdfUrl: "https://crimeindia.in/pdf/criminal-procedure-code.pdf"
    },
    { 
      id: "AC", 
      title: "Anti Corruption Act", 
      desc: "Anti-corruption laws and prevention measures.", 
      icon: <ShieldAlert size={22} />,
      pdfUrl: "https://crimeindia.in/pdf/anti-corruption-act.pdf"
    },
    { 
      id: "Cyber", 
      title: "Cyber Crime Act", 
      desc: "Online crime and data protection laws (IT Act).", 
      icon: <Lock size={22} />,
      pdfUrl: "https://crimeindia.in/pdf/cyber-law.pdf"
    },
    { 
      id: "Dowry", 
      title: "Anti Dowry Act", 
      desc: "Law to prevent dowry harassment.", 
      icon: <Scale size={22} />,
      pdfUrl: "https://crimeindia.in/pdf/anti-dowry.pdf"
    },
    { 
      id: "W-CL", 
      title: "Women Crime Law", 
      desc: "Protection against crimes against women.", 
      icon: <ShieldCheck size={22} />,
      pdfUrl: "https://crimeindia.in/pdf/women-law.pdf"
    },
    { 
      id: "Child", 
      title: "Child Crime Law", 
      desc: "Child protection and anti-exploitation laws (POCSO).", 
      icon: <Users size={22} />,
      pdfUrl: "https://crimeindia.in/pdf/child-law.pdf"
    },
    { 
      id: "MLA", 
      title: "Money Laundering Act", 
      desc: "Anti-money laundering and black money laws.", 
      icon: <Landmark size={22} />,
      pdfUrl: "https://crimeindia.in/pdf/money-laundering-act.pdf"
    },
    { 
      id: "Animal", 
      title: "Animal Crime Law", 
      desc: "Wildlife and animal protection laws.", 
      icon: <Dog size={22} />,
      pdfUrl: "https://crimeindia.in/pdf/animals-law.pdf"
    },
    { 
      id: "UCC", 
      title: "Uniform Civil Code", 
      desc: "Unified laws for civil matters (Draft/Info).", 
      icon: <BookOpen size={22} />,
      pdfUrl: "https://crimeindia.in/pdf/criminal-procedure-code.pdf"
    },
    { 
      id: "W-V", 
      title: "Women Violence Law", 
      desc: "Provisions to prevent violence against women.", 
      icon: <AlertOctagon size={22} />,
      pdfUrl: "https://wcd.delhi.gov.in/scert/protection-women-domestic-violence-act-2005"
    }
  ];

  // ✅ Function to handle PDF Opening
  const openPdf = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      alert("PDF link is currently being updated in the Bureau Archive.");
    }
  };

  return (
    <section className="py-20 bg-[#f4f4f4] dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Optimized Header Section */}
        <div className="mb-16 text-center lg:text-left flex flex-col lg:flex-row justify-between items-end gap-6 border-b-4 border-red-700 pb-8">
          <div className="space-y-2">
            <h4 className="text-red-700 font-black uppercase tracking-[0.3em] text-sm italic">
              Legal Resource Center
            </h4>
            <h2 className="text-4xl md:text-7xl font-[1000] text-[#002B5B] dark:text-white uppercase tracking-tighter leading-none">
              Indian <span className="text-red-700 italic">Laws</span>
            </h2>
          </div>
          <div className="bg-white dark:bg-white/5 p-4 rounded-lg border border-gray-200 dark:border-white/10 hidden md:block shadow-sm">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Bureau Digital Library v1.1
            </p>
          </div>
        </div>

        {/* Laws Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {laws.map((law, index) => (
            <div 
              key={index} 
              className="group relative bg-white dark:bg-[#111] p-6 rounded-sm border-l-8 border-red-700 shadow-sm hover:shadow-2xl transition-all duration-300 flex items-start gap-6 overflow-hidden"
            >
              <span className="absolute -right-4 -bottom-4 text-7xl font-black text-gray-100 dark:text-white/5 pointer-events-none group-hover:scale-110 group-hover:text-red-700/10 transition-all duration-500 italic">
                {law.id}
              </span>

              <div className="p-4 bg-[#002B5B] dark:bg-red-700 text-white rounded-lg shadow-lg group-hover:rotate-12 transition-transform duration-300 shrink-0">
                {law.icon}
              </div>

              <div className="flex-1 space-y-3 z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-[#002B5B] dark:text-white uppercase tracking-tighter leading-tight">
                      {law.title}
                    </h3>
                  </div>
                  <span className="bg-gray-100 dark:bg-white/10 px-2 py-1 text-[10px] font-black rounded-md text-gray-500">
                    {law.id}
                  </span>
                </div>
                
                <p className="text-sm font-bold text-gray-600 dark:text-gray-400 leading-relaxed max-w-[90%] italic">
                  {law.desc}
                </p>

                <div className="pt-2">
                  {/* ✅ Link Action Added Here */}
                  <button 
                    onClick={() => openPdf(law.pdfUrl)}
                    className="flex items-center gap-2 bg-[#002B5B] dark:bg-transparent dark:border-2 dark:border-white text-white dark:text-white px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-700 dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer"
                  >
                    View Case PDF <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-700 uppercase tracking-[0.5em]">
            Official CIB Legal Repository • Authorized Access Only
          </p>
        </div>
      </div>
    </section>
  );
};

export default Law;