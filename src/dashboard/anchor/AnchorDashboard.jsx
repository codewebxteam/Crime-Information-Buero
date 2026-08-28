import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LogOut, Loader2, FileEdit, Plus, Trash2, Image, Clock, CheckCircle, XCircle, Eye, Edit2, Newspaper
} from "lucide-react";
import logo from "../../assets/logo.png";

import { auth, db } from "../../firebase/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, orderBy, deleteDoc, where, doc } from "firebase/firestore";

import AnchorNewsForm from "./AnchorNewsForm";

const CRIME_SACH_LOGO = 'https://res.cloudinary.com/daj1kyrzf/image/upload/v1787938859/general/mwt0x23ao8feo7nuv8kt.jpg';

const AnchorDashboard = () => {
  const navigate = useNavigate();
  const [currentAnchor, setCurrentAnchor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("create");
  const [myContent, setMyContent] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [showLogoutAnim, setShowLogoutAnim] = useState(false);

  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showForm]);

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
      const q = query(collection(db, "anchorNews"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const contentData = snapshot.docs
        .map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() || new Date()
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

  const handleEdit = (item) => {
    setEditingNews(item);
    setShowForm(true);
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
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 tracking-wider"><Clock size={10} /> Pending</span>;
      case "approved":
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 tracking-wider"><CheckCircle size={10} /> Live</span>;
      case "rejected":
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 tracking-wider"><XCircle size={10} /> Rejected</span>;
      default:
        return null;
    }
  };

  const getThumb = (item) => {
    if (item.images && Array.isArray(item.images) && item.images[0]) return item.images[0];
    if (item.mediaUrl && typeof item.mediaUrl === 'string') return item.mediaUrl;
    if (item.youtubeId) return `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;
    return CRIME_SACH_LOGO;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9] dark:bg-[#0a0a0a]">
        <Loader2 className="w-10 h-10 animate-spin text-red-700" />
      </div>
    );
  }

  if (!currentAnchor) return null;

  return (
    <div className="min-h-screen bg-[#f4f7f9] dark:bg-[#0f0f0f] flex flex-col lg:flex-row">
      <AnimatePresence>
        {showLogoutAnim && (
          <motion.div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center text-white">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}
                className="w-16 h-16 mx-auto mb-6 border-4 border-red-600 border-t-transparent rounded-full" />
              <h2 className="text-2xl font-black uppercase">Thank You Anchor</h2>
              <p className="text-sm mt-2 text-gray-300">Logging Out Securely...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ SIDEBAR ═══ */}
      <aside className="w-full lg:w-80 bg-gradient-to-b from-[#002B5B] to-[#001a3a] text-white p-6 flex flex-col shadow-2xl">
        {/* Crime Sach News Branding */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/10">
          <img src={CRIME_SACH_LOGO} className="h-12 w-12 rounded-full object-cover border-2 border-white/20 shadow-lg" alt="Crime Sach News" />
          <div>
            <h2 className="font-black uppercase text-base tracking-tight italic leading-none">Crime Sach <span className="text-red-500">News</span></h2>
            <p className="text-[8px] text-white/40 uppercase tracking-[0.3em] mt-0.5">Anchor Portal</p>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-white/10 rounded-2xl p-4 mb-6 backdrop-blur-sm border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-black text-sm shadow-lg">
              {currentAnchor.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-sm">{currentAnchor.name}</p>
              <p className="text-[10px] text-white/50">News Reporter</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab("create")} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${activeTab === "create" ? "bg-red-700 text-white shadow-xl shadow-red-900/30 translate-x-1" : "hover:bg-white/5 text-white/50 hover:text-white"}`}>
            <FileEdit size={18} /> Create Content
          </button>
          <button onClick={() => setActiveTab("my-content")} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${activeTab === "my-content" ? "bg-red-700 text-white shadow-xl shadow-red-900/30 translate-x-1" : "hover:bg-white/5 text-white/50 hover:text-white"}`}>
            <Newspaper size={18} /> My News
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-4 relative overflow-hidden flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-red-600/30 text-red-400 hover:bg-red-700 hover:text-white hover:border-red-700 transition-all duration-300 group">
          <LogOut size={18} className="transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Secure Logout</span>
        </button>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "create" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#002B5B] dark:text-white uppercase italic tracking-tight">Create News</h2>
                  <p className="text-gray-500 text-xs">Submit news for admin approval • Crime Sach News</p>
                </div>
                <button onClick={() => { setEditingNews(null); setShowForm(true); }} className="flex items-center justify-center gap-2 px-5 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold uppercase text-xs transition-all shadow-lg active:scale-95">
                  <Plus size={18} /> New Report
                </button>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border border-red-200/50 dark:border-red-800/30 rounded-2xl p-5">
                <h3 className="font-black text-red-700 dark:text-red-400 text-sm mb-3 flex items-center gap-2"><Newspaper size={16} /> Crime Sach News — Guidelines</h3>
                <ul className="text-xs text-red-600/80 dark:text-red-300/60 space-y-1.5">
                  <li>• All content goes to admin for approval before publishing</li>
                  <li>• Upload multiple images and YouTube video links per report</li>
                  <li>• Enter your author name for credit on the published news</li>
                  <li>• Edit your pending reports before admin approval</li>
                </ul>
              </div>
            </motion.div>
          )}

          {activeTab === "my-content" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-[#002B5B] dark:text-white uppercase italic tracking-tight">My News Reports</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myContent.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-[#111] rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col group hover:shadow-xl transition-all">
                    <div className="h-44 bg-gray-100 dark:bg-gray-800 relative shrink-0 overflow-hidden">
                      <img src={getThumb(item)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                      <div className="absolute top-2 right-2">{getStatusBadge(item.status)}</div>
                      {/* Image count badge */}
                      {item.images?.length > 1 && (
                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-lg text-[8px] font-black flex items-center gap-1">
                          <Image size={8} /> {item.images.length}
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-black text-[#002B5B] dark:text-white uppercase text-sm line-clamp-2 italic tracking-tight">{item.title}</h3>
                      <p className="text-gray-500 text-xs line-clamp-2 mt-2 flex-1">{item.description}</p>

                      {/* Views */}
                      <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-400 font-bold">
                        <Eye size={12} /> {item.views || 0} Views
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-white/5">
                        <span className="text-gray-400 text-[9px] font-bold">{formatDate(item.createdAt)}</span>
                        <div className="flex items-center gap-1">
                          {/* Edit button for pending */}
                          {item.status === "pending" && (
                            <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors" title="Edit">
                              <Edit2 size={14} />
                            </button>
                          )}
                          {/* Delete button for pending/rejected */}
                          {(item.status === "pending" || item.status === "rejected") && (
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {myContent.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-[#111] rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/5">
                  <Newspaper size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="font-bold text-gray-400 text-sm">No news reports submitted yet</p>
                  <p className="text-xs text-gray-300 mt-1">Click "New Report" to get started</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* News Form */}
      {showForm && (
        <AnchorNewsForm
          currentAnchor={currentAnchor}
          onClose={() => { setShowForm(false); setEditingNews(null); }}
          onSuccess={fetchMyContent}
          editingNews={editingNews}
        />
      )}
    </div>
  );
};

export default AnchorDashboard;