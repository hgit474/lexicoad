import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getServices, getLocations, getServiceLocations, getMedia } from '../services/dataService';
import CostCalculator from '../components/CostCalculator';
import BrowseByGenre from '../components/BrowseByGenre';
import { useSite } from '../context/SiteContext';

const heroAds = [
  {
    img: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?q=80&w=1000&auto=format&fit=crop',
    brand: 'Nike — Just Do It City Takeover',
    meta: 'NH-48 • Gurugram • 48x20 ft • 1.2M impressions / week',
    type: 'HIGHWAY BILLBOARD'
  },
  {
    img: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=1000&auto=format&fit=crop',
    brand: 'Zomato Feast Fest — Metro Domination',
    meta: 'Central Hub • Delhi • 2.5L footfall / day',
    type: 'METRO STATION ADS'
  },
  {
    img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop',
    brand: 'Samsung Galaxy — Airport Arrival',
    meta: 'T3 Arrival • Delhi • 92K flyers / day',
    type: 'AIRPORT BANNERS'
  },
  {
    img: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=1000&auto=format&fit=crop',
    brand: 'Coca-Cola Summer — LED Burst',
    meta: 'Cyber Hub • Gurugram • 120 plays / day',
    type: 'DIGITAL LED SCREENS'
  }
];

const testimonials = [
  {
    name: 'Rohan Mehta',
    role: 'Brand Head, Nike India',
    quote: 'Laxico owned our NH-48 launch end-to-end — printing overnight, live photos by 7 AM. The unipole delivered 3x the footfall we modelled.',
    initials: 'NR'
  },
  {
    name: 'Ananya Rao',
    role: 'Growth, Zomato',
    quote: 'Metro domination across 2 hubs in 48 hours. Their availability checker saved us from a clash and their night-monitoring is genuinely best-in-class.',
    initials: 'AR'
  },
  {
    name: 'Vikram Iyer',
    role: 'CMO, Samsung India',
    quote: 'Airport arrivals with Laxico consistently beat our CTR benchmarks for QR scans. Transparent billing, zero surprises.',
    initials: 'VI'
  }
];

