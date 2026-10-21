import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import { SiteProvider } from './context/SiteContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastBox from './components/ToastBox';
import LightboxModal from './components/LightboxModal';
import LoginModal from './components/LoginModal';

// Public Pages
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import About from './pages/About';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminServices from './pages/admin/AdminServices';
import AdminLocations from './pages/admin/AdminLocations';
import AdminCampaigns from './pages/admin/AdminCampaigns';
import AdminInquiries from './pages/admin/AdminInquiries';
import AdminMedia from './pages/admin/AdminMedia';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminDatabase from './pages/admin/AdminDatabase';
import AdminSettings from './pages/admin/AdminSettings';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

// Public Layout Wrapper
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FF] text-[#071343] font-jakarta">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <ScrollToTop />
      {/* Global Overlays */}
      <ToastBox />
      <LightboxModal />
      <LoginModal />

      <Routes>
        {/* Public Website Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Admin Login Route (/lexico) */}
        <Route path="/lexico" element={<AdminLogin />} />
        <Route path="/laxico" element={<Navigate to="/lexico" replace />} />
        <Route path="/admin/login" element={<Navigate to="/lexico" replace />} />

        {/* Admin Dashboard & Management Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="locations" element={<AdminLocations />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="database" element={<AdminDatabase />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<PublicLayout />}>
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </SiteProvider>
  );
}
