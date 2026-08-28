import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Eye, ArrowLeft, Share2, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { db } from '../firebase/firebase';
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const CRIME_SACH_LOGO = 'https://res.cloudinary.com/daj1kyrzf/image/upload/v1787938859/general/mwt0x23ao8feo7nuv8kt.jpg';

const NewsArticle = () => {
  const { newsId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Aggressive scroll reset to fight Lenis smooth scroll
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // After Lenis initializes
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
    
    // Delayed fallback
    const t1 = setTimeout(() => { window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }, 50);
    const t2 = setTimeout(() => { window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }, 150);
    const t3 = setTimeout(() => { window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }, 300);
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [newsId]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // Try admin news first
        let docRef = doc(db, 'news', newsId);
        let snap = await getDoc(docRef);

        if (!snap.exists()) {
          // Try anchor news
          docRef = doc(db, 'anchorNews', newsId);
          snap = await getDoc(docRef);
        }

        if (snap.exists()) {
          const data = snap.data();
          setArticle({
            id: snap.id,
            ...data,
            collectionName: snap.ref.parent.id,
            createdAt: data.createdAt?.toDate?.() || new Date(),
          });

          // Increment view count
          try {
            await updateDoc(snap.ref, { views: increment(1) });
          } catch (e) { console.error('View increment error:', e); }
        }
      } catch (e) {
        console.error('Error fetching article:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [newsId]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = `📰 *${article.title}*\n\n${article.description?.substring(0, 150)}...\n\n🔗 Read Full News:\n${url}\n\n— Crime Sach News`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Collect all images
  const getAllImages = () => {
    if (!article) return [];
    const imgs = [];
    if (article.images && Array.isArray(article.images)) {
      imgs.push(...article.images.filter(Boolean));
    } else if (article.mediaUrl) {
      if (Array.isArray(article.mediaUrl)) {
        imgs.push(...article.mediaUrl.filter(Boolean));
      } else if (article.mediaUrl) {
        imgs.push(article.mediaUrl);
      }
    }
    return imgs;
  };

  // Collect all YouTube IDs
  const getAllYoutubeIds = () => {
    if (!article) return [];
    const ids = [];
    if (article.youtubeLinks && Array.isArray(article.youtubeLinks)) {
      ids.push(...article.youtubeLinks.filter(Boolean));
    } else if (article.youtubeId) {
      ids.push(article.youtubeId);
    }
    return ids;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Loading Article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm mb-4">Article Not Found</p>
        <button onClick={() => navigate('/news')} className="px-6 py-3 bg-red-700 text-white rounded-xl font-black uppercase text-xs">Back to News</button>
      </div>
    );
  }

  const images = getAllImages();
  const youtubeIds = getAllYoutubeIds();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-20">

      {/* Crime Sach News Top Bar */}
      <div className="bg-red-700 text-white py-3">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={CRIME_SACH_LOGO} className="w-8 h-8 rounded-full object-cover border-2 border-white/30" alt="logo" />
            <span className="font-black text-sm uppercase tracking-wider">Crime Sach News</span>
          </div>
          <button onClick={() => navigate('/news')} className="flex items-center gap-2 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider transition-all">
            <ArrowLeft size={14} /> All News
          </button>
        </div>
      </div>

      <article className="max-w-5xl mx-auto px-4 py-8 md:py-12">

        {/* Category & Meta */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            {article.category && (
              <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded uppercase tracking-widest flex items-center gap-1">
                <Tag size={10} /> {article.category}
              </span>
            )}
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar size={10} /> {formatDate(article.createdAt)}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Eye size={10} /> {(article.views || 0) + 1} Views
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-[1000] text-[#002B5B] dark:text-white leading-tight uppercase italic tracking-tight">
            {article.title}
          </h1>

          {/* Author & Share */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#002B5B] flex items-center justify-center text-white font-black text-sm">
                {(article.authorName || article.postedByName || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-black text-[#002B5B] dark:text-white">{article.authorName || article.postedByName || 'Crime Sach News'}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Reporter</p>
              </div>
            </div>

            <button onClick={handleWhatsAppShare}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-green-500/20 active:scale-95 cursor-pointer">
              <Share2 size={14} /> Share on WhatsApp
            </button>
          </div>
        </motion.div>

        {/* Images Gallery */}
        {images.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mb-10 relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-[16/9]">
            <img src={images[currentImageIndex]} className="w-full h-full object-contain" alt={article.title} />

            {images.length > 1 && (
              <>
                <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-red-700 text-white backdrop-blur-md transition-all cursor-pointer">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-red-700 text-white backdrop-blur-md transition-all cursor-pointer">
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  {images.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentImageIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === currentImageIndex ? 'w-5 bg-red-600' : 'w-2 bg-white/60 hover:bg-white'}`} />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Image Thumbnails Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button key={idx} onClick={() => setCurrentImageIndex(idx)}
                className={`w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${idx === currentImageIndex ? 'border-red-600 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        )}

        {/* Article Body */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="prose prose-lg max-w-none mb-10">
          <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-medium">
            {article.description}
          </p>
        </motion.div>

        {/* YouTube Videos */}
        {youtubeIds.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="space-y-6 mb-10">
            <h3 className="text-lg font-black text-[#002B5B] dark:text-white uppercase tracking-tight italic flex items-center gap-2">
              <span className="w-1.5 h-6 bg-red-600 rounded-full"></span> Video Coverage
            </h3>
            <div className={`grid gap-6 ${youtubeIds.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              {youtubeIds.map((ytId, idx) => (
                <div key={idx} className="aspect-video rounded-2xl overflow-hidden shadow-xl bg-black">
                  <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${ytId}`}
                    title={`Video ${idx + 1}`} frameBorder="0" allowFullScreen></iframe>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom Share & Back */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-gray-200 dark:border-white/10">
          <button onClick={() => navigate('/news')}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-white/5 text-[#002B5B] dark:text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/10 transition-all cursor-pointer">
            <ArrowLeft size={14} /> Back to News
          </button>
          <button onClick={handleWhatsAppShare}
            className="flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-green-500/20 active:scale-95 cursor-pointer">
            <Share2 size={14} /> Share on WhatsApp
          </button>
        </div>

        {/* Crime Sach News Footer */}
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5 text-center">
          <img src={CRIME_SACH_LOGO} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover shadow-lg" alt="Crime Sach News" />
          <p className="font-black text-[#002B5B] dark:text-white uppercase tracking-widest text-sm">Crime Sach News</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">आपका शहर — आपकी ख़बर</p>
        </div>

      </article>
    </div>
  );
};

export default NewsArticle;
