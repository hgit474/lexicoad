import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getServices, getLocations, getServiceLocations } from '../services/dataService';

export default function Services() {
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [serviceLocations, setServiceLocations] = useState([]);

  const [activeFilter, setActiveFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    Promise.all([getServices(), getLocations(), getServiceLocations()]).then(([svcs, locs, sl]) => {
      setServices(svcs);
      setLocations(locs);
      setServiceLocations(sl);
    });
  }, []);

  const types = ['All', ...new Set(services.map(s => s.type))];

  const getMappedLocations = (serviceId) => {
    const locIds = serviceLocations.filter(m => m.service_id === serviceId).map(m => m.location_id);
    return locations.filter(l => locIds.includes(l.id));
  };

  const getServiceCities = (service) => {
    const explicitCities = (service.cities || '')
      .split(',')
      .map(city => city.trim())
      .filter(Boolean);
    const mappedCities = getMappedLocations(service.id).map(location => location.city).filter(Boolean);
    return [...explicitCities, ...mappedCities].filter((city, index, list) => list.indexOf(city) === index);
  };

  const cityOptions = ['All', ...[...new Set(services.flatMap(getServiceCities))].sort()];

  let filtered = services.filter(s => {
    if (activeFilter !== 'All' && s.type !== activeFilter) return false;
    if (cityFilter !== 'All' && !getServiceCities(s).some(city => city.toLowerCase() === cityFilter.toLowerCase())) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const mappedLocs = getMappedLocations(s.id);
      const matchText = (s.name + s.type + s.description + s.dims).toLowerCase();
      const matchLoc = mappedLocs.some(l => (l.name + l.city).toLowerCase().includes(q));
      if (!matchText.includes(q) && !matchLoc) return false;
    }
    return true;
  });

  if (sortBy === 'low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  return (
    <div>
      {/* Top Banner */}
      <div className="grad-bg relative overflow-hidden">
        <div className="absolute inset-0 hero-grid"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-14">
          <span className="section-label text-red-300">Our inventory</span>
          <h1 className="font-grotesk font-bold text-white text-4xl sm:text-5xl mt-2">All Services</h1>
          <p className="text-blue-100 mt-3 max-w-2xl font-medium">
            Metro station ads, bus shelter posters, airport banners & more. Filter by service type, compare locations, pricing and durations.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search services, cities, locations..."
                className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold shadow-xl outline-none text-laxBlue-950 focus:ring-2 focus:ring-laxBlue-600 bg-white"
              />
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="rounded-2xl px-4 py-3.5 text-sm font-bold shadow-xl bg-white text-laxBlue-950 outline-none cursor-pointer"
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="low">Price: Low → High</option>
              <option value="high">Price: High → Low</option>
              <option value="name">Name A–Z</option>
            </select>

            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="rounded-2xl px-4 py-3.5 text-sm font-bold shadow-xl bg-white text-laxBlue-950 outline-none cursor-pointer"
            >
              {cityOptions.map(city => (
                <option key={city} value={city}>
                  {city === 'All' ? 'All cities' : city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Filter buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {types.map(t => {
            const count = services.filter(s => t === 'All' || s.type === t).length;
            return (
              <button
                key={t}
                onClick={() => setActiveFilter(t)}
                className={`filter-btn ${activeFilter === t ? 'active' : ''}`}
              >
                {t} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Count & note */}
        <div className="flex items-center justify-between mt-4 mb-5">
          <div className="text-sm font-bold text-slate-500">
            Showing {filtered.length} of {services.length} services
          </div>
          <div className="text-xs font-bold text-slate-400 hidden sm:block">
            <i className="fa-solid fa-circle-info mr-1"></i> Prices are per location / month • GST extra
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(s => {
            const mapped = getMappedLocations(s.id);
            const durs = (s.durations || '').split(',').slice(0, 3).map(d => d.trim()).filter(Boolean);
            return (
              <div
                key={s.id}
                className="bg-white rounded-3xl overflow-hidden border border-blue-100 shadow-sm card-hover flex flex-col"
              >
                <div className="img-zoom relative h-52 cursor-pointer">
                  <Link to={`/services/${s.id}`}>
                    <img
                      src={s.image}
                      alt={s.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/seed/${s.id}/800/500`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-laxBlue-950/70 via-transparent to-transparent"></div>
                    <span className="chip absolute top-3 left-3 bg-white/95 text-laxBlue-800 shadow">
                      {s.type}
                    </span>
                    {s.status !== 'Active' ? (
                      <span className="chip absolute top-3 right-3 bg-slate-800 text-white">
                        Paused
                      </span>
                    ) : (
                      <span className="chip absolute top-3 right-3 bg-laxRed-600 text-white">
                        ★ {s.rating}
                      </span>
                    )}
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <div className="text-white font-grotesk font-bold text-lg leading-tight">
                        {s.name}
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <i className="fa-solid fa-location-dot text-laxRed-500"></i> {mapped.length} locations •
                    <i className="fa-solid fa-ruler-combined text-laxBlue-600 ml-1"></i> {s.dims || 'Std'}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {getServiceCities(s).map(city => (
                      <span key={city} className="text-[11px] font-bold bg-red-50 text-laxRed-700 border border-red-100 px-2.5 py-1 rounded-full">
                        <i className="fa-solid fa-location-dot mr-1"></i>{city}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-slate-500 font-medium mt-2 line-clamp-2">
                    {s.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {durs.map(d => (
                      <span
                        key={d}
                        className="text-[11px] font-bold bg-blue-50 text-laxBlue-700 border border-blue-100 px-2.5 py-1 rounded-full"
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div>
                      <div className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase">
                        STARTS AT
                      </div>
                      <div className="font-grotesk font-bold text-xl text-laxBlue-950">
                        ₹{Number(s.price).toLocaleString('en-IN')}
                        <span className="text-xs text-slate-400 font-bold">/mo</span>
                      </div>
                    </div>

                    <Link
                      to={`/services/${s.id}`}
                      className="grad-btn text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 font-bold">
            No services match your search or filter.
          </div>
        )}
      </div>
    </div>
  );
}
