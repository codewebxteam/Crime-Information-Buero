import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { 
  collection, addDoc, serverTimestamp, getDocs, query, 
  orderBy, deleteDoc, doc, updateDoc, getDoc 
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword, signOut 
} from "firebase/auth";
import { auth, secondaryAuth } from "../../firebase/firebase";
import { Loader2, Plus, Trash2, User, Mail, Lock, Eye, EyeOff, Edit, Check, X } from "lucide-react";

const AnchorManagement = () => {
  const [anchors, setAnchors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    fetchAnchors();
  }, []);

  const fetchAnchors = async () => {
    try {
      const q = query(collection(db, "anchors"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const anchorData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      setAnchors(anchorData);
    } catch (error) {
      console.error("Error fetching anchors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email,
        formData.password
      );
      
      const uid = userCredential.user.uid;

      // Create anchor document in anchors collection
      await addDoc(collection(db, "anchors"), {
        uid,
        name: formData.name,
        email: formData.email,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Sign out after creating
      await signOut(secondaryAuth);

      setFormData({ name: "", email: "", password: "" });
      setShowForm(false);
      fetchAnchors();
      alert("Anchor account created successfully!");
    } catch (error) {
      console.error("Error creating anchor:", error);
      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered.");
      } else {
        alert("Failed to create anchor account: " + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this anchor?")) return;
    try {
      await deleteDoc(doc(db, "anchors", id));
      fetchAnchors();
    } catch (error) {
      console.error("Error deleting anchor:", error);
      alert("Failed to delete anchor.");
    }
  };

  const handleStatusToggle = async (anchor) => {
    const newStatus = anchor.status === "active" ? "inactive" : "active";
    try {
      await updateDoc(doc(db, "anchors", anchor.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      fetchAnchors();
    } catch (error) {
      console.error("Error updating anchor status:", error);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#002B5B] dark:text-white uppercase">Anchor Management</h2>
          <p className="text-gray-500 text-xs sm:text-sm">Manage news anchor accounts</p>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="flex items-center justify-center gap-2 px-4 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold uppercase text-xs sm:text-sm transition-all shadow-lg"
        >
          <Plus size={18} /> Add Anchor
        </button>
      </div>

      {/* Anchors Table */}
      <div className="bg-white dark:bg-[#111] rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Name</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Email</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Created</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {anchors.map((anchor) => (
                <tr key={anchor.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-xs">
                        {anchor.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm text-[#002B5B] dark:text-white">{anchor.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500">{anchor.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => handleStatusToggle(anchor)}
                      className={`px-2 py-1 rounded-md text-[10px] font-black uppercase transition-colors ${
                        anchor.status === "active" 
                          ? "bg-green-100 text-green-700 hover:bg-green-200" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {anchor.status}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400">{formatDate(anchor.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleDelete(anchor.id)} 
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {anchors.length === 0 && (
          <div className="text-center py-20">
            <User size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-bold text-gray-400">No anchors created yet</p>
          </div>
        )}
      </div>

      {/* Create Anchor Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl sm:rounded-[2.5rem] w-full max-w-md max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0f0f0f] z-10">
              <h3 className="text-lg sm:text-xl font-black text-[#002B5B] dark:text-white uppercase">Create Anchor Account</h3>
              <button 
                onClick={() => { setShowForm(false); setFormData({ name: "", email: "", password: "" }); }} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} className="dark:text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Enter anchor name"
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black text-[#002B5B] dark:text-white text-sm font-bold focus:border-red-700 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email" 
                    placeholder="Enter email address"
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black text-[#002B5B] dark:text-white text-sm font-bold focus:border-red-700 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter password"
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                    className="w-full pl-12 pr-12 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black text-[#002B5B] dark:text-white text-sm font-bold focus:border-red-700 outline-none transition-all"
                    required
                    minLength={6}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full py-4 bg-[#002B5B] dark:bg-red-700 text-white rounded-xl font-black uppercase text-xs sm:text-sm tracking-[0.2em] transition-all disabled:opacity-50 hover:bg-black shadow-xl flex items-center justify-center gap-3 active:scale-95"
              >
                {submitting ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : <><Plus size={18} /> Create Anchor</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnchorManagement;
