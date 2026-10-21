import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getServices, getLocations, getServiceLocations } from '../services/dataService';
import { useSite } from '../context/SiteContext';
import BrowseByGenre from '../components/BrowseByGenre';
import InquiryModal from '../components/InquiryModal';
import ServiceFilters from '../components/ServiceFilters';
import { getParsedFilterConfig } from '../lib/filterConfig';

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings } = useSite();
  const filterConfig = useMemo(() => getParsedFilterConfig(settings), [settings]);

  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [serviceLocations, setServiceLocations] = useState([]);

  // URL Initial Filters
  const initialType = searchParams.get('type') || searchParams.get('genre');
  const initialCity = searchParams.get('city');

  const [filters, setFilters] = useState({
    cities: initialCity && initialCity !== 'All' ? [initialCity] : [],
    categories: initialType && initialType !== 'All' ? [initialType] : [],
    subTypes: [],
    budgetBracket: 'all',
    reaches: [],
    durations: []
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
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
    if (typeParam && typeParam !== 'All') {
      setFilters(prev => {
        if (!prev.categories.includes(typeParam)) {
          return { ...prev, categories: [typeParam] };
        }
        return prev;
      });
    }
  }, [searchParams]);

  const activeGenre = filters.categories.length === 1 ? filters.categories[0] : (filters.categories.length > 1 ? 'Multiple' : 'All');

  const handleSelectGenre = (genreId) => {
    if (genreId === 'All') {
      setFilters(prev => ({ ...prev, categories: [] }));
      searchParams.delete('type');
      searchParams.delete('genre');
    } else {
      setFilters(prev => ({ ...prev, categories: [genreId] }));
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

  const allCitiesList = useMemo(() => {
    return [...new Set(services.flatMap(getServiceCities))].sort();
  }, [services, serviceLocations, locations]);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const sGenre = s.genre || s.type || '';

      // 1. Categories / Genres
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.some(c => c.toLowerCase() === sGenre.toLowerCase())) {
          return false;
        }
      }

      // 2. Cities / Locations (multi-select)
      if (filters.cities && filters.cities.length > 0) {
        const cities = getServiceCities(s);
        const matchCity = filters.cities.some(fc =>
          cities.some(c => c.toLowerCase() === fc.toLowerCase())
        );
        if (!matchCity) return false;
      }

      // 3. Ad Options / Formats (sub_types)
      if (filters.subTypes && filters.subTypes.length > 0) {
        if (!s.sub_type || !filters.subTypes.includes(s.sub_type)) {
          return false;
        }
      }

      // 4. Budget Bracket
      if (filters.budgetBracket && filters.budgetBracket !== 'all') {
        const bracket = (filterConfig.budget_brackets || []).find(b => b.id === filters.budgetBracket);
        if (bracket) {
          const val = s.min_spend || s.price || 0;
          if (val < bracket.min || (bracket.max !== Infinity && val > bracket.max)) {
            return false;
          }
        }
      }

      // 5. Audience & Reach
      if (filters.reaches && filters.reaches.length > 0) {
        const metric = s.audience_metric || '';
        const matchAny = filters.reaches.some(r => {
          if (r === 'mega') return /([1-9]\d*M|\d+\.\d+M|crore|cr)/i.test(metric);
          if (r === 'high') return /(500K|[5-9]\d\dK|600K|700K|800K|900K)/i.test(metric);
          if (r === 'mid') return /(100K|150K|200K|250K|300K|400K|lakh)/i.test(metric);
          if (r === 'local') return /(under 100k|50k|75k|neighbourhood|ward)/i.test(metric);
          return true;
        });
        if (!matchAny) return false;
      }

      // 6. Durations
      if (filters.durations && filters.durations.length > 0) {
        const dur = s.durations || '';
        const matchAny = filters.durations.some(d => {
          if (d === 'short') return /(10|15|two weeks|2 weeks)/i.test(dur);
          if (d === '1month') return /(1 month|monthly|30 days)/i.test(dur);
          if (d === '3months') return /(3 months|quarterly)/i.test(dur);
          if (d === 'long') return /(6 months|annual|1 year)/i.test(dur);
          return true;
        });
        if (!matchAny) return false;
      }

      // 7. Search Query
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
  }, [services, filters, searchQuery, sortBy, filterConfig, serviceLocations, locations]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Reset page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery, sortBy, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (itemsPerPage === 'all') return 1;
    return Math.max(1, Math.ceil(filteredServices.length / Number(itemsPerPage)));
  }, [filteredServices.length, itemsPerPage]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    pages.push(totalPages);
    return pages;
  }, [totalPages, currentPage]);

  const paginatedServices = useMemo(() => {
    if (itemsPerPage === 'all') return filteredServices;
    const size = Number(itemsPerPage);
    const start = (currentPage - 1) * size;
    return filteredServices.slice(start, start + size);
  }, [filteredServices, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const catalogEl = document.getElementById('services-catalog-top');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const resetAllFilters = () => {
    setFilters({
      cities: [],
      categories: [],
      subTypes: [],
      budgetBracket: 'all',
      reaches: [],
      durations: []
    });
    setSearchQuery('');
    setCurrentPage(1);
    searchParams.delete('type');
    searchParams.delete('genre');
    searchParams.delete('city');
    setSearchParams(searchParams);
  };

  const handleOpenQuote = (service) => {
    setModalService(service);
    setQuoteModalOpen(true);
  };

  const activeFiltersCount =
    (filters.cities?.length || 0) +
    (filters.categories?.length || 0) +
    (filters.subTypes?.length || 0) +
    (filters.budgetBracket && filters.budgetBracket !== 'all' ? 1 : 0) +
    (filters.reaches?.length || 0) +
    (filters.durations?.length || 0) +
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

            <div className="flex gap-2 min-w-0">
              <select
                value={filters.cities[0] || 'All'}
                onChange={e => {
                  const val = e.target.value;
                  setFilters(prev => ({ ...prev, cities: val === 'All' ? [] : [val] }));
                }}
                aria-label="Filter media by city"
                className="flex-1 min-w-0 md:w-44 px-3 py-3 text-xs sm:text-sm font-bold bg-slate-50 rounded-xl outline-none text-laxBlue-950 cursor-pointer border border-slate-200/80 truncate"
              >
                <option value="All">📍 All Cities</option>
                {allCitiesList.map(city => (
                  <option key={city} value={city}>
                    📍 {city}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="md:hidden px-3.5 sm:px-4 py-3 bg-laxBlue-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              >
                <i className="fa-solid fa-sliders"></i>
                <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 w-full min-w-0">
        {/* Browse Media By Genre Grid */}
        <BrowseByGenre
          activeGenre={activeGenre}
          onSelectGenre={handleSelectGenre}
          services={services}
        />

        {/* Main Catalog View: Left Sidebar + Right Inventory */}
        <div className="grid lg:grid-cols-4 gap-6 items-start mt-3 sm:mt-4 w-full min-w-0">
          {/* Left Filter Sidebar (The Media Ant style) */}
          <aside className={`
            lg:block lg:sticky lg:top-24 z-30
            ${mobileFilterOpen ? 'fixed inset-x-4 top-20 bottom-6 overflow-y-auto z-50 block' : 'hidden'}
          `}>
            {/* Mobile Close Button */}
            {mobileFilterOpen && (
              <div className="lg:hidden flex items-center justify-between bg-white px-4 py-3 border-b border-slate-200 rounded-t-2xl shadow-sm mb-2">
                <span className="font-grotesk font-bold text-sm text-slate-900">Filters</span>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"
                >
                  <i className="fa-solid fa-xmark text-xs"></i>
                </button>
              </div>
            )}

            <ServiceFilters
              services={services}
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={resetAllFilters}
              config={filterConfig}
            />

            {/* Direct Assistance Card */}
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#052F42] to-[#8E0808] p-4 text-white text-xs shadow-sm">
              <div className="font-grotesk font-bold text-sm mb-1">Need a Custom Media Plan?</div>
              <p className="text-blue-100 text-[11px] leading-relaxed mb-3">
                Our outdoor media strategist will build a geo-targeted plan within 4 hours.
              </p>
              <button
                onClick={() => handleOpenQuote(null)}
                className="w-full py-2 bg-white text-laxBlue-950 rounded-xl font-extrabold hover:bg-slate-100 transition shadow"
              >
                Request Media Plan
              </button>
            </div>
          </aside>

          {/* Right Inventory Listing */}
          <main className="lg:col-span-3 min-w-0 w-full max-w-full">
            {/* Top Toolbar: Result Count, Sort By, View Mode */}
            <div id="services-catalog-top" className="bg-white rounded-2xl border border-blue-100 px-3.5 sm:px-4 py-3 shadow-sm mb-4 flex flex-wrap items-center justify-between gap-3 scroll-mt-24 min-w-0 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold text-laxBlue-950">
                  {filteredServices.length} Media Properties
                </span>
                {totalPages > 1 && (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Page {currentPage} of {totalPages}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-slate-400 hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="text-xs font-bold text-laxBlue-950 bg-slate-50 border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-lg outline-none cursor-pointer max-w-[170px] sm:max-w-none truncate"
                  >
                    <option value="popular">Top Searched</option>
                    <option value="low">Min Spend: Low → High</option>
                    <option value="high">Price: High → Low</option>
                    <option value="name">Name A–Z</option>
                  </select>
                </div>

                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shrink-0">
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

            {/* Active Filter Chips / Pills (Media Ant style) */}
            {activeFiltersCount > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 mb-5 flex flex-wrap items-center gap-2 text-xs shadow-xs">
                <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider mr-1">
                  Active Filters:
                </span>

                {filters.cities.map(city => (
                  <span
                    key={`chip-city-${city}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    <i className="fa-solid fa-location-dot text-[10px]"></i>
                    <span>{city}</span>
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, cities: prev.cities.filter(c => c !== city) }))}
                      className="hover:text-indigo-900 ml-0.5"
                    >
                      <i className="fa-solid fa-xmark text-[10px]"></i>
                    </button>
                  </span>
                ))}

                {filters.categories.map(cat => (
                  <span
                    key={`chip-cat-${cat}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    <i className="fa-solid fa-tag text-[10px]"></i>
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, categories: prev.categories.filter(c => c !== cat) }))}
                      className="hover:text-blue-900 ml-0.5"
                    >
                      <i className="fa-solid fa-xmark text-[10px]"></i>
                    </button>
                  </span>
                ))}

                {filters.subTypes.map(st => (
                  <span
                    key={`chip-st-${st}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200"
                  >
                    <i className="fa-solid fa-shapes text-[10px]"></i>
                    <span className="max-w-[150px] truncate">{st}</span>
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, subTypes: prev.subTypes.filter(s => s !== st) }))}
                      className="hover:text-purple-900 ml-0.5"
                    >
                      <i className="fa-solid fa-xmark text-[10px]"></i>
                    </button>
                  </span>
                ))}

                {filters.budgetBracket && filters.budgetBracket !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <i className="fa-solid fa-indian-rupee-sign text-[10px]"></i>
                    <span>
                      {(filterConfig.budget_brackets || []).find(b => b.id === filters.budgetBracket)?.label || filters.budgetBracket}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, budgetBracket: 'all' }))}
                      className="hover:text-emerald-900 ml-0.5"
                    >
                      <i className="fa-solid fa-xmark text-[10px]"></i>
                    </button>
                  </span>
                )}

                {filters.reaches.map(r => (
                  <span
                    key={`chip-reach-${r}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200"
                  >
                    <i className="fa-solid fa-users text-[10px]"></i>
                    <span className="uppercase">{r} REACH</span>
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, reaches: prev.reaches.filter(x => x !== r) }))}
                      className="hover:text-amber-900 ml-0.5"
                    >
                      <i className="fa-solid fa-xmark text-[10px]"></i>
                    </button>
                  </span>
                ))}

                {filters.durations.map(d => (
                  <span
                    key={`chip-dur-${d}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    <i className="fa-solid fa-clock text-[10px]"></i>
                    <span>{d}</span>
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, durations: prev.durations.filter(x => x !== d) }))}
                      className="hover:text-slate-900 ml-0.5"
                    >
                      <i className="fa-solid fa-xmark text-[10px]"></i>
                    </button>
                  </span>
                ))}

                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-extrabold text-laxRed-600 hover:text-laxRed-700 ml-auto transition hover:underline"
                >
                  Clear All
                </button>
              </div>
            )}

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
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 min-w-0 w-full">
                {paginatedServices.map(service => {
                  const cities = getServiceCities(service);
                  const minSpend = service.min_spend || Math.round(service.price * 0.35);

                  return (
                    <div
                      key={service.id}
                      className="bg-white rounded-3xl overflow-hidden border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group min-w-0 w-full"
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

                          {/* Chips Bar: Consistent 2-line layout (Line 1: Category & Star, Line 2: Brand) */}
                          <div className="absolute top-3 inset-x-3 flex items-start justify-between gap-2 pointer-events-none z-10">
                            {/* Left: Category (Line 1) + Brand (Line 2) strictly stacked */}
                            <div className="flex flex-col items-start gap-1.5 min-w-0 max-w-[calc(100%-60px)] pointer-events-auto">
                              <span className="chip bg-white/95 text-laxBlue-900 font-bold text-[10px] sm:text-[11px] shadow max-w-full truncate">
                                {service.genre || service.type}
                              </span>
                              {service.chain_or_brand && (
                                <span className="chip bg-black/60 text-white backdrop-blur text-[10px] sm:text-[11px] font-semibold border border-white/20 max-w-full truncate">
                                  {service.chain_or_brand}
                                </span>
                              )}
                            </div>

                            {/* Right: Star Rating (Always anchored top-right) */}
                            <span className="chip bg-laxRed-600 text-white font-bold text-[10px] sm:text-[11px] shadow shrink-0 pointer-events-auto">
                              ★ {service.rating || 4.8}
                            </span>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <h4 className="font-grotesk font-bold text-sm sm:text-base line-clamp-1 leading-snug drop-shadow-sm">
                              {service.name}
                            </h4>
                          </div>
                        </Link>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between min-w-0">
                        <div className="min-w-0">
                          {/* Audience / Footfall Metric (Media Ant style) */}
                          {service.audience_metric && (
                            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 bg-slate-50 border border-slate-200/60 rounded-xl px-2.5 sm:px-3 py-2 mb-3 min-w-0">
                              <i className="fa-solid fa-users text-laxBlue-700 text-sm shrink-0"></i>
                              <span className="truncate">{service.audience_metric}</span>
                            </div>
                          )}

                          {/* Cities */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {cities.slice(0, 3).map(city => (
                              <span
                                key={city}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-laxRed-700 border border-red-100 truncate max-w-[110px]"
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

                        {/* Pricing & Actions (Non-clipping, wrap-protected on all mobile screens) */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-end justify-between gap-2 min-w-0">
                          <div className="min-w-0 flex-1">
                            <div className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider truncate">
                              MIN SPEND
                            </div>
                            <div className="font-grotesk font-bold text-base sm:text-lg text-laxBlue-950 truncate leading-tight">
                              ₹{Number(minSpend).toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold truncate">
                              Rates from ₹{Number(service.price).toLocaleString('en-IN')}/mo
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenQuote(service)}
                              className="grad-btn text-white text-xs font-extrabold px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl shadow hover:shadow-md transition whitespace-nowrap"
                            >
                              Get Quote
                            </button>
                            <Link
                              to={`/services/${service.id}`}
                              className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-100 hover:bg-slate-200 text-laxBlue-950 text-xs font-extrabold rounded-xl transition flex items-center justify-center shrink-0"
                              title="Details"
                              aria-label={`View details for ${service.name}`}
                            >
                              <i className="fa-solid fa-arrow-right text-[11px]"></i>
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
                {paginatedServices.map(service => {
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

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenQuote(service)}
                            className="grad-btn text-white text-xs font-extrabold px-3.5 py-2 sm:px-4 rounded-xl shadow whitespace-nowrap shrink-0"
                          >
                            Get Quote
                          </button>
                          <Link
                            to={`/services/${service.id}`}
                            className="bg-slate-100 hover:bg-slate-200 text-laxBlue-950 text-xs font-extrabold px-3 py-2 rounded-xl shrink-0"
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

            {/* Pagination & Next Page Controls */}
            {filteredServices.length > 0 && (
              <div className="mt-10 bg-white rounded-2xl border border-blue-100 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Result count & Per Page Selector */}
                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold w-full md:w-auto justify-between md:justify-start">
                  <span>
                    Showing <strong className="text-laxBlue-950 font-bold">{Math.min((currentPage - 1) * Number(itemsPerPage === 'all' ? filteredServices.length : itemsPerPage) + 1, filteredServices.length)}–{Math.min(currentPage * Number(itemsPerPage === 'all' ? filteredServices.length : itemsPerPage), filteredServices.length)}</strong> of <strong className="text-laxBlue-950 font-bold">{filteredServices.length}</strong> media options
                  </span>

                  <div className="flex items-center gap-1.5 ml-2">
                    <span className="text-slate-400 hidden sm:inline">Per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={e => setItemsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 text-laxBlue-950 font-bold text-xs rounded-lg px-2.5 py-1 outline-none cursor-pointer hover:border-slate-300 transition"
                    >
                      <option value={6}>6</option>
                      <option value={9}>9</option>
                      <option value={12}>12</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                </div>

                {/* Navigation Buttons: Previous, Page Numbers, Next Page */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap w-full md:w-auto justify-center md:justify-end">
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 ${
                        currentPage === 1
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50'
                          : 'bg-white hover:bg-slate-50 text-laxBlue-950 border border-slate-200 shadow-xs hover:border-slate-300'
                      }`}
                      aria-label="Previous Page"
                    >
                      <i className="fa-solid fa-chevron-left text-[10px]"></i>
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1 shrink-0">
                      {pageNumbers.map((page, idx) => {
                        if (page === '...') {
                          return (
                            <span key={`ellipsis-${idx}`} className="w-6 sm:w-8 text-center text-slate-400 font-bold text-xs">
                              …
                            </span>
                          );
                        }

                        const isCurrent = currentPage === page;
                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-extrabold transition flex items-center justify-center shrink-0 ${
                              isCurrent
                                ? 'grad-btn text-white shadow-md'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Page Button */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 ${
                        currentPage === totalPages
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50'
                          : 'bg-white hover:bg-slate-50 text-laxBlue-950 border border-slate-200 shadow-xs hover:border-slate-300'
                      }`}
                      aria-label="Next Page"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    </button>
                  </div>
                )}
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
