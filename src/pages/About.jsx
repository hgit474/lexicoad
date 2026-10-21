import React from 'react';
import { useSite } from '../context/SiteContext';

const parseArray = (value) => {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function About() {
  const { settings } = useSite();
  const timelineData = parseArray(settings.about_timeline);
  const teamData = parseArray(settings.about_team);

  return (
    <div>
      {/* Top Banner */}
      <div className="grad-bg relative overflow-hidden">
        <div className="absolute inset-0 hero-grid"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-14 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="section-label text-red-300">{settings.about_label || 'Since 2025'}</span>
            <h1 className="font-grotesk font-bold text-white text-4xl sm:text-5xl mt-2">{settings.about_title || 'About Laxico'}</h1>
            <p className="text-blue-100 mt-4 font-medium leading-relaxed">
              {settings.about_description || ''}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=700&auto=format&fit=crop"
              className="rounded-2xl h-56 w-full object-cover shadow-lg"
              alt="Laxico Team"
            />
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=700&auto=format&fit=crop"
              className="rounded-2xl h-56 w-full object-cover mt-8 shadow-lg"
              alt="Laxico Strategy"
            />
          </div>
        </div>
      </div>

      {/* Mission / Vision / Retention Cards */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-blue-100 p-7 shadow-card">
          <div className="tick bg-blue-100 text-laxBlue-700 text-xl shadow-sm">
            <i className="fa-solid fa-bullseye"></i>
          </div>
          <h3 className="font-grotesk font-bold text-xl mt-4 text-laxBlue-950">Our Mission</h3>
          <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">
            {settings.about_mission || ''}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-blue-100 p-7 shadow-card">
          <div className="tick bg-red-100 text-laxRed-600 text-xl shadow-sm">
            <i className="fa-solid fa-eye"></i>
          </div>
          <h3 className="font-grotesk font-bold text-xl mt-4 text-laxBlue-950">Our Vision</h3>
          <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">
            {settings.about_vision || ''}
          </p>
        </div>

        <div className="rounded-3xl grad-btn p-7 text-white shadow-card">
          <div className="tick bg-white/20 text-white text-xl shadow-sm">
            <i className="fa-solid fa-handshake"></i>
          </div>
          <h3 className="font-grotesk font-bold text-xl mt-4">{settings.about_retention_title || 'Why clients stay'}</h3>
          <p className="text-blue-100 text-sm font-medium mt-2 leading-relaxed">
            {settings.about_retention_description || ''}
          </p>
        </div>
      </div>

      {/* Journey Timeline */}
      {timelineData.length > 0 && <div className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="font-grotesk font-bold text-3xl text-center text-laxBlue-950">Our Journey</h2>
        <div className="mt-8 relative max-w-3xl mx-auto pl-8">
          <div className="absolute left-[11px] top-2 bottom-2 w-1 rounded-full timeline-line"></div>
          <div className="space-y-6">
            {timelineData.map((item, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-8 top-1 w-4 h-4 rounded-full grad-btn border-2 border-white shadow"></span>
                <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
                  <div className="text-xs font-extrabold tracking-widest text-laxRed-600 uppercase">
                    {item.year}
                  </div>
                  <div className="font-grotesk font-bold text-laxBlue-950 mt-0.5">{item.title}</div>
                  <div className="text-sm text-slate-500 font-medium mt-1">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>}

      {/* Leadership */}
      {teamData.length > 0 && <div className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="font-grotesk font-bold text-3xl text-center text-laxBlue-950">Leadership</h2>
        <p className="text-center text-slate-500 font-medium mt-1">
          Operators, planners and ex-agency minds.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {teamData.map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-blue-100 p-6 text-center card-hover shadow-sm"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl grad-bg flex items-center justify-center text-white font-grotesk font-bold text-xl shadow">
                {member.initials}
              </div>
              <div className="font-grotesk font-bold mt-3 text-laxBlue-950">{member.name}</div>
              <div className="text-xs font-extrabold text-laxRed-600 tracking-wide mt-0.5">
                {member.role}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                {member.desc}
              </div>
            </div>
          ))}
        </div>
      </div>}

      {/* Offices & Contact */}
      <div className="max-w-7xl mx-auto px-4 pb-20 grid lg:grid-cols-2 gap-6">
        <div className="bg-laxBlue-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-card">
          <div className="absolute inset-0 hero-grid"></div>
          <div className="relative">
            <h3 className="font-grotesk font-bold text-2xl">Head Office — New Delhi</h3>
            <div className="mt-5 space-y-4 text-sm font-semibold text-blue-100">
              <div className="flex gap-3">
                <i className="fa-solid fa-location-dot text-laxRed-500 mt-1"></i>
                {settings.head_office || 'No 1 Nandini Complex, Chandra Layout, Bangalore — 560040'}
              </div>
              <div className="flex gap-3">
                <i className="fa-solid fa-phone text-laxRed-500 mt-1"></i>
                {settings.phone || '9742313705'} • {settings.phone_alt || '9742313705'}
              </div>
              <div className="flex gap-3">
                <i className="fa-solid fa-envelope text-laxRed-500 mt-1"></i>
                {settings.email || 'lexicoadvertising@gmail.com'} • {settings.email_sales || 'lexicoadvertising@gmail.com'}
              </div>
              <div className="flex gap-3">
                <i className="fa-brands fa-whatsapp text-emerald-400 mt-1"></i>
                WhatsApp: {settings.whatsapp || '9742313705'}
              </div>
              <div className="flex gap-3">
                <i className="fa-solid fa-file-invoice text-laxRed-500 mt-1"></i>
                UDYAM: {settings.udyam_number || 'UDYAM-KR-03-0664055'} • GST: {settings.gst_number || '29CTIPS2521P1ZZ'}
              </div>
              <div className="flex gap-3">
                <i className="fa-solid fa-clock text-laxRed-500 mt-1"></i>
                {settings.support_hours || 'Mon–Sat • 10:00 AM – 7:00 PM IST'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 text-center">
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="font-bold">Delhi</div>
                <div className="text-xs text-blue-200">HQ + Plant</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="font-bold">Mumbai</div>
                <div className="text-xs text-blue-200">{settings.office_mumbai || 'BKC Office'}</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="font-bold">Bengaluru</div>
                <div className="text-xs text-blue-200">{settings.office_bengaluru || 'HSR Office'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Placeholder & Socials */}
        <div className="bg-white rounded-3xl border border-blue-100 shadow-card overflow-hidden">
          <div className="h-64 bg-[#e8edff] relative dot-pattern flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl grad-bg flex items-center justify-center text-white text-2xl shadow-glowB">
                <i className="fa-solid fa-map-location-dot"></i>
              </div>
              <div className="font-grotesk font-bold text-lg mt-3 text-laxBlue-950">
                Find us on the map
              </div>
              <div className="text-sm text-slate-500 font-semibold">{settings.head_office || 'No 1 Nandini Complex, Chandra Layout, Bangalore 560040'}</div>
              <a
                href={settings.map_link || 'https://maps.google.com/?q=No+1+Nandini+Complex+Chandra+Layout+Bangalore+560040'}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 grad-btn text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow"
              >
                Open in Google Maps
              </a>
            </div>
          </div>

          <div className="p-6 grid grid-cols-3 gap-3 text-center">
            <a
              href={settings.social_links?.facebook || '#'}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-blue-50 p-4 hover:bg-blue-100 transition"
            >
              <i className="fa-brands fa-facebook text-laxBlue-700 text-xl"></i>
              <div className="text-xs font-bold mt-1 text-laxBlue-950">Facebook</div>
            </a>
            <a
              href={settings.social_links?.instagram || '#'}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-blue-50 p-4 hover:bg-blue-100 transition"
            >
              <i className="fa-brands fa-instagram text-laxRed-600 text-xl"></i>
              <div className="text-xs font-bold mt-1 text-laxBlue-950">Instagram</div>
            </a>
            <a
              href={settings.social_links?.twitter || '#'}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-blue-50 p-4 hover:bg-blue-100 transition"
            >
              <i className="fa-brands fa-x-twitter text-laxBlue-900 text-xl"></i>
              <div className="text-xs font-bold mt-1 text-laxBlue-950">Twitter / X</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
