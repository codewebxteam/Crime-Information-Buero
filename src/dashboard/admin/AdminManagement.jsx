import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Plus, Search, Trash2, Loader2, Users, XCircle
} from "lucide-react";

// Firebase imports
import { db } from "../../firebase/firebase";
import { 
  collection, getDocs, doc, setDoc, deleteDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { auth } from "../../firebase/firebase";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";

const ADMIN_ROLES = [
  { value: "super_admin", label: "Super Admin", level: 5, color: "bg-red-600" },
  { value: "national_admin", label: "National Admin", level: 4, color: "bg-purple-600" },
  { value: "state_admin", label: "State Admin", level: 3, color: "bg-blue-600" },
  { value: "district_admin", label: "District Admin", level: 2, color: "bg-green-600" },
  { value: "sub_admin", label: "Sub Admin", level: 1, color: "bg-gray-600" },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir"
];

const AdminManagement = ({ currentAdmin }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "district_admin",
    state: "",
    district: ""
  });

  // Fetch all admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "admins"));
      const adminList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAdmins(adminList);
    } catch (error) {
      console.error("Error fetching admins:", error);
      alert("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Check if current admin can manage target role
  const canManageRole = (targetRole) => {
    if (!currentAdmin) return false;
    const currentLevel = ADMIN_ROLES.find(r => r.value === currentAdmin.role)?.level || 0;
    const targetLevel = ADMIN_ROLES.find(r => r.value === targetRole)?.level || 0;
    return currentLevel > targetLevel;
  };

  // Create new admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!canManageRole(formData.role)) {
      alert("You don't have permission to create this role");
      return;
    }

    setIsCreating(true);
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const uid = userCredential.user.uid;

      // Create admin document
      await setDoc(doc(db, "admins", uid), {
        uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        hierarchyLevel: ADMIN_ROLES.find(r => r.value === formData.role)?.level || 0,
        state: formData.state || "",
        district: formData.district || "",
        permissions: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentAdmin?.uid
      });

      // Sign out after creating
      await signOut(auth);

      alert("Admin created successfully!");
      setShowModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "district_admin",
        state: "",
        district: ""
      });
      fetchAdmins();
    } catch (error) {
      console.error("Error creating admin:", error);
      alert(error.message || "Failed to create admin");
    } finally {
      setIsCreating(false);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!confirm(`Are you sure you want to delete admin: ${adminName}?`)) return;
    if (adminId === currentAdmin?.uid) {
      alert("You cannot delete your own account");
      return;
    }

    try {
      await deleteDoc(doc(db, "admins", adminId));
      alert("Admin deleted successfully");
      fetchAdmins();
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert("Failed to delete admin");
    }
  };

  // Filter admins
  const filteredAdmins = admins.filter(admin => 
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get role info
  const getRoleInfo = (role) => ADMIN_ROLES.find(r => r.value === role) || { label: role, color: "bg-gray-600" };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#002B5B] dark:text-white uppercase italic">
            Admin <span className="text-red-700">Management</span>
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
            Manage admin accounts and permissions
          </p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#002B5B] hover:bg-red-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
        >
          <Plus size={16} /> Create Admin
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#111] p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 pl-12 rounded-xl text-sm font-bold focus:border-red-700 outline-none"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {ADMIN_ROLES.slice(0, 5).map(role => (
          <div key={role.value} className="bg-white dark:bg-[#111] p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${role.color} flex items-center justify-center`}>
                <Shield size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase">{role.label}</p>
                <p className="text-xl font-black text-[#002B5B] dark:text-white">
                  {admins.filter(a => a.role === role.value).length}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin List */}
      <div className="bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-black/50">
              <tr>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin</th>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">State</th>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">District</th>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <Users size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 font-bold">No admins found</p>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map(admin => {
                  const roleInfo = getRoleInfo(admin.role);
                  const canManage = canManageRole(admin.role);
                  return (
                    <tr key={admin.id} className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="p-4">
                        <div>
                          <p className="font-black text-[#002B5B] dark:text-white">{admin.name}</p>
                          <p className="text-xs text-gray-400">{admin.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${roleInfo.color} text-white`}>
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-500">{admin.state || "-"}</td>
                      <td className="p-4 text-sm font-bold text-gray-500">{admin.district || "-"}</td>
                      <td className="p-4">
                        {canManage && admin.id !== currentAdmin?.uid ? (
                          <button
                            onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-black uppercase">No Access</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div 
            initial={{ scale: 0.9 }} 
            animate={{ scale: 1 }} 
            className="bg-white dark:bg-[#111] w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div className="bg-[#002B5B] p-6 text-white flex justify-between items-center">
              <h3 className="font-black uppercase italic tracking-tighter text-lg">Create New Admin</h3>
              <button onClick={() => setShowModal(false)} className="hover:bg-white/10 p-2 rounded-lg">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="p-8 space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 rounded-2xl text-sm font-bold focus:border-red-700 outline-none"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 rounded-2xl text-sm font-bold focus:border-red-700 outline-none"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 rounded-2xl text-sm font-bold focus:border-red-700 outline-none"
                  placeholder="Min 6 characters"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 rounded-2xl text-sm font-bold focus:border-red-700 outline-none"
                >
                  {ADMIN_ROLES.filter(r => canManageRole(r.value)).map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 rounded-2xl text-sm font-bold focus:border-red-700 outline-none"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 rounded-2xl text-sm font-bold focus:border-red-700 outline-none"
                    placeholder="District"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-[#002B5B] hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm mt-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="animate-spin" /> : <><Plus size={16} /> Create Admin</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
