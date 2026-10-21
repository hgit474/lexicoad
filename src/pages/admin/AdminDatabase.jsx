import React, { useState, useEffect } from 'react';
import {
  getServices,
  getLocations,
  getServiceLocations,
  getCampaigns,
  getInquiries,
  getMedia,
  getLocalDB,
  exportMySQLDump,
  exportDatabase
} from '../../services/dataService';
import { useSite } from '../../context/SiteContext';

export default function AdminDatabase() {
  const { showToast } = useSite();
  const [activeTab, setActiveTab] = useState('mysql'); // 'mysql' | 'postgres'
  const [copied, setCopied] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('Services');
  const [counts, setCounts] = useState({
    services: 0,
    locations: 0,
    service_locations: 0,
    campaigns: 0,
    clients: 5,
    inquiries: 0,
    media: 0,
    genres: 12
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
        media: m.length,
        genres: 12
      });
    });
  }, []);

  const erdEntities = {
    Clients: {
      name: 'Clients',
      table: 'clients',
      icon: 'fa-users',
      color: '#f59e0b',
      count: counts.clients,
      pk: 'id VARCHAR(64)',
      fks: ['(Referenced by campaigns.client)'],
      relations: '1 : N with Placements (Campaigns)',
      desc: 'Advertisers, retail brands, tech startups, and direct agency clients booking outdoor ad inventory.',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'Unique client identifier' },
        { name: 'name', type: 'VARCHAR(255)', key: '', desc: 'Brand / Company legal entity name' },
        { name: 'contact_person', type: 'VARCHAR(150)', key: '', desc: 'Media manager or lead contact' },
        { name: 'phone', type: 'VARCHAR(50)', key: '', desc: 'WhatsApp & billing contact' },
        { name: 'email', type: 'VARCHAR(255)', key: '', desc: 'Official invoice email' }
      ]
    },
    Placements: {
      name: 'Placements (Campaigns)',
      table: 'campaigns',
      icon: 'fa-rectangle-ad',
      color: '#E11D2E',
      count: counts.campaigns,
      pk: 'id VARCHAR(64)',
      fks: ['service_id → services(id)', 'location_id → locations(id)', 'client → clients(name)'],
      relations: 'N : 1 with Services, N : 1 with Locations, N : 1 with Clients',
      desc: 'Active, scheduled, and past outdoor advertising campaigns with proof photos and budget tracking.',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'Placement ID (e.g. camp_01)' },
        { name: 'client', type: 'VARCHAR(255)', key: 'FK', desc: 'Client account reference' },
        { name: 'service_id', type: 'VARCHAR(64)', key: 'FK', desc: 'Media channel / format reference' },
        { name: 'location_id', type: 'VARCHAR(64)', key: 'FK', desc: 'Prime physical site reference' },
        { name: 'start_date', type: 'DATE', key: '', desc: 'Campaign go-live date' },
        { name: 'end_date', type: 'DATE', key: '', desc: 'Campaign end date' },
        { name: 'budget', type: 'INT UNSIGNED', key: '', desc: 'Contract budget in INR' },
        { name: 'status', type: 'VARCHAR(32)', key: '', desc: 'Live | Scheduled | Paused | Completed' },
        { name: 'artwork', type: 'TEXT', key: '', desc: 'Creative asset URL or photo proof' }
      ]
    },
    Services: {
      name: 'Services (Media Catalog)',
      table: 'services',
      icon: 'fa-layer-group',
      color: '#0B3DFF',
      count: counts.services,
      pk: 'id VARCHAR(64)',
      fks: ['(Referenced by service_locations, campaigns, inquiries, media)'],
      relations: '1 : N with Campaigns, M : N with Locations via service_locations',
      desc: 'Catalog of 12 media channels (Cinema, Transit, Airport, DOOH, Unipoles) with footfall metrics & min spend.',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'Service slug (e.g. cinema_ad)' },
        { name: 'name', type: 'VARCHAR(255)', key: '', desc: 'Headline display name' },
        { name: 'type / genre', type: 'VARCHAR(100)', key: '', desc: 'Channel (Cinema, Airport, DOOH, etc.)' },
        { name: 'sub_type', type: 'VARCHAR(150)', key: '', desc: 'Format (Multiplex 30s, AC Bus, Unipole)' },
        { name: 'chain_or_brand', type: 'VARCHAR(150)', key: '', desc: 'Brand network (PVR INOX, DTC, Indigo)' },
        { name: 'audience_metric', type: 'VARCHAR(255)', key: '', desc: 'Footfall / impression volume' },
        { name: 'min_spend', type: 'INT UNSIGNED', key: '', desc: 'Minimum spend threshold in INR' },
        { name: 'price', type: 'INT UNSIGNED', key: '', desc: 'Base monthly rate in INR' }
      ]
    },
    Service_Locations: {
      name: 'Service_Locations (Pivot)',
      table: 'service_locations',
      icon: 'fa-link',
      color: '#7c3aed',
      count: counts.service_locations,
      pk: 'id VARCHAR(64)',
      fks: ['service_id → services(id) ON DELETE CASCADE', 'location_id → locations(id) ON DELETE CASCADE'],
      relations: 'Many-to-Many pivot join between Services and Locations',
      desc: 'Connects any service format to multiple physical hoardings, cinema screens, or bus depot routes.',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'Pivot record key' },
        { name: 'service_id', type: 'VARCHAR(64)', key: 'FK', desc: 'Foreign key referencing services.id' },
        { name: 'location_id', type: 'VARCHAR(64)', key: 'FK', desc: 'Foreign key referencing locations.id' }
      ]
    },
    Locations: {
      name: 'Locations (Prime Sites)',
      table: 'locations',
      icon: 'fa-location-dot',
      color: '#16a34a',
      count: counts.locations,
      pk: 'id VARCHAR(64)',
      fks: ['(Referenced by service_locations, campaigns, inquiries)'],
      relations: 'M : N with Services, 1 : N with Campaigns',
      desc: 'Prime physical inventory across Delhi NCR, Mumbai, Bengaluru, Hyderabad with verified footfall.',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'Location slug / ID' },
        { name: 'name', type: 'VARCHAR(255)', key: '', desc: 'Site / Junction name' },
        { name: 'city', type: 'VARCHAR(100)', key: '', desc: 'Metro city' },
        { name: 'zone', type: 'VARCHAR(50)', key: '', desc: 'Zone / Corridor' },
        { name: 'footfall', type: 'INT UNSIGNED', key: '', desc: 'Daily eyeball impressions' },
        { name: 'size', type: 'VARCHAR(80)', key: '', desc: 'Dimensions (e.g. 40 × 20 ft)' },
        { name: 'status', type: 'VARCHAR(32)', key: '', desc: 'Available | Occupied | Maintenance' }
      ]
    },
    Inquiries: {
      name: 'Inquiries (Lead CRM)',
      table: 'inquiries',
      icon: 'fa-inbox',
      color: '#06b6d4',
      count: counts.inquiries,
      pk: 'id VARCHAR(64)',
      fks: ['service_id → services(id)', 'location_id → locations(id)'],
      relations: 'N : 1 with Services, converts into Campaigns',
      desc: 'Website quote requests and inbound leads with budget brackets and pipeline stages.',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'Lead inquiry ID' },
        { name: 'name', type: 'VARCHAR(255)', key: '', desc: 'Prospective client name' },
        { name: 'phone', type: 'VARCHAR(50)', key: '', desc: 'Contact phone / WhatsApp' },
        { name: 'company', type: 'VARCHAR(255)', key: '', desc: 'Company or brand name' },
        { name: 'stage', type: 'VARCHAR(32)', key: '', desc: 'New | Contacted | Quoted | Converted | Closed' },
        { name: 'budget', type: 'VARCHAR(100)', key: '', desc: 'Proposed spend range' }
      ]
    },
    Media: {
      name: 'Media (Creative Assets)',
      table: 'media',
      icon: 'fa-photo-film',
      color: '#ec4899',
      count: counts.media,
      pk: 'id VARCHAR(64)',
      fks: ['service_id → services(id)'],
      relations: 'N : 1 with Services and Campaigns',
      desc: 'Showcase photos, installation proofs, and client creative graphics uploaded to storage.',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'Media record ID' },
        { name: 'title', type: 'VARCHAR(255)', key: '', desc: 'Media display title' },
        { name: 'tag', type: 'VARCHAR(50)', key: '', desc: 'Showcase | Hero Carousel | Portfolio' },
        { name: 'url', type: 'TEXT', key: '', desc: 'Hosted image URL' }
      ]
    }
  };

  const currentEntity = erdEntities[selectedEntity] || erdEntities.Services;

  const tables = [
    {
      icon: 'fa-cubes',
      title: 'media_genres',
      desc: 'id PK • name, short_name, icon, tagline, is_popular, sort_order',
      count: counts.genres,
      color: '#3B82F6'
    },
    {
      icon: 'fa-layer-group',
      title: 'services',
      desc: 'id PK • name, type, genre, sub_type, chain_or_brand, audience_metric, min_spend, price',
      count: counts.services,
      color: '#0B3DFF'
    },
    {
      icon: 'fa-location-dot',
      title: 'locations',
      desc: 'id PK • name, city, zone, footfall, lat, lng, price_mult, address',
      count: counts.locations,
      color: '#16a34a'
    },
    {
      icon: 'fa-link',
      title: 'service_locations',
      desc: 'id PK • service_id FK → services • location_id FK → locations',
      count: counts.service_locations,
      color: '#7c3aed'
    },
    {
      icon: 'fa-rectangle-ad',
      title: 'campaigns',
      desc: 'id PK • client_name, service_id FK, location_id FK, start_date, end_date, budget',
      count: counts.campaigns,
      color: '#E11D2E'
    },
    {
      icon: 'fa-inbox',
      title: 'inquiries',
      desc: 'id PK • name, phone, email, company, service_id, location_id, stage',
      count: counts.inquiries,
      color: '#06b6d4'
    },
    {
      icon: 'fa-photo-film',
      title: 'media',
      desc: 'id PK • title, category, url, caption, service_id, location_id',
      count: counts.media,
      color: '#ec4899'
    },
    {
      icon: 'fa-gear',
      title: 'site_settings',
      desc: 'id PK • site_name, contact info, udyam, gst, brand subtitle, faqs',
      count: 1,
      color: '#f59e0b'
    }
  ];

  const mysqlSchema = `-- ==============================================================================
-- Laxico Advertising • MySQL 8.0 DDL Schema
-- Engine: InnoDB • Charset: utf8mb4_unicode_ci
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS \`lexicoad_db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`lexicoad_db\`;

-- 1. SITE SETTINGS
CREATE TABLE IF NOT EXISTS \`site_settings\` (
  \`id\` VARCHAR(64) NOT NULL DEFAULT 'default',
  \`site_name\` VARCHAR(255) NOT NULL DEFAULT 'Laxico Advertising',
  \`phone\` VARCHAR(50) DEFAULT '9742313705',
  \`email\` VARCHAR(255) DEFAULT 'lexicoadvertising@gmail.com',
  \`udyam_number\` VARCHAR(100) DEFAULT 'UDYAM-KR-03-0664055',
  \`gst_number\` VARCHAR(100) DEFAULT '29CTIPS2521P1ZZ',
  \`head_office\` TEXT,
  \`contact_faqs\` JSON,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. MEDIA GENRES
CREATE TABLE IF NOT EXISTS \`media_genres\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`short_name\` VARCHAR(50) NOT NULL,
  \`icon\` VARCHAR(100) NOT NULL,
  \`tagline\` VARCHAR(255) DEFAULT '',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. SERVICES (Cinema, Transit, Airport, DOOH, Outdoor)
CREATE TABLE IF NOT EXISTS \`services\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`type\` VARCHAR(100) NOT NULL,
  \`genre\` VARCHAR(100) NOT NULL,
  \`sub_type\` VARCHAR(150) DEFAULT '',
  \`chain_or_brand\` VARCHAR(150) DEFAULT '',
  \`audience_metric\` VARCHAR(255) DEFAULT '',
  \`min_spend\` INT UNSIGNED NOT NULL DEFAULT 10000,
  \`price\` INT UNSIGNED NOT NULL DEFAULT 45000,
  \`rating\` DECIMAL(3,1) DEFAULT 4.7,
  \`dims\` VARCHAR(150) DEFAULT '20 × 10 ft • Backlit',
  \`durations\` VARCHAR(255) DEFAULT '1 Week, 2 Weeks, 1 Month',
  \`cities\` TEXT,
  \`image\` TEXT,
  \`status\` VARCHAR(50) DEFAULT 'Active',
  PRIMARY KEY (\`id\`),
  KEY \`idx_services_genre\` (\`genre\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. LOCATIONS
CREATE TABLE IF NOT EXISTS \`locations\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`city\` VARCHAR(100) NOT NULL,
  \`footfall\` INT UNSIGNED DEFAULT 50000,
  \`lat\` DECIMAL(10,8) NOT NULL,
  \`lng\` DECIMAL(11,8) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. SERVICE_LOCATIONS (Pivot)
CREATE TABLE IF NOT EXISTS \`service_locations\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`service_id\` VARCHAR(64) NOT NULL,
  \`location_id\` VARCHAR(64) NOT NULL,
  PRIMARY KEY (\`id\`),
  FOREIGN KEY (\`service_id\`) REFERENCES \`services\` (\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`location_id\`) REFERENCES \`locations\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. INQUIRIES & LEADS
CREATE TABLE IF NOT EXISTS \`inquiries\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`phone\` VARCHAR(50) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL,
  \`company\` VARCHAR(255) DEFAULT '',
  \`service_id\` VARCHAR(64) DEFAULT NULL,
  \`location_id\` VARCHAR(64) DEFAULT NULL,
  \`stage\` VARCHAR(50) DEFAULT 'New',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const postgresSchema = `-- Laxico Advertising • PostgreSQL Supabase Schema
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  site_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  contact_faqs JSONB
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  sub_type VARCHAR(150),
  chain_or_brand VARCHAR(150),
  audience_metric VARCHAR(255),
  min_spend INTEGER DEFAULT 10000,
  price INTEGER DEFAULT 45000,
  rating NUMERIC(3,1) DEFAULT 4.7,
  dims VARCHAR(150),
  cities TEXT,
  image TEXT
);

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  footfall INTEGER,
  lat NUMERIC(10,8),
  lng NUMERIC(11,8)
);`;

  const handleCopy = () => {
    const code = activeTab === 'mysql' ? mysqlSchema : postgresSchema;
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast(`${activeTab.toUpperCase()} schema copied to clipboard`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMySQL = async () => {
    await exportMySQLDump();
    showToast('MySQL 8.0 SQL dump downloaded', 'success');
  };

  const handleDownloadJSON = async () => {
    await exportDatabase();
    showToast('Database exported as JSON', 'success');
  };

  const erdNodes = ['Clients', 'Placements', 'Services', 'Service_Locations', 'Locations', 'Inquiries', 'Media'];

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
        <div>
          <h2 className="text-white font-grotesk font-bold text-xl">Database Architecture & Schema</h2>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">
            Relational MySQL 8.0 & Supabase storage engine with 8 production tables.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleDownloadMySQL}
            className="grad-btn text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow hover:shadow-lg transition"
          >
            <i className="fa-solid fa-database"></i>
            <span>Download MySQL .sql</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition"
          >
            <i className="fa-solid fa-file-code"></i>
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Entity-Relationship Diagram (ERD) */}
      <div className="bg-[#0c1747] border border-white/10 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-white font-grotesk font-bold text-lg flex items-center gap-2">
              <i className="fa-solid fa-diagram-project text-laxRed-500"></i>
              <span>Entity-Relationship Diagram</span>
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Interactive relationship map • Click any entity pill to inspect keys, foreign relations & attributes.
            </p>
          </div>

          <div className="text-[11px] font-bold text-slate-400 flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
            <span>Legend:</span>
            <span className="text-blue-300">1 : N (One-to-Many)</span>
            <span>•</span>
            <span className="text-purple-300">M : N (Pivot Join)</span>
          </div>
        </div>

        {/* Visual ERD Flow */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/30 border border-white/10 flex flex-wrap items-center justify-center gap-2 text-xs font-extrabold">
          {erdNodes.map((item, i) => {
            const isSelected = selectedEntity === item;
            const isPivot = item === 'Service_Locations';
            return (
              <React.Fragment key={item}>
                {i > 0 && (
                  <span className="text-slate-500 text-[11px] px-1 font-mono">
                    {i === 3 || i === 4 ? '⇄' : '→'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedEntity(item)}
                  className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border transition flex items-center gap-2 shadow ${
                    isSelected
                      ? 'border-white text-white scale-105 ring-2 ring-blue-400/50'
                      : 'border-white/15 text-slate-300 hover:text-white hover:border-white/30'
                  }`}
                  style={{
                    background: isSelected
                      ? 'linear-gradient(90deg,#0B3DFF,#E11D2E)'
                      : isPivot
                      ? 'rgba(124, 58, 237, 0.2)'
                      : 'rgba(255,255,255,0.06)'
                  }}
                >
                  <i className={`fa-solid ${erdEntities[item]?.icon} text-[11px]`}></i>
                  <span>{item}</span>
                  <span className="text-[10px] opacity-75 font-mono px-1.5 py-0.5 rounded-full bg-black/30">
                    {erdEntities[item]?.count || 0}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Interactive Entity Inspector Panel */}
        <div className="mt-5 rounded-2xl bg-[#0a1440] border border-white/10 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base shadow"
                style={{ backgroundColor: currentEntity.color }}
              >
                <i className={`fa-solid ${currentEntity.icon}`}></i>
              </div>
              <div>
                <h4 className="text-white font-grotesk font-bold text-base">
                  {currentEntity.name}
                </h4>
                <div className="text-[11px] text-slate-400 font-mono">
                  Table: <span className="text-blue-300 font-bold">{currentEntity.table}</span> • Primary Key: <span className="text-emerald-300 font-bold">{currentEntity.pk}</span>
                </div>
              </div>
            </div>

            <div className="text-xs font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-blue-200">
              {currentEntity.relations}
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            {currentEntity.desc}
          </p>

          <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/5 text-slate-300 border-b border-white/10">
                <tr>
                  <th className="py-2 px-3">Column</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Constraint</th>
                  <th className="py-2 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {currentEntity.columns.map(col => (
                  <tr key={col.name} className="hover:bg-white/[0.02]">
                    <td className="py-2 px-3 font-bold text-white">{col.name}</td>
                    <td className="py-2 px-3 text-cyan-300">{col.type}</td>
                    <td className="py-2 px-3">
                      {col.key === 'PK' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                          PRIMARY KEY
                        </span>
                      )}
                      {col.key === 'FK' && (
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                          FOREIGN KEY
                        </span>
                      )}
                      {!col.key && <span className="text-slate-500">—</span>}
                    </td>
                    <td className="py-2 px-3 text-slate-400">{col.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div>
        <h3 className="text-white font-grotesk font-bold text-base mb-3 flex items-center gap-2">
          <i className="fa-solid fa-table-cells text-laxRed-500"></i>
          <span>Database Tables & Live Row Counts</span>
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tables.map(t => (
            <div
              key={t.title}
              className="bg-[#0a1440] rounded-2xl border border-white/10 p-4 hover:border-white/25 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: t.color }}
                  >
                    <i className={`fa-solid ${t.icon}`}></i>
                  </div>
                  <span className="text-white font-grotesk font-bold text-lg">
                    {t.count}
                  </span>
                </div>
                <div className="text-white font-grotesk font-bold text-sm">{t.title}</div>
                <p className="text-[11px] text-slate-400 mt-1 font-mono leading-relaxed line-clamp-2">
                  {t.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schema Viewer */}
      <div className="bg-[#0a1440] rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('mysql')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'mysql'
                  ? 'bg-laxBlue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-server"></i> MySQL 8.0 (Active Target)
            </button>
            <button
              onClick={() => setActiveTab('postgres')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'postgres'
                  ? 'bg-laxBlue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-cloud"></i> Supabase / Postgres
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="text-xs font-bold text-slate-300 hover:text-white bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
          >
            <i className={`fa-solid ${copied ? 'fa-check text-green-400' : 'fa-copy'}`}></i>
            <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
          </button>
        </div>

        <pre className="p-5 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[380px] leading-relaxed bg-[#03071e]/50">
          {activeTab === 'mysql' ? mysqlSchema : postgresSchema}
        </pre>
      </div>
    </div>
  );
}
