import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LogOut,
  Loader2,
  FileEdit,
  Plus,
  Trash2,
  Image,
  Clock,
  CheckCircle,
  XCircle,
  Bell
} from "lucide-react";
import logo from "../../assets/logo.png";

import { auth, db } from "../../firebase/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, orderBy, deleteDoc, where, doc } from "firebase/firestore";

// 🔥 FIX: Kyunki dono files ek hi folder mein hain, isliye path ye hoga:
import AnchorNewsForm from "./AnchorNewsForm";

const AnchorDashboard = () => {
  const navigate = useNavigate();
  const [currentAnchor, setCurrentAnchor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("create");
  const [myContent, setMyContent] = useState([]);
  const [showForm, setShowForm] = useState(false);
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
              <p className="text-sm mt-2 text-gray-300">Logging Out Securely...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="w-full lg:w-80 bg-[#002B5B] dark:bg-[#1e2128] text-white p-6 flex flex-col shadow-2xl">
        <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6">
          <img src={logo} className="h-12 w-12 bg-white p-1 rounded-xl" />
          <div>
            <h2 className="font-black uppercase text-lg italic">Anchor<span className="text-red-600">Hub</span></h2>
            <p className="text-[8px] text-gray-400 uppercase tracking-widest">Content Portal</p>
          </div>
        </div>

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

        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab("create")} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${activeTab === "create" ? "bg-red-700 text-white shadow-xl translate-x-2" : "hover:bg-white/5 text-gray-400 hover:text-white"}`}>
            <FileEdit size={18} /> Create Content
          </button>
          <button onClick={() => setActiveTab("my-content")} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${activeTab === "my-content" ? "bg-red-700 text-white shadow-xl translate-x-2" : "hover:bg-white/5 text-gray-400 hover:text-white"}`}>
            <Image size={18} /> My Content
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-4 relative overflow-hidden flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-red-600/30 text-red-400 bg-gradient-to-r from-red-600/10 via-red-500/5 to-transparent hover:from-red-600 hover:to-red-700 hover:text-white hover:shadow-xl hover:shadow-red-700/30 transition-all duration-300 group">
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-red-700/10 blur-xl"></span>
          <LogOut size={18} className="transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="relative z-10">Secure Logout</span>
        </button>
      </aside>

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "create" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#002B5B] dark:text-white uppercase">Create News Content</h2>
                  <p className="text-gray-500 text-xs sm:text-sm">Submit news for admin approval</p>
                </div>
                <button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2 px-4 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold uppercase text-xs sm:text-sm transition-all shadow-lg">
                  <Plus size={18} /> New Content
                </button>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                <h3 className="font-bold text-blue-800 dark:text-blue-400 text-sm mb-2 flex items-center gap-2"><Bell size={16} /> Submission Guidelines</h3>
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-[#002B5B] dark:text-white uppercase">My Content</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {myContent.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-[#111] rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col">
                    <div className="h-40 sm:h-48 bg-gray-100 dark:bg-gray-800 relative shrink-0">
                      {item.youtubeId ? (
                        <img src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`} className="w-full h-full object-cover" />
                      ) : (
                        <img src={item.mediaUrl} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute top-2 right-2">{getStatusBadge(item.status)}</div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-black text-[#002B5B] dark:text-white uppercase text-sm sm:text-base line-clamp-1">{item.title}</h3>
                      <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mt-2 flex-1">{item.description}</p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 dark:border-white/5">
                        <span className="text-gray-400 text-[10px] font-bold">{formatDate(item.createdAt)}</span>
                        {item.status === "pending" && (
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 🔥 Form Injected Here 🔥 */}
      {showForm && (
        <AnchorNewsForm 
          currentAnchor={currentAnchor} 
          onClose={() => setShowForm(false)} 
          onSuccess={fetchMyContent} 
        />
      )}
    </div>
  );
};

export default AnchorDashboard;