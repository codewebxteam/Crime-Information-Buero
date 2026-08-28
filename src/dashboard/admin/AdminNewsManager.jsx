import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { uploadImageToCloudinary, uploadToCloudinary } from '../../services/cloudinary.service';
import { Loader2, Plus, Trash2, Image, Video, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminNewsManager = ({ adminUid }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mediaType: 'image',
    category: 'Intelligence',
    mediaFiles: [],
    youtubeUrl: ''
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      setNews(newsData);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setMediaPreviews([...mediaPreviews, ...newPreviews]);
      setFormData({ ...formData, mediaFiles: [...formData.mediaFiles, ...files] });
    }
  };

  const removeFile = (index) => {
    const updatedPreviews = mediaPreviews.filter((_, i) => i !== index);
    const updatedFiles = formData.mediaFiles.filter((_, i) => i !== index);
    setMediaPreviews(updatedPreviews);
    setFormData({ ...formData, mediaFiles: updatedFiles });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert('Please fill in all fields');
      return;
    }

    // Ensure category has a valid value
    const category = formData.category || 'All';

    setSubmitting(true);
    try {
      let mediaUrls = [];
      let youtubeId = '';
      
      // Handle YouTube URL for video type - check first if URL is provided
      if (formData.mediaType === 'video' && formData.youtubeUrl && formData.youtubeUrl.trim() !== '') {
        // Extract YouTube video ID from various URL formats (watch, live, embed, youtu.be)
        const url = formData.youtubeUrl;
        // Match patterns: youtube.com/watch?v=ID, youtube.com/live/ID, youtu.be/ID, youtube.com/embed/ID
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (match) {
          youtubeId = match[1];
          console.log('YouTube ID extracted:', youtubeId);
        } else {
          alert('Invalid YouTube URL. Please enter a valid YouTube video URL.');
          setSubmitting(false);
          return;
        }
      } 
      // If no YouTube URL, check for uploaded files
      else if (formData.mediaFiles.length > 0) {
        console.log('Uploading files to Cloudinary...');
        // Upload files to Cloudinary
        const uploadPromises = formData.mediaFiles.map(file => {
          if (formData.mediaType === 'video') {
            return uploadToCloudinary(file, 'news', 'video');
          } else {
            return uploadImageToCloudinary(file, 'news');
          }
        });
        mediaUrls = await Promise.all(uploadPromises);
        console.log('Upload complete, URLs:', mediaUrls);
      }
      // No media provided - allow posting without media

      console.log('Saving to Firestore:', { title: formData.title, category, youtubeId });
      
      await addDoc(collection(db, 'news'), {
        title: formData.title,
        description: formData.description,
        mediaType: formData.mediaType,
        mediaUrl: mediaUrls.length > 1 ? mediaUrls : (mediaUrls[0] || ''),
        youtubeId: youtubeId || '',
        category: category,
        postedBy: adminUid,
        status: 'approved',
        createdAt: serverTimestamp()
      });

      console.log('News saved successfully!');
      setFormData({ title: '', description: '', mediaType: 'image', category: 'Intelligence', mediaFiles: [], youtubeUrl: '' });
      setMediaPreviews([]);
      setShowForm(false);
      fetchNews();
      alert('News posted successfully!');
    } catch (error) {
      console.error('Error posting news:', error);
      alert('Failed to post news. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'news', id));
      fetchNews();
    } catch (error) {
      alert('Failed to delete news.');
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* Header - Responsive Flex */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#002B5B] dark:text-white uppercase">News Manager</h2>
          <p className="text-gray-500 text-xs sm:text-sm">Manage official CIB intelligence feed</p>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="flex items-center justify-center gap-2 px-4 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold uppercase text-xs sm:text-sm transition-all shadow-lg"
        >
          <Plus size={18} /> Post News
        </button>
      </div>

      {/* News Grid - Responsive Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {news.map((item) => (
          <div key={item.id} onClick={() => setPreviewItem(item)} className="bg-white dark:bg-[#111] rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col cursor-pointer hover:shadow-xl hover:border-red-700/20 transition-all group">
            <div className="h-40 sm:h-48 bg-gray-100 dark:bg-gray-800 relative shrink-0">
              {Array.isArray(item.mediaUrl) ? (
                 <img src={item.mediaUrl[0]} alt={item.title} className="w-full h-full object-cover" />
              ) : item.mediaUrl ? (
                item.mediaType === 'video' ? <video src={item.mediaUrl} className="w-full h-full object-cover" /> : <img src={item.mediaUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400"><Image size={40} /></div>
              )}
              
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase shadow-md ${
                  item.mediaType === 'video' ? 'bg-red-700 text-white' : 'bg-[#002B5B] text-white'
                }`}>
                  {item.mediaType}
                </span>
              </div>

              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase shadow-md bg-white/90 text-[#002B5B]">
                  {item.category || 'All'}
                </span>
              </div>

              {Array.isArray(item.mediaUrl) && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-md font-bold">
                  +{item.mediaUrl.length - 1} More
                </div>
              )}
            </div>

            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-black text-[#002B5B] dark:text-white uppercase text-sm sm:text-base line-clamp-1 group-hover:text-red-700 transition-colors">{item.title}</h3>
              <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mt-2 flex-1">{item.description}</p>
              
              {/* Views */}
              <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-400 font-bold">
                <Eye size={12} /> {item.views || 0} Views
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 dark:border-white/5">
                <span className="text-gray-400 text-[10px] font-bold">{formatDate(item.createdAt)}</span>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {news.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-[#111] rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/5">
          <Image size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="font-bold text-gray-400">No reports posted in database</p>
        </div>
      )}

      {/* Modal - Full Responsive */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl sm:rounded-[2.5rem] w-full max-w-xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0f0f0f] z-10">
              <h3 className="text-lg sm:text-xl font-black text-[#002B5B] dark:text-white uppercase">Create News Feed</h3>
              <button onClick={() => { 
                setShowForm(false); 
                setMediaPreviews([]); 
                setFormData({ 
                  title: '', 
                  description: '', 
                  mediaType: 'image', 
                  category: 'Intelligence', 
                  mediaFiles: [], 
                  youtubeUrl: '' 
                }); 
              }} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all">
                <X size={20} className="dark:text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
              <div className="flex gap-2 sm:gap-4">
                <button type="button" onClick={() => setFormData({ ...formData, mediaType: 'image' })} className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${formData.mediaType === 'image' ? 'bg-[#002B5B] text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>Image</button>
                <button type="button" onClick={() => setFormData({ ...formData, mediaType: 'video' })} className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${formData.mediaType === 'video' ? 'bg-red-700 text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>Video</button>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Category *</label>
                <div className="grid grid-cols-5 gap-2">
                  {['All', 'Intelligence', 'Cyber Crime', 'Events', 'Social'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`py-2 px-1 rounded-lg text-[8px] sm:text-[10px] font-black uppercase transition-all ${
                        formData.category === cat
                          ? 'bg-[#002B5B] text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Upload or YouTube */}
              {formData.mediaType === 'video' ? (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">YouTube URL</label>
                  <input
                    type="text"
                    placeholder="Enter YouTube URL (e.g., https://youtube.com/watch?v=...)"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black text-[#002B5B] dark:text-white text-sm font-bold focus:border-red-700 outline-none transition-all"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Paste YouTube video URL or leave empty for video upload</p>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Media Assets</label>
                  <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-3 sm:p-4 bg-gray-50/50 dark:bg-black/20">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {mediaPreviews.map((preview, index) => (
                        <div key={index} className="relative h-20 sm:h-24">
                          <img src={preview} className="w-full h-full object-cover rounded-xl" />
                          <button type="button" onClick={() => removeFile(index)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:scale-110 transition-all"><X size={12} /></button>
                        </div>
                      ))}
                      <label className="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer h-20 sm:h-24 hover:bg-white dark:hover:bg-white/5 transition-all">
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                        <Plus size={24} className="text-gray-400" />
                        <span className="text-[8px] font-black text-gray-400 uppercase mt-1">Add More</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <input type="text" placeholder="Intelligence Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black text-[#002B5B] dark:text-white text-sm font-bold focus:border-red-700 outline-none transition-all" required />
                <textarea placeholder="Detailed Intelligence Report *" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-4 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black text-[#002B5B] dark:text-white text-sm font-bold focus:border-red-700 outline-none transition-all resize-none" required />
              </div>

              <button type="submit" disabled={submitting} className="w-full py-4 bg-[#002B5B] dark:bg-red-700 text-white rounded-xl font-black uppercase text-xs sm:text-sm tracking-[0.2em] transition-all disabled:opacity-50 hover:bg-black shadow-xl flex items-center justify-center gap-3 active:scale-95">
                {submitting ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : <><Plus size={18} /> Transmit News</>}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ═══ FULL PREVIEW MODAL ═══ */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-3 backdrop-blur-md" onClick={() => setPreviewItem(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0f0f0f] max-w-3xl w-full rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              
              {/* Preview Header */}
              <div className="p-5 border-b dark:border-white/5 flex items-center justify-between bg-[#002B5B] text-white shrink-0">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest italic">Full Preview — Crime Sach News</h3>
                  <p className="text-[9px] text-white/50 mt-0.5">{formatDate(previewItem.createdAt)} • {previewItem.views || 0} views</p>
                </div>
                <button onClick={() => setPreviewItem(null)} className="p-2 hover:bg-white/10 rounded-xl"><X size={18} /></button>
              </div>

              {/* Preview Body (scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Category & Title */}
                <div>
                  {previewItem.category && <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded uppercase tracking-widest">{previewItem.category}</span>}
                  <h2 className="text-xl md:text-2xl font-black text-[#002B5B] dark:text-white uppercase italic tracking-tight leading-tight mt-3">{previewItem.title}</h2>
                </div>

                {/* Images */}
                {(previewItem.mediaUrl || previewItem.images) && (
                  <div className="grid gap-3" style={{ gridTemplateColumns: (Array.isArray(previewItem.mediaUrl) ? previewItem.mediaUrl.length : 1) === 1 ? '1fr' : 'repeat(2, 1fr)' }}>
                    {Array.isArray(previewItem.mediaUrl) ? (
                      previewItem.mediaUrl.map((img, idx) => (
                        <img key={idx} src={img} className="w-full rounded-xl object-cover max-h-[300px] shadow-md" alt="" />
                      ))
                    ) : previewItem.mediaUrl && previewItem.mediaType !== 'video' ? (
                      <img src={previewItem.mediaUrl} className="w-full rounded-xl object-cover max-h-[300px] shadow-md" alt="" />
                    ) : null}
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{previewItem.description}</p>

                {/* Video */}
                {previewItem.youtubeId && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-[#002B5B] dark:text-white uppercase tracking-widest">Video Coverage</h4>
                    <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                      <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${previewItem.youtubeId}`} title="Video Coverage" frameBorder="0" allowFullScreen></iframe>
                    </div>
                  </div>
                )}
                {previewItem.mediaType === 'video' && previewItem.mediaUrl && !previewItem.youtubeId && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-[#002B5B] dark:text-white uppercase tracking-widest">Uploaded Video</h4>
                    <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                      <video src={previewItem.mediaUrl} className="w-full h-full object-contain" controls />
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Footer — Live Link */}
              <div className="p-5 border-t dark:border-white/5 flex gap-3 shrink-0 bg-gray-50 dark:bg-black/50">
                <button onClick={() => window.open(`${window.location.origin}/news/${previewItem.id}`, '_blank')} className="flex-1 py-3 bg-red-700 hover:bg-red-800 text-white font-black uppercase text-[10px] tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all">View Live News Page</button>
                <button onClick={() => setPreviewItem(null)} className="py-3 px-6 bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all hover:bg-gray-300">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminNewsManager;