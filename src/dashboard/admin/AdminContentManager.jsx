import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { 
  doc, collection, getDocs, addDoc, 
  deleteDoc, updateDoc, serverTimestamp, 
  query, orderBy 
} from "firebase/firestore";
import { 
  Edit2, FileText, Loader2, 
  Image as ImageIcon, Plus, Trash2, X, Check,
  Images, Users, MapPin, Calendar, Layers, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadImageToCloudinary } from "../../services/cloudinary.service";

// ─── GALLERY MANAGER (ALBUM / FOLDER LOGIC) ─────────────────────────────
const GalleryManager = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  
  const [formData, setFormData] = useState({ 
    title: "", location: "", date: "", 
    description: "", files: [], previews: [], showOnHome: false 
  });

  useEffect(() => { fetchPhotos(); }, []);

  const fetchPhotos = async () => {
    try {
      const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, files: selectedFiles, previews: newPreviews }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.files.length === 0 || !formData.title) { alert("Title and images required"); return; }
    
    setUploading(true);
    try {
      // 1. Upload all images and get their URLs in an array
      const uploadPromises = formData.files.map(file => uploadImageToCloudinary(file, "gallery"));
      const allImageUrls = await Promise.all(uploadPromises);

      // 2. Save as a SINGLE document (Album)
      await addDoc(collection(db, "gallery"), {
        title: formData.title,
        location: formData.location,
        date: formData.date,
        description: formData.description,
        images: allImageUrls, // 🔥 Array of all images
        image: allImageUrls[0], // Main cover image for backward compatibility
        isAlbum: allImageUrls.length > 1, 
        createdAt: serverTimestamp()
      });

      setFormData({ title: "", location: "", date: "", description: "", files: [], previews: [], showOnHome: false });
      setShowForm(false);
      fetchPhotos();
      alert(`Album "${formData.title}" created with ${allImageUrls.length} photos.`);
    } catch (err) { 
      console.error(err);
      alert("Upload failed"); 
    } 
    finally { setUploading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "gallery", editingPhoto.id), {
        title: editingPhoto.title,
        location: editingPhoto.location,
        description: editingPhoto.description,
        date: editingPhoto.date
      });
      setEditingPhoto(null);
      fetchPhotos();
    } catch (err) { alert("Update failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entire album permanently?")) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "gallery", id));
      setPhotos(prev => prev.filter(p => p.id !== id));
    } catch (err) { alert("Delete failed"); } 
    finally { setDeletingId(null); }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-black text-[#002B5B] dark:text-white uppercase tracking-tighter italic">Gallery Control</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Manage Albums & Records</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
          <Plus size={16} /> Create Album
        </button>
      </div>

      <div className="overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '550px' }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group bg-white dark:bg-[#111] rounded-[1.5rem] overflow-hidden shadow-md h-[280px] flex flex-col border border-transparent hover:border-red-700/20 transition-all">
              <div className="relative h-[180px] w-full shrink-0">
                <img src={photo.image || (photo.images && photo.images[0])} alt={photo.title} className="w-full h-full object-cover" />
                
                {/* Album Badge */}
                {photo.images?.length > 1 && (
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[8px] font-black flex items-center gap-1">
                    <Layers size={10} /> {photo.images.length} PHOTOS
                  </div>
                )}

                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingPhoto(photo)} className="p-1.5 bg-white/90 dark:bg-black/70 text-[#002B5B] dark:text-white rounded-lg backdrop-blur-sm hover:bg-red-700 hover:text-white transition-all"><Edit2 size={12} /></button>
                  <button disabled={deletingId === photo.id} onClick={() => handleDelete(photo.id)} className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-800 transition-all">{deletingId === photo.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}</button>
                </div>
              </div>
              <div className="p-3 flex flex-col justify-center flex-grow overflow-hidden">
                <h4 className="text-[11px] font-black text-[#002B5B] dark:text-white uppercase truncate italic leading-none">{photo.title}</h4>
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center gap-1 text-red-600 font-bold text-[8px] uppercase tracking-widest"><MapPin size={8} /> {photo.location || 'Site X'}</div>
                  <div className="text-gray-400 font-bold text-[7px]">{photo.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE ALBUM MODAL */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white dark:bg-[#0f0f0f] rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-5 border-b dark:border-white/5 flex items-center justify-between bg-[#002B5B] text-white">
                <h3 className="text-xs font-black uppercase tracking-widest italic">Album Authorization</h3>
                <button onClick={() => setShowForm(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-3">
                <label className="border-2 border-dashed dark:border-white/10 rounded-2xl flex flex-wrap gap-2 p-3 items-center justify-center cursor-pointer min-h-32 max-h-48 overflow-y-auto bg-gray-50 dark:bg-black">
                  {formData.previews.length > 0 ? (
                    formData.previews.map((url, i) => <img key={i} src={url} className="w-16 h-16 object-cover rounded-lg shadow-md" />)
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon size={30} className="mx-auto mb-1" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Select Multiple Images for Album</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" multiple required />
                </label>
                <div className="grid grid-cols-2 gap-3">
                   <input type="text" placeholder="Album Title *" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border dark:border-white/10 dark:bg-black dark:text-white text-xs font-bold focus:border-red-700 outline-none" required />
                   <input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border dark:border-white/10 dark:bg-black dark:text-white text-xs font-bold outline-none" />
                </div>
                <input type="text" placeholder="Location" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border dark:border-white/10 dark:bg-black dark:text-white text-xs font-bold outline-none" />
                <textarea placeholder="Event Description..." value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-4 py-2.5 rounded-xl border dark:border-white/10 dark:bg-black dark:text-white text-xs font-bold focus:border-red-700 outline-none resize-none" />
                <button type="submit" disabled={uploading} className="w-full py-3 bg-red-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all hover:bg-red-800">
                  {uploading ? `Uploading ${formData.files.length} Images...` : "Save Album to Archive"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingPhoto && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#0f0f0f] rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-5 border-b dark:border-white/5 flex items-center justify-between bg-red-700 text-white">
                <h3 className="text-xs font-black uppercase tracking-widest">Edit Intelligence Record</h3>
                <button onClick={() => setEditingPhoto(null)}><X size={18} /></button>
              </div>
              <form onSubmit={handleUpdate} className="p-5 space-y-3">
                <img src={editingPhoto.image || (editingPhoto.images && editingPhoto.images[0])} className="w-full h-32 object-cover rounded-xl mb-2" alt="" />
                <div className="grid grid-cols-2 gap-3">
                   <input type="text" value={editingPhoto.title} onChange={e => setEditingPhoto(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border dark:border-white/10 dark:bg-black dark:text-white text-xs font-bold outline-none" />
                   <input type="date" value={editingPhoto.date} onChange={e => setEditingPhoto(p => ({ ...p, date: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border dark:border-white/10 dark:bg-black dark:text-white text-xs font-bold outline-none" />
                </div>
                <input type="text" value={editingPhoto.location} onChange={e => setEditingPhoto(p => ({ ...p, location: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border dark:border-white/10 dark:bg-black dark:text-white text-xs font-bold outline-none" />
                <textarea value={editingPhoto.description} onChange={e => setEditingPhoto(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-4 py-2.5 rounded-xl border dark:border-white/10 dark:bg-black dark:text-white text-xs font-bold resize-none outline-none" />
                <button type="submit" className="w-full py-3 bg-[#002B5B] text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Update Record</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── ANCHOR MANAGER (with Full Preview) ─────────────────────────────────
const AnchorContentManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => { fetchContent(); }, []);

  const fetchContent = async () => {
    try {
      const q = query(collection(db, "anchorNews"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(), 
        status: d.data().status || 'pending',
        createdAt: d.data().createdAt?.toDate?.() || new Date()
      })));
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "anchorNews", id), { status: newStatus, updatedAt: serverTimestamp() });
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      if (previewItem?.id === id) setPreviewItem(prev => ({ ...prev, status: newStatus }));
    } catch (e) { alert("Action failed."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete permanently?")) return;
    try {
      await deleteDoc(doc(db, "anchorNews", id));
      setItems(prev => prev.filter(item => item.id !== id));
      if (previewItem?.id === id) setPreviewItem(null);
    } catch (e) { alert("Delete failed"); }
  };

  const getThumb = (item) => {
    if (item.images && Array.isArray(item.images) && item.images[0]) return item.images[0];
    if (item.mediaUrl && typeof item.mediaUrl === 'string') return item.mediaUrl;
    if (item.youtubeId) return `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;
    return 'https://via.placeholder.com/150';
  };

  const getAllImages = (item) => {
    if (item.images && Array.isArray(item.images)) return item.images.filter(Boolean);
    if (item.mediaUrl) return Array.isArray(item.mediaUrl) ? item.mediaUrl.filter(Boolean) : [item.mediaUrl];
    return [];
  };

  const getAllYoutubeIds = (item) => {
    if (item.youtubeLinks && Array.isArray(item.youtubeLinks)) return item.youtubeLinks.filter(Boolean);
    if (item.youtubeId) return [item.youtubeId];
    return [];
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filtered = items.filter(i => filter === "all" ? true : i.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-xl font-black text-[#002B5B] dark:text-white uppercase tracking-tighter italic">Review Command</h3>
        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
          {["pending", "approved", "rejected", "all"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${filter === f ? "bg-red-700 text-white shadow-lg" : "text-gray-500 hover:text-red-600"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
        {filtered.map(item => (
          <div key={item.id} onClick={() => setPreviewItem(item)}
            className="bg-white dark:bg-[#111] p-4 rounded-[2rem] shadow-xl border border-transparent hover:border-red-700/10 transition-all flex flex-col relative group cursor-pointer">
            <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="absolute top-4 right-4 p-2 bg-red-50 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:text-white z-10"><Trash2 size={14} /></button>
            <div className="flex gap-4 mb-4">
              <img src={getThumb(item)} className="w-20 h-20 rounded-2xl object-cover shrink-0" alt="" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[8px] font-black uppercase text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">{item.category || 'General'}</span>
                  <span className="text-[8px] font-bold text-gray-400 flex items-center gap-1"><Eye size={8} /> {item.views || 0}</span>
                </div>
                <h4 className="font-bold text-xs truncate dark:text-white uppercase italic mt-1">{item.title}</h4>
                <p className="text-[10px] text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                {item.authorName && <p className="text-[8px] text-gray-400 mt-1 font-bold">By: {item.authorName}</p>}
              </div>
            </div>
            
            <div className="flex gap-2 mt-auto pt-3 border-t dark:border-white/5">
              {item.status === 'pending' ? (
                <>
                  <button onClick={(e) => { e.stopPropagation(); updateStatus(item.id, 'approved'); }} className="flex-1 py-2 bg-green-600 text-white text-[9px] font-black uppercase rounded-xl flex items-center justify-center gap-2"><Check size={12} /> Approve</button>
                  <button onClick={(e) => { e.stopPropagation(); updateStatus(item.id, 'rejected'); }} className="flex-1 py-2 bg-gray-100 dark:bg-white/5 dark:text-white text-gray-700 text-[9px] font-black uppercase rounded-xl">Reject</button>
                </>
              ) : (
                <div className="flex w-full items-center justify-between px-2">
                  <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${item.status === 'approved' ? 'text-green-600 bg-green-50 dark:bg-green-900/10' : 'text-red-600 bg-red-50 dark:bg-red-900/10'}`}>{item.status}</span>
                  <button onClick={(e) => { e.stopPropagation(); updateStatus(item.id, 'pending'); }} className="text-[8px] font-black uppercase text-gray-400 hover:text-red-600 underline">Reset</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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
                  <p className="text-[9px] text-white/50 mt-0.5">By: {previewItem.authorName || previewItem.postedByName || 'Unknown'} • {formatDate(previewItem.createdAt)} • {previewItem.views || 0} views</p>
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
                {getAllImages(previewItem).length > 0 && (
                  <div className="grid gap-3" style={{ gridTemplateColumns: getAllImages(previewItem).length === 1 ? '1fr' : 'repeat(2, 1fr)' }}>
                    {getAllImages(previewItem).map((img, idx) => (
                      <img key={idx} src={img} className="w-full rounded-xl object-cover max-h-[300px] shadow-md" alt="" />
                    ))}
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{previewItem.description}</p>

                {/* YouTube Videos */}
                {getAllYoutubeIds(previewItem).length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-[#002B5B] dark:text-white uppercase tracking-widest">Video Embeds</h4>
                    {getAllYoutubeIds(previewItem).map((ytId, idx) => (
                      <div key={idx} className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                        <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${ytId}`} title={`Video ${idx + 1}`} frameBorder="0" allowFullScreen></iframe>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview Footer — Approve / Reject */}
              <div className="p-5 border-t dark:border-white/5 flex gap-3 shrink-0 bg-gray-50 dark:bg-black/50">
                {previewItem.status === 'pending' ? (
                  <>
                    <button onClick={() => updateStatus(previewItem.id, 'approved')} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all"><Check size={14} /> Approve & Publish</button>
                    <button onClick={() => updateStatus(previewItem.id, 'rejected')} className="flex-1 py-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all hover:bg-red-200">Reject</button>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-full ${previewItem.status === 'approved' ? 'text-green-600 bg-green-100 dark:bg-green-900/10' : 'text-red-600 bg-red-100 dark:bg-red-900/10'}`}>Status: {previewItem.status}</span>
                    <button onClick={() => updateStatus(previewItem.id, 'pending')} className="text-[10px] font-black uppercase text-gray-400 hover:text-red-600 underline">Reset to Pending</button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── HERO SECTION CAROUSEL MANAGER ──────────────────────────────────────────
const HeroSectionManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const q = query(collection(db, "heroImages"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setImages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file, "hero");
      if (url) {
        await addDoc(collection(db, "heroImages"), {
          imageUrl: url,
          createdAt: serverTimestamp(),
        });
        fetchImages();
        alert("Image uploaded successfully to Hero Carousel!");
      } else {
        alert("Image upload failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this image from the Home Hero carousel?")) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "heroImages", id));
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h3 className="text-lg font-black text-[#002B5B] dark:text-white uppercase tracking-tighter italic">Hero Carousel Control</h3>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Upload & manage homepage hero slides</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Upload Container */}
        <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-md border border-gray-100 dark:border-white/5 flex flex-col space-y-4">
          <h4 className="text-[11px] font-black text-[#002B5B] dark:text-white uppercase tracking-widest italic">Upload New Slide</h4>
          
          <label className="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer min-h-[200px] hover:border-red-700 dark:hover:border-red-700 bg-gray-50 dark:bg-black transition-all">
            {uploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="animate-spin text-red-700" size={30} />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-700">Uploading to Cloudinary...</span>
              </div>
            ) : (
              <div className="text-center text-gray-400 flex flex-col items-center">
                <ImageIcon size={36} className="mb-2 text-gray-300 dark:text-white/10" />
                <span className="text-[10px] font-black uppercase tracking-widest">Select Image File</span>
                <span className="text-[8px] text-gray-400 mt-1">Recommended: aspect ratio 4:3 or 16:9</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
          </label>
        </div>

        {/* Existing Slides List */}
        <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-md border border-gray-100 dark:border-white/5 flex flex-col space-y-4">
          <h4 className="text-[11px] font-black text-[#002B5B] dark:text-white uppercase tracking-widest italic">Current Slides</h4>
          
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-gray-400" size={24} />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-[10px] font-black uppercase tracking-widest">No Carousel Slides Uploaded</p>
              <p className="text-[8px] text-gray-400 mt-1">The website is currently displaying the fallback ID Card layout.</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[350px] pr-2 custom-scrollbar space-y-3">
              {images.map((img, index) => (
                <div key={img.id} className="flex items-center gap-4 bg-gray-50 dark:bg-black p-3 rounded-2xl border dark:border-white/5 group relative">
                  <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-200">
                    <img src={img.imageUrl} className="w-full h-full object-cover" alt={`Slide ${index + 1}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-[#002B5B] dark:text-white uppercase italic">Slide #{images.length - index}</p>
                    <p className="text-[8px] text-gray-400 truncate">{img.imageUrl}</p>
                  </div>
                  <button
                    disabled={deletingId === img.id}
                    onClick={() => handleDelete(img.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all cursor-pointer shrink-0 disabled:opacity-55"
                  >
                    {deletingId === img.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN ADMIN CONTENT MANAGER ──────────────────────────────────────────────
const AdminContentManager = () => {
  const [activeSection, setActiveSection] = useState("gallery");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[#002B5B] text-white rounded-3xl shadow-2xl rotate-3 shadow-blue-900/20"><FileText size={28} /></div>
          <div>
            <h2 className="text-3xl md:text-4xl font-[1000] text-[#002B5B] dark:text-white uppercase tracking-tighter italic leading-none">CIB <span className="text-red-700">Central.</span></h2>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-2">Operational Command Hub</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-72 space-y-3 sticky top-6">
            <button onClick={() => setActiveSection("gallery")} className={`w-full flex items-center justify-between px-6 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all ${activeSection === "gallery" ? "bg-red-700 text-white shadow-2xl shadow-red-900/40 -translate-y-1" : "bg-white dark:bg-[#111] dark:text-white hover:bg-gray-100 shadow-xl"}`}>Gallery Archive <Images size={18} /></button>
            <button onClick={() => setActiveSection("anchor")} className={`w-full flex items-center justify-between px-6 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all ${activeSection === "anchor" ? "bg-red-700 text-white shadow-2xl shadow-red-900/40 -translate-y-1" : "bg-white dark:bg-[#111] dark:text-white hover:bg-gray-100 shadow-xl"}`}>Anchor Content <Users size={18} /></button>
            <button onClick={() => setActiveSection("hero")} className={`w-full flex items-center justify-between px-6 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all ${activeSection === "hero" ? "bg-red-700 text-white shadow-2xl shadow-red-900/40 -translate-y-1" : "bg-white dark:bg-[#111] dark:text-white hover:bg-gray-100 shadow-xl"}`}>Hero Section <ImageIcon size={18} /></button>
          </div>

          <div className="flex-1 bg-white dark:bg-[#0f0f0f] rounded-[3rem] p-6 md:p-8 shadow-2xl min-h-[600px] overflow-hidden border border-gray-100 dark:border-white/5">
            {activeSection === "gallery" && <GalleryManager />}
            {activeSection === "anchor" && <AnchorContentManager />}
            {activeSection === "hero" && <HeroSectionManager />}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e11d48; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminContentManager;