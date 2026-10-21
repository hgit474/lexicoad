import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getListings } from '../services/dataService';
import InquiryModal from '../components/InquiryModal';

const POPULAR_CATEGORIES = [
  'Transit',
  'Outdoor',
  'Airport',
  'Cinema',
  'Digital',
  'Retail',
  'Street Furniture'
];

export default function CategoryListings() {
  const { category: rawCategory } = useParams();
  const currentCategory = rawCategory ? decodeURIComponent(rawCategory).trim() : 'Transit';

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'low' | 'high' | 'name'

  // Pagination / Lazy-load visible counts per subcategory
  const [visibleCountMap, setVisibleCountMap] = useState({});
  const INITIAL_BATCH_SIZE = 6;

  // Quote modal
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [modalService, setModalService] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getListings().then((data) => {
      if (isMounted) {
        setListings(data);
        setLoading(false);
      }
    }).catch((err) => {
      console.error('Failed to load listings:', err);
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter listings by current category (case-insensitive)
  const categoryListings = useMemo(() => {
    return listings.filter(l => (l.category || '').toLowerCase() === currentCategory.toLowerCase());
  }, [listings, currentCategory]);

  // Available subcategories in this category
  const subcategories = useMemo(() => {
    const subs = [...new Set(categoryListings.map(l => l.subcategory).filter(Boolean))].sort();
    return subs;
  }, [categoryListings]);

  // Filtered & sorted listings
  const filteredListings = useMemo(() => {
    return categoryListings.filter(item => {
      if (activeSubcategory !== 'All' && (item.subcategory || '').toLowerCase() !== activeSubcategory.toLowerCase()) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const text = `${item.title || ''} ${item.location || ''} ${item.media_type || ''} ${item.subcategory || ''} ${item.description || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'low') return a.price - b.price;
      if (sortBy === 'high') return b.price - a.price;
      if (sortBy === 'name') return (a.title || '').localeCompare(b.title || '');
      return (b.reach || 0) - (a.reach || 0);
    });
  }, [categoryListings, activeSubcategory, searchQuery, sortBy]);

  // Group listings by subcategory for visually distinct sections
  const groupedListings = useMemo(() => {
    const groups = {};
    filteredListings.forEach(item => {
      const sub = item.subcategory || 'General Inventory';
      if (!groups[sub]) groups[sub] = [];
      groups[sub].push(item);
    });
    return groups;
  }, [filteredListings]);

  const handleOpenQuote = (listing) => {
    setModalService({
      id: listing.id,
      name: listing.title,
      price: listing.price,
      type: listing.category,
      genre: listing.category,
      sub_type: listing.subcategory
    });
    setQuoteModalOpen(true);
  };

  const handleLoadMore = (subKey) => {
    setVisibleCountMap(prev => ({
      ...prev,
      [subKey]: (prev[subKey] || INITIAL_BATCH_SIZE) + INITIAL_BATCH_SIZE
    }));
  };

  const minPrice = useMemo(() => {
    if (categoryListings.length === 0) return 0;
    return Math.min(...categoryListings.map(l => l.price));
  }, [categoryListings]);

  return (
    <div className="min-h-screen bg-[#F6F8FF] text-[#071343] font-jakarta pb-20">
      {/* Hero Category Banner */}
      <div className="grad-bg relative overflow-hidden text-white">
        <div className="absolute inset-0 hero-grid opacity-75"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-bold text-blue-200/80 mb-4">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <Link to="/services" className="hover:text-white transition">Media Marketplace</Link>
            <span>/</span>
            <span className="text-white capitalize">{currentCategory}</span>
          </nav>

          <div className="max-w-3xl">
            <span className="section-label text-red-300 uppercase tracking-widest text-[11px] font-extrabold">
              CATEGORY SPOTLIGHT
            </span>
            <h1 className="font-grotesk font-bold text-3xl sm:text-5xl mt-2 text-white leading-tight">
              {currentCategory} Advertising
            </h1>
            <p className="text-blue-100 mt-3 text-sm sm:text-base font-medium leading-relaxed">
              Explore high-visibility media inventory across {currentCategory}. Grouped by subcategory with verified audience metrics, rates, and direct media planning quotes.
            </p>

            {/* KPI Badges */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="bg-white/10 backdrop-blur border border-white/20 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <i className="fa-solid fa-rectangle-list text-red-300"></i>
                <span>{categoryListings.length} Media Properties</span>
              </div>
              <div className="bg-white/10 backdrop-blur border border-white/20 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <i className="fa-solid fa-layer-group text-blue-300"></i>
                <span>{subcategories.length} Subcategories</span>
              </div>
              {minPrice > 0 && (
                <div className="bg-white/10 backdrop-blur border border-white/20 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <i className="fa-solid fa-tag text-emerald-300"></i>
                  <span>Rates from ₹{Number(minPrice).toLocaleString('en-IN')}/mo</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Categories Switcher */}
          <div className="mt-8 pt-6 border-t border-white/15 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-blue-200/80 mr-1">Other Categories:</span>
            {POPULAR_CATEGORIES.map(cat => (
              <Link
                key={cat}
                to={`/category/${encodeURIComponent(cat)}`}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                  cat.toLowerCase() === currentCategory.toLowerCase()
                    ? 'bg-white text-laxBlue-950 shadow-md font-extrabold'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10 space-y-8">
        {/* Search & Subcategory Controls Filter Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-lg border border-blue-100 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${currentCategory} (e.g. Bus, Metro, Train, Station)...`}
              className="w-full bg-slate-50 border border-slate-200 focus:border-laxBlue-600 rounded-2xl py-2.5 pl-11 pr-4 text-xs sm:text-sm font-medium outline-none text-laxBlue-950 placeholder-slate-400"
            />
          </div>

          {/* Subcategory Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubcategory('All')}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl transition ${
                activeSubcategory === 'All'
                  ? 'bg-laxBlue-950 text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({categoryListings.length})
            </button>
            {subcategories.map(sub => {
              const count = categoryListings.filter(l => (l.subcategory || '').toLowerCase() === sub.toLowerCase()).length;
              return (
                <button
                  key={sub}
                  onClick={() => setActiveSubcategory(sub)}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl transition ${
                    activeSubcategory.toLowerCase() === sub.toLowerCase()
                      ? 'bg-laxBlue-950 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sub} ({count})
                </button>
              );
            })}

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 ml-auto md:ml-2">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-laxBlue-950 px-3 py-2 rounded-xl outline-none cursor-pointer"
              >
                <option value="popular">Top Reach / Imp</option>
                <option value="low">Price: Low → High</option>
                <option value="high">Price: High → Low</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-blue-100 p-16 text-center shadow-sm">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-laxBlue-900 mb-3 block"></i>
            <p className="text-sm font-bold text-slate-600">Loading {currentCategory} service listings...</p>
          </div>
        ) : Object.keys(groupedListings).length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-blue-100 p-12 sm:p-16 text-center shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-laxRed-600 flex items-center justify-center mx-auto text-2xl mb-4">
              <i className="fa-solid fa-filter-circle-xmark"></i>
            </div>
            <h3 className="font-grotesk font-bold text-xl text-laxBlue-950">
              No Listings Found in {currentCategory}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
              We couldn't find listings matching your search or filters. You can clear filters, check other categories, or request a custom media plan.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setActiveSubcategory('All');
                  setSearchQuery('');
                }}
                className="grad-btn text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow"
              >
                Reset Filters
              </button>
              <Link
                to="/services"
                className="bg-slate-100 hover:bg-slate-200 text-laxBlue-950 text-xs font-bold px-5 py-2.5 rounded-xl transition"
              >
                All Services
              </Link>
            </div>
          </div>
        ) : (
          /* Grouped Subcategory Sections */
          <div className="space-y-12">
            {Object.entries(groupedListings).map(([subcategoryName, items]) => {
              const visibleLimit = visibleCountMap[subcategoryName] || INITIAL_BATCH_SIZE;
              const visibleItems = items.slice(0, visibleLimit);
              const hasMore = items.length > visibleLimit;

              return (
                <section
                  key={subcategoryName}
                  id={`subcat-${subcategoryName.replace(/\s+/g, '-').toLowerCase()}`}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-blue-100/80 p-4 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Visually Distinct Subcategory Header Section */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl grad-btn flex items-center justify-center text-white text-xl shadow-md shrink-0">
                        {currentCategory.toLowerCase() === 'transit' ? (
                          <i className="fa-solid fa-train-subway"></i>
                        ) : currentCategory.toLowerCase() === 'outdoor' ? (
                          <i className="fa-solid fa-billboard"></i>
                        ) : currentCategory.toLowerCase() === 'airport' ? (
                          <i className="fa-solid fa-plane-departure"></i>
                        ) : (
                          <i className="fa-solid fa-layer-group"></i>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-grotesk font-bold text-xl sm:text-2xl text-laxBlue-950">
                            {subcategoryName}
                          </h2>
                          <span className="chip bg-blue-50 text-laxBlue-700 border border-blue-100 text-[11px] font-bold">
                            {items.length} {items.length === 1 ? 'Listing' : 'Listings'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          High-reach {currentCategory} &gt; {subcategoryName} formats across prime Indian metropolitan routes
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 font-bold self-start sm:self-center">
                      Section: {currentCategory} / {subcategoryName}
                    </div>
                  </div>

                  {/* Listings Grid */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleItems.map(listing => (
                      <div
                        key={listing.id}
                        className="bg-[#F8FAFF] rounded-2xl border border-blue-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                      >
                        {/* Image Header */}
                        <div className="relative h-48 overflow-hidden bg-slate-900">
                          {listing.image_url ? (
                            <img
                              src={listing.image_url}
                              alt={listing.title}
                              loading="lazy"
                              decoding="async"
                              width="400"
                              height="220"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src = `https://picsum.photos/seed/${listing.id}/800/500`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full grad-bg flex items-center justify-center text-white text-3xl opacity-80">
                              <i className="fa-solid fa-rectangle-ad"></i>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>

                          {/* Media Type Chip */}
                          <div className="absolute top-3 inset-x-3 flex items-start gap-1.5 flex-wrap z-10 pointer-events-none">
                            <span className="chip bg-white/95 text-laxBlue-900 font-bold text-[10px] sm:text-[11px] shadow max-w-[130px] sm:max-w-[160px] truncate pointer-events-auto">
                              {listing.media_type || listing.subcategory}
                            </span>
                            <span className="chip bg-black/60 text-white backdrop-blur text-[10px] sm:text-[11px] font-semibold border border-white/20 max-w-[110px] sm:max-w-[140px] truncate pointer-events-auto">
                              {listing.category}
                            </span>
                          </div>

                          {/* Location Badge */}
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <div className="text-[11px] font-bold text-red-300 flex items-center gap-1 mb-0.5 truncate">
                              <i className="fa-solid fa-location-dot text-[10px] shrink-0"></i>
                              <span className="truncate">{listing.location || 'Pan India'}</span>
                            </div>
                            <h3 className="font-grotesk font-bold text-base line-clamp-1 leading-snug drop-shadow-sm">
                              {listing.title}
                            </h3>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 min-w-0">
                          <div className="min-w-0">
                            {/* Reach Badge */}
                            {listing.reach ? (
                              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 bg-white border border-slate-200/60 rounded-xl px-2.5 sm:px-3 py-2 mb-2 shadow-xs min-w-0">
                                <i className="fa-solid fa-users text-laxBlue-700 text-sm shrink-0"></i>
                                <span className="truncate">{Number(listing.reach).toLocaleString('en-IN')} Reach / Week</span>
                              </div>
                            ) : null}

                            {/* Description */}
                            {listing.description && (
                              <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mb-2">
                                {listing.description}
                              </p>
                            )}
                          </div>

                          {/* Pricing & Call to Action (Wrap protected for mobile) */}
                          <div className="pt-3 border-t border-slate-200/80 flex flex-wrap sm:flex-nowrap items-end justify-between gap-2 min-w-0">
                            <div className="min-w-0 flex-1">
                              <div className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider truncate">
                                MONTHLY RATE
                              </div>
                              <div className="font-grotesk font-bold text-base sm:text-xl text-laxBlue-950 truncate leading-tight">
                                ₹{Number(listing.price).toLocaleString('en-IN')}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenQuote(listing)}
                              className="grad-btn text-white text-xs font-extrabold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow hover:shadow-md transition flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                            >
                              <span>Get Quote</span>
                              <i className="fa-solid fa-arrow-right text-[10px]"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Show More Pagination Button for this Subcategory */}
                  {hasMore && (
                    <div className="mt-8 text-center pt-4 border-t border-slate-100">
                      <button
                        onClick={() => handleLoadMore(subcategoryName)}
                        className="bg-white hover:bg-slate-50 text-laxBlue-950 border border-blue-200 text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition inline-flex items-center gap-2"
                      >
                        <i className="fa-solid fa-angles-down text-xs"></i>
                        <span>Load More {subcategoryName} Listings ({items.length - visibleLimit} remaining)</span>
                      </button>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Quote Inquiry Modal */}
      {quoteModalOpen && (
        <InquiryModal
          isOpen={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
          selectedService={modalService}
          servicesList={[]}
          locationsList={[]}
        />
      )}
    </div>
  );
}
