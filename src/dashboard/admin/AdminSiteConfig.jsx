import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Globe, Save, Zap, Loader2, CheckCircle, XCircle, Bell, Shield, Palette, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

const AdminSiteConfig = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("general");

  const [config, setConfig] = useState({
    // General Settings
    siteName: "Crime Information Bureau",
    siteTagline: "Your Trusted Security Partner",
    maintenanceMode: false,
    registrationOpen: true,
    
    // Contact Settings
    contactEmail: "info@cib.in",
    contactPhone: "+91 1234567890",
    contactAddress: "New Delhi, India",
    
    // Social Settings
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    
    // News Ticker
    newsTicker: "CIB Update: High-level security meeting scheduled...",
    tickerEnabled: true,
    
    // Footer Settings
    footerText: "© 2024 Crime Information Bureau. All rights reserved.",
    footerLinks: []
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const docRef = doc(db, "siteConfig", "main");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(prev => ({ ...prev, ...docSnap.data() }));
      }
    } catch (error) {
      console.log("Error loading config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await setDoc(doc(db, "siteConfig", "main"), {
        ...config,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setMessage({ type: "success", text: "Site configuration saved successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error saving config:", error);
      setMessage({ type: "error", text: "Failed to save configuration" });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setConfig({ ...config, [field]: value });
    setMessage({ type: "", text: "" });
  };

  const tabs = [
    { id: "general", label: "General", icon: <Globe size={16} /> },
    { id: "contact", label: "Contact", icon: <Phone size={16} /> },
    { id: "social", label: "Social", icon: <Shield size={16} /> },
    { id: "ticker", label: "News Ticker", icon: <Bell size={16} /> },
    { id: "footer", label: "Footer", icon: <Palette size={16} /> }
  ];

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#002B5B] dark:text-white uppercase">Site Configuration</h2>
          <p className="text-gray-500 text-xs sm:text-sm">Manage all site settings from one place</p>
        </div>
        <div className="flex items-center gap-2 bg-red-700/10 text-red-700 px-3 py-1 rounded-full w-fit">
          <Zap size={12} className="animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-widest">Real-time</span>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === "success" 
            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" 
            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
        }`}>
          {message.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs Sidebar */}
        <div className="w-full lg:w-56 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-bold transition-colors ${
                activeTab === tab.id 
                  ? "bg-[#002B5B] text-white" 
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-[#111] rounded-2xl p-6 shadow-lg">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#002B5B] dark:text-white border-b pb-2">
                General Settings
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={config.siteName}
                    onChange={(e) => handleChange("siteName", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:border-red-700 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    Site Tagline
                  </label>
                  <input
                    type="text"
                    value={config.siteTagline}
                    onChange={(e) => handleChange("siteTagline", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:border-red-700 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black rounded-xl">
                  <div>
                    <p className="font-bold text-sm text-[#002B5B] dark:text-white">Maintenance Mode</p>
                    <p className="text-xs text-gray-500">Show maintenance page to visitors</p>
                  </div>
                  <button
                    onClick={() => handleChange("maintenanceMode", !config.maintenanceMode)}
                    className={`w-12 h-6 rounded-full transition-colors ${config.maintenanceMode ? "bg-red-700" : "bg-gray-300"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${config.maintenanceMode ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black rounded-xl">
                  <div>
                    <p className="font-bold text-sm text-[#002B5B] dark:text-white">Registration Open</p>
                    <p className="text-xs text-gray-500">Allow new user registrations</p>
                  </div>
                  <button
                    onClick={() => handleChange("registrationOpen", !config.registrationOpen)}
                    className={`w-12 h-6 rounded-full transition-colors ${config.registrationOpen ? "bg-green-600" : "bg-gray-300"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${config.registrationOpen ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#002B5B] dark:text-white border-b pb-2">
                Contact Settings
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    <Mail size={14} className="inline mr-1" /> Contact Email
                  </label>
                  <input
                    type="email"
                    value={config.contactEmail}
                    onChange={(e) => handleChange("contactEmail", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:border-red-700 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    <Phone size={14} className="inline mr-1" /> Contact Phone
                  </label>
                  <input
                    type="text"
                    value={config.contactPhone}
                    onChange={(e) => handleChange("contactPhone", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:border-red-700 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    Address
                  </label>
                  <textarea
                    value={config.contactAddress}
                    onChange={(e) => handleChange("contactAddress", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:border-red-700 focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === "social" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#002B5B] dark:text-white border-b pb-2">
                Social Media Links
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={config.facebookUrl}
                    onChange={(e) => handleChange("facebookUrl", e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:border-red-700 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    Twitter/X URL
                  </label>
                  <input
                    type="url"
                    value={config.twitterUrl}
                    onChange={(e) => handleChange("twitterUrl", e.target.value)}
                    placeholder="https://twitter.com/..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:border-red-700 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={config.instagramUrl}
                    onChange={(e) => handleChange("instagramUrl", e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:border-red-700 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={config.youtubeUrl}
                    onChange={(e) => handleChange("youtubeUrl", e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:border-red-700 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Ticker Tab */}
          {activeTab === "ticker" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#002B5B] dark:text-white border-b pb-2">
                News Ticker Settings
              </h3>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black rounded-xl">
                <div>
                  <p className="font-bold text-sm text-[#002B5B] dark:text-white">Enable News Ticker</p>
                  <p className="text-xs text-gray-500">Show scrolling news on homepage</p>
                </div>
                <button
                  onClick={() => handleChange("tickerEnabled", !config.tickerEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${config.tickerEnabled ? "bg-green-600" : "bg-gray-300"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${config.tickerEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                  Ticker Content
                </label>
                <textarea 
                  value={config.newsTicker} 
                  onChange={(e) => handleChange("newsTicker", e.target.value)} 
                  placeholder="Enter announcement text..."
                  className="w-full bg-gray-50 dark:bg-black p-4 rounded-2xl text-sm font-bold outline-none border border-gray-200 dark:border-white/10 h-32 resize-none focus:border-red-700 dark:focus:border-red-700 transition-all shadow-inner text-[#002B5B] dark:text-gray-200" 
                />
              </div>
            </div>
          )}

          {/* Footer Tab */}
          {activeTab === "footer" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#002B5B] dark:text-white border-b pb-2">
                Footer Settings
              </h3>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                  Footer Copyright Text
                </label>
                <textarea
                  value={config.footerText}
                  onChange={(e) => handleChange("footerText", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:border-red-700 focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-red-700 hover:bg-[#002B5B] dark:hover:bg-red-800 text-white py-4 rounded-2xl font-black uppercase text-xs sm:text-sm tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] group disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Save size={18} className="group-hover:rotate-12 transition-transform" /> 
                  Save Configuration
                </>
              )}
            </button>
            <p className="text-center text-[8px] sm:text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest pt-4">
              Authorized Personnel Only • Configuration v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSiteConfig;
