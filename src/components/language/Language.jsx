import React, { useEffect, useState } from 'react';
import { Languages, Check, Loader2, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Language = () => {
  const [selected, setSelected] = useState('en');
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 1. Check existing cookie to set initial language state
    const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
    if (match && match[1]) {
      const currentLang = match[1].split('/')[2];
      if (currentLang) setSelected(currentLang);
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', includedLanguages: 'en,hi,bn,mr,te,ta,gu,kn,ml,pa', autoDisplay: false },
        'hidden_google_translate_element' 
      );

      // Smart Polling
      let attempts = 0;
      const checkExist = setInterval(() => {
        if (document.querySelector('.goog-te-combo')) {
          setIsEngineReady(true);
          clearInterval(checkExist);
        }
        attempts++;
        if (attempts > 50) clearInterval(checkExist);
      }, 100);
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      setTimeout(() => setIsEngineReady(true), 500);
    }
  }, []);

  const handleTranslate = (code) => {
    setSelected(code);
    setIsOpen(false); // Menu turant band karo

    // METHOD 1: Strong Event Dispatching
    const selectEl = document.querySelector('.goog-te-combo');
    if (selectEl) {
      selectEl.value = code;
      
      // Purane aur naye dono browsers ke liye event trigger (100% working)
      let event;
      if (typeof Event === 'function') {
        event = new Event('change', { bubbles: true, cancelable: true });
      } else {
        event = document.createEvent('HTMLEvents');
        event.initEvent('change', true, true);
      }
      selectEl.dispatchEvent(event);
    }

    // METHOD 2: Ultimate Fallback (Cookie update)
    // Agar Google ka dabangai chala aur usne click nahi mana, toh hum seedha uski memory (cookie) badal denge!
    document.cookie = `googtrans=/en/${code}; path=/`;
    document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname}`;
    
    // Agar upar wale event ne 500ms mein kaam nahi kiya, toh page khud refresh hoke nayi bhasha mein aayega
    setTimeout(() => {
      const isTranslated = document.documentElement.classList.contains('translated-ltr') || document.documentElement.classList.contains('translated-rtl');
      if (!isTranslated && code !== 'en') {
         window.location.reload();
      } else if (code === 'en' && document.documentElement.classList.contains('translated-ltr')) {
         window.location.reload();
      }
    }, 600);
  };

  const langList = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાਤੀ' },
  ];

  return (
    <div className="relative z-[1200] flex flex-col items-start">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-[70px] left-0 bg-white/95 dark:bg-[#111] p-5 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/10 w-[280px] backdrop-blur-md"
          >
            {!isEngineReady && (
              <div className="absolute inset-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-[2rem]">
                <Loader2 className="animate-spin text-red-700 mb-2" size={24} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Initializing AI...</span>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-red-700 p-2 rounded-xl text-white shadow-lg shadow-red-900/20">
                  <Languages size={16} />
                </div>
                <h3 className="text-xs font-black text-[#002B5B] dark:text-white uppercase tracking-tighter italic">
                  Select Language
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
              {langList.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleTranslate(lang.code)}
                  className={`flex flex-col items-start p-2.5 rounded-xl border-2 transition-all relative ${
                    selected === lang.code ? 'border-red-700 bg-red-50/50 dark:bg-red-900/10' : 'border-gray-50 dark:border-white/5 hover:border-red-700/30'
                  }`}
                >
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${selected === lang.code ? 'text-red-700' : 'text-gray-400'}`}>
                    {lang.name}
                  </span>
                  <span className="text-xs font-bold text-[#002B5B] dark:text-white">{lang.native}</span>
                  {selected === lang.code && (
                    <div className="absolute top-1.5 right-1.5 text-red-700"><Check size={12} strokeWidth={4} /></div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#002B5B] dark:bg-white dark:text-[#002B5B] hover:bg-red-700 dark:hover:bg-red-700 hover:text-white text-white rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-all hover:scale-110 active:scale-95"
      >
        {isOpen ? <X size={24} /> : <Globe size={24} />}
      </button>

      {/* ✅ YAHAN FIX KIYA HAI: 'hidden' ya 'display:none' hata kar usko invisible banaya hai */}
      <div className="absolute w-0 h-0 opacity-0 overflow-hidden pointer-events-none -z-50">
        <div id="hidden_google_translate_element"></div>
      </div>

      {/* 👇 NAYI AGGRESSIVE CSS JO BANNER KO HAMESHA KE LIYE GAYAB KAREGI 👇 */}
      <style>{`
        /* 1. Hide the Banner Frame (Old & New Google Classes) */
        iframe.goog-te-banner-frame { display: none !important; }
        .goog-te-banner-frame { display: none !important; }
        .skiptranslate > iframe { display: none !important; }
        
        /* 2. Google's New Modern Banner Classes */
        .VIpgJd-ZVi9od-ORHb-OEVmcd, 
        .VIpgJd-ZVi9od-ORHb, 
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf { display: none !important; }

        /* 3. Stop the website from pushing down */
        body { top: 0px !important; position: static !important; }
        html { top: 0px !important; height: auto !important; }

        /* 4. Hide annoying hover tooltips */
        .goog-tooltip { display: none !important; }
        .goog-tooltip:hover { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
      `}</style>
    </div>
  );
};

export default Language;