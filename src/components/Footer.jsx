import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { getServices } from '../services/dataService';

export default function Footer() {
  const { settings, showToast } = useSite();
  const [nlEmail, setNlEmail] = useState('');
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getServices().then(res => {
      if (res) setServices(res.slice(0, 5));
    });
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!nlEmail || !nlEmail.includes('@')) {
      showToast('Enter a valid work email', 'error');
      return;
    }
    setNlEmail('');
    showToast('Subscribed! Rate card lands monthly.', 'success');
  };

  return (
    <footer className="bg-laxBlue-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-50"></div>
      <div className="relative max-w-7xl mx-auto px-4 pt-14 pb-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div>
            <div className="flex items-center gap-3">
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.site_name}
                  width="44"
                  height="44"
                  className="h-11 max-w-[140px] object-contain rounded-xl"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl grad-btn flex items-center justify-center font-grotesk font-bold text-xl text-white shadow-lg">
                  {settings.logo_badge || 'L'}
                </div>
              )}
              <div>
                <div className="font-grotesk font-bold tracking-tight">
                  {settings.site_name || 'LAXICO ADVERTISING'}
                </div>
                <div className="text-[10px] tracking-[.3em] text-slate-400 font-bold">
                  BILLBOARDS • POSTERS • LED
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-400 font-medium mt-4 leading-relaxed">
              Full-stack outdoor media company. Own inventory, in-house print, live proof-of-display and a client portal — across 12 cities.
            </p>
            <div className="flex gap-2 mt-4 flex-wrap">
              <a
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-laxRed-600 transition"
                href={settings.social_links?.facebook || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Facebook page"
                title="Facebook"
              >
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-laxRed-600 transition"
                href={settings.social_links?.instagram || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Instagram page"
                title="Instagram"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-laxRed-600 transition"
                href={settings.social_links?.twitter || 'https://twitter.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Twitter / X profile"
                title="Twitter"
              >
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-laxRed-600 transition"
                href={settings.social_links?.youtube || 'https://youtube.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our YouTube channel"
                title="YouTube"
              >
                <i className="fa-brands fa-youtube"></i>
              </a>
            </div>
          </div>

          {/* Services Col */}
          <div>
            <h3 className="font-grotesk font-bold text-sm tracking-widest text-slate-200 uppercase">
              SERVICES
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm font-semibold text-slate-300">
              {services.map(s => (
                <li key={s.id}>
                  <Link to={`/services/${s.id}`} className="hover:text-white transition">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Col */}
          <div>
            <h3 className="font-grotesk font-bold text-sm tracking-widest text-slate-200 uppercase">
              COMPANY
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm font-semibold text-slate-300">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-white transition">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Request Quote
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Stay Updated Col */}
          <div>
            <h3 className="font-grotesk font-bold text-sm tracking-widest text-slate-200 uppercase">
              STAY UPDATED
            </h3>
            <p className="text-sm text-slate-300 font-medium mt-4">
              New site launches & rate cards, monthly.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 mt-3">
              <input
                type="email"
                aria-label="Work email address for monthly rate card"
                value={nlEmail}
                onChange={e => setNlEmail(e.target.value)}
                placeholder="Work email"
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 text-white outline-none focus:border-laxBlue-600"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="grad-btn px-4 rounded-xl text-white"
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </form>
            <div className="mt-4 text-sm font-bold text-slate-200 flex items-center">
              <i className="fa-solid fa-phone text-laxRed-500 mr-2"></i>
              {settings.phone || '9742313705'}
            </div>
            <div className="text-sm font-semibold text-slate-300 flex items-center mt-1">
              <i className="fa-solid fa-envelope text-laxRed-500 mr-2"></i>
              {settings.email || 'lexicoadvertising@gmail.com'}
            </div>
            <a href={settings.map_link || '#'} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-400 mt-3 block hover:text-white">
              <i className="fa-solid fa-location-dot mr-1"></i>{settings.head_office || 'Head Office Location'}
            </a>
            <div className="text-xs font-semibold text-slate-400 mt-3 space-y-1">
              <div>UDYAM: {settings.udyam_number || 'UDYAM-KR-03-0664055'}</div>
              <div>GST: {settings.gst_number || '29CTIPS2521P1ZZ'}</div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500">
          <div>
            © 2026 {settings.site_name || 'Laxico Advertising Pvt. Ltd.'} • GST {settings.gst_number || '29CTIPS2521P1ZZ'} • All rights reserved.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Privacy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms</span>
            <span className="text-slate-300">Made for outdoor impact • v3.2</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
