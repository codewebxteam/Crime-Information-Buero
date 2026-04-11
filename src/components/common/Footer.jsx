import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, ShieldCheck, ExternalLink, ArrowRight } from 'lucide-react';
import { db } from '../../firebase/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import cibiLogo from '../../assets/logo.png';

const Footer = () => {
  // --- SITE CONFIG STATE ---
  const [config, setConfig] = useState({
    contactEmail: "cibindia11@gmail.com",
    contactPhone: "+91 94535 91912",
    contactAddress: "Head Office: 29 States Operational, Central Command, India",
    footerText: "© 2026 Crime Information Bureau. All Rights Reserved.",
    facebookUrl: "#",
    twitterUrl: "#",
    instagramUrl: "#",
    youtubeUrl: "#"
  });

  // --- FETCH CONFIG REAL-TIME ---
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "siteConfig", "main"), (snap) => {
      if (snap.exists()) {
        setConfig(prev => ({ ...prev, ...snap.data() }));
      }
    });
    return () => unsub();
  }, []);

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // 🔥 SOCIAL LINKS MAPPING
  const socialMedia = [
    { Icon: Facebook, url: config.facebookUrl },
    { Icon: Twitter, url: config.twitterUrl },
    { Icon: Instagram, url: config.instagramUrl },
    { Icon: Youtube, url: config.youtubeUrl },
  ];

  return (
    <footer className="bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-white pt-20 pb-10 border-t-4 border-red-700 overflow-hidden relative transition-colors duration-500">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] hidden dark:block"></div>

      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
        <div className="bg-[#f8f9fa] dark:bg-gradient-to-r dark:from-red-900/40 dark:to-black border border-gray-200 dark:border-white/10 p-8 md:p-12 rounded-[3rem] mb-20 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl dark:shadow-2xl">
          <div className="space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-red-700/10 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
              <span className="w-2 h-2 bg-red-700 rounded-full animate-pulse"></span> Bureau Mandate
            </div>
            <h2 className="text-3xl md:text-5xl font-[1000] italic uppercase tracking-tighter leading-none text-[#002B5B] dark:text-white">
              Stay Up-To-Date <br />
              <span className="text-red-600 not-italic">With Our Movements.</span>
            </h2>
          </div>
          
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-black/50 p-4 md:p-6 rounded-[2rem] border border-gray-200 dark:border-white/10">
            <div className="text-center sm:text-right pr-0 sm:pr-4 border-r-0 sm:border-r border-gray-200 dark:border-white/10">
              <p className="text-[#002B5B] dark:text-white font-black uppercase text-sm md:text-base tracking-widest">"Satyameva Jayate"</p>
              <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[9px] tracking-[0.2em] mt-1">Truth Alone Triumphs</p>
            </div>
            <Link to="/contact" onClick={handleLinkClick} className="bg-red-700 hover:bg-[#002B5B] dark:hover:bg-white dark:hover:text-red-700 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg group">
              Contact HQ <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img src={cibiLogo} alt="Logo" className="h-14 w-auto dark:grayscale dark:brightness-200" />
              <div>
                <h3 className="text-xl font-black italic uppercase leading-none tracking-tighter text-[#002B5B] dark:text-white">Crime<span className="text-red-600">India</span></h3>
                <h4 className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Information Bureau</h4>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs font-bold leading-relaxed uppercase tracking-tight italic border-l-2 border-red-700 pl-3">
              "Working tirelessly since 2012 to eliminate corruption and crime through organizational unity and digital intelligence."
            </p>
            
            {/* 🔥 DYNAMIC SOCIAL MEDIA LINKS */}
            <div className="flex gap-4 mt-4">
              {socialMedia.map(({ Icon, url }, i) => (
                <a 
                  key={i} 
                  href={url && url !== "" ? url : "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-red-700 hover:text-white transition-all border border-gray-200 dark:border-white/5 text-gray-600 dark:text-white"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-red-600 font-black uppercase tracking-[0.3em] text-[11px] mb-8 border-b border-gray-200 dark:border-white/10 pb-3">Bureau Portal</h4>
            <ul className="space-y-4">
              {['About CIB', 'Join Bureau', 'CIB Rules', 'Public Awareness', 'Legal Literacy'].map((item, idx) => (
                <li key={idx}>
                  <Link to={['/about', '/user', '/rules', '/news', '/laws'][idx]} onClick={handleLinkClick} className="text-gray-600 dark:text-gray-400 hover:text-red-700 dark:hover:text-white transition-colors text-xs font-bold uppercase flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-red-700 rounded-full scale-0 group-hover:scale-100 transition-all"></span>{item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-red-600 font-black uppercase tracking-[0.3em] text-[11px] mb-8 border-b border-gray-200 dark:border-white/10 pb-3">Official Contact</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin className="text-red-700 shrink-0" size={20} />
                <p className="text-gray-600 dark:text-gray-400 text-xs font-bold uppercase leading-relaxed">{config.contactAddress}</p>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="text-red-700 shrink-0" size={20} /><p className="text-gray-600 dark:text-gray-400 text-xs font-bold tracking-widest">{config.contactPhone}</p>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="text-red-700 shrink-0" size={20} /><p className="text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">{config.contactEmail}</p>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center lg:items-end">
            <div className="p-8 bg-[#f8f9fa] dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] text-center space-y-4 w-full shadow-sm dark:shadow-none">
              <ShieldCheck size={48} className="text-red-700 mx-auto" />
              <h5 className="text-[10px] font-black uppercase tracking-widest leading-tight text-[#002B5B] dark:text-white">Official Criminal <br /> Information Provider</h5>
              <div className="w-full h-1 bg-gray-200 dark:bg-red-700/20 rounded-full overflow-hidden"><div className="w-2/3 h-full bg-red-700"></div></div>
              <p className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase italic">Registered NGO | Est. 2012</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest text-center md:text-left">
            {config.footerText} <br /><span className="text-[8px] opacity-50 italic">Justice through Awareness & Information.</span>
          </p>
          <div className="flex flex-wrap justify-center gap-8">
  {/* Contact Us */}
  <Link 
    to="/contact" 
    onClick={handleLinkClick} 
    className="text-gray-500 hover:text-red-700 dark:hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
  >
    Contact Us <ExternalLink size={12} />
  </Link>

  {}
  <Link 
    to="/about" 
    onClick={handleLinkClick} 
    className="text-gray-500 hover:text-red-700 dark:hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
  >
    Privacy Policy <ExternalLink size={12} />
  </Link>

  {}
  <Link 
    to="/about" 
    onClick={handleLinkClick} 
    className="text-gray-500 hover:text-red-700 dark:hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
  >
    Terms of Use <ExternalLink size={12} />
  </Link>
</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;