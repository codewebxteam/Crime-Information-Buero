import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Eye, Share2, Loader2, Tag, TrendingUp, ChevronRight } from 'lucide-react';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

const CRIME_SACH_LOGO = 'https://res.cloudinary.com/daj1kyrzf/image/upload/v1787938859/general/mwt0x23ao8feo7nuv8kt.jpg';
const CATEGORIES = ['All', 'Intelligence', 'Cyber Crime', 'Events', 'Social'];

const News = () => {
  const navigate = useNavigate();
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        let combinedNews = [];

        // Admin news
        try {
          const q1 = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
          const snap1 = await getDocs(q1);
          const adminData = snap1.docs.map(d => ({
            id: d.id,
            ...d.data(),
            sourceCollection: 'news',
            createdAt: d.data().createdAt?.toDate?.() || new Date(),
          }));
          combinedNews.push(...adminData);
        } catch (err) { console.error('Admin News Error:', err); }

        // Anchor news (approved only)
        try {
          const q2 = query(collection(db, 'anchorNews'), where('status', '==', 'approved'));
          const snap2 = await getDocs(q2);
          const anchorData = snap2.docs.map(d => ({
            id: d.id,
            ...d.data(),
            sourceCollection: 'anchorNews',
            createdAt: d.data().createdAt?.toDate?.() || new Date(),
          }));
          combinedNews.push(...anchorData);
        } catch (err) { console.error('Anchor News Error:', err); }

        combinedNews.sort((a, b) => b.createdAt - a.createdAt);
        setAllNews(combinedNews);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });

  const handleWhatsAppShare = (e, item) => {
    e.stopPropagation();
    const url = `${window.location.origin}/news/${item.id}`;
    const text = `📰 *${item.title}*\n\n🔗 Read Full News:\n${url}\n\n— Crime Sach News`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getThumb = (item) => {
    if (item.images && Array.isArray(item.images) && item.images[0]) return item.images[0];
    if (Array.isArray(item.mediaUrl) && item.mediaUrl[0]) return item.mediaUrl[0];
    if (item.mediaUrl && typeof item.mediaUrl === 'string') return item.mediaUrl;
    if (item.youtubeId) return `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;
    if (item.youtubeLinks && item.youtubeLinks[0]) return `https://img.youtube.com/vi/${item.youtubeLinks[0]}/hqdefault.jpg`;
    return CRIME_SACH_LOGO;
  };

  const filteredNews = activeCategory === 'All'
    ? allNews
    : allNews.filter(n => (n.category || '').toLowerCase() === activeCategory.toLowerCase());

  const heroArticle = filteredNews[0];
  const remainingNews = filteredNews.slice(1);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Loading Crime Sach News...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a] pt-20">

      {/* ═══ CRIME SACH NEWS HEADER BANNER ═══ */}
      <div className="relative bg-gradient-to-r from-red-700 via-red-800 to-[#002B5B] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={CRIME_SACH_LOGO} className="w-full h-full object-cover blur-sm" alt="" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-14 flex flex-col md:flex-row items-center gap-6">
          <img src={CRIME_SACH_LOGO} className="w-20 h-20 md:w-28 md:h-28 rounded-2xl object-contain bg-white p-1 border-4 border-white/30 shadow-2xl" alt="Crime Sach News" />
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-[1000] text-white uppercase italic tracking-tight leading-none">
              Crime Sach News
            </h1>
            <p className="text-white/70 text-sm md:text-base font-bold mt-2 uppercase tracking-widest">
              आपका शहर — आपकी ख़बर
            </p>
            <div className="flex items-center gap-2 mt-3 justify-center md:justify-start">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Live News Feed • {allNews.length} Stories</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CATEGORY FILTER TABS ═══ */}
      <div className="sticky top-[64px] z-30 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto py-3 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-red-700 text-white shadow-lg shadow-red-700/20'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {filteredNews.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No news found in this category</p>
          </div>
        ) : (
          <>
            {/* ═══ HERO / FEATURED ARTICLE ═══ */}
            {heroArticle && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/news/${heroArticle.id}`)}
                className="relative rounded-3xl overflow-hidden cursor-pointer group mb-10 shadow-2xl">
                <div className="aspect-[21/9] md:aspect-[21/8]">
                  <img src={getThumb(heroArticle)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <div className="absolute bottom-0 p-6 md:p-10 w-full">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {heroArticle.category && (
                      <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded uppercase tracking-widest">{heroArticle.category}</span>
                    )}
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Calendar size={10} /> {formatDate(heroArticle.createdAt)}
                    </span>
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Eye size={10} /> {heroArticle.views || 0} views
                    </span>
                  </div>
                  <h2 className="text-xl md:text-4xl font-[1000] text-white leading-tight uppercase italic tracking-tight line-clamp-2">
                    {heroArticle.title}
                  </h2>
                  {heroArticle.description && (
                    <p className="text-white/70 mt-3 line-clamp-2 text-sm md:text-base max-w-3xl">{heroArticle.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-red-400 text-[10px] font-black uppercase tracking-widest group-hover:underline flex items-center gap-1">
                      Read Full Story <ChevronRight size={12} />
                    </span>
                    <button onClick={(e) => handleWhatsAppShare(e, heroArticle)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer">
                      <Share2 size={10} /> WhatsApp
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══ TRENDING SECTION HEADER ═══ */}
            {remainingNews.length > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={18} className="text-red-600" />
                <h3 className="text-lg font-black text-[#002B5B] dark:text-white uppercase tracking-tight italic">Latest News</h3>
                <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
              </div>
            )}

            {/* ═══ NEWS CARDS GRID ═══ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {remainingNews.map((item, idx) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/news/${item.id}`)}
                  className="bg-white dark:bg-[#111] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col border border-gray-100 dark:border-white/5 hover:border-red-700/20">

                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden shrink-0">
                    <img src={getThumb(item)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                    {item.category && (
                      <span className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                        {item.category}
                      </span>
                    )}
                    {/* WhatsApp share on card */}
                    <button onClick={(e) => handleWhatsAppShare(e, item)}
                      className="absolute top-3 right-3 p-2 bg-[#25D366] text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 cursor-pointer shadow-lg">
                      <Share2 size={12} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-black text-sm text-[#002B5B] dark:text-white uppercase italic leading-snug tracking-tight line-clamp-2 group-hover:text-red-700 transition-colors">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Calendar size={9} /> {formatDate(item.createdAt)}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold flex items-center gap-1">
                          <Eye size={9} /> {item.views || 0}
                        </span>
                      </div>
                      <span className="text-[9px] font-black text-red-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        Read <ChevronRight size={10} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ═══ CRIME SACH NEWS FOOTER ═══ */}
      <div className="bg-[#002B5B] text-white py-8 mt-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={CRIME_SACH_LOGO} className="w-10 h-10 rounded-full object-cover border-2 border-white/20" alt="" />
            <div>
              <p className="font-black uppercase tracking-wider text-sm">Crime Sach News</p>
              <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">आपका शहर — आपकी ख़बर</p>
            </div>
          </div>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">© 2026 Crime Sach News. All Rights Reserved.</p>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default News;