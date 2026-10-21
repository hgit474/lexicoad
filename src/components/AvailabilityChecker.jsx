import React, { useState, useEffect } from 'react';
import { getServices, getLocations, getCampaigns } from '../services/dataService';

export default function AvailabilityChecker() {
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  const [serviceId, setServiceId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    Promise.all([getServices(), getLocations(), getCampaigns()]).then(([svcs, locs, camps]) => {
      const activeSvcs = svcs.filter(s => s.status === 'Active');
      setServices(activeSvcs);
      setLocations(locs);
      setCampaigns(camps);

      if (activeSvcs.length > 0) setServiceId(activeSvcs[0].id);
      if (locs.length > 0) setLocationId(locs[0].id);

      const now = new Date();
      setStartDate(now.toISOString().slice(0, 10));
      const end = new Date(Date.now() + 30 * 864e5);
      setEndDate(end.toISOString().slice(0, 10));
    });
  }, []);

  const handleCheck = () => {
    if (!locationId || !startDate || !endDate) return;

    // Check for date clashes
    const clash = campaigns.find(c => {
      if (c.location_id !== locationId || c.status === 'Completed') return false;
      const cStart = c.start_date;
      const cEnd = c.end_date;
      return !(endDate < cStart || startDate > cEnd);
    });

    const currentSvc = services.find(s => s.id === serviceId);
    const currentLoc = locations.find(l => l.id === locationId);

    if (clash) {
      setResult({
        available: false,
        message: `Busy: "${clash.title}" (${clash.start_date} → ${clash.end_date}). Try nearby dates or alternate sites.`
      });
    } else {
      setResult({
        available: true,
        message: `Available! ${currentSvc?.name || 'Selected Service'} @ ${currentLoc?.name || 'Selected Site'} is free for your requested schedule.`
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-blue-100 shadow-card p-6">
      <h3 className="font-grotesk font-bold text-lg text-laxBlue-950">Check Live Availability</h3>
      <p className="text-xs text-slate-500 font-semibold mt-0.5">Avoid clashes — see if your site is free.</p>

      <div className="space-y-3 mt-4">
        <div>
          <label className="lbl">Service</label>
          <select
            value={serviceId}
            onChange={e => setServiceId(e.target.value)}
            className="field"
          >
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="lbl">Location</label>
          <select
            value={locationId}
            onChange={e => setLocationId(e.target.value)}
            className="field"
          >
            {locations.map(l => (
              <option key={l.id} value={l.id}>
                {l.name} — {l.city}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="lbl">Start</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="field"
            />
          </div>
          <div>
            <label className="lbl">End</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="field"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheck}
          className="w-full bg-laxBlue-900 text-white font-extrabold py-3 rounded-xl hover:bg-laxBlue-700 transition text-sm flex items-center justify-center gap-2 shadow"
        >
          <i className="fa-solid fa-calendar-check"></i> Check Availability
        </button>

        {result && (
          <div
            className={`rounded-xl p-3.5 text-xs sm:text-sm font-bold border transition-all ${
              result.available
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <i
              className={`fa-solid mr-1.5 ${
                result.available ? 'fa-circle-check text-green-600' : 'fa-triangle-exclamation text-red-600'
              }`}
            ></i>
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
}
