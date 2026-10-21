import React, { useState, useEffect } from 'react';
import {
  getServices,
  getLocations,
  getServiceLocations,
  getCampaigns,
  getInquiries,
  getMedia,
  getLocalDB
} from '../../services/dataService';

export default function AdminDatabase() {
  const [counts, setCounts] = useState({
    services: 0,
    locations: 0,
    service_locations: 0,
    campaigns: 0,
    clients: 5,
    inquiries: 0,
    media: 0
  });

  useEffect(() => {
    Promise.all([
      getServices(),
      getLocations(),
      getServiceLocations(),
      getCampaigns(),
      getInquiries(),
      getMedia()
    ]).then(([s, l, sl, c, i, m]) => {
      const db = getLocalDB();
      setCounts({
        services: s.length,
        locations: l.length,
        service_locations: sl.length,
        campaigns: c.length,
        clients: db.clients?.length || 5,
        inquiries: i.length,
        media: m.length
      });
    });
  }, []);

  const tables = [
    {
      icon: 'fa-layer-group',
      title: 'Services',
      desc: 'service_id PK • name, type, price, dims, durations, image, rating, status',
      count: counts.services,
      color: '#0B3DFF'
    },
    {
      icon: 'fa-location-dot',
      title: 'Locations',
      desc: 'location_id PK • name, city, zone, footfall, size, image, status',
      count: counts.locations,
      color: '#16a34a'
    },
    {
      icon: 'fa-link',
      title: 'Service_Locations',
      desc: 'mapping_id PK • service_id FK → Services • location_id FK → Locations',
      count: counts.service_locations,
      color: '#7c3aed'
    },
    {
      icon: 'fa-rectangle-ad',
      title: 'Placements / Campaigns',
      desc: 'placement_id PK • client FK, service FK, location FK, dates, budget, status, artwork',
      count: counts.campaigns,
      color: '#E11D2E'
    },
    {
      icon: 'fa-users',
      title: 'Clients',
      desc: 'client_id PK • name, contact, phone, email',
      count: counts.clients,
      color: '#f59e0b'
    },
    {
      icon: 'fa-inbox',
      title: 'Inquiries',
      desc: 'inquiry_id PK • service FK, location FK, contact, budget, stage, follow-up',
      count: counts.inquiries,
      color: '#06b6d4'
    },
    {
      icon: 'fa-photo-film',
      title: 'Images / Media',
      desc: 'image_id PK • service FK, title, tag, url',
      count: counts.media,
      color: '#ec4899'
    }
  ];

  const sqlPreview = `-- Laxico Advertising • PostgreSQL Supabase Schema
CREATE TABLE site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  site_name VARCHAR(255),
  tagline TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  head_office TEXT,
  social_links JSONB
);

CREATE TABLE services (
  id TEXT PRIMARY KEY,
  name VARCHAR(120),
  type VARCHAR(50),
  price INT,
  dims VARCHAR(120),
  durations TEXT,
  image TEXT,
  rating DECIMAL(2,1),
  status VARCHAR(16)
);

CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  name VARCHAR(140),
  city VARCHAR(60),
  zone VARCHAR(16),
  footfall INT,
  size VARCHAR(80),
  status VARCHAR(16)
);

CREATE TABLE service_locations (
  id TEXT PRIMARY KEY,
  service_id TEXT REFERENCES services(id) ON DELETE CASCADE,
  location_id TEXT REFERENCES locations(id) ON DELETE CASCADE
);

CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  client TEXT,
  service_id TEXT REFERENCES services(id),
  location_id TEXT REFERENCES locations(id),
  start_date DATE,
  end_date DATE,
  budget INT,
  status VARCHAR(32),
  artwork TEXT
);

CREATE TABLE inquiries (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  email TEXT,
  service_id TEXT,
  location_id TEXT,
  stage VARCHAR(32)
);`;

  return (
    <div className="space-y-4">
      {/* Table Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((t, idx) => (
          <div key={idx} className="bg-[#0c1747] border border-white/10 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow"
                style={{ background: t.color }}
              >
                <i className={`fa-solid ${t.icon}`}></i>
              </div>
              <div>
                <div className="text-white font-grotesk font-bold">{t.title}</div>
                <div className="text-slate-400 text-[11px] font-bold">{t.count} rows</div>
              </div>
              <span className="ml-auto text-2xl font-grotesk font-bold text-white/20">
                {t.count}
              </span>
            </div>
            <p className="text-slate-400 text-xs font-mono mt-3 leading-relaxed">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* ERD Diagram & SQL */}
      <div className="bg-[#0c1747] border border-white/10 rounded-3xl p-6 shadow-xl">
        <h3 className="text-white font-grotesk font-bold text-lg">Entity-Relationship Diagram</h3>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">
          Services ⇄ Service_Locations ⇄ Locations • Clients → Placements → Images • Inquiries → Clients
        </p>

        {/* Visual ERD Flow */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[12px] font-extrabold">
          {['Clients', 'Placements', 'Services', 'Service_Locations', 'Locations', 'Inquiries', 'Media'].map(
            (item, i) => (
              <React.Fragment key={item}>
                {i > 0 && <i className="fa-solid fa-arrow-right text-slate-600 text-xs"></i>}
                <span
                  className="px-4 py-2.5 rounded-xl border border-white/15 text-blue-100 shadow"
                  style={{
                    background:
                      i === 1
                        ? 'linear-gradient(90deg,#0B3DFF,#E11D2E)'
                        : 'rgba(255,255,255,.05)'
                  }}
                >
                  {item}
                </span>
              </React.Fragment>
            )
          )}
        </div>

        {/* SQL Preview Box */}
        <div className="mt-6 rounded-2xl bg-black/40 border border-white/10 p-4 overflow-x-auto shadow-inner">
          <pre className="text-[12px] leading-relaxed text-emerald-300 font-mono">
            {sqlPreview}
          </pre>
        </div>
      </div>
    </div>
  );
}
