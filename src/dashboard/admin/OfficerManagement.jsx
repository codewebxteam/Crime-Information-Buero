import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase"; 
import { 
  collection, addDoc, serverTimestamp, getDocs, query, 
  orderBy, deleteDoc, doc, updateDoc, getDoc 
} from "firebase/firestore";
import { Loader2, Plus, Trash2, User, Mail, Phone, Edit, X, Image as ImageIcon, MessageSquare } from "lucide-react";
import { uploadImageToCloudinary } from "../../services/cloudinary.service";

const OfficerManagement = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    department: "",
    message: "",
    phone: "",
    image: ""
  });

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const q = query(collection(db, "officers"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const officerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      setOfficers(officerData);
    } catch (error) {
      console.error("Error fetching officers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.position || !formData.department) {
      alert("Please fill in required fields");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = formData.image;
      
      // Upload image if it's a base64 string (new image selected)
      if (formData.image && formData.image.startsWith('data:')) {
        try {
          imageUrl = await uploadImageToCloudinary(formData.image, 'officers');
        } catch (uploadError) {
          console.error("Image upload failed, using base64:", uploadError);
          // Continue with base64 if upload fails
        }
      }

      if (editingOfficer) {
        // Update existing officer
        await updateDoc(doc(db, "officers", editingOfficer.id), {
          name: formData.name,
          position: formData.position,
          department: formData.department,
          message: formData.message,
          phone: formData.phone,
          image: imageUrl,
          updatedAt: serverTimestamp()
        });
        alert("Officer updated successfully!");
      } else {
        // Create new officer
        await addDoc(collection(db, "officers"), {
          name: formData.name,
          position: formData.position,
          department: formData.department,
          message: formData.message,
          phone: formData.phone,
          image: imageUrl,
          status: "active",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        alert("Officer created successfully!");
      }

      resetForm();
      fetchOfficers();
    } catch (error) {
      console.error("Error saving officer:", error);
      alert("Failed to save officer: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (officer) => {
    setEditingOfficer(officer);
    setFormData({
      name: officer.name,
      position: officer.position,
      department: officer.department,
      message: officer.message || "",
      phone: officer.phone || "",
      image: officer.image || ""
    });
    setImagePreview(officer.image || null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this officer?")) return;
    try {
      await deleteDoc(doc(db, "officers", id));
      fetchOfficers();
    } catch (error) {
      console.error("Error deleting officer:", error);
      alert("Failed to delete officer.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      department: "",
      message: "",
      phone: "",
      image: ""
    });
    setImagePreview(null);
    setEditingOfficer(null);
    setShowForm(false);
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
          <h2 className="text-xl sm:text-2xl font-black text-[#002B5B] dark:text-white uppercase">CIB Officer Management</h2>
          <p className="text-gray-500 text-xs sm:text-sm">Manage CIB Officers displayed on the Officers page</p>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="flex items-center justify-center gap-2 px-4 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold uppercase text-xs sm:text-sm transition-all shadow-lg"
        >
          <Plus size={18} /> Add Officer
        </button>
      </div>

      {/* Officers Grid - Card Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {officers.map((officer) => (
          <div key={officer.id} className="bg-white dark:bg-[#111] rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-white/5">
            {/* Circular Image */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              {officer.image ? (
                <img 
                  src={officer.image} 
                  alt={officer.name}
                  className="w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-2xl">
                  {officer.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="text-center">
              <h3 className="text-lg font-black text-[#002B5B] dark:text-white uppercase tracking-tight mb-1">{officer.name}</h3>
              <p className="text-red-600 text-xs font-bold uppercase tracking-widest mb-2">{officer.position}</p>
              
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="px-3 py-1 bg-[#f8f9fa] dark:bg-white/5 rounded-full">
                  <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{officer.department}</p>
                </div>
              </div>
              
              {officer.message && (
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed mb-3 italic line-clamp-2">
                  "{officer.message}"
                </p>
              )}
              
              {officer.phone && (
                <p className="text-[#002B5B] dark:text-red-500 text-xs font-bold mb-4">{officer.phone}</p>
              )}

              <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
                <button 
                  onClick={() => handleEdit(officer)}
                  className="p-2 text-[#002B5B] dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(officer.id)} 
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {officers.length === 0 && (
          <div className="col-span-full text-center py-20">
            <User size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-bold text-gray-400">No officers created yet</p>
            <p className="text-xs text-gray-400 mt-1">Click "Add Officer" to create the first CIB Officer</p>
          </div>
        )}
      </div>

      {/* Create/Edit Officer Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl sm:rounded-[2.5rem] w-full max-w-lg max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0f0f0f] z-10">
              <h3 className="text-lg sm:text-xl font-black text-[#002B5B] dark:text-white uppercase">
                {editingOfficer ? "Edit Officer" : "Add New Officer"}
              </h3>
              <button 
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} className="dark:text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden flex items-center justify-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={24} className="text-gray-300" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-red-700 file:text-white hover:file:bg-red-800"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Name *</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Enter officer name"
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black text-[#002B5B] dark:text-white text-sm font-bold focus:border-red-700 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Position *</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="e.g. Organization Secretary"
                    value={formData.position} 
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })} 
                    className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black text-[#002B5B] dark:text-white text-sm font-bold focus:border-red-700 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Department *</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="e.g. Organization Department"
                    value={formData.department} 
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })} 
                    className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black text-[#002B5B] dark:text-white text-sm font-bold focus:border-red-700 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Message</label>
                <div className="relative">
                  <MessageSquare size={18} className="absolute left-4 top-4 text-gray-400" />
                  <textarea 
                    placeholder="Enter a short message from the officer"
                    value={formData.message} 
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })} 
                    rows={3}
                    className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black text-[#002B5B] dark:text-white text-sm font-bold focus:border-red-700 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43210"
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black text-[#002B5B] dark:text-white text-sm font-bold focus:border-red-700 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full py-4 bg-[#002B5B] dark:bg-red-700 text-white rounded-xl font-black uppercase text-xs sm:text-sm tracking-[0.2em] transition-all disabled:opacity-50 hover:bg-black shadow-xl flex items-center justify-center gap-3 active:scale-95"
              >
                {submitting ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Plus size={18} /> {editingOfficer ? "Update Officer" : "Add Officer"}</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerManagement;
