import React, { useState, useEffect } from "react";
import { X, Image as ImageIcon, Video, Plus, Loader2, Send, LayoutGrid } from "lucide-react";
import { db } from "../../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadImageToCloudinary } from "../../services/cloudinary.service";

const CATEGORIES = ["Intelligence", "Cyber Crime", "Events", "Social"];

const AnchorNewsForm = ({ currentAnchor, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Intelligence",
    mediaFiles: [],
    youtubeLink: ""
  });

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
    const updatedPreviews = mediaPreviews.filter((_, i) => i !== index);
    const updatedFiles = formData.mediaFiles.filter((_, i) => i !== index);
    setMediaPreviews(updatedPreviews);
    setFormData({ ...formData, mediaFiles: updatedFiles });
  };

  const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return alert("Title aur Description bharna zaroori hai!");

    setSubmitting(true);
    try {
      let mediaUrl = "";
      if (formData.mediaFiles.length > 0) {
        mediaUrl = await uploadImageToCloudinary(formData.mediaFiles[0], "news");
      }

      const youtubeId = getYoutubeId(formData.youtubeLink);

      await addDoc(collection(db, "anchorNews"), {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        mediaUrl: mediaUrl,
        youtubeId: youtubeId,
        youtubeLink: formData.youtubeLink,
        postedBy: currentAnchor.uid,
        postedByName: currentAnchor.name,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      alert("News report approval ke liye bhej di gayi hai!");
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
      <div className="relative bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-white/10">
        
        {/* Header Section */}
        <div className="shrink-0 p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between z-20 bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center gap-3">
             <div className="bg-red-700 p-2 rounded-lg"><Plus size={20} className="text-white"/></div>
             <h3 className="text-xl font-black text-[#002B5B] dark:text-white uppercase">New Report</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-600 transition-all"><X size={28} /></button>
        </div>

        {/* 🔥 Scrollable Area - Added 'custom-scrollbar' class */}
        <div 
          className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 scroll-smooth custom-scrollbar"
          onWheel={(e) => e.stopPropagation()} 
          onTouchMove={(e) => e.stopPropagation()}
          style={{ overscrollBehavior: 'contain' }}
        >
          
          {/* Category Dropdown */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase tracking-widest"><LayoutGrid size={14}/> Report Category</label>
            <div className="relative">
              {/* 🔥 Added proper borders here */}
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full appearance-none px-6 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#111] text-[#002B5B] dark:text-white font-bold outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all cursor-pointer">
                {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-white dark:bg-[#111]">{cat}</option>)}
              </select>
              <Plus size={16} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-45 text-gray-400 pointer-events-none"/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* YouTube Input */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Video size={14}/> YouTube Link</label>
              {/* 🔥 Added proper borders here */}
              <input type="url" placeholder="https://..." value={formData.youtubeLink} onChange={(e) => setFormData({...formData, youtubeLink: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#111] text-[#002B5B] dark:text-white font-bold outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"/>
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14}/> Image Only</label>
              {/* 🔥 Added proper dashed borders here */}
              <label className="flex items-center justify-center h-[54px] rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#111] cursor-pointer hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <span className="text-[10px] font-black text-gray-500 uppercase">Upload Image</span>
              </label>
            </div>
          </div>

          {/* Image Previews */}
          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {mediaPreviews.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden group">
                  <img src={p} className="h-full w-full object-cover" alt="Preview" />
                  <button 
                    type="button" 
                    onClick={() => removeFile(i)} 
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 shadow-md hover:scale-110 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Headline & Description */}
          <div className="space-y-6">
            {/* 🔥 Added proper borders here */}
            <input type="text" placeholder="NEWS HEADLINE..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-6 py-5 rounded-2xl border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#111] text-[#002B5B] dark:text-white text-xl font-black uppercase outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" required />
            
            {/* 🔥 Added proper borders here */}
            <textarea placeholder="DETAILED REPORT..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={8} className="w-full px-6 py-5 rounded-3xl border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#111] text-[#002B5B] dark:text-white text-sm font-medium outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 resize-none transition-all custom-scrollbar" required />
          </div>
        </div>

        {/* Footer Button */}
        <div className="shrink-0 p-6 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-20">
          <button type="submit" onClick={handleSubmit} disabled={submitting} className="w-full py-5 bg-[#002B5B] dark:bg-red-700 text-white rounded-2xl font-black uppercase text-xs sm:text-sm tracking-[0.3em] transition-all hover:bg-black shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
            {submitting ? <Loader2 className="animate-spin" size={20}/> : <Send size={20}/>}
            {submitting ? "Publishing..." : "Publish News Report"}
          </button>
        </div>
      </div>

      {/* 🔥 Custom Scrollbar CSS Style Injector 🔥 */}
      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #374151; /* Dark gray for dark mode */
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #dc2626; /* Red on hover */
        }
        
        /* Light mode adjustments if needed */
        @media (prefers-color-scheme: light) {
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #b91c1c; 
          }
        }
      `}</style>
    </div>
  );
};

export default AnchorNewsForm;