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
            <div>
              <label htmlFor="portfolio-service-filter" className="sr-only">Filter by service type</label>
              <select
                id="portfolio-service-filter"
                aria-label="Filter campaigns by service type"
                value={serviceTypeFilter}
                onChange={e => setServiceTypeFilter(e.target.value)}
                className="w-full rounded-2xl px-4 py-3 text-sm font-bold bg-white text-laxBlue-950 outline-none shadow cursor-pointer"
              >
                {serviceTypes.map(t => (
                  <option key={t} value={t}>
                    {t === 'All' ? 'All service types' : t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="portfolio-location-filter" className="sr-only">Filter by location</label>
              <select
                id="portfolio-location-filter"
                aria-label="Filter campaigns by location"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full rounded-2xl px-4 py-3 text-sm font-bold bg-white text-laxBlue-950 outline-none shadow cursor-pointer"
              >
                <option value="All">All locations</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label htmlFor="portfolio-search-query" className="sr-only">Search campaigns by brand or client</label>
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true"></i>
              <input
                id="portfolio-search-query"
                aria-label="Search campaigns by brand, client, or keyword"
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

        {/* Structured Grid Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredCampaigns.map(c => {
            const s = services.find(x => x.id === c.service_id);
            const l = locations.find(x => x.id === c.location_id);
            return (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                aria-label={`View campaign details for ${c.title}`}
                className="group relative rounded-3xl overflow-hidden shadow-card border border-blue-100/70 bg-white h-[320px] sm:h-[350px] cursor-pointer card-hover flex flex-col justify-end text-left focus:outline-none focus:ring-2 focus:ring-laxBlue-600"
                onClick={() =>
                  openLightbox(
                    c.artwork,
                    c.title,
                    `${c.client} • ${s?.name || ''} • ${l?.name || ''}`
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(
                      c.artwork,
                      c.title,
                      `${c.client} • ${s?.name || ''} • ${l?.name || ''}`
                    );
                  }
                }}
              >
                <img
                  src={c.artwork}
                  alt={c.title}
                  loading="lazy"
                  decoding="async"
                  width="600"
                  height="400"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/seed/${c.id}/700/500`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-laxBlue-950/95 via-laxBlue-950/40 to-black/25 opacity-90 transition-opacity duration-300 group-hover:opacity-100"></div>

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span
                    className={`chip shadow text-xs font-extrabold ${
                      c.status === 'Live'
                        ? 'bg-emerald-500 text-white'
                        : c.status === 'Scheduled'
                        ? 'bg-amber-400 text-laxBlue-950'
                        : 'bg-white/95 text-laxBlue-950'
                    }`}
                  >
                    {c.status === 'Live' && (
                      <span className="w-2 h-2 rounded-full bg-white mr-1.5 animate-pulse inline-block"></span>
                    )}
                    {c.status}
                  </span>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/20">
                    {s?.type || 'CAMPAIGN'}
                  </span>
                </div>

                {/* Bottom Details */}
                <div className="relative z-10 p-5 sm:p-6">
                  <div className="text-[11px] font-extrabold tracking-widest text-red-400 uppercase">
                    {c.client || 'FEATURED BRAND'}
                  </div>
                  <div className="text-white font-grotesk font-bold text-xl leading-snug mt-1 group-hover:text-red-300 transition-colors drop-shadow-sm">
                    {c.title}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-semibold text-blue-100">
                    <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                      <i className="fa-solid fa-location-dot text-laxRed-500 shrink-0"></i>
                      <span className="truncate">{l?.name || 'Prime Location'}</span>
                    </div>
                    <div className="font-grotesk font-bold text-sm text-white shrink-0 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/10">
                      {fmtK(c.budget)}
                    </div>
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
