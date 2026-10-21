import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  getServices,
  getLocations,
  getCampaigns,
  getInquiries
} from '../../services/dataService';

export default function AdminDashboard() {
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [inquiries, setInquiries] = useState([]);

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
      getInquiries()
    ]).then(([svcs, locs, camps, inqs]) => {
      setServices(svcs);
      setLocations(locs);
      setCampaigns(camps);
      setInquiries(inqs);
    });
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
  }, [services, locations, campaigns]);

  const totalRev = campaigns
    .filter(c => c.status !== 'Paused')
    .reduce((sum, c) => sum + (Number(c.budget) || 0), 0);

  const liveCampaigns = campaigns.filter(c => c.status === 'Live').length;
  const openInquiries = inquiries.filter(i => !['Converted', 'Closed'].includes(i.stage)).length;
  const newInquiries = inquiries.filter(i => i.stage === 'New').length;

  const occTotal = locations.length;
  const occCount = locations.filter(l => l.status === 'Occupied').length;
  const availCount = locations.filter(l => l.status === 'Available').length;
  const maintCount = locations.filter(l => l.status === 'Maintenance').length;

  const kpis = [
    {
      icon: 'fa-layer-group',
      title: 'TOTAL SERVICES',
      value: services.length,
      sub: '8 types incl.',
      bg: 'linear-gradient(135deg,#0B3DFF,#0A1E5E)'
    },
    {
      icon: 'fa-rectangle-ad',
      title: 'ACTIVE CAMPAIGNS',
      value: liveCampaigns,
      sub: `${campaigns.length} total placements`,
      bg: 'linear-gradient(135deg,#E11D2E,#7f0d23)'
    },
    {
      icon: 'fa-indian-rupee-sign',
      title: 'REVENUE BOOKED',
      value: fmtK(totalRev),
      sub: '+24.6% vs last Q',
      bg: 'linear-gradient(135deg,#0B3DFF,#E11D2E)'
    },
    {
      icon: 'fa-inbox',
      title: 'OPEN INQUIRIES',
      value: openInquiries,
      sub: `${newInquiries} new today`,
      bg: 'linear-gradient(135deg,#7c3aed,#0B3DFF)'
    }
  ];

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="kpi-card" style={{ background: kpi.bg }}>
            <div className="absolute -right-6 -bottom-6 text-[90px] opacity-15 pointer-events-none">
              <i className={`fa-solid ${kpi.icon}`}></i>
            </div>
            <div className="text-xs font-extrabold tracking-widest opacity-80 uppercase">
              {kpi.title}
            </div>
            <div className="font-grotesk font-bold text-4xl mt-1">{kpi.value}</div>
            <div className="text-xs font-bold opacity-80 mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Row 1 Charts: Revenue & Occupancy */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#0c1747] border border-white/10 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-grotesk font-bold text-lg">
              Revenue Trend (last 8 months)
            </h3>
            <span className="badge bg-green-500/15 text-green-300 border border-green-500/30">
              ▲ +24.6%
            </span>
          </div>
          <div className="h-[260px] relative">
            <canvas ref={revCanvasRef}></canvas>
          </div>
        </div>

        <div className="bg-[#0c1747] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <h3 className="text-white font-grotesk font-bold text-lg mb-2">
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

      {/* Row 2: Service Performance & Latest Inquiries */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#0c1747] border border-white/10 rounded-3xl p-6 shadow-xl">
          <h3 className="text-white font-grotesk font-bold text-lg mb-4">
            Service-wise Performance (active campaigns)
          </h3>
          <div className="h-[260px] relative">
            <canvas ref={perfCanvasRef}></canvas>
          </div>
        </div>

        <div className="bg-[#0c1747] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-grotesk font-bold text-lg">Latest Inquiries</h3>
            <Link to="/admin/inquiries" className="text-xs font-bold text-blue-300 hover:text-white transition">
              View all →
            </Link>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {inquiries.slice(0, 4).map(q => {
              const s = services.find(x => x.id === q.service_id);
              return (
                <div
                  key={q.id}
                  className="rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center gap-3 hover:bg-white/10 transition"
                >
                  <div className="w-10 h-10 rounded-xl grad-bg flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow">
                    {(q.name || '?')[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm font-bold truncate">
                      {q.name} • <span className="text-slate-400 font-normal">{q.company}</span>
                    </div>
                    <div className="text-slate-400 text-xs font-semibold truncate">
                      {s?.name || '—'} • <span className="text-amber-300">{q.stage}</span>
                    </div>
                  </div>
                  <Link
                    to="/admin/inquiries"
                    className="ml-auto text-[11px] font-extrabold text-blue-300 hover:text-white shrink-0 uppercase tracking-wider"
                  >
                    OPEN
                  </Link>
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
