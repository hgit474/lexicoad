import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getServices, getLocations, getServiceLocations } from '../services/dataService';
import BrowseByGenre from '../components/BrowseByGenre';
import InquiryModal from '../components/InquiryModal';

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [serviceLocations, setServiceLocations] = useState([]);

  // Filters
  const initialType = searchParams.get('type') || searchParams.get('genre') || 'All';
  const [activeGenre, setActiveGenre] = useState(initialType);
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [maxBudget, setMaxBudget] = useState(100000);
  const [selectedSubType, setSelectedSubType] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Quote modal state
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [modalService, setModalService] = useState(null);

  useEffect(() => {
    Promise.all([getServices(), getLocations(), getServiceLocations()]).then(([svcs, locs, sl]) => {
      setServices(svcs);
      setLocations(locs);
      setServiceLocations(sl);
    });
  }, []);

  // Sync URL search params
  useEffect(() => {
    const typeParam = searchParams.get('type') || searchParams.get('genre');
    if (typeParam && typeParam !== activeGenre) {
      setActiveGenre(typeParam);
    }
  }, [searchParams]);

  const handleSelectGenre = (genreId) => {
    setActiveGenre(genreId);
    if (genreId === 'All') {
      searchParams.delete('type');
      searchParams.delete('genre');
    } else {
      searchParams.set('type', genreId);
    }
    setSearchParams(searchParams);
  };

  const getMappedLocations = (serviceId) => {
    const locIds = serviceLocations.filter(m => m.service_id === serviceId).map(m => m.location_id);
    return locations.filter(l => locIds.includes(l.id));
  };

  const getServiceCities = (service) => {
    const explicitCities = (service.cities || '')
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);
    const mappedCities = getMappedLocations(service.id).map(l => l.city).filter(Boolean);
    return [...new Set([...explicitCities, ...mappedCities])];
  };

  const cityOptions = useMemo(() => {
    return ['All', ...[...new Set(services.flatMap(getServiceCities))].sort()];
  }, [services, serviceLocations, locations]);

  const subTypeOptions = useMemo(() => {
    const types = services
      .filter(s => activeGenre === 'All' || (s.genre || s.type).toLowerCase() === activeGenre.toLowerCase())
      .map(s => s.sub_type)
      .filter(Boolean);
    return ['All', ...new Set(types)];
  }, [services, activeGenre]);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const sGenre = s.genre || s.type;
      if (activeGenre !== 'All' && sGenre.toLowerCase() !== activeGenre.toLowerCase()) {
        return false;
      }
      if (selectedCity !== 'All') {
        const cities = getServiceCities(s);
        if (!cities.some(c => c.toLowerCase() === selectedCity.toLowerCase())) {
          return false;
        }
      }
      if (selectedSubType !== 'All' && s.sub_type !== selectedSubType) {
        return false;
      }
      if (s.min_spend && s.min_spend > maxBudget) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const mappedLocs = getMappedLocations(s.id);
        const matchText = (s.name + ' ' + sGenre + ' ' + (s.sub_type || '') + ' ' + (s.chain_or_brand || '') + ' ' + (s.description || '')).toLowerCase();
        const matchLoc = mappedLocs.some(l => (l.name + ' ' + l.city).toLowerCase().includes(q));
        if (!matchText.includes(q) && !matchLoc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'low') return (a.min_spend || a.price) - (b.min_spend || b.price);
      if (sortBy === 'high') return (b.price) - (a.price);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (b.popularity || 0) - (a.popularity || 0);
    });
  }, [services, activeGenre, selectedCity, selectedSubType, maxBudget, searchQuery, sortBy, serviceLocations, locations]);

  const resetAllFilters = () => {
    setActiveGenre('All');
    setSelectedCity('All');
    setSelectedSubType('All');
    setMaxBudget(100000);
    setSearchQuery('');
    searchParams.delete('type');
    searchParams.delete('genre');
    setSearchParams(searchParams);
  };

  const handleOpenQuote = (service) => {
    setModalService(service);
    setQuoteModalOpen(true);
  };

  const activeFiltersCount = (activeGenre !== 'All' ? 1 : 0) +
    (selectedCity !== 'All' ? 1 : 0) +
    (selectedSubType !== 'All' ? 1 : 0) +
    (maxBudget < 100000 ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#F6F8FF]">
      {/* Top Banner (Media Ant Style Search Header) */}
      <div className="grad-bg relative overflow-hidden text-white">
        <div className="absolute inset-0 hero-grid opacity-75"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-3xl">
            <span className="section-label text-red-300">MEDIA MARKETPLACE</span>
            <h1 className="font-grotesk font-bold text-3xl sm:text-5xl mt-2 text-white leading-tight">
              Media Planning & Ad Inventory
            </h1>
            <p className="text-blue-100 mt-3 text-sm sm:text-base font-medium leading-relaxed">
              Browse transparent rates for Multiplex Cinemas, Metro Networks, Airports, Highways and Digital DOOH screens across top Indian metros.
            </p>
          </div>

          {/* Search & Quick Controls */}
          <div className="mt-8 bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col md:flex-row gap-2.5 text-laxBlue-950">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search 'PVR INOX', 'Metro Stations', 'Cinepolis', 'Airport Unipole'..."
                aria-label="Search media services"
                className="w-full pl-11 pr-4 py-3.5 text-sm font-semibold rounded-xl sm:rounded-2xl outline-none focus:ring-2 focus:ring-laxBlue-600 bg-slate-50 md:bg-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                aria-label="Filter media by city"
                className="flex-1 md:w-44 px-3 py-3 text-xs sm:text-sm font-bold bg-slate-50 rounded-xl outline-none text-laxBlue-950 cursor-pointer border border-slate-200/80"
              >
                {cityOptions.map(city => (
                  <option key={city} value={city}>
                    {city === 'All' ? '📍 All Cities' : `📍 ${city}`}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="md:hidden px-4 py-3 bg-laxBlue-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
              >
                <i className="fa-solid fa-sliders"></i>
                <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Browse Media By Genre Grid */}
        <BrowseByGenre
          activeGenre={activeGenre}
          onSelectGenre={handleSelectGenre}
          services={services}
        />

        {/* Main Catalog View: Left Sidebar + Right Inventory */}
        <div className="grid lg:grid-cols-4 gap-6 items-start mt-3 sm:mt-4">
          {/* Left Filter Sidebar */}
          <aside className={`
            lg:block lg:sticky lg:top-24 bg-white rounded-3xl border border-blue-100 p-6 shadow-sm z-30
            ${mobileFilterOpen ? 'fixed inset-x-4 top-20 bottom-6 overflow-y-auto z-50 shadow-2xl block' : 'hidden'}
          `}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-filter text-laxRed-600"></i>
                <h3 className="font-grotesk font-bold text-lg text-laxBlue-950">Filters</h3>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="text-xs font-bold text-laxRed-600 hover:underline"
                >
                  Reset All
                </button>
              )}
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="lg:hidden text-slate-400 hover:text-slate-600"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* City Selector */}
            <div className="mb-6">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                Location / City
              </label>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {cityOptions.map(city => {
                  const isChecked = selectedCity === city;
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setSelectedCity(city)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                        isChecked
                          ? 'bg-laxBlue-950 text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{city === 'All' ? 'All Locations' : city}</span>
                      {isChecked && <i className="fa-solid fa-check text-[10px]"></i>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ad Options / Sub-Types */}
            {subTypeOptions.length > 2 && (
              <div className="mb-6">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  Ad Option / Format
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {subTypeOptions.map(opt => {
                    const isChecked = selectedSubType === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedSubType(opt)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                          isChecked
                            ? 'bg-laxRed-600 text-white font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{opt === 'All' ? 'All Ad Options' : opt}</span>
                        {isChecked && <i className="fa-solid fa-check text-[10px]"></i>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Min Spend Range Slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Budget Ceiling
                </label>
                <span className="text-xs font-bold text-laxBlue-950 font-grotesk">
                  ₹{maxBudget.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="5000"
                value={maxBudget}
                onChange={e => setMaxBudget(Number(e.target.value))}
                className="w-full accent-laxBlue-900 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>₹5K</span>
                <span>₹50K</span>
                <span>₹100K+</span>
              </div>
            </div>

            {/* Direct Assistance Card */}
            <div className="rounded-2xl bg-gradient-to-br from-[#052F42] to-[#8E0808] p-4 text-white text-xs">
              <div className="font-grotesk font-bold text-sm mb-1">Need a Custom Media Plan?</div>
              <p className="text-blue-100 text-[11px] leading-relaxed mb-3">
                Our outdoor media strategist will build a geo-targeted plan within 4 hours.
              </p>
              <button
                onClick={() => handleOpenQuote(null)}
                className="w-full py-2 bg-white text-laxBlue-950 rounded-xl font-extrabold hover:bg-slate-100 transition"
              >
                Request Media Plan
              </button>
            </div>
          </aside>

          {/* Right Inventory Listing */}
          <main className="lg:col-span-3">
            {/* Top Toolbar: Result Count, Sort By, View Mode */}
            <div className="bg-white rounded-2xl border border-blue-100 px-4 py-3 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-laxBlue-950">
                  {filteredServices.length} Media Properties
                </span>
                {activeGenre !== 'All' && (
                  <span className="chip bg-blue-50 text-laxBlue-700 border border-blue-100 text-[11px] font-bold">
                    {activeGenre}
                  </span>
                )}
                {selectedCity !== 'All' && (
                  <span className="chip bg-red-50 text-laxRed-700 border border-red-100 text-[11px] font-bold">
                    {selectedCity}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-400 hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="text-xs font-bold text-laxBlue-950 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg outline-none cursor-pointer"
                  >
                    <option value="popular">Top Searched</option>
                    <option value="low">Min Spend: Low → High</option>
                    <option value="high">Price: High → Low</option>
                    <option value="name">Name A–Z</option>
                  </select>
                </div>

                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 px-2.5 text-xs ${viewMode === 'grid' ? 'bg-laxBlue-950 text-white' : 'text-slate-600'}`}
                    title="Grid View"
                  >
                    <i className="fa-solid fa-table-cells-large"></i>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 px-2.5 text-xs ${viewMode === 'list' ? 'bg-laxBlue-950 text-white' : 'text-slate-600'}`}
                    title="List View"
                  >
                    <i className="fa-solid fa-list"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredServices.length === 0 && (
              <div className="bg-white rounded-3xl border border-blue-100 p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-laxRed-600 flex items-center justify-center mx-auto text-2xl mb-4">
                  <i className="fa-solid fa-filter-circle-xmark"></i>
                </div>
                <h3 className="font-grotesk font-bold text-xl text-laxBlue-950">No media options found</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                  Try widening your budget filter or switching cities to see available advertising inventories.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="mt-5 grad-btn text-white text-xs font-extrabold px-6 py-2.5 rounded-xl shadow"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredServices.map(service => {
                  const cities = getServiceCities(service);
                  const minSpend = service.min_spend || Math.round(service.price * 0.35);

                  return (
                    <div
                      key={service.id}
                      className="bg-white rounded-3xl overflow-hidden border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                      {/* Image Header */}
                      <div className="relative h-48 overflow-hidden bg-slate-900">
                        <Link to={`/services/${service.id}`}>
                          <img
                            src={service.image}
                            alt={service.name}
                            loading="lazy"
                            decoding="async"
                            width="400"
                            height="240"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={e => {
                              e.target.src = `https://picsum.photos/seed/${service.id}/800/500`;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>

                          {/* Chips */}
                          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                            <span className="chip bg-white/95 text-laxBlue-900 font-bold text-[11px] shadow">
                              {service.genre || service.type}
                            </span>
                            {service.chain_or_brand && (
                              <span className="chip bg-black/60 text-white backdrop-blur text-[11px] font-semibold border border-white/20">
                                {service.chain_or_brand}
                              </span>
                            )}
                          </div>

                          <div className="absolute top-3 right-3">
                            <span className="chip bg-laxRed-600 text-white font-bold text-[11px] shadow">
                              ★ {service.rating || 4.8}
                            </span>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <h4 className="font-grotesk font-bold text-base line-clamp-1 leading-snug drop-shadow-sm">
                              {service.name}
                            </h4>
                          </div>
                        </Link>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex flex-col flex-1 justify-between">
                        <div>
                          {/* Audience / Footfall Metric (Media Ant style) */}
                          {service.audience_metric && (
                            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 mb-3">
                              <i className="fa-solid fa-users text-laxBlue-700 text-sm shrink-0"></i>
                              <span className="truncate">{service.audience_metric}</span>
                            </div>
                          )}

                          {/* Cities */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {cities.slice(0, 3).map(city => (
                              <span
                                key={city}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-laxRed-700 border border-red-100"
                              >
                                📍 {city}
                              </span>
                            ))}
                            {cities.length > 3 && (
                              <span className="text-[10px] font-bold text-slate-400 self-center">
                                +{cities.length - 3} more
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mb-4">
                            {service.description}
                          </p>
                        </div>

                        {/* Pricing & Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
                          <div>
                            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              MIN SPEND
                            </div>
                            <div className="font-grotesk font-bold text-lg text-laxBlue-950">
                              ₹{Number(minSpend).toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold">
                              Rates from ₹{Number(service.price).toLocaleString('en-IN')}/mo
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenQuote(service)}
                              className="grad-btn text-white text-xs font-extrabold px-3.5 py-2.5 rounded-xl shadow hover:shadow-md transition"
                            >
                              Get Quote
                            </button>
                            <Link
                              to={`/services/${service.id}`}
                              className="bg-slate-100 hover:bg-slate-200 text-laxBlue-950 text-xs font-extrabold px-2.5 py-2.5 rounded-xl transition"
                              title="Details"
                            >
                              <i className="fa-solid fa-arrow-right"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Compact List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {filteredServices.map(service => {
                  const cities = getServiceCities(service);
                  const minSpend = service.min_spend || Math.round(service.price * 0.35);

                  return (
                    <div
                      key={service.id}
                      className="bg-white rounded-2xl border border-blue-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                    >
                      <div className="flex gap-4 items-start sm:items-center flex-1 min-w-0">
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-20 h-20 sm:w-28 sm:h-24 rounded-2xl object-cover shrink-0 bg-slate-900"
                          onError={e => {
                            e.target.src = `https://picsum.photos/seed/${service.id}/400/300`;
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="chip bg-blue-50 text-laxBlue-800 text-[10px] font-bold">
                              {service.genre || service.type}
                            </span>
                            {service.chain_or_brand && (
                              <span className="chip bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                {service.chain_or_brand}
                              </span>
                            )}
                            <span className="text-amber-500 text-xs font-bold">
                              ★ {service.rating || 4.8}
                            </span>
                          </div>

                          <Link
                            to={`/services/${service.id}`}
                            className="font-grotesk font-bold text-base text-laxBlue-950 hover:text-laxRed-600 transition truncate block"
                          >
                            {service.name}
                          </Link>

                          {service.audience_metric && (
                            <div className="text-xs text-slate-600 font-semibold mt-1 flex items-center gap-1.5 truncate">
                              <i className="fa-solid fa-users text-laxBlue-700 text-xs"></i>
                              <span>{service.audience_metric}</span>
                            </div>
                          )}

                          <div className="text-[11px] text-slate-400 font-medium mt-1 truncate">
                            📍 {cities.join(', ')}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-3">
                        <div className="text-left sm:text-right">
                          <div className="text-[10px] font-extrabold text-slate-400 uppercase">Min Spend</div>
                          <div className="font-grotesk font-bold text-lg text-laxBlue-950 leading-tight">
                            ₹{Number(minSpend).toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenQuote(service)}
                            className="grad-btn text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow"
                          >
                            Get Quote
                          </button>
                          <Link
                            to={`/services/${service.id}`}
                            className="bg-slate-100 hover:bg-slate-200 text-laxBlue-950 text-xs font-extrabold px-3 py-2 rounded-xl"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Inquiry Quote Modal */}
      <InquiryModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        selectedService={modalService}
        servicesList={services}
        locationsList={locations}
        onSuccess={() => setQuoteModalOpen(false)}
      />
    </div>
  );
}
