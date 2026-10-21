import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import { SiteProvider, useSite } from './context/SiteContext';

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

// Route metadata updater (Scroll, Dynamic Canonical URL, Title, OG URL, Twitter URL)
function RouteMetadataUpdater() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 1. Authoritative Canonical URL across all domains pointing to primary lexicoadvertising.com
    const cleanPath = pathname === '/' ? '' : pathname.replace(/\/$/, '');
    const canonicalHref = `https://lexicoadvertising.com${cleanPath}`;

    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalHref);

    // 2. Dynamic OpenGraph URL
    let ogUrl = document.querySelector("meta[property='og:url']");
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', canonicalHref);

    // 3. Dynamic Twitter URL
    let twitterUrl = document.querySelector("meta[name='twitter:url']");
    if (!twitterUrl) {
      twitterUrl = document.createElement('meta');
      twitterUrl.setAttribute('name', 'twitter:url');
      document.head.appendChild(twitterUrl);
    }
    twitterUrl.setAttribute('content', canonicalHref);

    // 3. Dynamic Page Titles for SEO
    const pageTitles = {
      '/': 'Laxico Advertising — Billboard & Poster Placements Across India',
      '/services': 'Outdoor Media Services & Inventory — Laxico Advertising',
      '/portfolio': 'Portfolio & Live Campaign Gallery — Laxico Advertising',
      '/contact': 'Request Media Plan & Pricing Quote — Laxico Advertising',
      '/about': 'About Laxico Advertising — India-Wide Outdoor Network',
      '/lexico': 'Admin Portal Login — Laxico Advertising'
    };

    if (pageTitles[pathname]) {
      document.title = pageTitles[pathname];
    } else if (pathname.startsWith('/services/')) {
      document.title = 'Service Details & Availability — Laxico Advertising';
    }
  }, [pathname]);

  return null;
}

// Public Layout Wrapper
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FF] text-[#071343] font-jakarta">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-laxRed-600 focus:text-white focus:px-4 focus:py-2.5 focus:rounded-xl focus:shadow-2xl focus:font-extrabold focus:outline-none"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" role="main" tabIndex="-1" className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Synchronous Route Guard for Admin Panel (Blocks any unauthorized direct link access)
function AdminProtectedRoute({ children }) {
  const { isAdmin } = useSite();
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to="/lexico" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export default function App() {
  return (
    <SiteProvider>
      <RouteMetadataUpdater />
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

        {/* Admin Dashboard & Management Routes (Strictly Protected) */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
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
