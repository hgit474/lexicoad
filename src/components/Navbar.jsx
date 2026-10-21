import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

export default function Navbar() {
  const { settings } = useSite();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] glass border-b border-blue-100/70">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer group">
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.site_name}
              width="44"
              height="44"
              className="h-11 max-w-[160px] object-contain rounded-xl"
            />
          ) : (
            <div className="relative">
              <div className="w-11 h-11 rounded-xl grad-bg flex items-center justify-center text-white font-grotesk font-bold text-xl shadow-lg transition-transform group-hover:scale-105">
                {settings.logo_badge || 'L'}
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-laxRed-500 rounded-full border-2 border-white"></div>
            </div>
          )}
          <div className="leading-none">
            <div className="font-grotesk font-bold text-[1.15rem] tracking-tight text-laxBlue-900">
              {settings.logo_text || 'LAXICO'} <span className="text-laxRed-600">{settings.logo_subtext || 'ADS'}</span>
            </div>
            <div className="text-[10px] font-extrabold tracking-[.28em] text-slate-500">
              {settings.brand_subtitle || 'ADVERTISING'}
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            HOME
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            ABOUT
          </NavLink>
          <NavLink
            to="/services"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            SERVICES
          </NavLink>
          <NavLink
            to="/portfolio"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            PORTFOLIO
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            CONTACT
          </NavLink>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            to="/contact"
            className="hidden sm:inline-flex grad-btn text-white font-extrabold text-sm px-5 py-2.5 rounded-xl items-center gap-2 shadow"
          >
            <i className="fa-solid fa-bolt"></i> Get Quote
          </Link>
          <button
            className="lg:hidden w-11 h-11 rounded-xl bg-laxBlue-900 text-white flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-blue-100 bg-white px-4 py-3 flex flex-col gap-1 shadow-xl">
          <NavLink
            to="/"
            end
            onClick={() => setMobileOpen(false)}
            className="text-left font-bold py-2.5 px-3 rounded-lg hover:bg-blue-50 text-laxBlue-900"
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setMobileOpen(false)}
            className="text-left font-bold py-2.5 px-3 rounded-lg hover:bg-blue-50 text-laxBlue-900"
          >
            About
          </NavLink>
          <NavLink
            to="/services"
            onClick={() => setMobileOpen(false)}
            className="text-left font-bold py-2.5 px-3 rounded-lg hover:bg-blue-50 text-laxBlue-900"
          >
            Services
          </NavLink>
          <NavLink
            to="/portfolio"
            onClick={() => setMobileOpen(false)}
            className="text-left font-bold py-2.5 px-3 rounded-lg hover:bg-blue-50 text-laxBlue-900"
          >
            Portfolio
          </NavLink>
          <NavLink
            to="/contact"
            onClick={() => setMobileOpen(false)}
            className="text-left font-bold py-2.5 px-3 rounded-lg hover:bg-blue-50 text-laxBlue-900"
          >
            Contact
          </NavLink>
        </div>
      )}
    </header>
  );
}
