import React, { useState, useEffect, useRef } from 'react';
import { getServices, getLocations, getCampaigns, getInquiries } from '../../services/dataService';

export default function AdminAnalytics() {
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  const popRef = useRef(null);
  const revSvcRef = useRef(null);
  const locOccRef = useRef(null);

  const chartsRef = useRef({});

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

  useEffect(() => {
    if (!window.Chart || services.length === 0) return;

    const Chart = window.Chart;
    Chart.defaults.color = '#8fa0cf';
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

    Object.values(chartsRef.current).forEach(c => c?.destroy());
    chartsRef.current = {};

    // 1. Service Popularity (Horizontal bar)
    if (popRef.current) {
      const labels = services.map(s => (s.name.length > 16 ? s.name.slice(0, 16) + '…' : s.name));
      const popScores = services.map(
        s =>
          campaigns.filter(c => c.service_id === s.id).length * 2 +
          inquiries.filter(i => i.service_id === s.id).length +
          (s.popularity || 50) / 25
      );

      chartsRef.current.pop = new Chart(popRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Popularity score',
              data: popScores,
              backgroundColor: 'rgba(11,61,255,.85)',
              borderRadius: 8
            }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,.07)' } },
            y: { grid: { display: false } }
          }
        }
      });
    }

    // 2. Revenue by Service Doughnut
    if (revSvcRef.current) {
      const revValues = services.map(s => {
        const booked = campaigns
          .filter(c => c.service_id === s.id)
          .reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
        return Math.round((booked / 100000) * 10) / 10;
      });

      chartsRef.current.revSvc = new Chart(revSvcRef.current, {
        type: 'doughnut',
        data: {
          labels: services.map(s => s.name.split(' ')[0]),
          datasets: [
            {
              data: revValues,
              backgroundColor: [
                '#0B3DFF',
                '#FF2E4D',
                '#7c3aed',
                '#16a34a',
                '#f59e0b',
                '#06b6d4',
                '#ec4899',
                '#84cc16'
              ],
              borderWidth: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { boxWidth: 12, font: { size: 10 }, color: '#8fa0cf' }
            }
          }
        }
      });
    }

    // 3. Location Occupancy Bar
    if (locOccRef.current) {
      const locLabels = locations.slice(0, 7).map(l => l.name.split('—')[0].slice(0, 14));
      const occValues = locations.slice(0, 7).map(l => (l.status === 'Occupied' ? 92 : 38));

      chartsRef.current.locOcc = new Chart(locOccRef.current, {
        type: 'bar',
        data: {
          labels: locLabels,
          datasets: [
            {
              label: 'Occupancy %',
              data: occValues,
              backgroundColor: 'rgba(225,29,46,.85)',
              borderRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              max: 100,
              grid: { color: 'rgba(255,255,255,.07)' }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 9 } }
            }
          }
        }
      });
    }

    return () => {
      Object.values(chartsRef.current).forEach(c => c?.destroy());
    };
  }, [services, locations, campaigns, inquiries]);

  const topLocations = [...locations].sort((a, b) => b.footfall - a.footfall).slice(0, 5);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* 1. Service Popularity */}
      <div className="bg-[#0c1747] border border-white/10 rounded-3xl p-6 shadow-xl">
        <h3 className="text-white font-grotesk font-bold text-lg mb-1">Service Popularity</h3>
        <p className="text-xs text-slate-400 font-semibold mb-4">
          Inquiries + campaigns per service
        </p>
        <div className="h-[280px] relative">
          <canvas ref={popRef}></canvas>
        </div>
      </div>

      {/* 2. Revenue by Service */}
      <div className="bg-[#0c1747] border border-white/10 rounded-3xl p-6 shadow-xl">
        <h3 className="text-white font-grotesk font-bold text-lg mb-1">Revenue by Service</h3>
        <p className="text-xs text-slate-400 font-semibold mb-4">
          Booked campaign value (₹ Lakh)
        </p>
        <div className="h-[280px] relative">
          <canvas ref={revSvcRef}></canvas>
        </div>
      </div>

      {/* 3. Location Occupancy Rate */}
      <div className="bg-[#0c1747] border border-white/10 rounded-3xl p-6 shadow-xl">
        <h3 className="text-white font-grotesk font-bold text-lg mb-1">Location Occupancy Rate</h3>
        <p className="text-xs text-slate-400 font-semibold mb-4">
          % of days booked (last 90 days)
        </p>
        <div className="h-[280px] relative">
          <canvas ref={locOccRef}></canvas>
        </div>
      </div>

      {/* 4. Top Performing Locations */}
      <div className="bg-[#0c1747] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="text-white font-grotesk font-bold text-lg mb-4">
            Top Performing Locations
          </h3>
          <div className="space-y-4">
            {topLocations.map((l, i) => {
              const pct = Math.min(100, Math.round(l.footfall / 4100));
              return (
                <div key={l.id}>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">
                      #{i + 1} {l.name}
                    </span>
                    <span className="text-slate-400">
                      {Number(l.footfall).toLocaleString('en-IN')} / day
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/10 mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg,#0B3DFF,#FF2E4D)'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
