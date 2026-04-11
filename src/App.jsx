import React, { useState, useEffect, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';
import './App.css';
import Navbar from './components/common/Navbar'; 
import Hero from './components/home/Hero';
import Gallery from './components/home/Gallery';
import FullGallery from './pages/FullGallery';
import FileReport from './pages/FileReport';
import Founders from './components/home/Founders'; 
import NationalMessage from './components/home/NationalMessage'; 
import Disclaimer from './pages/Disclaimer';
import Footer from './components/common/Footer';

// Firebase Imports
import { db } from './firebase/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// Imports
import Language from './components/language/Language'; 
import Chatbot from './components/common/Chatbot';
import BureauStatus from './features/bureau/BureauStatus'; 
import AboutCIB from './components/home/AboutCIB';
import CIBOfficer from './dashboard/officer/CIBOfficer';
import Rules from './pages/Rules'; 
import Contact from './pages/Contact';
import Donate from './pages/Donate';
import Law from './pages/Law';
import News from './pages/News';
import LoginPage from './pages/LoginPage';
import AdminLogin from './dashboard/admin/AdminLogin';
import AdminDashboard from './dashboard/admin/AdminDashboard'; 
import User from './dashboard/user/User';
import MemberDashboard from './dashboard/member/MemberDashboard';
import { AdminProtectedRoute, MemberProtectedRoute } from './components/common/ProtectedRoutes';
import { AnchorProtectedRoute } from './components/common/AnchorProtectedRoute';
import AnchorDashboard from './dashboard/anchor/AnchorDashboard';

// 1. Lenis Smooth Scroll Helper
const SmoothScroll = ({ children }) => {
  useLayoutEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};

//  2. ScrollToTop Helper Component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function HomePage() {
  return (
    <>
      <Hero />
      <Gallery />
      <Founders /> 
      <NationalMessage /> 
      <Disclaimer/>
    </>
  );
}

// 3. Layout Wrapper with Dynamic Ticker Logic
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  
  // Dashboard paths check
  const isAdminPath = location.pathname.toLowerCase().startsWith('/dashboard') || 
                      location.pathname.toLowerCase().startsWith('/admin') ||
                      location.pathname.toLowerCase().startsWith('/member') ||
                      location.pathname.toLowerCase().startsWith('/anchor');

  // 🔥 LIVE TICKER STATE
  const [tickerConfig, setTickerConfig] = useState({
    newsTicker: "",
    tickerEnabled: false 
  });

  useEffect(() => {
    // Real-time listener for Site Configuration
    const unsub = onSnapshot(doc(db, "siteConfig", "main"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTickerConfig({
          newsTicker: data.newsTicker || "",
          // Strict boolean check for the toggle
          tickerEnabled: data.tickerEnabled === true 
        });
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f0f0f] font-sans text-gray-900 dark:text-gray-100 transition-colors duration-500 relative">
      {!isAdminPath && <Navbar />}
      
      {/* 🔥 DYNAMIC TICKER STRIP (Visible only if enabled AND text exists) */}
      {!isAdminPath && tickerConfig.tickerEnabled && tickerConfig.newsTicker && (
        <div className="bg-[#1a1a1a] dark:bg-black text-white py-3 overflow-hidden border-b border-gray-800 dark:border-red-900/20 shadow-lg">
          <div className="max-w-[1600px] mx-auto px-6 flex items-center">
            <span className="bg-red-600 text-[10px] md:text-[11px] font-black px-3 py-1 rounded-sm mr-6 animate-pulse uppercase tracking-tighter shrink-0">
              Breaking News
            </span>
            
            <div className="overflow-hidden relative w-full">
               <marquee scrollamount="5" className="text-[13px] md:text-[14px] font-bold tracking-wide italic opacity-95">
                 {tickerConfig.newsTicker} &nbsp; • &nbsp; {tickerConfig.newsTicker} &nbsp; • &nbsp; {tickerConfig.newsTicker}
               </marquee>
            </div>
          </div>
        </div>
      )}

      <main>{children}</main>

      {!isAdminPath && <Footer />}
      {!isAdminPath && <BureauStatus />}
      
      {!isAdminPath && (
        <>
          <div className="fixed bottom-6 left-6 z-[9999]">
            <Language />
          </div>

          <div className="fixed bottom-6 right-6 z-[9999]">
            <Chatbot />
          </div>
        </>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop /> 
      <SmoothScroll>
        <LayoutWrapper>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/gallery" element={<FullGallery />} /> 
            <Route path="/about" element={<AboutCIB />} />
            <Route path="/officers" element={<CIBOfficer />} />
            <Route path="/file-report" element={<FileReport />} />
            <Route path="/laws" element={<Law />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/news" element={<News />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/anchor/login" element={<Navigate to="/anchor/dashboard" replace />} />
            <Route path="/user" element={<User />} />
            <Route path="/member/register" element={<User />} />
            
            {/* Admin Dashboards */}
            <Route path="/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/admin/*" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            
            {/* Member Dashboards */}
            <Route path="/member/dashboard" element={<MemberProtectedRoute><MemberDashboard /></MemberProtectedRoute>} />
            <Route path="/member/profile" element={<MemberProtectedRoute><MemberDashboard initialTab="profile" /></MemberProtectedRoute>} />
            <Route path="/member/documents" element={<MemberProtectedRoute><MemberDashboard initialTab="documents" /></MemberProtectedRoute>} />
            <Route path="/member/*" element={<MemberProtectedRoute><MemberDashboard /></MemberProtectedRoute>} />
            
            {/* Anchor Dashboards */}
            <Route path="/anchor/dashboard" element={<AnchorProtectedRoute><AnchorDashboard /></AnchorProtectedRoute>} />
            <Route path="/anchor/*" element={<AnchorProtectedRoute><AnchorDashboard /></AnchorProtectedRoute>} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LayoutWrapper>
      </SmoothScroll>
    </Router>
  );
}

export default App;