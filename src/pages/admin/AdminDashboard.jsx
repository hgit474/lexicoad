import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  getServices,
  getLocations,
  getCampaigns,
  getInquiries,
  getListings
} from '../../services/dataService';

export default function AdminDashboard() {
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [listings, setListings] = useState([]);

  const revCanvasRef = useRef(null);
  const occCanvasRef = useRef(null);
  const perfCanvasRef = useRef(null);

  const chartsRef = useRef({});

  const fmtK = (n) => {
    n = Number(n || 0);
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return '₹' + (n / 1000).toFixed(0) + 'K';
    return '₹' + n.toLocaleString('en-IN');
  };

  useEffect(() => {
    Promise.all([
      getServices(),
      getLocations(),
      getCampaigns(),
      getInquiries(),
      getListings()
    ]).then(([svcs, locs, camps, inqs, lists]) => {
      setServices(svcs || []);
      setLocations(locs || []);
      setCampaigns(camps || []);
      setInquiries(inqs || []);
      setListings(lists || []);
    });
  }, []);

  const [chartReady, setChartReady] = useState(Boolean(window.Chart));

  // Detect deferred Chart.js CDN load
  useEffect(() => {
    if (window.Chart) {
      setChartReady(true);
      return;
    }
    const interval = setInterval(() => {
      if (window.Chart) {
        setChartReady(true);
        clearInterval(interval);
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Initialize charts once data and Chart.js are available
  useEffect(() => {
    if (!window.Chart || services.length === 0) return;

    const Chart = window.Chart;
    Chart.defaults.color = '#8fa0cf';
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.font.weight = 600;

    // Destroy existing instances
    Object.values(chartsRef.current).forEach(c => c?.destroy());
    chartsRef.current = {};

    const totalRev = campaigns
      .filter(c => c.status !== 'Paused')
      .reduce((sum, c) => sum + (Number(c.budget) || 0), 0);

    // 1. Revenue Chart
    if (revCanvasRef.current) {
      const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
      const baseRev = [18, 22, 20, 27, 31, 29, 36, Math.round(totalRev / 100000) || 38];

      chartsRef.current.rev = new Chart(revCanvasRef.current, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Revenue (₹ L)',
              data: baseRev,
              borderColor: '#FF2E4D',
              backgroundColor: 'rgba(225,29,46,.15)',
              fill: true,
              tension: 0.45,
              pointBackgroundColor: '#fff',
              borderWidth: 3
            },
            {
              label: 'Campaigns',
              data: [4, 6, 5, 8, 9, 8, 11, 12],
              borderColor: '#5b8cff',
              borderDash: [6, 4],
              tension: 0.45,
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { boxWidth: 12, color: '#8fa0cf' } }
          },
          scales: {
            y: { grid: { color: 'rgba(255,255,255,.07)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // 2. Occupancy Doughnut
    if (occCanvasRef.current) {
      const occCount = locations.filter(l => l.status === 'Occupied').length;
      const availCount = locations.filter(l => l.status === 'Available').length;
      const maintCount = locations.filter(l => l.status === 'Maintenance').length;

      chartsRef.current.occ = new Chart(occCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Occupied', 'Available', 'Maintenance'],
          datasets: [
            {
              data: [occCount, availCount, maintCount],
              backgroundColor: ['#FF2E4D', '#0B3DFF', '#64748b'],
              borderWidth: 0
            }
          ]
        },
        options: {
          cutout: '68%',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }

    // 3. Service Performance Bar
    if (perfCanvasRef.current) {
      const perSvc = services.map(
        s => campaigns.filter(c => c.service_id === s.id && c.status === 'Live').length
      );
      chartsRef.current.perf = new Chart(perfCanvasRef.current, {
        type: 'bar',
        data: {
          labels: services.map(s => s.name.split(' ')[0]),
          datasets: [
            {
              label: 'Live campaigns',
              data: perSvc,
              backgroundColor: [
                '#0B3DFF',
                '#E11D2E',
                '#7c3aed',
                '#16a34a',
                '#f59e0b',
                '#06b6d4',
                '#ec4899',
                '#84cc16'
              ],
              borderRadius: 10
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
              grid: { color: 'rgba(255,255,255,.07)' }
            },
            x: { grid: { display: false } }
          }
        }
      });
    }

    return () => {
      Object.values(chartsRef.current).forEach(c => c?.destroy());
    };
  }, [services, locations, campaigns, chartReady]);

  const totalRev = campaigns
    .filter(c => c.status !== 'Paused')
    .reduce((sum, c) => sum + (Number(c.budget) || 0), 0);

  const totalListingVal = listings.reduce((sum, l) => sum + (Number(l.price) || 0), 0);
  const liveCampaigns = campaigns.filter(c => c.status === 'Live').length;
  const openInquiries = inquiries.filter(i => !['Converted', 'Closed'].includes(i.stage)).length;
  const newInquiries = inquiries.filter(i => i.stage === 'New').length;

  const occTotal = locations.length;
  const occCount = locations.filter(l => l.status === 'Occupied').length;
  const availCount = locations.filter(l => l.status === 'Available').length;
  const maintCount = locations.filter(l => l.status === 'Maintenance').length;

  // Category counts from listings
  const categoryCounts = {};
  listings.forEach(l => {
    const c = l.category || 'Other';
    categoryCounts[c] = (categoryCounts[c] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const kpis = [
    {
      icon: 'fa-cubes-stacked',
      title: 'TOTAL INVENTORY',
      value: listings.length > 0 ? listings.length : services.length,
      sub: `${fmtK(totalListingVal)} catalog value`,
      bg: 'linear-gradient(135deg,#0B3DFF,#0A1E5E)',
      link: '/admin/listings'
    },
    {
      icon: 'fa-rectangle-ad',
      title: 'ACTIVE CAMPAIGNS',
      value: liveCampaigns,
      sub: `${campaigns.length} total • ${fmtK(totalRev)} booked`,
      bg: 'linear-gradient(135deg,#E11D2E,#7f0d23)',
      link: '/admin/campaigns'
    },
    {
      icon: 'fa-inbox',
      title: 'PIPELINE LEADS',
      value: openInquiries,
      sub: `${newInquiries} awaiting response`,
      bg: 'linear-gradient(135deg,#7c3aed,#0B3DFF)',
      link: '/admin/inquiries'
    },
    {
      icon: 'fa-location-dot',
      title: 'TOTAL LOCATIONS',
      value: occTotal,
      sub: `${occCount} occupied (${occTotal ? Math.round((occCount / occTotal) * 100) : 0}%)`,
      bg: 'linear-gradient(135deg,#059669,#047857)',
      link: '/admin/locations'
    }
  ];

  const quickActions = [
    {
      icon: 'fa-file-excel',
      label: 'Bulk Upload (.xlsx)',
      sub: 'Multi-category Excel ingestion',
      link: '/admin/upload-services',
      badge: '.XLSX',
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
    },
    {
      icon: 'fa-list-check',
      label: 'Manage Listings',
      sub: 'Filter & edit inventory',
      link: '/admin/listings',
      color: 'border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20'
    },
    {
      icon: 'fa-user-plus',
      label: 'Add Lead / Inquiry',
      sub: 'Log client consultation',
      link: '/admin/inquiries',
      color: 'border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
    },
    {
      icon: 'fa-photo-film',
      label: 'Media Library',
      sub: 'Upload creative assets',
      link: '/admin/media',
      color: 'border-pink-500/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20'
    },
    {
      icon: 'fa-map-pin',
      label: 'Add Location',
      sub: 'Expand OOH reach',
      link: '/admin/locations',
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
    }
  ];

  return (
    <div className="space-y-5 w-full max-w-full overflow-hidden">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 w-full">
        {kpis.map((kpi, idx) => (
          <Link
            key={idx}
            to={kpi.link}
            className="kpi-card p-4 sm:p-5 overflow-hidden transition transform hover:-translate-y-0.5 hover:shadow-2xl group block cursor-pointer"
            style={{ background: kpi.bg }}
          >
            <div className="absolute -right-6 -bottom-6 text-[90px] opacity-15 group-hover:opacity-25 transition pointer-events-none">
              <i className={`fa-solid ${kpi.icon}`}></i>
            </div>
            <div className="text-xs font-extrabold tracking-widest opacity-80 uppercase flex items-center justify-between">
              <span>{kpi.title}</span>
              <i className="fa-solid fa-arrow-right text-[10px] opacity-0 group-hover:opacity-100 transition"></i>
            </div>
            <div className="font-grotesk font-bold text-3xl sm:text-4xl mt-1">{kpi.value}</div>
            <div className="text-xs font-bold opacity-80 mt-1">{kpi.sub}</div>
          </Link>
        ))}
      </div>

      {/* QUICK ACTION COMMAND BAR */}
      <div className="bg-[#071343]/70 border border-white/10 rounded-2xl p-3.5 sm:p-4">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
          <i className="fa-solid fa-bolt text-amber-400"></i>
          <span>Admin Command Shortcuts</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {quickActions.map((act, i) => (
            <Link
              key={i}
              to={act.link}
              className={`p-3 rounded-xl border flex flex-col justify-between transition ${act.color}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <i className={`fa-solid ${act.icon} text-base`}></i>
                {act.badge && (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded">
                    {act.badge}
                  </span>
                )}
              </div>
              <div>
                <div className="font-bold text-xs text-white">{act.label}</div>
                <div className="text-[10px] opacity-70 truncate">{act.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Row 1 Charts: Revenue & Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
        <div className="lg:col-span-2 bg-[#0c1747] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl w-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-grotesk font-bold text-base sm:text-lg">
              Revenue Trend (last 8 months)
            </h3>
            <span className="badge bg-green-500/15 text-green-300 border border-green-500/30 text-[11px] sm:text-xs">
              ▲ +24.6%
            </span>
          </div>
          <div className="h-[220px] sm:h-[260px] relative w-full">
            <canvas ref={revCanvasRef}></canvas>
          </div>
        </div>

        <div className="bg-[#0c1747] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col justify-between w-full min-w-0 overflow-hidden">
          <h3 className="text-white font-grotesk font-bold text-base sm:text-lg mb-2">
            Location Occupancy
          </h3>
          <div className="h-[200px] flex items-center justify-center relative">
            <canvas ref={occCanvasRef}></canvas>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
              <span className="w-3 h-3 rounded-full bg-[#FF2E4D]"></span> Occupied
              <span className="ml-auto text-white">
                {occCount} sites • {occTotal ? Math.round((occCount / occTotal) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
              <span className="w-3 h-3 rounded-full bg-[#0B3DFF]"></span> Available
              <span className="ml-auto text-white">
                {availCount} sites • {occTotal ? Math.round((availCount / occTotal) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
              <span className="w-3 h-3 rounded-full bg-[#64748b]"></span> Maintenance
              <span className="ml-auto text-white">
                {maintCount} sites • {occTotal ? Math.round((maintCount / occTotal) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Category Inventory & Latest Inquiries with WhatsApp */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
        {/* Category Inventory Share Widget */}
        <div className="lg:col-span-2 bg-[#0c1747] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl w-full min-w-0 overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white font-grotesk font-bold text-base sm:text-lg">
                Inventory Category Distribution
              </h3>
              <p className="text-xs text-slate-400">Total active listings across major OOH formats</p>
            </div>
            <Link
              to="/admin/upload-services"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1.5"
            >
              <i className="fa-solid fa-plus text-[10px]"></i> Upload New Category
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-2">
            {topCategories.map(([catName, count], idx) => {
              const pct = listings.length > 0 ? Math.round((count / listings.length) * 100) : 0;
              return (
                <Link
                  key={idx}
                  to={`/admin/listings?category=${encodeURIComponent(catName)}`}
                  className="bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/10 p-3 rounded-xl transition group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-300 group-hover:text-white truncate">{catName}</span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">{count}</span>
                  </div>
                  <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full"
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">{pct}% of total catalog</div>
                </Link>
              );
            })}
          </div>

          <div className="h-[140px] relative w-full pt-2">
            <canvas ref={perfCanvasRef}></canvas>
          </div>
        </div>

        {/* Latest Leads with Direct WhatsApp follow-up */}
        <div className="bg-[#0c1747] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col w-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-grotesk font-bold text-base sm:text-lg">Recent Leads</h3>
              <p className="text-xs text-slate-400">{newInquiries} uncontacted</p>
            </div>
            <Link to="/admin/inquiries" className="text-xs font-bold text-blue-300 hover:text-white transition">
              View all ({inquiries.length}) →
            </Link>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {inquiries.slice(0, 5).map(q => {
              const s = services.find(x => x.id === q.service_id);
              const cleanPhone = (q.phone || '').replace(/\D/g, '');
              const waUrl = cleanPhone ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hi ${q.name}, following up regarding your advertising inquiry on Laxico Advertising.`)}` : null;

              return (
                <div
                  key={q.id}
                  className="rounded-xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white text-xs truncate max-w-[150px]">
                      {q.name}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      q.stage === 'New' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                      q.stage === 'Contacted' ? 'bg-blue-500/20 text-blue-300' :
                      q.stage === 'Converted' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'
                    }`}>
                      {q.stage}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 truncate">
                    {q.company || 'Direct Client'} • {s?.name || 'OOH Inquiry'}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                    <span className="text-emerald-400 font-bold font-mono">{q.budget || 'Custom'}</span>
                    <div className="flex items-center gap-1.5">
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-6 h-6 rounded-lg bg-green-500/20 hover:bg-green-500 text-green-300 hover:text-white flex items-center justify-center transition"
                          title="Chat on WhatsApp"
                        >
                          <i className="fa-brands fa-whatsapp text-xs"></i>
                        </a>
                      )}
                      <Link
                        to="/admin/inquiries"
                        className="text-[10px] text-blue-300 hover:text-white font-bold"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {inquiries.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs font-bold">
                No inquiries recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