export default function Home() {
  const { settings } = useSite();
  const featuredBrands = (settings.featured_brands || 'NIKE, ZOMATO, SAMSUNG, HDFC BANK, COCA-COLA, AMAZON, TATA, SWIGGY, BOAT, MYNTRA')
    .split(',')
    .map(brand => brand.trim())
    .filter(Boolean);
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [serviceLocations, setServiceLocations] = useState([]);
  const [filterType, setFilterType] = useState('All');

  // Hero carousel state
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroFade, setHeroFade] = useState(true);
  const [heroSlides, setHeroSlides] = useState(heroAds);

  // Testimonials carousel state
  const [testiIdx, setTestiIdx] = useState(0);

  // Counter numbers
  const [counts, setCounts] = useState({ campaigns: 0, locations: 0, retention: 0 });

  useEffect(() => {
    getMedia().then(media => {
      const uploadedSlides = media
        .filter(item => /hero|carousel/i.test(item.tag || ''))
        .map(item => ({
          img: item.url,
          brand: item.title || 'Featured Campaign',
          meta: item.tag || 'FEATURED CAMPAIGN',
          type: 'HERO CAMPAIGN'
        }));
      setHeroSlides(uploadedSlides.length ? uploadedSlides : heroAds);
      setHeroIdx(0);
    });
  }, []);

  useEffect(() => {
    const heroInterval = setInterval(() => {
      setHeroFade(false);
      setTimeout(() => {
        setHeroIdx(prev => (prev + 1) % heroSlides.length);
        setHeroFade(true);
      }, 300);
    }, 4500);

    return () => clearInterval(heroInterval);
  }, [heroSlides]);

  useEffect(() => {
    Promise.all([getServices(), getLocations(), getServiceLocations()]).then(([svcs, locs, sl]) => {
      setServices(svcs);
      setLocations(locs);
      setServiceLocations(sl);
    });

    // Auto rotate testimonials
    const testiInterval = setInterval(() => {
      setTestiIdx(prev => (prev + 1) % testimonials.length);
    }, 6000);

    // Animate stats
    const timer = setTimeout(() => {
      const targetC = settings.campaigns_count || 1250;
      const targetL = settings.locations_count || 248;
      const targetR = settings.retention_rate || 98;

      let step = 0;
      const iv = setInterval(() => {
        step++;
        setCounts({
          campaigns: Math.min(targetC, Math.round((targetC / 30) * step)),
          locations: Math.min(targetL, Math.round((targetL / 30) * step)),
          retention: Math.min(targetR, Math.round((targetR / 30) * step))
        });
        if (step >= 30) clearInterval(iv);
      }, 30);
    }, 200);

    return () => {
      clearInterval(testiInterval);
      clearTimeout(timer);
    };
  }, [settings]);

  const categories = ['All', ...new Set(services.map(s => s.type))];
  const filteredServices = services
    .filter(s => s.status === 'Active')
    .filter(s => filterType === 'All' || s.type === filterType)
    .slice(0, 6);

  const getMappedCount = (serviceId) => {
    return serviceLocations.filter(m => m.service_id === serviceId).length;
  };

  const nextTestimonial = (dir) => {
    setTestiIdx(prev => (prev + dir + testimonials.length) % testimonials.length);
  };

  return (
    <div>
      {/* ================= HERO ================= */}
      <div className="relative grad-bg overflow-hidden">
        <div className="absolute inset-0 hero-grid"></div>
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-laxRed-500/30 blur-[110px] rounded-full"></div>
        <div className="absolute top-20 right-0 w-[520px] h-[520px] bg-blue-400/30 blur-[120px] rounded-full"></div>

        <div className="relative max-w-7xl mx-auto px-4 pt-12 pb-16 lg:pt-20 lg:pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-grotesk font-bold text-white leading-[1.02] text-[2.6rem] sm:text-6xl">
              Your Brand.<br />
              Every <span className="relative inline-block">
                <span className="absolute left-0 -bottom-1 w-full h-3 bg-laxRed-500/80 -z-0 rounded"></span>
                <span className="relative z-10">Street.</span>
              </span><br />
              Every Station.
            </h1>

            <p className="text-blue-100 mt-6 text-[1.05rem] leading-relaxed max-w-xl">
              {settings.site_name} manages{' '}
              <strong className="text-white">250+ premium billboard & poster placements</strong> across metros,
              airports, highways and malls. Plan by service, pick locations, launch in 48 hours.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                to="/services"
                className="bg-white text-laxBlue-800 font-extrabold px-7 py-3.5 rounded-2xl hover:bg-laxRed-500 hover:text-white transition shadow-xl flex items-center gap-2"
              >
                <i className="fa-solid fa-layer-group"></i> Explore Services
              </Link>
              <Link
                to="/portfolio"
                className="border-2 border-white/40 text-white font-extrabold px-7 py-3.5 rounded-2xl hover:bg-white/10 transition flex items-center gap-2"
              >
                <i className="fa-solid fa-play"></i> View Campaigns
              </Link>
            </div>

            {/* Live Counters */}
            <div className="grid grid-cols-3 gap-3 mt-10 max-w-lg">
              <div
                className="rounded-2xl p-4 border border-white/15"
                style={{ background: 'rgba(255,255,255,.08)' }}
              >
                <div className="text-white font-grotesk font-bold text-2xl">
                  {counts.campaigns.toLocaleString('en-IN')}+
                </div>
                <div className="text-blue-200 text-xs font-bold tracking-wide">
                  CAMPAIGNS LIVE
                </div>
              </div>

              <div
                className="rounded-2xl p-4 border border-white/15"
                style={{ background: 'rgba(255,255,255,.08)' }}
              >
                <div className="text-white font-grotesk font-bold text-2xl">
                  {counts.locations.toLocaleString('en-IN')}
                </div>
                <div className="text-blue-200 text-xs font-bold tracking-wide">
                  PRIME LOCATIONS
                </div>
              </div>

              <div
                className="rounded-2xl p-4 border border-white/15"
                style={{ background: 'rgba(255,255,255,.08)' }}
              >
                <div className="text-white font-grotesk font-bold text-2xl">
                  {counts.retention}%
                </div>
                <div className="text-blue-200 text-xs font-bold tracking-wide">
                  CLIENT RETENTION
                </div>
              </div>
            </div>
          </div>

          {/* Billboard Frame Visual */}
          <div className="relative hero-phone">
            <div className="billboard-frame led-dot p-2 relative">
              <div className="rounded-xl overflow-hidden relative h-[340px] sm:h-[400px]">
                <img
                  src={heroSlides[heroIdx % heroSlides.length].img}
                  alt={heroSlides[heroIdx % heroSlides.length].brand}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    heroFade ? 'opacity-100' : 'opacity-0'
                  }`}
                  onError={(e) => {
                    e.target.src = 'https://picsum.photos/seed/laxhero/1000/600';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-laxBlue-950/85 via-transparent to-transparent"></div>

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-laxRed-600 text-white text-[10px] font-extrabold tracking-widest px-3 py-1.5 rounded-full">
                    ● LIVE
                  </span>
                  <span className="bg-white/90 text-laxBlue-900 text-[10px] font-extrabold tracking-widest px-3 py-1.5 rounded-full uppercase">
                    {heroSlides[heroIdx % heroSlides.length].type}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="text-white font-grotesk font-bold text-2xl">
                    {heroSlides[heroIdx % heroSlides.length].brand}
                  </div>
                  <div className="text-blue-200 text-sm font-semibold mt-0.5">
                    {heroSlides[heroIdx % heroSlides.length].meta}
                  </div>
                  <div className="flex gap-1.5 mt-3">
                    {heroSlides.map((_, i) => (
                      <span
                        key={i}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: i === heroIdx ? 28 : 10,
                          background: i === heroIdx ? '#FF2E4D' : 'rgba(255,255,255,.4)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-6 mt-0">
              <div className="w-3 h-16 bg-[#0d1533] rounded-b-lg"></div>
              <div className="w-3 h-16 bg-[#0d1533] rounded-b-lg"></div>
            </div>

          </div>
        </div>

        {/* Marquee Track */}
        <div className="relative border-t border-white/10" style={{ background: 'rgba(0,0,0,.22)' }}>
          <div className="max-w-7xl mx-auto px-4 py-4 overflow-hidden">
            <div className="marquee-track text-white/80 text-sm font-extrabold tracking-[.22em]">
              {[...Array(2)].flatMap((_, rep) =>
                featuredBrands.map((brand, bIdx) => (
                  <span key={`${rep}-${bIdx}`} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-laxRed-500 inline-block"></span>
                    {brand}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= BROWSE MEDIA BY GENRE (THE MEDIA ANT STYLE) ================= */}
      <div className="max-w-7xl mx-auto px-4 pt-10 sm:pt-14">
        <BrowseByGenre services={services} />
      </div>

      {/* ================= FEATURED SERVICES ================= */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span className="section-label text-laxRed-600">What we do</span>
            <h2 className="font-grotesk font-bold text-3xl sm:text-4xl mt-2 text-laxBlue-950">
              Featured <span className="grad-text">Services Showcase</span>
            </h2>
            <p className="text-slate-500 font-medium mt-2 max-w-xl">
              Filter by service type. Every service includes verified locations, transparent pricing and duration options.
            </p>
          </div>

          <Link
            to="/services"
            className="grad-btn text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center shadow"
          >
            View all services <i className="fa-solid fa-arrow-right ml-1.5 text-xs"></i>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-3">
          {categories.map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`filter-btn ${filterType === t ? 'active' : ''}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredServices.map(s => {
            const locCount = getMappedCount(s.id);
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
                    <span className="chip absolute top-3 right-3 bg-laxRed-600 text-white">
                      ★ {s.rating}
                    </span>
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <div className="text-white font-grotesk font-bold text-lg leading-tight">
                        {s.name}
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <i className="fa-solid fa-location-dot text-laxRed-500"></i> {locCount} locations •
                    <i className="fa-solid fa-ruler-combined text-laxBlue-600 ml-1"></i> {s.dims || 'Std'}
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
      </div>

      {/* ================= HOW IT WORKS + CALCULATOR ================= */}
      <div className="bg-laxBlue-950 relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-60"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          <div className="flex flex-col justify-between h-full space-y-6">
            <div>
              <span className="section-label text-red-400">Simple process</span>
              <h2 className="font-grotesk font-bold text-white text-3xl sm:text-4xl mt-2">
                Launch in 4 steps.<br />Live in 48 hours.
              </h2>
            </div>

            <div className="grid gap-3.5 flex-1">
              {[
                { n: '1', t: 'Pick a service', d: 'Browse 12 media channels with live pricing & durations.', icon: 'fa-layer-group' },
                { n: '2', t: 'Choose locations', d: 'Compare footfall, photos & availability per site.', icon: 'fa-location-dot' },
                { n: '3', t: 'Approve artwork', d: 'Upload creative — we print, mount & light it.', icon: 'fa-pen-nib' },
                { n: '4', t: 'Track live proof', d: 'Get geo-tagged photos + performance report.', icon: 'fa-satellite-dish' }
              ].map(step => (
                <div
                  key={step.n}
                  className="flex items-center gap-4 rounded-2xl p-4 border border-white/12 transition hover:border-white/25"
                  style={{ background: 'rgba(255,255,255,.06)' }}
                >
                  <div className="w-11 h-11 rounded-2xl grad-btn flex items-center justify-center text-white font-grotesk font-bold text-base shrink-0 shadow">
                    {step.n}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                      <span>{step.t}</span>
                      <i className={`fa-solid ${step.icon} text-red-400 text-xs sm:text-sm`}></i>
                    </div>
                    <div className="text-blue-200 text-xs sm:text-sm font-medium mt-0.5">{step.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 grid sm:grid-cols-3 gap-3 text-xs sm:text-[13px] font-bold text-blue-100">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-400 shrink-0"></i>
                <span>Govt. Approved Sites</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-400 shrink-0"></i>
                <span>Geo-tagged Proof</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-400 shrink-0"></i>
                <span>Dedicated Manager</span>
              </div>
            </div>
          </div>

          <div className="h-full">
            <CostCalculator />
          </div>
        </div>
      </div>

      {/* ================= LOCATIONS ================= */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <span className="section-label text-laxRed-600 justify-center">Network</span>
          <h2 className="font-grotesk font-bold text-3xl sm:text-4xl mt-2 text-laxBlue-950">
            Prime locations, <span className="grad-text">verified footfall</span>
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            A glimpse of our highest-demand inventory. Full list lives inside each service.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {locations.slice(0, 4).map(l => (
            <div
              key={l.id}
              className="bg-white rounded-3xl overflow-hidden border border-blue-100 card-hover"
            >
              <div className="img-zoom h-44">
                <img
                  src={l.image}
                  alt={l.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/seed/${l.id}/600/400`;
                  }}
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span
                    className={`badge ${
                      l.status === 'Available'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <span
                      className="status-dot"
                      style={{
                        background: l.status === 'Available' ? '#16a34a' : l.status === 'Occupied' ? '#f59e0b' : '#64748b'
                      }}
                    ></span>
                    {l.status}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{l.city}</span>
                </div>
                <div className="font-grotesk font-bold mt-2 text-laxBlue-950">{l.name}</div>
                <div className="text-xs font-bold text-slate-500 mt-1">
                  <i className="fa-solid fa-users text-laxBlue-600 mr-1"></i>
                  {Number(l.footfall).toLocaleString('en-IN')} / day • {l.size}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= WHY LAXICO ================= */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="rounded-[28px] overflow-hidden grid lg:grid-cols-2 items-stretch grad-bg-2 relative">
          <div className="absolute inset-0 hero-grid"></div>

          <div className="relative p-6 sm:p-10 lg:p-12 flex flex-col justify-between h-full">
            <div>
              <span className="section-label text-red-300">Why Laxico</span>
              <h2 className="font-grotesk font-bold text-white text-3xl sm:text-4xl mt-2">
                The agency brands call when outdoor must perform.
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-8 flex-1">
              {[
                { icon: 'fa-certificate', title: 'Govt.-Approved Sites', desc: 'MCD, DMRC, AAI & railway approvals on every hoarding. Zero takedown risk.' },
                { icon: 'fa-camera', title: 'Photo Proof of Display', desc: 'Geo-tagged day & night photos for every site, every cycle.' },
                { icon: 'fa-print', title: 'In-House Print + Install', desc: 'Own plant in Delhi. Flex, vinyl & backlit printed & mounted in 24 hrs.' },
                { icon: 'fa-chart-line', title: 'Footfall-Verified Pricing', desc: 'Pay for real impressions — we share traffic & dwell data upfront.' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-5 border border-white/15 h-full flex flex-col justify-between transition hover:border-white/30"
                  style={{ background: 'rgba(255,255,255,.07)' }}
                >
                  <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-white text-lg">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <div className="mt-3">
                    <div className="text-white font-bold text-sm sm:text-base">{item.title}</div>
                    <div className="text-blue-200 text-xs sm:text-[13px] font-medium mt-1 leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative p-6 sm:p-10 lg:p-12 flex flex-col justify-between h-full border-t lg:border-t-0 lg:border-l border-white/10"
            style={{ background: 'rgba(255,255,255,.06)' }}
          >
            <div className="glass rounded-3xl p-6 sm:p-7 shadow-xl flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <span className="text-slate-600 font-bold ml-2">4.9 / 5 • 320 reviews</span>
                </div>

                <div className="overflow-hidden mt-4 rounded-2xl relative min-h-[140px]">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${testiIdx * 100}%)` }}
                  >
                    {testimonials.map((t, idx) => (
                      <div key={idx} className="min-w-full pr-1">
                        <p className="text-slate-600 font-medium text-[15px] leading-relaxed">
                          “{t.quote}”
                        </p>
                        <div className="flex items-center gap-3 mt-4">
                          <div className="w-11 h-11 rounded-full grad-bg flex items-center justify-center text-white font-extrabold text-sm shadow">
                            {t.initials}
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-laxBlue-950">{t.name}</div>
                            <div className="text-xs text-slate-500 font-semibold">{t.role}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                <div className="flex gap-2">
                  {testimonials.map((_, i) => (
                    <span
                      key={i}
                      onClick={() => setTestiIdx(i)}
                      className="h-2 rounded-full transition-all cursor-pointer"
                      style={{
                        width: i === testiIdx ? 26 : 8,
                        background: i === testiIdx ? '#E11D2E' : '#c9d4ff'
                      }}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => nextTestimonial(-1)}
                    className="w-10 h-10 rounded-xl bg-laxBlue-900 text-white hover:bg-laxRed-600 transition flex items-center justify-center shadow"
                    aria-label="Previous testimonial"
                  >
                    <i className="fa-solid fa-arrow-left"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => nextTestimonial(1)}
                    className="w-10 h-10 rounded-xl bg-laxBlue-900 text-white hover:bg-laxRed-600 transition flex items-center justify-center shadow"
                    aria-label="Next testimonial"
                  >
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>

            <Link
              to="/contact"
              className="mt-5 grad-btn shine text-white font-extrabold py-4 rounded-2xl text-[15px] text-center shadow-lg block transition hover:scale-[1.01]"
            >
              Get My Free Media Plan <i className="fa-solid fa-paper-plane ml-2"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= CTA BANNER ================= */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="rounded-[28px] bg-white border border-blue-100 shadow-card p-8 sm:p-12 grid lg:grid-cols-3 gap-8 items-center relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-blue-200 to-red-200 blur-2xl opacity-60"></div>
          <div className="lg:col-span-2 relative">
            <h2 className="font-grotesk font-bold text-3xl sm:text-4xl text-laxBlue-950">
              Ready to own your city's <span className="grad-text">skyline?</span>
            </h2>
            <p className="text-slate-500 font-medium mt-3">
              Talk to a Laxico media strategist today. Free site photos, footfall data and a custom plan within 4 working hours.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                to="/contact"
                className="grad-btn text-white font-extrabold px-7 py-3.5 rounded-xl shadow"
              >
                Start Inquiry <i className="fa-solid fa-arrow-right ml-1 text-xs"></i>
              </Link>
              <a
                href={`tel:${settings.phone || '9742313705'}`}
                className="font-extrabold px-7 py-3.5 rounded-xl border-2 border-laxBlue-900 text-laxBlue-900 hover:bg-laxBlue-900 hover:text-white transition flex items-center gap-2"
              >
                <i className="fa-solid fa-phone"></i> {settings.phone || '9742313705'}
              </a>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-3">
            <img
              src="https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=600&auto=format&fit=crop"
              className="rounded-2xl h-40 object-cover w-full shadow"
              alt="Night billboard"
            />
            <img
              src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=600&auto=format&fit=crop"
              className="rounded-2xl h-40 object-cover w-full mt-6 shadow"
              alt="Metro train"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
