import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true }
};

const CIBOfficer = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      // Backend (Firebase) se data fetch karne ki query
      const q = query(collection(db, "officers"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setOfficers([]); // Agar backend mein koi officer nahi hai to array empty rahegi
      } else {
        const officerData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOfficers(officerData);
      }
    } catch (err) {
      console.error("Error fetching officers:", err);
      setError(err.message);
      setOfficers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-[#f8f9fa] dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden relative">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-red-700" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#f8f9fa] dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden relative">
       
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-700/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#002B5B]/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* Header */}
        <motion.div className="text-center mb-16" {...fadeUp}>
          <div className="inline-flex items-center gap-2 bg-[#002B5B] dark:bg-red-700 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4">
             Our Team
          </div>
          <h2 className="text-5xl md:text-7xl font-[1000] text-[#002B5B] dark:text-white uppercase tracking-tighter leading-none">
            CIB <span className="text-red-700">Officers</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mt-4">
            Dedicated Team Across 28 States
          </p>
        </motion.div>

        {/* Officers Grid - Only Backend Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {officers.map((officer, idx) => (
            <motion.div 
              key={officer.id || idx}
              className="bg-white dark:bg-[#111] rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group text-center border border-gray-100 dark:border-white/5"
              {...fadeUp}
              transition={{ delay: idx * 0.05 }}
            >
              {/* Circular Image */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-[#002B5B] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {officer.image ? (
                  <img 
                    src={officer.image} 
                    alt={officer.name}
                    className="w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-800 shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-3xl border-4 border-white dark:border-gray-800">
                    {officer.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xl font-black text-[#002B5B] dark:text-white uppercase tracking-tight mb-1">{officer.name}</h3>
                <p className="text-red-600 text-xs font-bold uppercase tracking-widest mb-3">{officer.position}</p>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="px-3 py-1 bg-[#f8f9fa] dark:bg-white/5 rounded-full">
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{officer.department}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 italic line-clamp-3">
                  "{officer.message}"
                </p>
                
                {officer.phone && (
                  <a 
                    href={`tel:${officer.phone}`}
                    className="inline-flex items-center gap-2 text-[#002B5B] dark:text-red-500 text-xs font-black uppercase tracking-wider hover:text-red-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    {officer.phone}
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
            United We Stand • CIB India
          </p>
        </div>

      </div>
    </section>
  );
};

export default CIBOfficer;