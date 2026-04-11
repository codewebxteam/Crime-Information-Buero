import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Calendar, 
  MapPin, Image as ImageIcon, X, Maximize2, Layers, Loader2
} from 'lucide-react';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const Gallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setGalleryItems(data);
        }
      } catch (e) {
        console.error('Gallery fetch error:', e);
      } finally {
        // Data fetch ho gaya (chahe empty ho ya nahi), ab loading false karenge
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // 🔥 FIX: Ab hum display items tabhi nikalenge jab loading khatam ho chuki ho
  const carouselSlides = !loading 
    ? galleryItems.filter(item => !item.images || item.images.length <= 1).slice(0, 3)
    : [];

  useEffect(() => {
    if (carouselSlides.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev === carouselSlides.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [carouselSlides.length, currentIndex]);

  const openModal = (item) => {
    setSelectedItem(item);
    setActivePhotoIndex(0);
  };

  // Jab tak data load ho raha hai, ek clean loader dikhayenge
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#080808] pb-20 font-sans relative text-slate-900 dark:text-white">
      
      {/* 🔴 MODAL SECTION */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-6xl w-full bg-white dark:bg-[#111] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto max-h-[90vh]"
            >
              <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-red-700 text-white rounded-full transition-all">
                <X size={24} />
              </button>

              <div className="w-full md:w-[60%] bg-black flex items-center justify-center overflow-hidden relative group">
                <img 
                  src={selectedItem.images ? selectedItem.images[activePhotoIndex] : (selectedItem.image || selectedItem.imageUrl)} 
                  alt={selectedItem.title} 
                  className="w-full h-full object-contain" 
                />
                
                {selectedItem.images?.length > 1 && (
                  <>
                    <button 
                      onClick={() => setActivePhotoIndex(prev => (prev === 0 ? selectedItem.images.length - 1 : prev - 1))}
                      className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={() => setActivePhotoIndex(prev => (prev === selectedItem.images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              <div className="w-full md:w-[40%] p-8 md:p-12 flex flex-col justify-center">
                <div className="bg-red-700 w-16 h-1.5 mb-8"></div>
                <h2 className="text-2xl md:text-4xl font-[1000] text-[#002B5B] dark:text-white uppercase italic tracking-tighter leading-tight mb-6">
                  {selectedItem.title}
                </h2>
                <div className="space-y-4 mb-8">
                  <p className="flex items-center gap-2 text-red-600 font-black text-xs uppercase tracking-[0.2em]"><MapPin size={16} /> {selectedItem.location || "Confidential"}</p>
                  <p className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-[0.2em]"><Calendar size={16} /> {selectedItem.date || "Archive Logged"}</p>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-bold text-sm italic border-l-4 border-gray-200 dark:border-white/10 pl-6 leading-relaxed">
                  {selectedItem.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP CAROUSEL (CLEAN) */}
      <section className="relative h-[65vh] md:h-[85vh] w-full overflow-hidden bg-black">
        {carouselSlides.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} 
              className="relative h-full w-full cursor-pointer"
              onClick={() => openModal(carouselSlides[currentIndex])}
            >
              <img 
                src={carouselSlides[currentIndex].image || carouselSlides[currentIndex].imageUrl} 
                className="w-full h-full object-cover opacity-80" alt="Carousel" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>
        )}
        
        {/* Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-10">
           {carouselSlides.map((_, idx) => (
             <div 
               key={idx} 
               className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-10 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]' : 'w-2 bg-white/40'}`} 
             />
           ))}
        </div>
      </section>

      {/* 2. GRID GALLERY SECTION */}
      <section className="max-w-[1600px] mx-auto px-6 mt-16">
        <div className="border-b border-gray-200 dark:border-white/5 pb-10 mb-16 text-center md:text-left">
            <h2 className="text-red-700 font-black uppercase tracking-[0.4em] text-[10px] mb-3">Intelligence Archive</h2>
            <h3 className="text-4xl md:text-7xl font-[1000] text-[#002B5B] dark:text-white uppercase italic tracking-tighter leading-none"> BUREAU <span className="text-red-700 not-italic">GALLERY.</span></h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleryItems.map((item) => (
            <motion.div 
              key={item.id} onClick={() => openModal(item)}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} whileHover={{ y: -8 }}
              className="relative group rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl bg-white dark:bg-[#111] cursor-pointer h-[350px] w-full"
            >
              <img 
                src={item.images ? item.images[0] : (item.image || item.imageUrl)} 
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" alt={item.title} 
              />
              
              {item.images?.length > 1 && (
                <div className="absolute top-4 left-4 bg-red-700 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg z-10">
                  <Layers size={12} /> {item.images.length} PHOTOS
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
                 <p className="text-white font-black uppercase italic tracking-tighter text-xl leading-tight truncate">{item.title}</p>
                 <div className="flex justify-between items-center mt-2">
                    <span className="text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><MapPin size={10} /> {item.location || "Archive"}</span>
                    <Maximize2 size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Gallery;