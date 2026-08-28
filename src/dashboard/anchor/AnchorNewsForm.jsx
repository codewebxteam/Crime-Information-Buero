import React, { useState, useEffect } from "react";
import { X, Image as ImageIcon, Video, Plus, Loader2, Send, LayoutGrid, User, Calendar, Link as LinkIcon } from "lucide-react";
import { db } from "../../firebase/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { uploadImageToCloudinary } from "../../services/cloudinary.service";

const CATEGORIES = ["Intelligence", "Cyber Crime", "Events", "Social"];

const AnchorNewsForm = ({ currentAnchor, onClose, onSuccess, editingNews = null }) => {
  const [submitting, setSubmitting] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Intelligence",
    mediaFiles: [],
    existingImages: [],
    youtubeLinks: [""],
    authorName: currentAnchor?.name || "",
  });

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  // Pre-fill if editing
  useEffect(() => {
    if (editingNews) {
      const existingImgs = editingNews.images || (editingNews.mediaUrl ? (Array.isArray(editingNews.mediaUrl) ? editingNews.mediaUrl : [editingNews.mediaUrl]) : []);
      const existingYt = editingNews.youtubeLinks || (editingNews.youtubeId ? [editingNews.youtubeId] : []);

      setFormData({
        title: editingNews.title || "",
        description: editingNews.description || "",
        category: editingNews.category || "Intelligence",
        mediaFiles: [],
        existingImages: existingImgs.filter(Boolean),
        youtubeLinks: existingYt.length > 0 ? existingYt : [""],
        authorName: editingNews.authorName || editingNews.postedByName || currentAnchor?.name || "",
      });
      setMediaPreviews([]);
    }
  }, [editingNews, currentAnchor]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setMediaPreviews([...mediaPreviews, ...files.map(f => URL.createObjectURL(f))]);
      setFormData({ ...formData, mediaFiles: [...formData.mediaFiles, ...files] });
    }
  };

  const removeFile = (index) => {
    setMediaPreviews(mediaPreviews.filter((_, i) => i !== index));
    setFormData({ ...formData, mediaFiles: formData.mediaFiles.filter((_, i) => i !== index) });
  };

  const removeExistingImage = (index) => {
    setFormData({ ...formData, existingImages: formData.existingImages.filter((_, i) => i !== index) });
  };

  // YouTube link management
  const addYoutubeLink = () => {
    setFormData({ ...formData, youtubeLinks: [...formData.youtubeLinks, ""] });
  };

  const updateYoutubeLink = (index, value) => {
    const updated = [...formData.youtubeLinks];
    updated[index] = value;
    setFormData({ ...formData, youtubeLinks: updated });
  };

  const removeYoutubeLink = (index) => {
    if (formData.youtubeLinks.length <= 1) {
      updateYoutubeLink(0, "");
      return;
    }
    setFormData({ ...formData, youtubeLinks: formData.youtubeLinks.filter((_, i) => i !== index) });
  };

  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return alert("Title aur Description bharna zaroori hai!");

    setSubmitting(true);
    try {
      // Upload new images
      let newImageUrls = [];
      if (formData.mediaFiles.length > 0) {
        const uploadPromises = formData.mediaFiles.map(file => uploadImageToCloudinary(file, "news"));
        newImageUrls = await Promise.all(uploadPromises);
      }

      // Combine existing + new images
      const allImages = [...formData.existingImages, ...newImageUrls].filter(Boolean);

      // Extract YouTube IDs
      const youtubeIds = formData.youtubeLinks
        .map(link => getYoutubeId(link))
        .filter(Boolean);

      const newsData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        authorName: formData.authorName,
        images: allImages,
        mediaUrl: allImages[0] || "",
        youtubeLinks: youtubeIds,
        youtubeId: youtubeIds[0] || "",
        updatedAt: serverTimestamp()
      };

      if (editingNews) {
        // Update existing
        await updateDoc(doc(db, "anchorNews", editingNews.id), newsData);
        alert("News updated successfully!");
      } else {
        // Create new
        await addDoc(collection(db, "anchorNews"), {
          ...newsData,
          postedBy: currentAnchor.uid,
          postedByName: currentAnchor.name,
          status: "pending",
          views: 0,
          createdAt: serverTimestamp(),
        });
        alert("News report approval ke liye bhej di gayi hai!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Submission fail ho gaya.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-hidden">
      <div className="relative bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] w-full max-w-2xl h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-white/10">

        {/* Header */}
        <div className="shrink-0 p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between z-20 bg-gradient-to-r from-red-700 to-[#002B5B] text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl"><Plus size={18} className="text-white" /></div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider">{editingNews ? "Edit Report" : "New Report"}</h3>
              <p className="text-[9px] text-white/60 font-bold uppercase tracking-widest">Crime Sach News</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"><X size={22} /></button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 scroll-smooth custom-scrollbar"
          onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}
          style={{ overscrollBehavior: 'contain' }}>

          {/* Author Name & Auto Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><User size={12} /> Author Name</label>
              <input type="text" placeholder="Your Name" value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111] text-[#002B5B] dark:text-white font-bold text-sm outline-none focus:border-red-600 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><Calendar size={12} /> Date (Auto)</label>
              <div className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1a1a1a] text-[#002B5B] dark:text-white/60 font-bold text-sm">
                {today}
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase tracking-widest"><LayoutGrid size={12} /> Report Category</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => setFormData({ ...formData, category: cat })}
                  className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    formData.category === cat
                      ? 'bg-red-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200'
                  }`}>{cat}</button>
              ))}
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><ImageIcon size={12} /> Images (Multiple Allowed)</label>
            <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-3 bg-gray-50/50 dark:bg-black/20">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {/* Existing images (for editing) */}
                {formData.existingImages.map((url, i) => (
                  <div key={`existing-${i}`} className="relative aspect-square rounded-xl border-2 border-green-400/30 overflow-hidden group">
                    <img src={url} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => removeExistingImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:scale-110 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      <X size={10} strokeWidth={3} />
                    </button>
                  </div>
                ))}
                {/* New file previews */}
                {mediaPreviews.map((p, i) => (
                  <div key={`new-${i}`} className="relative aspect-square rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden group shadow-sm">
                    <img src={p} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:scale-110 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      <X size={10} strokeWidth={3} />
                    </button>
                  </div>
                ))}
                {/* Add more button */}
                <label className="aspect-square border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/5 transition-all">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" multiple />
                  <Plus size={20} className="text-gray-400" />
                  <span className="text-[7px] font-black text-gray-400 uppercase mt-1">Add</span>
                </label>
              </div>
            </div>
          </div>

          {/* YouTube Links Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><Video size={12} /> YouTube Videos (Multiple Allowed)</label>
            <div className="space-y-2">
              {formData.youtubeLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="url" placeholder={`YouTube Link #${idx + 1}`} value={link}
                      onChange={(e) => updateYoutubeLink(idx, e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111] text-[#002B5B] dark:text-white font-bold text-xs outline-none focus:border-red-600 transition-all" />
                  </div>
                  <button type="button" onClick={() => removeYoutubeLink(idx)}
                    className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all shrink-0">
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addYoutubeLink}
                className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase tracking-widest hover:text-red-800 transition-all py-2">
                <Plus size={14} /> Add Another YouTube Link
              </button>
            </div>
          </div>

          {/* Headline & Description */}
          <div className="space-y-4">
            <input type="text" placeholder="NEWS HEADLINE..." value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111] text-[#002B5B] dark:text-white text-lg font-black uppercase outline-none focus:border-red-600 transition-all" required />
            <textarea placeholder="DETAILED REPORT..." value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={8}
              className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111] text-[#002B5B] dark:text-white text-sm font-medium outline-none focus:border-red-600 resize-none transition-all custom-scrollbar" required />
          </div>
        </div>

        {/* Footer Submit */}
        <div className="shrink-0 p-5 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-20">
          <button type="submit" onClick={handleSubmit} disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-red-700 to-[#002B5B] text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all hover:opacity-90 shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50">
            {submitting ? <><Loader2 className="animate-spin" size={18} /> {editingNews ? "Updating..." : "Submitting..."}</> : <><Send size={18} /> {editingNews ? "Update Report" : "Submit for Approval"}</>}
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #374151; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #dc2626; }
      `}</style>
    </div>
  );
};

export default AnchorNewsForm;