import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom'; // Navigation ke liye

import { ShieldAlert, Gavel, Scale, FileText, Globe, Landmark, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';



const Hero = () => {

  const navigate = useNavigate(); // Hook initialize kiya
  const { user } = useAuth();

  const [carouselImages, setCarouselImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const q = query(collection(db, 'heroImages'), orderBy('createdAt', 'asc'));
        const snap = await getDocs(q);
        setCarouselImages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error("Error fetching hero images:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (carouselImages.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [carouselImages, isPaused]);



  return (

    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-[#f4f4f4] dark:bg-[#0a0a0a] transition-colors duration-500 py-10">

     

      {/* 1. Official Background */}

      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] pointer-events-none flex items-center justify-center">

        <Landmark size={800} strokeWidth={0.5} className="text-[#002B5B] dark:text-white" />

      </div>



      <div className="max-w-[1600px] w-full mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

       

        {/* --- LEFT CONTENT --- */}

        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 order-2 lg:order-1">

         

          <div className="flex items-center gap-3 bg-[#002B5B] text-white px-5 py-2 rounded-sm shadow-lg">

            <ShieldAlert size={18} />

            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em]">

              Official Agency Protocol

            </span>

          </div>



          <div className="space-y-4">

            <h2 className="text-gray-500 dark:text-gray-400 text-sm md:text-2xl font-black uppercase tracking-[0.4em]">

              Crime Information Bureau

            </h2>

            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[100px] font-[1000] leading-[0.9] text-[#002B5B] dark:text-white uppercase tracking-tighter">

              Unity <span className="text-red-700 italic">Against</span> <br /> Corruption.

            </h1>

          </div>



          <p className="max-w-xl text-sm md:text-lg font-bold text-gray-700 dark:text-gray-300 leading-relaxed uppercase border-l-8 border-red-700 pl-6 bg-white/50 dark:bg-white/5 py-4 shadow-sm">

            CIB stands as the primary non-governmental intelligence provider, committed to legal awareness and organizational unity across 29 states of India.

          </p>



          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">

            {/* CONDITIONAL MAIN BUTTON */}

            {user ? (
              <button
                onClick={() => navigate('/file-report')}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-red-700 hover:bg-[#002B5B] text-white px-10 py-5 rounded-sm font-black uppercase tracking-widest transition-all shadow-[5px_5px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 cursor-pointer"
              >
                File A Report <FileText size={18} />
              </button>
            ) : (
              <button
                onClick={() => navigate('/login?type=member')}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-red-700 hover:bg-[#002B5B] text-white px-10 py-5 rounded-sm font-black uppercase tracking-widest transition-all shadow-[5px_5px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 cursor-pointer"
              >
                Apply for Membership <User size={18} />
              </button>
            )}



            {/* BUREAU RULES BUTTON - Redirecting to /rules */}

            <button

              onClick={() => navigate('/rules')}

              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white dark:bg-transparent border-2 border-[#002B5B] dark:border-white text-[#002B5B] dark:text-white px-10 py-5 rounded-sm font-black uppercase tracking-widest hover:bg-[#002B5B] hover:text-white transition-all cursor-pointer"

            >

              Bureau Rules <Scale size={18} />

            </button>

          </div>

        </div>



        {/* --- RIGHT CONTENT (ORIGINAL ID CARD - COMMENTED FOR EASY RESTORATION) ---
        <div className="relative order-1 lg:order-2 flex justify-center items-center w-full group">
          <div className="absolute -top-10 -right-5 md:-right-10 border-4 border-red-700/30 text-red-700/30 font-black text-3xl md:text-5xl px-6 py-2 rotate-12 rounded-xl pointer-events-none uppercase">
            Top Secret
          </div>
          <div className="relative w-full max-w-[450px] bg-[#e0e0e0] dark:bg-[#1a1a1a] p-1 rounded-lg shadow-2xl overflow-hidden border border-gray-400 dark:border-white/10">
            <div className="bg-white dark:bg-[#111] p-6 md:p-10 flex flex-col gap-8 relative">
              <div className="flex justify-between items-center border-b-2 border-[#002B5B] pb-4">
                <div className="space-y-1">
                  <h4 className="text-[#002B5B] dark:text-red-700 font-black text-xl italic uppercase">CIB_INDIA</h4>
                  <p className="text-[8px] font-mono text-gray-500">REF NO: 29S/CB/2026</p>
                </div>
                <Globe size={30} className="text-gray-300 dark:text-white/10" />
              </div>
              <div className="flex gap-6 items-center">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-200 dark:bg-white/5 border-2 border-dashed border-gray-400 flex items-center justify-center relative overflow-hidden">
                  <Gavel size={50} className="text-gray-400 opacity-30" />
                  <div className="w-full h-1 bg-red-600 shadow-[0_0_10px_red] animate-scan z-20"></div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase">Organization</p>
                    <p className="text-xs md:text-sm font-black text-[#002B5B] dark:text-white">CRIME INFORMATION BUREAU</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase">Mission</p>
                    <p className="text-xs md:text-sm font-black text-red-700 uppercase italic">Anti-Corruption</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-10 bg-[url('https://www.shutterstock.com/image-vector/barcode-vector-illustration-isolated-on-260nw-154693154.jpg')] opacity-20 grayscale invert dark:invert-0"></div>
                <div className="flex justify-between text-[10px] font-mono text-gray-500">
                  <span>ACTIVE_NODES: 28</span>
                  <span>VERIFIED_UNIT</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-10 bg-red-700 text-white px-12 py-2 rotate-[-45deg] shadow-lg">
                <p className="text-[10px] font-black uppercase tracking-widest text-center">Authentic</p>
              </div>
            </div>
          </div>
        </div>
        --- END OF ORIGINAL ID CARD COMMENT --- */}

        {/* --- DYNAMIC CAROUSEL SECTION (FALLS BACK TO ORIGINAL ID CARD IF NO IMAGES) --- */}
        <div className="relative order-1 lg:order-2 flex justify-center items-center w-full">
          {loading ? (
            <div className="w-full max-w-[450px] aspect-[4/3] rounded-3xl flex items-center justify-center bg-gray-200 dark:bg-white/5 border border-dashed border-gray-400 dark:border-white/10">
              <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Loading Protocol...</span>
            </div>
          ) : carouselImages.length > 0 ? (
            <div
              className="relative w-full max-w-[450px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-gray-400 dark:border-white/10 bg-[#e0e0e0] dark:bg-[#1a1a1a] p-1 group"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentSlide}
                    src={carouselImages[currentSlide].imageUrl}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                </AnimatePresence>

                {/* Carousel Controls */}
                {carouselImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-red-700 text-white backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-lg"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-red-700 text-white backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-lg"
                    >
                      <ChevronRight size={18} />
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      {carouselImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                            idx === currentSlide ? 'w-5 bg-red-600' : 'w-2 bg-white/60 hover:bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Fallback: Original ID Card */
            <div className="relative w-full max-w-[450px] bg-[#e0e0e0] dark:bg-[#1a1a1a] p-1 rounded-lg shadow-2xl overflow-hidden border border-gray-400 dark:border-white/10 animate-fade-in">
              <div className="bg-white dark:bg-[#111] p-6 md:p-10 flex flex-col gap-8 relative">
                <div className="flex justify-between items-center border-b-2 border-[#002B5B] pb-4">
                  <div className="space-y-1">
                    <h4 className="text-[#002B5B] dark:text-red-700 font-black text-xl italic uppercase">CIB_INDIA</h4>
                    <p className="text-[8px] font-mono text-gray-500">REF NO: 29S/CB/2026</p>
                  </div>
                  <Globe size={30} className="text-gray-300 dark:text-white/10" />
                </div>

                <div className="flex gap-6 items-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-200 dark:bg-white/5 border-2 border-dashed border-gray-400 flex items-center justify-center relative overflow-hidden">
                    <Gavel size={50} className="text-gray-400 opacity-30" />
                    <div className="w-full h-1 bg-red-600 shadow-[0_0_10px_red] animate-scan z-20"></div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase">Organization</p>
                      <p className="text-xs md:text-sm font-black text-[#002B5B] dark:text-white">CRIME INFORMATION BUREAU</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase">Mission</p>
                      <p className="text-xs md:text-sm font-black text-red-700 uppercase italic">Anti-Corruption</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-10 bg-[url('https://www.shutterstock.com/image-vector/barcode-vector-illustration-isolated-on-260nw-154693154.jpg')] opacity-20 grayscale invert dark:invert-0"></div>
                  <div className="flex justify-between text-[10px] font-mono text-gray-500">
                    <span>ACTIVE_NODES: 28</span>
                    <span>VERIFIED_UNIT</span>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-10 bg-red-700 text-white px-12 py-2 rotate-[-45deg] shadow-lg">
                  <p className="text-[10px] font-black uppercase tracking-widest text-center">Authentic</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </section>

  );

};



export default Hero;