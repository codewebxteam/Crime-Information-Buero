import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { db } from '../../firebase/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

// 1. LOCAL IMAGES IMPORT
import LocalImg1 from '../../assets/i1.jpeg'; 
import LocalImg2 from '../../assets/i2.jpeg';
import LocalImg3 from '../../assets/i3.jpeg';

const localImages = [LocalImg1, LocalImg2, LocalImg3];

const FALLBACK_SLIDES = [
  {
    id: 'local-1',
    location: "National Integration Event",
    date: "August 2025",
    image: LocalImg1, 
    description: "Desh ke veeron ka samman aur rashtriya ekta ki shapath—Crime Information Bureau dwara Swatantrata Diwas ka garvmay samaroh."
  },
  {
    id: 'local-2',
    location: "Social Achievement Awards",
    date: "July 2024",
    image: LocalImg2, 
    description: "Samajik kalyan aur aparadh mukti ke kshetra mein utkrisht karya karne wale karmayogiyo ko sammanit karne ka ek vishesh pal."
  },
  {
    id: 'local-3',
    location: "State Intelligence Conclave",
    date: "May 2025",
    image: LocalImg3, 
    description: "Manavadhikar aur suraksha ke naye ayam—Varishth adhikariyon ki upasthiti mein sashakt aur surakshit Bharat ki ore ek kadam."
  }
];

const Gallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slides, setSlides] = useState(FALLBACK_SLIDES);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const q = query(
          collection(db, 'gallery'), 
          where('showOnHome', '==', true), 
          orderBy('position', 'asc')
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const firebaseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setSlides([...firebaseData, ...FALLBACK_SLIDES]);
        }
      } catch (e) {
        setSlides(FALLBACK_SLIDES);
      }
    };
    fetchGallery();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return; 
    const timer = setInterval(() => handleNext(), 6000);
    return () => clearInterval(timer);
  }, [currentIndex, slides.length]);

  const handleNext = () => setCurrentIndex(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  const handlePrev = () => setCurrentIndex(prev => (prev === 0 ? slides.length - 1 : prev - 1));

  const currentSlide = slides[currentIndex];
  if (!currentSlide) return null;

  const currentImage = (currentSlide.image && typeof currentSlide.image === 'string' && currentSlide.image.startsWith('http')) 
    ? currentSlide.image 
    : localImages[currentIndex % 3];

  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] bg-[#050505] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/20 z-20" />
      <div className="absolute inset-0 bg-black/30 z-10" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="relative w-full h-full"
        >
          <img
            key={`img-${currentIndex}`}
            src={currentImage}
            className="w-full h-full object-cover opacity-80"
            alt="Gallery"
          />
          
          <div className="absolute inset-0 z-30 flex flex-col justify-end p-6 md:p-20">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold uppercase tracking-widest">
                  <Calendar size={12} className="text-red-600" /> {currentSlide.date}
                </div>
              </div>

              <p className="text-gray-200 text-xs md:text-lg max-w-xl mb-6 border-l-2 border-red-700 pl-4 italic leading-relaxed font-medium">
                {currentSlide.description}
              </p>

              {currentSlide.location && (
                <div className="flex items-center gap-2 text-white/50 text-[9px] md:text-xs font-bold uppercase tracking-[0.2em]">
                  <MapPin size={14} className="text-red-600" /> {currentSlide.location}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 right-6 md:right-20 z-40 flex gap-3">
        <button onClick={handlePrev} className="p-3 md:p-4 bg-white/5 hover:bg-red-700 backdrop-blur-md border border-white/10 text-white transition-all rounded-full active:scale-90">
          <ChevronLeft size={20} />
        </button>
        <button onClick={handleNext} className="p-3 md:p-4 bg-white/5 hover:bg-red-700 backdrop-blur-md border border-white/10 text-white transition-all rounded-full active:scale-90">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Line Progress Bar Hata Diya Gaya Hai yahan se */}
    </section>
  );
};

export default Gallery;