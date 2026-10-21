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
import CategoryListings from './pages/CategoryListings';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminServices from './pages/admin/AdminServices';
import AdminUploadServices from './pages/admin/AdminUploadServices';
import AdminListings from './pages/admin/AdminListings';
import AdminLocations from './pages/admin/AdminLocations';
import AdminCampaigns from './pages/admin/AdminCampaigns';
import AdminInquiries from './pages/admin/AdminInquiries';
import AdminMedia from './pages/admin/AdminMedia';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminDatabase from './pages/admin/AdminDatabase';
import AdminSettings from './pages/admin/AdminSettings';

// Comprehensive Route metadata updater (Scroll, Multi-domain Canonical, Hreflang, Titles, OG/Twitter, Robots Guard)
function RouteMetadataUpdater() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Determine current host domain via environment or window location
    const host = window.location.hostname || '';
    const configuredPrimary = (import.meta.env.VITE_SITE_URL || 'https://lexicoadvertising.com').replace(/\/$/, '');
    const configuredIn = (import.meta.env.VITE_IN_SITE_URL || 'https://lexicoadvertising.in').replace(/\/$/, '');
    const configuredOrg = (import.meta.env.VITE_ORG_SITE_URL || 'https://lexicoadvertising.org').replace(/\/$/, '');

    let currentDomain = configuredPrimary;
    if (host.endsWith('.in') || host.includes('lexicoadvertising.in')) {
      currentDomain = configuredIn;
    } else if (host.endsWith('.org') || host.includes('lexicoadvertising.org')) {
      currentDomain = configuredOrg;
    }

    const cleanPath = pathname === '/' ? '' : pathname.replace(/\/$/, '');
    const canonicalHref = `${currentDomain}${cleanPath}`;
    const primaryComHref = `${configuredPrimary}${cleanPath}`;
    const inHref = `${configuredIn}${cleanPath}`;
    const orgHref = `${configuredOrg}${cleanPath}`;

    // 1. Authoritative Canonical URL
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalHref);

    // 2. Multi-domain Hreflang Alternates (.com, .in, .org)
    const hreflangDefs = [
      { lang: 'x-default', href: primaryComHref },
      { lang: 'en-IN', href: inHref },
      { lang: 'en-US', href: primaryComHref },
      { lang: 'en', href: primaryComHref },
      { lang: 'en-GB', href: orgHref }
    ];

    hreflangDefs.forEach(({ lang, href }) => {
      let link = document.querySelector(`link[rel='alternate'][hreflang='${lang}']`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', lang);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    });

    // 3. Dynamic Page Titles & Descriptions
    const pageTitles = {
      '/': 'Laxico Advertising — Billboard & Poster Placements Across India',
      '/services': 'Outdoor Media Services & Inventory — Laxico Advertising',
      '/portfolio': 'Portfolio & Live Campaign Gallery — Laxico Advertising',
      '/contact': 'Request Media Plan & Pricing Quote — Laxico Advertising',
      '/about': 'About Laxico Advertising — India-Wide Outdoor Network',
      '/terms': 'Terms & Conditions — Laxico Advertising',
      '/privacy': 'Privacy Policy — Laxico Advertising',
      '/lexico': 'Admin Portal Login — Laxico Advertising'
    };

    const pageDescriptions = {
      '/': 'Laxico Advertising manages 250+ premium billboard, metro, airport, transit and digital LED DOOH placements across Delhi NCR, Mumbai, Bengaluru, and Hyderabad.',
      '/services': 'Explore all outdoor media placements including metro trains, highway unipoles, cinema ads, airport banners, and DOOH LED networks across India.',
      '/portfolio': 'View live campaigns executed for Nike, Zomato, Samsung, HDFC Bank, Coca-Cola and national brands with verified footfall reporting.',
      '/contact': 'Request customized outdoor media proposals, real-time rates, and geo-tagged site availability within 4 working hours.',
      '/about': 'Since 2025, Laxico Advertising connects national brands with prime outdoor real-estate across Delhi NCR, Mumbai, Bengaluru, and Hyderabad.',
      '/terms': 'Official terms and conditions governing advertising placement bookings, billing, and campaign execution with Laxico Advertising.',
      '/privacy': 'Privacy policy outlining how Laxico Advertising collects, safeguards, and handles customer campaign inquiry data.'
    };

    let title = pageTitles[pathname];
    let desc = pageDescriptions[pathname];

    if (!title) {
      if (pathname.startsWith('/category/') || pathname.startsWith('/listings/category/') || pathname.startsWith('/listings/')) {
        const parts = pathname.split('/');
        const catName = decodeURIComponent(parts[parts.length - 1] || 'Transit');
        title = `${catName} Advertising & Media Placements — Laxico Advertising`;
        desc = `Book premium ${catName} advertising sites across Delhi NCR, Mumbai, Bengaluru, and Hyderabad with verified footfall and 48-hour launch.`;
      } else if (pathname.startsWith('/services/')) {
        title = 'Service Details & Real-Time Availability — Laxico Advertising';
        desc = 'View media specifications, audience impressions, pricing rates, and verified location listings across India.';
      } else if (pathname.startsWith('/admin')) {
        title = 'Admin Control Panel — Laxico Advertising';
        desc = 'Internal administrative management portal.';
      } else {
        title = 'Laxico Advertising — Billboard & Poster Placements Across India';
        desc = 'Billboard, metro, airport, transit and digital LED DOOH placements across India.';
      }
    }

    document.title = title;

    // 4. Meta Description
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    if (desc) metaDesc.setAttribute('content', desc);

    // 5. OpenGraph & Twitter Tags
    let ogUrl = document.querySelector("meta[property='og:url']");
    if (ogUrl) ogUrl.setAttribute('content', canonicalHref);

    let ogTitle = document.querySelector("meta[property='og:title']");
    if (ogTitle) ogTitle.setAttribute('content', title);

    let ogDesc = document.querySelector("meta[property='og:description']");
    if (ogDesc && desc) ogDesc.setAttribute('content', desc);

    let twitterUrl = document.querySelector("meta[name='twitter:url']");
    if (twitterUrl) twitterUrl.setAttribute('content', canonicalHref);

    let twitterTitle = document.querySelector("meta[name='twitter:title']");
    if (twitterTitle) twitterTitle.setAttribute('content', title);

    let twitterDesc = document.querySelector("meta[name='twitter:description']");
    if (twitterDesc && desc) twitterDesc.setAttribute('content', desc);

    // 6. Robots Tag: noindex for Admin routes to protect crawl budget
    let metaRobots = document.querySelector("meta[name='robots']");
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    if (pathname.startsWith('/admin') || pathname.startsWith('/lexico')) {
      metaRobots.setAttribute('content', 'noindex, nofollow');
    } else {
      metaRobots.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }
  }, [pathname]);

  return null;
}

// Public Layout Wrapper
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FF] text-[#071343] font-jakarta w-full max-w-full overflow-x-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-laxRed-600 focus:text-white focus:px-4 focus:py-2.5 focus:rounded-xl focus:shadow-2xl focus:font-extrabold focus:outline-none"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" role="main" tabIndex="-1" className="flex-1 focus:outline-none w-full max-w-full overflow-x-hidden">
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
          <Route path="/category/:category" element={<CategoryListings />} />
          <Route path="/category" element={<CategoryListings />} />
          <Route path="/listings/category/:category" element={<CategoryListings />} />
          <Route path="/listings/:category" element={<CategoryListings />} />
          <Route path="/listings" element={<CategoryListings />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
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
          <Route path="listings" element={<AdminListings />} />
          <Route path="upload-services" element={<AdminUploadServices />} />
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
