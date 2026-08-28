import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { Home, Shield, Newspaper, Gavel, Mail, User, BookOpen, Sun, Moon, ChevronDown, Menu, X, Heart, LogOut, UserCircle, Image as ImageIcon } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion'; 
import cibiLogo from '../../assets/logo.png'; 
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/firebase';
import { signOut } from 'firebase/auth'; 

import Language from '../language/Language'; 

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCibOpen, setIsCibOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false); // New state for mobile dropdown
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' ? true : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark'); 
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light'); 
    }
  }, [isDarkMode]);

  const isMember = user?.role === 'member';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowUserMenu(false);
      localStorage.removeItem('memberAuth');
      localStorage.removeItem('cib_member_data');
      navigate('/login', { replace: true });
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const cibSubMenu = [
    { name: "About CIB", link: "/about", icon: <Shield size={14} /> },
    { name: "CIB Officer", link: "/officers", icon: <User size={14} /> },
    { name: "CIB Rules", link: "/rules", icon: <BookOpen size={14} /> },
    { name: "Legal Laws", link: "/laws", icon: <Gavel size={14} /> },
    { name: "Contact Us", link: "/contact", icon: <Mail size={14} /> },
    { name: "Membership", link: "/user", icon: <User size={14} /> },
  ];

  return (
    <header className="bg-[#f8f9fa] dark:bg-[#0f0f0f] sticky top-0 z-50 shadow-sm font-serif transition-all duration-300 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between relative">
        
        {/* 1. LEFT: Logo & Brand */}
        <Link to="/" className="flex items-center gap-3 shrink-0 cursor-pointer">
          <img src={cibiLogo} alt="CIB Logo" className="h-12 md:h-18 w-auto object-contain transition-transform duration-300 hover:scale-105" />
          <div className="border-l-2 border-gray-300 dark:border-gray-800 pl-3 text-left flex flex-col justify-center">
            <h1 className="text-lg md:text-xl font-black tracking-tighter italic uppercase leading-none text-[#002B5B] dark:text-white text-nowrap">
              <span className="font-serif">Crime</span>
            </h1>
            <p className="text-sm md:text-base font-black text-red-700 dark:text-red-600 tracking-widest uppercase mt-0.5">Information Bureau</p>
          </div>
        </Link>

        {/* 2. CENTER: Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-2 bg-[#f1f3f5] dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-2 rounded-2xl shadow-inner">
          <Link to="/" className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-black uppercase tracking-widest rounded-xl transition-all ${location.pathname === '/' ? 'bg-red-700 text-white shadow-md' : 'text-gray-700 dark:text-gray-200 hover:text-red-700'}`}>
            <Home size={15} /> Home
          </Link>

          <div className="relative" onMouseEnter={() => setIsCibOpen(true)} onMouseLeave={() => setIsCibOpen(false)}>
            <button className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-black uppercase tracking-widest rounded-xl transition-all ${isCibOpen ? 'bg-red-700 text-white shadow-md' : 'text-gray-700 dark:text-gray-200 hover:text-red-700'}`}>
              <Shield size={15} /> Services <ChevronDown size={14} className={`transition-transform duration-300 ${isCibOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`absolute left-0 mt-2 w-52 bg-[#f8f9fa] dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 shadow-2xl py-3 z-[100] rounded-2xl transition-all duration-300 ${isCibOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
              {cibSubMenu.map((sub, index) => (
                <Link key={index} to={sub.link} className="flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-red-900/20 hover:text-red-700 transition-all">
                  {sub.icon} {sub.name}
                </Link>
              ))}
            </div>
          </div>

          <Link to="/news" className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-black uppercase tracking-widest rounded-xl transition-all ${location.pathname === '/news' ? 'bg-red-700 text-white shadow-md' : 'text-gray-700 dark:text-gray-200 hover:text-red-700'}`}>
            <Newspaper size={15} /> News
          </Link>
          
          <Link to="/gallery" className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-black uppercase tracking-widest rounded-xl transition-all ${location.pathname === '/gallery' ? 'bg-red-700 text-white shadow-md' : 'text-gray-700 dark:text-gray-200 hover:text-red-700'}`}>
            <ImageIcon size={15} /> Gallery
          </Link>
          
          <Link to="/donate" className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-black uppercase tracking-widest rounded-xl transition-all ${location.pathname === '/donate' ? 'bg-red-700 text-white shadow-md' : 'text-red-700 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'} border border-transparent hover:border-red-200`}>
            <Heart size={15} fill="currentColor" className="opacity-80" /> Donate
          </Link>
        </nav>

        {/* 3. RIGHT: Controls */}
        <div className="flex items-center gap-4">
          {isMember ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="hidden lg:flex items-center gap-2 bg-red-700 text-white text-[11px] font-black px-4 py-3 rounded-2xl hover:bg-red-800 transition-all shadow-lg active:scale-95"
              >
                <UserCircle size={18} />
                <span className="uppercase">{user?.name?.split(' ')[0] || 'Profile'}</span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-700 py-2 z-50">
                  <Link 
                    to="/member/dashboard" 
                    className="block px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Dashboard
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login?type=member" 
              className="hidden lg:flex items-center gap-2 bg-[#002B5B] dark:bg-red-700 text-white text-[11px] font-black px-6 py-3 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95 uppercase"
            >
              <User size={14} /> Join
            </Link>
          )}

          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-2xl bg-[#f1f3f5] dark:bg-white/10 text-gray-800 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-white/20 transition-all border border-gray-200 dark:border-white/10">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="xl:hidden p-2 text-gray-900 dark:text-white transition-all z-[60]">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* 4. MOBILE MENU DRAWER */}
      <div className={`xl:hidden fixed inset-0 top-[70px] bg-[#f8f9fa] dark:bg-[#0f0f0f] z-[50] transition-all duration-500 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="flex flex-col p-8 gap-6 h-[calc(100vh-70px)] overflow-y-auto pb-24 font-sans">
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/" className="flex items-center gap-4 text-xl font-black uppercase text-[#002B5B] dark:text-white border-b border-gray-200 dark:border-gray-800 pb-4">
            <Home /> Home
          </Link>
          
          {/* Mobile Dropdown for Services */}
          <div className="flex flex-col border-b border-gray-200 dark:border-gray-800 pb-4">
            <button 
              onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
              className="flex items-center justify-between w-full text-xl font-black uppercase text-red-700"
            >
              <span className="flex items-center gap-4"><Shield /> Services</span>
              <ChevronDown className={`transition-transform duration-300 ${isMobileServicesOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isMobileServicesOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden flex flex-col gap-4 mt-4"
                >
                  {cibSubMenu.map((sub, i) => (
                    <Link 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      key={i} 
                      to={sub.link} 
                      className="pl-12 text-lg font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2 hover:text-red-700 transition-colors"
                    >
                      {sub.icon} {sub.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link onClick={() => setIsMobileMenuOpen(false)} to="/news" className="flex items-center gap-4 text-xl font-black uppercase text-[#002B5B] dark:text-white border-b border-gray-200 dark:border-gray-800 pb-4">
            <Newspaper /> News
          </Link>

          <Link onClick={() => setIsMobileMenuOpen(false)} to="/gallery" className="flex items-center gap-4 text-xl font-black uppercase text-[#002B5B] dark:text-white border-b border-gray-200 dark:border-gray-800 pb-4">
            <ImageIcon /> Gallery
          </Link>

          {isMember ? (
            <div className="flex flex-col gap-4">
              <Link 
                to="/member/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="w-full flex justify-center items-center gap-3 bg-red-700 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl"
              >
                <UserCircle size={20} /> My Dashboard
              </Link>
              <button 
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} 
                className="w-full flex justify-center items-center gap-3 border-2 border-red-700 text-red-700 py-4 rounded-xl font-black uppercase tracking-widest"
              >
                <LogOut size={20} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link 
                to="/login?type=member" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="w-full flex justify-center items-center gap-3 bg-[#002B5B] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl"
              >
                <User size={20} /> Join
              </Link>
              <Link 
                to="/donate" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="w-full flex justify-center items-center gap-3 border-2 border-red-700 text-red-700 py-4 rounded-xl font-black uppercase tracking-widest"
              >
                <Heart size={20} /> Donate
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="w-full h-[4px] bg-red-700"></div>
    </header>
  );
};

export default Navbar;