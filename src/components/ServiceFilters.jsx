import React, { useState, useMemo } from 'react';

export default function ServiceFilters({
  services = [],
  filters = {
    cities: [],
    categories: [],
    subTypes: [],
    budgetBracket: 'all',
    reaches: [],
    durations: []
  },
  onFilterChange,
  onResetFilters,
  config = {},
  onOpenAdminConfig,
  isAdmin = false,
  className = ''
}) {
  // Accordion collapsed/expanded states
  const [openSections, setOpenSections] = useState({
    location: true,
    category: true,
    format: true,
    budget: true,
    reach: false,
    duration: false
  });

  // "Show More" toggles per section
  const [expandedSections, setExpandedSections] = useState({
    location: false,
    category: false,
    format: false,
    reach: false,
    duration: false
  });

  // Internal search queries for options
  const [globalFilterSearch, setGlobalFilterSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [formatSearch, setFormatSearch] = useState('');

  // Auto-expand sections if global search is typed
  useEffect(() => {
    if (globalFilterSearch.trim()) {
      setOpenSections(prev => ({
        ...prev,
        location: true,
        category: true,
        format: true
      }));
    }
  }, [globalFilterSearch]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleExpanded = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const maxVisible = config.max_visible_items || 5;

  // Helper: Extract cities for a service
  const getServiceCities = (service) => {
    if (!service.cities) return [];
    return service.cities
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);
  };

  // 1. Location counts & list
  const locationStats = useMemo(() => {
    const counts = {};
    services.forEach(s => {
      const cities = getServiceCities(s);
      cities.forEach(c => {
        counts[c] = (counts[c] || 0) + 1;
      });
    });

    const list = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return list;
  }, [services]);

  const filteredLocations = useMemo(() => {
    const q = (globalFilterSearch || locationSearch).toLowerCase().trim();
    if (!q) return locationStats;
    return locationStats.filter(item => item.name.toLowerCase().includes(q));
  }, [locationStats, locationSearch, globalFilterSearch]);

  // 2. Category / Media Genre counts & list
  const categoryStats = useMemo(() => {
    const counts = {};
    services.forEach(s => {
      const genre = s.genre || s.type || 'Other';
      counts[genre] = (counts[genre] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [services]);

  const filteredCategories = useMemo(() => {
    const q = (globalFilterSearch || categorySearch).toLowerCase().trim();
    if (!q) return categoryStats;
    return categoryStats.filter(item => item.name.toLowerCase().includes(q));
  }, [categoryStats, categorySearch, globalFilterSearch]);

  // 3. Ad Options / Formats (sub_types) counts & list
  const formatStats = useMemo(() => {
    const counts = {};
    services.forEach(s => {
      const format = s.sub_type;
      if (format && format.trim()) {
        counts[format.trim()] = (counts[format.trim()] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [services]);

  const filteredFormats = useMemo(() => {
    const q = (globalFilterSearch || formatSearch).toLowerCase().trim();
    if (!q) return formatStats;
    return formatStats.filter(item => item.name.toLowerCase().includes(q));
  }, [formatStats, formatSearch, globalFilterSearch]);

  // 4. Budget brackets counts
  const budgetBrackets = config.budget_brackets || [
    { id: 'all', label: 'All Budgets', min: 0, max: 999999999 },
    { id: 'under_25k', label: 'Under ₹25K', min: 0, max: 25000 },
    { id: '25k_50k', label: '₹25K - ₹50K', min: 25000, max: 50000 },
    { id: '50k_100k', label: '₹50K - ₹1L', min: 50000, max: 100000 },
    { id: '100k_300k', label: '₹1L - ₹3L', min: 100000, max: 300000 },
    { id: 'above_300k', label: '₹3L+', min: 300000, max: 999999999 }
  ];

  const budgetStats = useMemo(() => {
    return budgetBrackets.map(b => {
      if (b.id === 'all') {
        return { ...b, count: services.length };
      }
      const count = services.filter(s => {
        const val = s.min_spend || s.price || 0;
        return val >= b.min && (b.max === Infinity ? true : val <= b.max);
      }).length;
      return { ...b, count };
    });
  }, [services, budgetBrackets]);

  // 5. Audience & Reach tiers
  const reachTiers = [
    { id: 'mega', label: 'Mega Reach (1M+ monthly)', check: (m) => /([1-9]\d*M|\d+\.\d+M|crore|cr)/i.test(m) || parseInt(m) >= 1000000 },
    { id: 'high', label: 'High Reach (500K - 1M)', check: (m) => /(500K|[5-9]\d\dK|600K|700K|800K|900K)/i.test(m) },
    { id: 'mid', label: 'Mid Tier (100K - 500K)', check: (m) => /(100K|150K|200K|250K|300K|400K|lakh)/i.test(m) },
    { id: 'local', label: 'Targeted Local (< 100K)', check: (m) => /(under 100k|50k|75k|neighbourhood|ward)/i.test(m) }
  ];

  const reachStats = useMemo(() => {
    return reachTiers.map(t => {
      const count = services.filter(s => {
        const metric = s.audience_metric || '';
        return t.check(metric);
      }).length;
      return { ...t, count };
    });
  }, [services]);

  // 6. Duration options
  const durationOptions = [
    { id: 'short', label: '10–15 Days', check: (d) => /(10|15|two weeks|2 weeks)/i.test(d) },
    { id: '1month', label: '1 Month', check: (d) => /(1 month|monthly|30 days)/i.test(d) },
    { id: '3months', label: '3 Months', check: (d) => /(3 months|quarterly)/i.test(d) },
    { id: 'long', label: 'Long Term (6M+)', check: (d) => /(6 months|annual|1 year)/i.test(d) }
  ];

  const durationStats = useMemo(() => {
    return durationOptions.map(d => {
      const count = services.filter(s => {
        const dur = s.durations || '';
        return d.check(dur);
      }).length;
      return { ...d, count };
    });
  }, [services]);

  // Handler: toggle location selection
  const handleLocationClick = (cityName) => {
    const isMulti = config.allow_multi_location !== false;
    let nextCities = [];
    if (isMulti) {
      if (filters.cities.includes(cityName)) {
        nextCities = filters.cities.filter(c => c !== cityName);
      } else {
        nextCities = [...filters.cities, cityName];
      }
    } else {
      nextCities = filters.cities.includes(cityName) ? [] : [cityName];
    }
    onFilterChange({ ...filters, cities: nextCities });
  };

  // Handler: toggle category selection
  const handleCategoryClick = (categoryName) => {
    const isMulti = config.allow_multi_category !== false;
    let nextCategories = [];
    if (isMulti) {
      if (filters.categories.includes(categoryName)) {
        nextCategories = filters.categories.filter(c => c !== categoryName);
      } else {
        nextCategories = [...filters.categories, categoryName];
      }
    } else {
      nextCategories = filters.categories.includes(categoryName) ? [] : [categoryName];
    }
    onFilterChange({ ...filters, categories: nextCategories });
  };

  // Handler: toggle format selection
  const handleFormatClick = (formatName) => {
    let nextFormats = [];
    if (filters.subTypes.includes(formatName)) {
      nextFormats = filters.subTypes.filter(f => f !== formatName);
    } else {
      nextFormats = [...filters.subTypes, formatName];
    }
    onFilterChange({ ...filters, subTypes: nextFormats });
  };

  // Handler: select budget bracket
  const handleBudgetClick = (bracketId) => {
    onFilterChange({ ...filters, budgetBracket: bracketId });
  };

  // Handler: toggle reach tier
  const handleReachClick = (reachId) => {
    let nextReaches = [];
    if (filters.reaches.includes(reachId)) {
      nextReaches = filters.reaches.filter(r => r !== reachId);
    } else {
      nextReaches = [...filters.reaches, reachId];
    }
    onFilterChange({ ...filters, reaches: nextReaches });
  };

  // Handler: toggle duration
  const handleDurationClick = (durId) => {
    let nextDurations = [];
    if (filters.durations.includes(durId)) {
      nextDurations = filters.durations.filter(d => d !== durId);
    } else {
      nextDurations = [...filters.durations, durId];
    }
    onFilterChange({ ...filters, durations: nextDurations });
  };

  // Count active filters
  const activeCount =
    (filters.cities?.length || 0) +
    (filters.categories?.length || 0) +
    (filters.subTypes?.length || 0) +
    (filters.budgetBracket && filters.budgetBracket !== 'all' ? 1 : 0) +
    (filters.reaches?.length || 0) +
    (filters.durations?.length || 0);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-800 ${className}`}>
      {/* Filters Header (Media Ant style) */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="font-grotesk font-extrabold text-lg text-slate-900 tracking-tight">
            Filters
          </h2>
          {activeCount > 0 && (
            <span className="bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Global Quick Search across all filter options */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={globalFilterSearch}
            onChange={e => setGlobalFilterSearch(e.target.value)}
            placeholder="Search filter options..."
            aria-label="Search all filter options"
            className="w-full pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 transition shadow-2xs"
          />
          {globalFilterSearch && (
            <button
              type="button"
              onClick={() => setGlobalFilterSearch('')}
              aria-label="Clear filter search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {/* 1. LOCATION SECTION */}
        {config.show_location !== false && (
          <div className="p-4 sm:p-5">
            <button
              type="button"
              onClick={() => toggleSection('location')}
              className="w-full flex items-center justify-between text-left group"
            >
              <span className="text-xs font-extrabold tracking-wider text-slate-900 uppercase">
                {config.location_title || 'LOCATION'}
              </span>
              <i
                className={`fa-solid fa-chevron-up text-xs text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                  openSections.location ? '' : 'rotate-180'
                }`}
              ></i>
            </button>

            {openSections.location && (
              <div className="mt-3">
                {/* Search inside Location */}
                <div className="relative mb-3">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={e => setLocationSearch(e.target.value)}
                    placeholder="Type to search"
                    className="w-full pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 transition"
                  />
                  {locationSearch && (
                    <button
                      type="button"
                      onClick={() => setLocationSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <i className="fa-solid fa-xmark text-xs"></i>
                    </button>
                  )}
                </div>

                {/* City Options List */}
                <div className="space-y-2">
                  {filteredLocations.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">No matching cities</p>
                  ) : (
                    (expandedSections.location
                      ? filteredLocations
                      : filteredLocations.slice(0, maxVisible)
                    ).map(item => {
                      const isChecked = filters.cities.includes(item.name);
                      return (
                        <label
                          key={item.name}
                          className="flex items-center justify-between text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none group py-0.5"
                        >
                          <span className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleLocationClick(item.name)}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                            />
                            <span className={isChecked ? 'font-bold text-indigo-950' : 'font-medium'}>
                              {item.name}
                            </span>
                          </span>
                          <span className="text-slate-400 text-xs font-normal">
                            ({item.count})
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>

                {/* More / Less Toggle */}
                {filteredLocations.length > maxVisible && (
                  <button
                    type="button"
                    onClick={() => toggleExpanded('location')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-2 block"
                  >
                    {expandedSections.location
                      ? 'Show Less'
                      : `${filteredLocations.length - maxVisible} More`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. CATEGORY / MEDIA GENRE SECTION */}
        {config.show_category !== false && (
          <div className="p-4 sm:p-5">
            <button
              type="button"
              onClick={() => toggleSection('category')}
              className="w-full flex items-center justify-between text-left group"
            >
              <span className="text-xs font-extrabold tracking-wider text-slate-900 uppercase">
                {config.category_title || 'CATEGORY'}
              </span>
              <i
                className={`fa-solid fa-chevron-up text-xs text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                  openSections.category ? '' : 'rotate-180'
                }`}
              ></i>
            </button>

            {openSections.category && (
              <div className="mt-3">
                {/* Search inside Category */}
                <div className="relative mb-3">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={e => setCategorySearch(e.target.value)}
                    placeholder="Type to search"
                    className="w-full pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 transition"
                  />
                  {categorySearch && (
                    <button
                      type="button"
                      onClick={() => setCategorySearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <i className="fa-solid fa-xmark text-xs"></i>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {filteredCategories.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">No matching categories</p>
                  ) : (
                    (expandedSections.category
                      ? filteredCategories
                      : filteredCategories.slice(0, maxVisible)
                    ).map(item => {
                      const isChecked = filters.categories.includes(item.name);
                      return (
                        <label
                          key={item.name}
                          className="flex items-center justify-between text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none group py-0.5"
                        >
                          <span className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCategoryClick(item.name)}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                            />
                            <span className={isChecked ? 'font-bold text-indigo-950' : 'font-medium'}>
                              {item.name}
                            </span>
                          </span>
                          <span className="text-slate-400 text-xs font-normal">
                            ({item.count})
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>

                {filteredCategories.length > maxVisible && (
                  <button
                    type="button"
                    onClick={() => toggleExpanded('category')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-2 block"
                  >
                    {expandedSections.category
                      ? 'Show Less'
                      : `${filteredCategories.length - maxVisible} More`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. AD OPTIONS / FORMAT SECTION */}
        {config.show_format !== false && formatStats.length > 0 && (
          <div className="p-4 sm:p-5">
            <button
              type="button"
              onClick={() => toggleSection('format')}
              className="w-full flex items-center justify-between text-left group"
            >
              <span className="text-xs font-extrabold tracking-wider text-slate-900 uppercase">
                {config.format_title || 'AD OPTIONS'}
              </span>
              <i
                className={`fa-solid fa-chevron-up text-xs text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                  openSections.format ? '' : 'rotate-180'
                }`}
              ></i>
            </button>

            {openSections.format && (
              <div className="mt-3">
                <div className="relative mb-3">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input
                    type="text"
                    value={formatSearch}
                    onChange={e => setFormatSearch(e.target.value)}
                    placeholder="Type to search"
                    className="w-full pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 transition"
                  />
                  {formatSearch && (
                    <button
                      type="button"
                      onClick={() => setFormatSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <i className="fa-solid fa-xmark text-xs"></i>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {filteredFormats.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">No matching ad options</p>
                  ) : (
                    (expandedSections.format
                      ? filteredFormats
                      : filteredFormats.slice(0, maxVisible)
                    ).map(item => {
                      const isChecked = filters.subTypes.includes(item.name);
                      return (
                        <label
                          key={item.name}
                          className="flex items-center justify-between text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none group py-0.5"
                        >
                          <span className="flex items-center gap-2.5 max-w-[80%]">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleFormatClick(item.name)}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 shrink-0"
                            />
                            <span className={`truncate ${isChecked ? 'font-bold text-indigo-950' : 'font-medium'}`}>
                              {item.name}
                            </span>
                          </span>
                          <span className="text-slate-400 text-xs font-normal">
                            ({item.count})
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>

                {filteredFormats.length > maxVisible && (
                  <button
                    type="button"
                    onClick={() => toggleExpanded('format')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-2 block"
                  >
                    {expandedSections.format
                      ? 'Show Less'
                      : `${filteredFormats.length - maxVisible} More`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. BUDGET SECTION (Radio circles matching Media Ant) */}
        {config.show_budget !== false && (
          <div className="p-4 sm:p-5">
            <button
              type="button"
              onClick={() => toggleSection('budget')}
              className="w-full flex items-center justify-between text-left group"
            >
              <span className="text-xs font-extrabold tracking-wider text-slate-900 uppercase">
                {config.budget_title || 'BUDGET'}
              </span>
              <i
                className={`fa-solid fa-chevron-up text-xs text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                  openSections.budget ? '' : 'rotate-180'
                }`}
              ></i>
            </button>

            {openSections.budget && (
              <div className="mt-3 space-y-2">
                {budgetStats.map(item => {
                  const isChecked = (filters.budgetBracket || 'all') === item.id;
                  return (
                    <label
                      key={item.id}
                      className="flex items-center justify-between text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none group py-0.5"
                    >
                      <span className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="media_ant_budget"
                          value={item.id}
                          checked={isChecked}
                          onChange={() => handleBudgetClick(item.id)}
                          className="w-4 h-4 border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        />
                        <span className={isChecked ? 'font-bold text-indigo-950' : 'font-medium'}>
                          {item.label}
                        </span>
                      </span>
                      <span className="text-slate-400 text-xs font-normal">
                        ({item.count})
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 5. AUDIENCE & REACH SECTION */}
        {config.show_reach !== false && (
          <div className="p-4 sm:p-5">
            <button
              type="button"
              onClick={() => toggleSection('reach')}
              className="w-full flex items-center justify-between text-left group"
            >
              <span className="text-xs font-extrabold tracking-wider text-slate-900 uppercase">
                {config.reach_title || 'AUDIENCE & REACH'}
              </span>
              <i
                className={`fa-solid fa-chevron-up text-xs text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                  openSections.reach ? '' : 'rotate-180'
                }`}
              ></i>
            </button>

            {openSections.reach && (
              <div className="mt-3 space-y-2">
                {reachStats.map(item => {
                  const isChecked = filters.reaches.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className="flex items-center justify-between text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none group py-0.5"
                    >
                      <span className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleReachClick(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        />
                        <span className={isChecked ? 'font-bold text-indigo-950' : 'font-medium'}>
                          {item.label}
                        </span>
                      </span>
                      <span className="text-slate-400 text-xs font-normal">
                        ({item.count})
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 6. CAMPAIGN DURATION SECTION */}
        {config.show_duration !== false && (
          <div className="p-4 sm:p-5">
            <button
              type="button"
              onClick={() => toggleSection('duration')}
              className="w-full flex items-center justify-between text-left group"
            >
              <span className="text-xs font-extrabold tracking-wider text-slate-900 uppercase">
                {config.duration_title || 'CAMPAIGN DURATION'}
              </span>
              <i
                className={`fa-solid fa-chevron-up text-xs text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                  openSections.duration ? '' : 'rotate-180'
                }`}
              ></i>
            </button>

            {openSections.duration && (
              <div className="mt-3 space-y-2">
                {durationStats.map(item => {
                  const isChecked = filters.durations.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className="flex items-center justify-between text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none group py-0.5"
                    >
                      <span className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleDurationClick(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        />
                        <span className={isChecked ? 'font-bold text-indigo-950' : 'font-medium'}>
                          {item.label}
                        </span>
                      </span>
                      <span className="text-slate-400 text-xs font-normal">
                        ({item.count})
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin Panel Customizer Trigger */}
      {isAdmin && onOpenAdminConfig && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
            <i className="fa-solid fa-lock text-slate-400"></i> Admin Controls
          </span>
          <button
            type="button"
            onClick={onOpenAdminConfig}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 transition"
          >
            <i className="fa-solid fa-sliders text-xs"></i>
            <span>Customize Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
