import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import {
  getServices,
  getLocations,
  getCampaigns,
  getInquiries,
  exportDatabase,
  exportMySQLDump,
  resetDemoData
} from '../../services/dataService';

export default function AdminLayout() {
  const { isAdmin, logout, showToast, settings, adminUser } = useSite();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState({
    services: 0,
    locations: 0,
    liveCampaigns: 0,
    newInquiries: 0
  });

  const loadCounts = async () => {
    try {
      const [s, l, c, i] = await Promise.all([
        getServices(),
        getLocations(),
        getCampaigns(),
        getInquiries()
      ]);
      setCounts({
        services: s.length,
        locations: l.length,
        liveCampaigns: c.filter(x => x.status === 'Live').length,
        newInquiries: i.filter(x => x.stage === 'New').length
      });
    } catch (e) {
      console.warn('Error loading admin counts:', e);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/lexico', { replace: true });
    } else {
      loadCounts();
    }
  }, [isAdmin, navigate]);

  const handleExportDB = async () => {
    await exportDatabase();
    showToast('Database exported as JSON', 'success');
  };

  const handleExportMySQL = async () => {
    await exportMySQLDump();
    showToast('MySQL 8.0 dump downloaded', 'success');
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all data to demo defaults?')) return;
    await resetDemoData();
    await loadCounts();
    showToast('Demo data restored', 'success');
    window.location.reload();
  };

  const getPageMeta = () => {
    const p = location.pathname;
    if (p.includes('/admin/services')) return { title: 'Services Management', sub: 'Add, edit, delete — with locations mapping' };
    if (p.includes('/admin/locations')) return { title: 'Locations Management', sub: 'Inventory, footfall & status' };
    if (p.includes('/admin/campaigns')) return { title: 'Campaigns / Placements', sub: 'Active client campaigns + artwork' };
    if (p.includes('/admin/inquiries')) return { title: 'Inquiry / Lead Management', sub: 'Pipeline, stages & follow-ups' };
    if (p.includes('/admin/media')) return { title: 'Media Library', sub: 'Showcase & campaign images' };
    if (p.includes('/admin/analytics')) return { title: 'Analytics', sub: 'Popularity, revenue & occupancy' };
    if (p.includes('/admin/database')) return { title: 'Database Structure', sub: '7 tables • live row counts & schema' };
    if (p.includes('/admin/settings')) return { title: 'CMS & Site Settings', sub: 'Update logo, favicon, site name, contact info & Supabase' };
    return { title: 'Dashboard', sub: 'Live overview of services, campaigns & revenue' };
  };

  const getContextButton = () => {
    const p = location.pathname;
    if (p.includes('/admin/services')) {
      return { label: '+ Services', action: 'services', target: '/admin/services' };
    }
    if (p.includes('/admin/locations')) {
      return { label: '+ Location', action: 'locations', target: '/admin/locations' };
    }
    if (p.includes('/admin/campaigns')) {
      return { label: '+ Campaign', action: 'campaigns', target: '/admin/campaigns' };
    }
    if (p.includes('/admin/inquiries')) {
      return { label: '+ Inquiry', action: 'inquiries', target: '/admin/inquiries' };
    }
    if (p.includes('/admin/media')) {
      return { label: '+ Media', action: 'media', target: '/admin/media' };
    }
    return { label: '+ Services', action: 'services', target: '/admin/services' };
  };

  const contextButton = getContextButton();

  const handleContextAction = () => {
    if (location.pathname === contextButton.target) {
      window.dispatchEvent(new CustomEvent('admin-open-modal', { detail: { action: contextButton.action } }));
    } else {
      navigate(contextButton.target, { state: { openAdd: true } });
    }
  };

  const pageMeta = getPageMeta();

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#040A29] text-white flex flex-col font-jakarta">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          id="adminSidebar"
          className={`w-[270px] shrink-0 min-h-screen bg-[#0a1440] border-r border-white/10 p-5 flex flex-col gap-2 fixed lg:sticky top-0 h-screen overflow-y-auto z-50 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-[110%] lg:translate-x-0'
          }`}
        >
          <div className="flex items-center justify-between px-1 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl grad-btn flex items-center justify-center text-white font-grotesk font-bold text-xl shadow-lg overflow-hidden shrink-0">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt={settings.site_name || 'Logo'} className="w-full h-full object-contain bg-white" />
                ) : (
                  settings.logo_badge || 'L'
                )}
              </div>
              <div>
                <div className="text-white font-grotesk font-bold leading-none text-sm">
                  {settings.logo_text || 'LAXICO'} ADMIN
                </div>
                <div className="text-[9px] tracking-[.25em] text-slate-400 font-bold mt-1">
                  CONTROL TOWER
                </div>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center text-sm"
              title="Close Menu"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <NavLink
            to="/admin"
            end
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}
          >
            <i className="fa-solid fa-gauge-high w-5"></i> Dashboard
          </NavLink>

          <NavLink
            to="/admin/services"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}
          >
            <i className="fa-solid fa-layer-group w-5"></i> Services
            <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded-full">
              {counts.services}
            </span>
          </NavLink>

          <NavLink
            to="/admin/locations"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}
          >
            <i className="fa-solid fa-location-dot w-5"></i> Locations
            <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded-full">
              {counts.locations}
            </span>
          </NavLink>

          <NavLink
            to="/admin/campaigns"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}
          >
            <i className="fa-solid fa-rectangle-ad w-5"></i> Campaigns
            <span className="ml-auto text-xs bg-laxRed-500 px-2 py-0.5 rounded-full text-white font-bold">
              {counts.liveCampaigns}
            </span>
          </NavLink>

          <NavLink
            to="/admin/inquiries"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}
          >
            <i className="fa-solid fa-inbox w-5"></i> Inquiries / Leads
            <span className="ml-auto text-xs bg-amber-400 text-black px-2 py-0.5 rounded-full font-extrabold">
              {counts.newInquiries}
            </span>
          </NavLink>

          <NavLink
            to="/admin/media"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}
          >
            <i className="fa-solid fa-photo-film w-5"></i> Media Library
          </NavLink>

          <NavLink
            to="/admin/analytics"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}
          >
            <i className="fa-solid fa-chart-line w-5"></i> Analytics
          </NavLink>

          <NavLink
            to="/admin/database"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}
          >
            <i className="fa-solid fa-database w-5"></i> Database Schema
          </NavLink>

          <NavLink
            to="/admin/settings"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}
          >
            <i className="fa-solid fa-gear w-5"></i> CMS & Settings
          </NavLink>

          <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
            <Link to="/" className="admin-link">
              <i className="fa-solid fa-globe w-5"></i> Back to Website
            </Link>

            <button onClick={logout} className="admin-link !text-red-300">
              <i className="fa-solid fa-right-from-bracket w-5"></i> Logout
            </button>

            <div className="text-[11px] text-slate-500 font-semibold px-2">
              Logged in as <span className="text-slate-300 capitalize">{adminUser || 'Admin'}</span>
            </div>
          </div>
        </aside>

        {/* Overlay backdrop on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Topbar */}
          <header className="sticky top-0 z-30 bg-[#040A29]/95 backdrop-blur border-b border-white/10 px-3.5 sm:px-8 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                className="lg:hidden w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle navigation menu"
              >
                <i className="fa-solid fa-bars"></i>
              </button>

              <div className="min-w-0">
                <h1 className="text-white font-grotesk font-bold text-base sm:text-xl leading-tight truncate">
                  {pageMeta.title}
                </h1>
                <p className="text-slate-400 text-[11px] sm:text-xs font-semibold mt-0.5 truncate hidden sm:block">
                  {pageMeta.sub}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportMySQL}
                className="inline-flex items-center gap-1.5 bg-laxBlue-600/30 hover:bg-laxBlue-600/50 text-blue-200 border border-blue-500/30 text-xs font-bold px-3 py-2 rounded-xl transition"
                title="Download MySQL Dump"
              >
                <i className="fa-solid fa-database text-[11px]"></i>
                <span className="hidden sm:inline">Export DB</span>
              </button>

              <button
                onClick={handleResetDemo}
                className="inline-flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-2 rounded-xl transition"
                title="Restore default demo data"
              >
                <i className="fa-solid fa-rotate-left text-[11px]"></i>
                <span className="hidden sm:inline">Reset Demo</span>
              </button>

              <button
                onClick={handleContextAction}
                className="grad-btn text-white text-xs font-extrabold px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl flex items-center gap-1.5 shadow"
              >
                <span>{contextButton.label}</span>
              </button>
            </div>
          </header>

          <main className="p-3.5 sm:p-6 lg:p-8">
            <Outlet context={{ refreshCounts: loadCounts }} />
          </main>
        </div>
      </div>
    </div>
  );
}
