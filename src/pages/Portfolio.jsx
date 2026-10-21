import React, { useState, useEffect } from 'react';
import { getCampaigns, getServices, getLocations } from '../services/dataService';
import { useSite } from '../context/SiteContext';

export default function Portfolio() {
  const [campaigns, setCampaigns] = useState([]);
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);

  const [serviceTypeFilter, setServiceTypeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { openLightbox } = useSite();

  useEffect(() => {
    Promise.all([getCampaigns(), getServices(), getLocations()]).then(([camps, svcs, locs]) => {
      setCampaigns(camps);
      setServices(svcs);
      setLocations(locs);
    });
  }, []);

  const serviceTypes = ['All', ...new Set(services.map(s => s.type))];

  const filteredCampaigns = campaigns.filter(c => {
    const s = services.find(x => x.id === c.service_id);
    if (serviceTypeFilter !== 'All' && s?.type !== serviceTypeFilter) return false;
    if (locationFilter !== 'All' && c.location_id !== locationFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.title.toLowerCase().includes(q) && !c.client.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const totalValue = campaigns.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
  const liveCount = campaigns.filter(c => c.status === 'Live').length;

  const fmtK = (n) => {
    n = Number(n || 0);
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return '₹' + (n / 1000).toFixed(0) + 'K';
    return '₹' + n.toLocaleString('en-IN');
  };

  return (
    <div>
      {/* Top Banner */}
      <div className="grad-bg-2 relative overflow-hidden">
        <div className="absolute inset-0 hero-grid"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-14">
          <span className="section-label text-red-300">Proof of work</span>
          <h1 className="font-grotesk font-bold text-white text-4xl sm:text-5xl mt-2">
            Portfolio / Gallery
          </h1>
          <p className="text-blue-100 mt-3 max-w-2xl font-medium">
            Real campaigns by service type and location. Click any creative to view the full story.
          </p>

          <div className="grid sm:grid-cols-3 gap-3 mt-6 max-w-3xl">
            <select
              value={serviceTypeFilter}
              onChange={e => setServiceTypeFilter(e.target.value)}
              className="rounded-2xl px-4 py-3 text-sm font-bold bg-white text-laxBlue-950 outline-none shadow cursor-pointer"
            >
              {serviceTypes.map(t => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All service types' : t}
                </option>
              ))}
            </select>

            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="rounded-2xl px-4 py-3 text-sm font-bold bg-white text-laxBlue-950 outline-none shadow cursor-pointer"
            >
              <option value="All">All locations</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} — {l.city}
                </option>
              ))}
            </select>

            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search brand, client..."
                className="w-full rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold bg-white text-laxBlue-950 outline-none shadow focus:ring-2 focus:ring-laxBlue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: 'fa-rectangle-ad', value: campaigns.length, label: 'Total campaigns' },
            { icon: 'fa-indian-rupee-sign', value: fmtK(totalValue), label: 'Ad value delivered' },
            { icon: 'fa-location-dot', value: locations.length, label: 'Locations used' },
            { icon: 'fa-star', value: `${liveCount} Live`, label: 'Right now' }
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-blue-100 p-5 flex items-center gap-4 shadow-sm"
            >
              <div className="tick grad-bg text-white shadow">
                <i className={`fa-solid ${stat.icon}`}></i>
              </div>
              <div>
                <div className="font-grotesk font-bold text-xl text-laxBlue-950">{stat.value}</div>
                <div className="text-xs font-bold text-slate-400 tracking-wide">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Masonry Gallery */}
        <div className="gallery-masonry">
          {filteredCampaigns.map(c => {
            const s = services.find(x => x.id === c.service_id);
            const l = locations.find(x => x.id === c.location_id);
            return (
              <div
                key={c.id}
                className="masonry-item shadow-card group"
                onClick={() =>
                  openLightbox(
                    c.artwork,
                    c.title,
                    `${c.client} • ${s?.name || ''} • ${l?.name || ''}`
                  )
                }
              >
                <img
                  src={c.artwork}
                  alt={c.title}
                  className="w-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/seed/${c.id}/700/500`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-laxBlue-950/90 via-laxBlue-950/10 to-transparent opacity-90 transition-opacity group-hover:opacity-100"></div>

                <span
                  className={`chip absolute top-3 left-3 ${
                    c.status === 'Live'
                      ? 'bg-green-500 text-white'
                      : c.status === 'Scheduled'
                      ? 'bg-amber-400 text-black'
                      : 'bg-white/90 text-laxBlue-900'
                  }`}
                >
                  {c.status}
                </span>

                <div className="absolute bottom-0 p-5">
                  <div className="text-[11px] font-extrabold tracking-widest text-red-300 uppercase">
                    {s?.type || 'CAMPAIGN'}
                  </div>
                  <div className="text-white font-grotesk font-bold text-lg leading-tight mt-0.5">
                    {c.title}
                  </div>
                  <div className="text-blue-200 text-xs font-bold mt-1 flex items-center">
                    <i className="fa-solid fa-location-dot mr-1 text-laxRed-500"></i>
                    {l?.name || ''} • {fmtK(c.budget)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center text-slate-400 font-bold py-16">
            No campaigns match these filters.
          </div>
        )}
      </div>
    </div>
  );
}
