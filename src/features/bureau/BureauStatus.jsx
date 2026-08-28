import React, { useState, useEffect, useRef } from 'react';
import { Activity, Users, ShieldCheck } from 'lucide-react';
import { db } from '../../firebase/firebase'; 
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore'; 

const BureauStatus = () => {
  const [visitorCount, setVisitorCount] = useState('090000');
  
  // 🔥 StrictMode Double-Render Fix: Ye track karega ki count badh chuka hai ya nahi
  const hasIncremented = useRef(false);

  useEffect(() => {
    const counterRef = doc(db, 'analytics', 'visitors');

    const updateCounter = async () => {
      // Agar ek baar count badh chuka hai is render me, to wapas return kar jao
      if (hasIncremented.current) return;
      hasIncremented.current = true; // Lock kar diya

      try {
        const docSnap = await getDoc(counterRef);
        
        if (!docSnap.exists()) {
          await setDoc(counterRef, { count: 90000 });
        }
        
        // 🔥 Ab ye sirf 1 hi baar chalega
        await updateDoc(counterRef, {
          count: increment(1)
        });
      } catch (error) {
        console.error("Error updating visitor counter:", error);
      }
    };

    updateCounter();

    const unsubscribe = onSnapshot(counterRef, (docSnap) => {
      if (docSnap.exists()) {
        const currentCount = docSnap.data().count;
        setVisitorCount(currentCount.toString().padStart(6, '0'));
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-white/5 py-8 px-6">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        
        {/* --- Left Side: Live Visitor Counter --- */}
        <div className="flex items-center gap-5 group shrink-0 md:flex-1">
          <div className="relative">
            <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 group-hover:border-green-500/50 transition-colors">
              <Users size={20} className="text-[#002B5B] dark:text-gray-400 group-hover:text-green-500 transition-colors" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1.5">
              Portal Traffic Monitor
            </span>
            <div className="flex gap-1.5">
              {visitorCount.split("").map((num, i) => (
                <div key={i} className="relative overflow-hidden group/num">
                  <span className="flex items-center justify-center w-7 h-9 bg-[#002B5B] dark:bg-red-700 text-white text-lg font-mono font-black rounded-md shadow-lg transform transition-transform group-hover/num:-translate-y-1">
                    {num}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-md"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Center: Developer Credits --- */}
        <div className="flex flex-col items-center md:flex-1"> 
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-2">
            System Architect
          </span>
          <a 
            href="https://codewebx.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-gray-50 dark:bg-white/5 pl-4 pr-2 py-2 rounded-xl border border-gray-100 dark:border-white/10 hover:border-red-700/50 transition-all shadow-sm hover:shadow-md"
          >
            <span className="text-sm font-black uppercase tracking-tighter text-gray-800 dark:text-white">
              Designed by - <span className="text-red-700 italic">codewebx.in</span>
            </span>
            <div className="p-2 bg-[#002B5B] dark:bg-red-700 text-white rounded-lg group-hover:rotate-[360deg] transition-all duration-700">
              <Activity size={16} />
            </div>
          </a>
        </div>

        {/* --- Right Side: Security Badge --- */}
        <div className="hidden md:flex items-center justify-end gap-2 opacity-30 hover:opacity-100 transition-opacity md:flex-1">
          <ShieldCheck size={16} />
          <span className="text-[9px] font-bold uppercase tracking-widest text-right">
            Encrypted Bureau Network <br/> Secure Transmission
          </span>
        </div>

      </div>
    </div>
  );
};

export default BureauStatus;