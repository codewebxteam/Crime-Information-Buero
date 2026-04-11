import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LogOut,
  Shield,
  Loader2,
  FileEdit,
  Plus,
  Trash2,
  Image,
  Video,
  X,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Bell
} from "lucide-react";
import logo from "../../assets/logo.png";

import { auth, db } from "../../firebase/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc, where, doc } from "firebase/firestore";
import { uploadImageToCloudinary, uploadToCloudinary } from "../../services/cloudinary.service";

const CATEGORIES = [
  "Intelligence",
  "Cyber Crime",
  "Events",
  "Social"
];

const AnchorDashboard = () => {
  const navigate = useNavigate();
  const [currentAnchor, setCurrentAnchor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("create");
  const [myContent, setMyContent] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [showLogoutAnim, setShowLogoutAnim] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Intelligence",
    mediaType: "image",
    mediaFiles: [],
    youtubeLink: ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        localStorage.removeItem("anchorAuth");
        navigate("/");
        return;
      }

      try {
        const savedAnchor = localStorage.getItem("anchorAuth");
        const parsedAnchor = savedAnchor ? JSON.parse(savedAnchor) : null;

        if (parsedAnchor) {
          setCurrentAnchor({
            uid: parsedAnchor.uid || firebaseUser.uid,
            email: parsedAnchor.email || firebaseUser.email || "",
            name: parsedAnchor.name || "Anchor",
            role: "anchor"
          });
        } else {
          // Check anchors collection by uid field
          const anchorQuery = query(collection(db, "anchors"), where("uid", "==", firebaseUser.uid));
          const anchorSnap = await getDocs(anchorQuery);
          if (!anchorSnap.empty) {
            const anchorData = anchorSnap.docs[0].data();
            setCurrentAnchor({
              uid: firebaseUser.uid,
              email: anchorData.email || firebaseUser.email || "",
              name: anchorData.name || "Anchor",
              role: "anchor"
            });
            localStorage.setItem("anchorAuth", JSON.stringify({
              uid: firebaseUser.uid,
              email: anchorData.email,
              name: anchorData.name,
              role: "anchor"
            }));
          } else {
            navigate("/");
            return;
          }
        }
      } catch (err) {
        console.error("Anchor dashboard error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (currentAnchor) {
      fetchMyContent();
    }
  }, [currentAnchor]);

  const fetchMyContent = async () => {
    if (!currentAnchor?.uid) return;
    try {
      const q = query(
        collection(db, "anchorNews"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const contentData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }))
        .filter(item => item.postedBy === currentAnchor.uid);
      setMyContent(contentData);
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  };

  const handleLogout = async () => {
    try {
      setShowLogoutAnim(true);
      setTimeout(async () => {
        localStorage.removeItem("anchorAuth");
        await signOut(auth);
        navigate("/");
      }, 1800);
    } catch (e) {
      console.error(e);
      alert("Logout failed. Please try again.");
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

  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.mediaType === "image" && formData.mediaFiles.length === 0 && !formData.youtubeLink) {
      alert("Please upload an image or provide a YouTube link");
      return;
    }

    setSubmitting(true);
    try {
      let mediaUrl = "";
      let youtubeId = null;

      if (formData.mediaType === "youtube" && formData.youtubeLink) {
        youtubeId = getYoutubeId(formData.youtubeLink);
        if (!youtubeId) {
          alert("Invalid YouTube link");
          setSubmitting(false);
          return;
        }
      } else if (formData.mediaFiles.length > 0) {
        const uploadPromises = formData.mediaFiles.map(file => {
          if (formData.mediaType === "video") {
            return uploadToCloudinary(file, "news", "video");
          } else {
            return uploadImageToCloudinary(file, "news");
          }
        });
        const mediaUrls = await Promise.all(uploadPromises);
        mediaUrl = mediaUrls[0] || "";
      }

      await addDoc(collection(db, "anchorNews"), {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        mediaType: formData.mediaType,
        mediaUrl: mediaUrl,
        youtubeId: youtubeId,
        youtubeLink: formData.youtubeLink,
        postedBy: currentAnchor.uid,
        postedByName: currentAnchor.name,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setFormData({
        title: "",
        description: "",
        category: "Intelligence",
        mediaType: "image",
        mediaFiles: [],
        youtubeLink: ""
      });
      setMediaPreviews([]);
      setShowForm(false);
      fetchMyContent();
      alert("Content submitted successfully! It is now pending approval.");
    } catch (error) {
      console.error("Error submitting content:", error);
      alert("Failed to submit content. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this content?")) return;
    if (myContent.find(c => c.id === id)?.status === "approved") {
      alert("Cannot delete approved content. Contact admin.");
      return;
    }
    try {
      await deleteDoc(doc(db, "anchorNews", id));
      fetchMyContent();
    } catch (error) {
      alert("Failed to delete content.");
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase bg-yellow-100 text-yellow-700"><Clock size={12} /> Pending</span>;
      case "approved":
        return <span className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase bg-green-100 text-green-700"><CheckCircle size={12} /> Approved</span>;
      case "rejected":
        return <span className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase bg-red-100 text-red-700"><XCircle size={12} /> Rejected</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9]">
        <Loader2 className="w-10 h-10 animate-spin text-red-700" />
      </div>
    );
  }

  if (!currentAnchor) return null;

  return (
    <div className="min-h-screen bg-[#f4f7f9] dark:bg-[#1e2128] flex flex-col lg:flex-row">

      {/* Logout Animation */}
      <AnimatePresence>
        {showLogoutAnim && (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center text-white"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-16 h-16 mx-auto mb-6 border-4 border-red-600 border-t-transparent rounded-full"
              />
              <h2 className="text-2xl font-black uppercase">Thank You Anchor</h2>
              <p className="text-sm mt-2 text-gray-300">
                Logging Out Securely...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className="w-full lg:w-80 bg-[#002B5B] dark:bg-[#1e2128] text-white p-6 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6">
          <img src={logo} className="h-12 w-12 bg-white p-1 rounded-xl" />
          <div>
            <h2 className="font-black uppercase text-lg italic">
              Anchor<span className="text-red-600">Hub</span>
            </h2>
            <p className="text-[8px] text-gray-400 uppercase tracking-widest">
              Content Portal
            </p>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white/10 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-black text-sm">
              {currentAnchor.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-sm">{currentAnchor.name}</p>
              <p className="text-[10px] text-gray-400">News Anchor</p>
            </div>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab("create")}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${
              activeTab === "create"
                ? "bg-red-700 text-white shadow-xl translate-x-2"
                : "hover:bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            <FileEdit size={18} /> Create Content
          </button>
          <button
            onClick={() => setActiveTab("my-content")}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${
              activeTab === "my-content"
                ? "bg-red-700 text-white shadow-xl translate-x-2"
                : "hover:bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            <Image size={18} /> My Content
          </button>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-4 relative overflow-hidden flex items-center justify-center gap-3 p-4 
          rounded-2xl font-black text-[11px] uppercase tracking-widest 
          border border-red-600/30 text-red-400 
          bg-gradient-to-r from-red-600/10 via-red-500/5 to-transparent
          hover:from-red-600 hover:to-red-700 hover:text-white 
          hover:shadow-xl hover:shadow-red-700/30 
          transition-all duration-300 group"
        >
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-red-700/10 blur-xl"></span>
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            <LogOut size={18} />
          </span>
          <span className="relative z-10">Secure Logout</span>
        </button>

      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "create" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#002B5B] dark:text-white uppercase">Create News Content</h2>
                  <p className="text-gray-500 text-xs sm:text-sm">Submit news for admin approval</p>
                </div>
                <button 
                  onClick={() => setShowForm(true)} 
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold uppercase text-xs sm:text-sm transition-all shadow-lg"
                >
                  <Plus size={18} /> New Content
                </button>
              </div>

              {/* Quick Tips */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                <h3 className="font-bold text-blue-800 dark:text-blue-400 text-sm mb-2 flex items-center gap-2">
                  <Bell size={16} /> Submission Guidelines
                </h3>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• All content is subject to admin approval before publishing</li>
                  <li>• Use appropriate categories for better organization</li>
                  <li>• For YouTube videos, provide the full video link</li>
                  <li>• Images should be clear and relevant to the news</li>
                </ul>
              </div>
            </motion.div>
          )}

          {activeTab === "my-content" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#002B5B] dark:text-white uppercase">My Content</h2>
                <p className="text-gray-500 text-xs sm:text-sm">View your submitted content and status</p>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {myContent.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-[#111] rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col">
                    <div className="h-40 sm:h-48 bg-gray-100 dark:bg-gray-800 relative shrink-0">
                      {item.youtubeId ? (
                        <img 
                          src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : item.mediaUrl ? (
                        item.mediaType === 'video' ? (
                          <video src={item.mediaUrl} className="w-full h-full object-cover" />
                        ) : (
                          <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><Image size={40} /></div>
                      )}
                      
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(item.status)}
                      </div>

                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase shadow-md ${
                          item.mediaType === 'video' || item.youtubeId ? 'bg-red-700 text-white' : 'bg-[#002B5B] text-white'
                        }`}>
                          {item.youtubeId ? 'YouTube' : item.mediaType}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-[10px] font-bold text-gray-500 uppercase">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="font-black text-[#002B5B] dark:text-white uppercase text-sm sm:text-base line-clamp-1">{item.title}</h3>
                      <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mt-2 flex-1">{item.description}</p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 dark:border-white/5">
                        <span className="text-gray-400 text-[10px] font-bold">{formatDate(item.createdAt)}</span>
                        {item.status === "pending" && (
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {myContent.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-[#111] rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/5">
                  <FileEdit size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="font-bold text-gray-400">No content submitted yet</p>
                  <button 
                    onClick={() => { setActiveTab("create"); setShowForm(true); }}
                    className="mt-4 px-4 py-2 bg-red-700 text-white rounded-xl font-bold text-sm"
                  >
                    Create Your First Content
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Create Content Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl sm:rounded-[2.5rem] w-full max-w-xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0f0f0f] z-10">
              <h3 className="text-lg sm:text-xl font-black text-[#002B5B] dark:text-white uppercase">Create News Content</h3>
              <button 
                onClick={() => { 
                  setShowForm(false); 
                  setMediaPreviews([]); 
                  setFormData({ 
                    title: "", 
                    description: "", 
                    category: "Intelligence",
                    mediaType: "image", 
                    mediaFiles: [],
                    youtubeLink: "" 
                  }); 
                }} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} className="dark:text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
              {/* Media Type Selection */}
              <div className="flex gap-2 sm:gap-4">
                <button 
                  type="button" 
                  onClick={() => setFormData({ ...formData, mediaType: 'image' })} 
                  className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${formData.mediaType === 'image' ? 'bg-[#002B5B] text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}
                >
                  <Image size={16} className="inline mr-2" /> Image
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData({ ...formData, mediaType: 'youtube' })} 
                  className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${formData.mediaType === 'youtube' ? 'bg-red-700 text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}
                >
                  <Video size={16} className="inline mr-2" /> YouTube
                </button>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black text-[#002B5B] dark:text-white text-sm font-bold focus:border-red-700 outline-none transition-all"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Media Input */}
              {formData.mediaType === 'youtube' ? (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">YouTube Link</label>
                  <input 
                    type="url" 
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.youtubeLink}
                    onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                    className="w-full px-4 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black text-[#002B5B] dark:text-white text-sm font-bold focus:border-red-700 outline-none transition-all"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Media Assets</label>
                  <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-3 sm:p-4 bg-gray-50/50 dark:bg-black/20">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {mediaPreviews.map((preview, index) => (
                        <div key={index} className="relative h-20 sm:h-24">
                          {formData.mediaType === 'video' ? (
                            <video src={preview} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <img src={preview} className="w-full h-full object-cover rounded-xl" />
                          )}
                          <button 
                            type="button" 
                            onClick={() => removeFile(index)} 
                            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:scale-110 transition-all"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <label className="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer h-20 sm:h-24 hover:bg-white dark:hover:bg-white/5 transition-all">
                        <input type="file" multiple accept={formData.mediaType === 'video' ? 'video/*' : 'image/*'} onChange={handleFileChange} className="hidden" />
                        <Plus size={24} className="text-gray-400" />
                        <span className="text-[8px] font-black text-gray-400 uppercase mt-1">Add More</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Text Fields */}
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="News Title *" 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  className="w-full px-4 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black text-[#002B5B] dark:text-white text-sm font-bold focus:border-red-700 outline-none transition-all" 
                  required 
                />
                <textarea 
                  placeholder="News Description *" 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  rows={4} 
                  className="w-full px-4 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black text-[#002B5B] dark:text-white text-sm font-bold focus:border-red-700 outline-none transition-all resize-none" 
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full py-4 bg-[#002B5B] dark:bg-red-700 text-white rounded-xl font-black uppercase text-xs sm:text-sm tracking-[0.2em] transition-all disabled:opacity-50 hover:bg-black shadow-xl flex items-center justify-center gap-3 active:scale-95"
              >
                {submitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                ) : (
                  <><Send size={18} /> Submit for Approval</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnchorDashboard;
