import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Globe, X, Loader2, PlayCircle } from 'lucide-react';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

const News = () => {
  const [firebaseNews, setFirebaseNews] = useState([]);
  const [apiLiveFeed, setApiLiveFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // 🔥 FIX 1: Modal खुलने पर बैकग्राउंड स्क्रॉल लॉक कर देगा 🔥
  useEffect(() => {
    if (selectedArticle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedArticle]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        let firebaseNewsData = [];
        let combinedApiNews = [];

        // --- 1. ADMIN NEWS ---
        try {
          const q1 = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
          const snap1 = await getDocs(q1);
          const adminData = snap1.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            sourceType: 'admin',
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          }));
          firebaseNewsData = [...adminData];
        } catch (err) { console.error("Admin News Error:", err); }

        // --- 2. ANCHOR NEWS (Approved Only) ---
        try {
          const q2 = query(
            collection(db, 'anchorNews'), 
            where('status', '==', 'approved')
          );
          const snap2 = await getDocs(q2);
          const anchorData = snap2.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            sourceType: 'anchor',
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          })).sort((a, b) => b.createdAt - a.createdAt);

          firebaseNewsData = [...firebaseNewsData, ...anchorData];
        } catch (err) { console.error("Anchor News Error:", err); }

        firebaseNewsData.sort((a, b) => b.createdAt - a.createdAt);

        // --- 3. API NEWS ---
        try {
          const categories = ['general', 'business', 'technology', 'science'];
          const apiRequests = categories.map(cat => 
            fetch(`https://saurav.tech/NewsAPI/top-headlines/category/${cat}/in.json`).then(res => res.json())
          );
          const results = await Promise.all(apiRequests);
          results.forEach(data => {
            if (data?.articles) {
              const formatted = data.articles.map((art, i) => ({
                id: `api-${art.publishedAt}-${i}`,
                title: art.title,
                description: art.description || 'No details available',
                mediaUrl: art.urlToImage || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
                createdAt: new Date(art.publishedAt),
                url: art.url
              }));
              combinedApiNews = [...combinedApiNews, ...formatted];
            }
          });
          combinedApiNews = combinedApiNews
            .filter((v, i, a) => a.findIndex(t => (t.title === v.title)) === i)
            .sort((a, b) => b.createdAt - a.createdAt);
        } catch (err) { console.error(err); }

        setFirebaseNews(firebaseNewsData);
        setApiLiveFeed(combinedApiNews);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  const heroArticle = firebaseNews.find(art => !art.youtubeId && !art.videoUrl) || apiLiveFeed[0];
  const remainingFirebase = firebaseNews.filter(art => art.id !== heroArticle?.id);
  const remainingApi = apiLiveFeed.filter(art => art.id !== heroArticle?.id);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#080808]">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
        <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Initializing Live Feed...</p>
      </div>
    );
  }

  const AutoScrollList = ({ items, type }) => {
    const duplicatedItems = [...items, ...items];
    return (
      <div className="relative h-full overflow-hidden">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: "-50%" }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          whileHover={{ animationPlayState: 'paused' }} 
          className="space-y-5"
        >
          {duplicatedItems.slice(0, 20).map((item, idx) => (
            <div 
              key={`${item.id}-${idx}`} 
              onClick={() => setSelectedArticle(item)} 
              className={`cursor-pointer border-l-2 pl-3 py-0.5 transition-all group ${type === 'internal' ? 'border-green-500/10 hover:border-green-500' : 'border-white/5 hover:border-blue-400'}`}
            >
              <p className={`text-[8px] font-bold mb-1 tracking-tighter ${type === 'internal' ? 'text-gray-400' : 'text-blue-200'}`}>
                {formatDate(item.createdAt)}
              </p>
              <p className={`text-xs font-bold line-clamp-2 leading-snug ${type === 'internal' ? 'dark:text-gray-200 group-hover:text-green-600' : 'text-white group-hover:text-blue-300'}`}>
                {item.title}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f1f2f6] dark:bg-[#080808] pt-24 pb-10">
      
      {/* 🔥 MODAL SECTION (Fixed Scroll Issue) 🔥 */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              className="bg-white dark:bg-[#111] max-w-3xl w-full rounded-2xl overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button Stays Fixed at Top Right */}
              <button onClick={() => setSelectedArticle(null)} className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full z-20 hover:bg-red-700 transition-all shadow-lg backdrop-blur-sm">
                <X size={20} />
              </button>
              
              {/* 🔥 Entire Content (Video + Text) is now Scrollable Together 🔥 */}
              <div 
                className="w-full overflow-y-auto custom-scrollbar flex-1 scroll-smooth"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
              >
                {/* Top Banner Media */}
                {selectedArticle.youtubeId ? (
                  <div className="aspect-video bg-black w-full">
                    <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${selectedArticle.youtubeId}?autoplay=1`} title="Video" frameBorder="0" allowFullScreen></iframe>
                  </div>
                ) : (
                  <img src={selectedArticle.mediaUrl} className="w-full h-[250px] md:h-[350px] object-cover" alt="news" />
                )}
                
                {/* Text Content */}
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl md:text-2xl font-black mb-6 dark:text-white uppercase italic tracking-tight leading-tight">{selectedArticle.title}</h2>
                  
                  {/* If BOTH Video and Image exist, show Image here */}
                  {selectedArticle.youtubeId && selectedArticle.mediaUrl && (
                    <img src={selectedArticle.mediaUrl} className="w-full max-h-[300px] object-cover rounded-xl mb-6 shadow-md border border-gray-100 dark:border-white/5" alt="news context" />
                  )}

                  {/* News Paragraph */}
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedArticle.description}
                  </p>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1800px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebars */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-28">
            <div className="bg-white dark:bg-[#111] p-6 rounded-[2.5rem] shadow-sm flex flex-col h-[380px] overflow-hidden">
              <h2 className="font-black mb-4 text-[10px] uppercase border-b border-gray-100 dark:border-white/5 pb-3 dark:text-white tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Internal Feed
              </h2>
              {firebaseNews.length > 0 && <AutoScrollList items={firebaseNews} type="internal" />}
            </div>
            <div className="bg-[#002B5B] text-white p-6 rounded-[2.5rem] shadow-sm flex flex-col h-[380px] overflow-hidden">
              <h2 className="font-black mb-4 text-[10px] uppercase border-b border-white/10 pb-3 tracking-widest flex items-center gap-2">
                <Globe size={14} className="text-blue-400" /> Global Intel
              </h2>
              {apiLiveFeed.length > 0 && <AutoScrollList items={apiLiveFeed} type="global" />}
            </div>
          </div>

          <div className="lg:col-span-9 space-y-8">
            
            {/* Hero Article with READ MORE */}
            {heroArticle && (
              <div onClick={() => setSelectedArticle(heroArticle)} className="relative h-[350px] md:h-[550px] rounded-[2.5rem] overflow-hidden cursor-pointer group shadow-xl flex-shrink-0">
                <img src={heroArticle.mediaUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="hero" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 p-6 md:p-12 w-full">
                  <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded uppercase tracking-widest mb-4 inline-block">Flash Report</span>
                  <h1 className="text-lg md:text-5xl font-black text-white leading-tight uppercase italic tracking-tighter line-clamp-2">{heroArticle.title}</h1>
                  {heroArticle.description && (
                    <p className="text-white/80 mt-3 line-clamp-2 text-sm md:text-base max-w-3xl">{heroArticle.description}</p>
                  )}
                  <span className="text-[10px] font-black text-red-500 mt-3 inline-block uppercase tracking-widest group-hover:underline">Read Full Story »</span>
                </div>
              </div>
            )}

            {/* Remaining Firebase Cards with READ MORE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {remainingFirebase.map(item => (
                <motion.div key={item.id} onClick={() => setSelectedArticle(item)} whileHover={{ y: -5 }} className="bg-white dark:bg-[#111] rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col cursor-pointer transition-all">
                  <div className="relative h-48 md:h-56 overflow-hidden shrink-0">
                    <img src={item.youtubeId ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg` : item.mediaUrl} className="w-full h-full object-cover" alt="news" />
                    {item.youtubeId && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><PlayCircle size={40} className="text-white" /></div>}
                  </div>
                  <div className="p-7 flex flex-col flex-1">
                    <h3 className="font-bold text-sm md:text-base line-clamp-2 dark:text-white uppercase italic leading-tight tracking-tight">{item.title}</h3>
                    
                    {item.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{item.description}</p>}
                    <span className="text-[10px] font-black text-red-600 mt-2 uppercase tracking-wide group-hover:underline">Read More »</span>
                    
                    <div className="mt-auto pt-4">
                       <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Remaining API Cards with READ MORE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-100 dark:border-white/5">
              {remainingApi.map(item => (
                <motion.div key={item.id} onClick={() => setSelectedArticle(item)} whileHover={{ y: -5 }} className="bg-white dark:bg-[#111] rounded-[2rem] overflow-hidden shadow-sm flex flex-col cursor-pointer h-full transition-all group">
                  <img src={item.mediaUrl} className="h-40 w-full object-cover opacity-90 shrink-0" alt="news" />
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-xs md:text-sm line-clamp-2 dark:text-white mt-2 leading-snug">{item.title}</h3>
                    
                    {item.description && <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{item.description}</p>}
                    <span className="text-[9px] font-black text-red-600 mt-2 uppercase group-hover:underline">Read More »</span>

                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-white/5">
                        <p className="text-[8px] text-gray-400 font-bold uppercase">{formatDate(item.createdAt)}</p>
                        <Globe size={12} className="text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default News;