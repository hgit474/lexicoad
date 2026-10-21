import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

export default function TopBar() {
  const { settings, isAdmin } = useSite();
  const navigate = useNavigate();

  // Contact info derived from CMS settings
  const phone = settings.phone || '9742313705';
  const telHref = `tel:${phone.replace(/[^\d+]/g, '')}`;

  const email = settings.email || 'lexicoadvertising@gmail.com';
  const mailHref = `mailto:${email}`;

  const whatsappNum = settings.whatsapp || settings.phone || '9742313705';
  const waClean = whatsappNum.replace(/[^\d]/g, '');
  const waHref = `https://wa.me/${waClean}?text=Hello%20Laxico%20Advertising,%20I%20am%20interested%20in%20OOH%20billboard%20and%20poster%20campaigns.`;

  const social = settings.social_links || {};

  return (
    <div className="grad-bg text-white text-[12px] font-semibold select-none border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
        {/* Left Side: Dynamic Contact Links (Phone, Email, WhatsApp) */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Phone */}
          <a
            href={telHref}
            className="inline-flex items-center gap-1.5 hover:text-laxBlue-200 transition"
            title="Call Laxico Support"
          >
            <i className="fa-solid fa-phone text-[11px]"></i>
            <span>{phone}</span>
          </a>

          {/* Email */}
          <a
            href={mailHref}
            className="hidden md:inline-flex items-center gap-1.5 hover:text-laxBlue-200 transition"
            title="Email Laxico Team"
          >
            <i className="fa-solid fa-envelope text-[11px]"></i>
            <span>{email}</span>
          </a>

          {/* WhatsApp Direct */}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 hover:text-white px-2.5 py-0.5 rounded-full transition border border-emerald-400/30"
            title="Chat on WhatsApp"
          >
            <i className="fa-brands fa-whatsapp text-emerald-300 text-xs"></i>
            <span className="hidden sm:inline">WhatsApp:</span>
            <span>{whatsappNum}</span>
          </a>

          {/* Live Sites Badge */}
          {settings.active_sites_count && (
            <span className="hidden xl:inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-0.5 rounded-full text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              {settings.active_sites_count} SITES LIVE
            </span>
          )}
        </div>

        {/* Right Side: Social Media Icons + Admin Access */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Social Media Link Icons */}
          <div className="flex items-center gap-1.5">
            {social.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/25 hover:scale-110 flex items-center justify-center transition text-[11px] text-white"
                title="Facebook"
              >
                <i className="fa-brands fa-facebook-f"></i>
              </a>
            )}

            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/25 hover:scale-110 flex items-center justify-center transition text-[11px] text-white"
                title="Instagram"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
            )}

            {social.twitter && (
              <a
                href={social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/25 hover:scale-110 flex items-center justify-center transition text-[11px] text-white"
                title="Twitter / X"
              >
                <i className="fa-brands fa-x-twitter"></i>
              </a>
            )}

            {social.youtube && (
              <a
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/25 hover:scale-110 flex items-center justify-center transition text-[11px] text-white"
                title="YouTube"
              >
                <i className="fa-brands fa-youtube"></i>
              </a>
            )}
          </div>

          <div className="w-[1px] h-3.5 bg-white/20 hidden sm:block"></div>

          {/* Admin Access Button */}
          {isAdmin ? (
            <button
              onClick={() => navigate('/admin')}
              className="bg-white text-laxBlue-800 font-extrabold px-3.5 py-1 rounded-full hover:bg-laxRed-500 hover:text-white transition text-[11px] tracking-wide flex items-center gap-1.5 shadow"
            >
              <i className="fa-solid fa-gauge-high text-[10px]"></i>
              <span className="hidden sm:inline">CONTROL TOWER</span>
              <span className="sm:hidden">PANEL</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/lexico')}
              className="bg-white text-laxBlue-800 font-extrabold px-3.5 py-1 rounded-full hover:bg-laxRed-500 hover:text-white transition text-[11px] tracking-wide shadow"
            >
              ADMIN LOGIN
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
