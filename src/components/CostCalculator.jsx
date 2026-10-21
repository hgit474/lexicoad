import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServices } from '../services/dataService';
import { useSite } from '../context/SiteContext';

export default function CostCalculator() {
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [duration, setDuration] = useState('1 Month');
  const [qty, setQty] = useState(3);
  const [printCost, setPrintCost] = useState(0);
  const navigate = useNavigate();
  const { showToast } = useSite();

  useEffect(() => {
    getServices().then(res => {
      const active = res.filter(s => s.status === 'Active');
      setServices(active);
      if (active.length > 0) {
        setSelectedServiceId(active[0].id);
      }
    });
  }, []);

  const durationMultipliers = {
    '1 Week': 0.35,
    '2 Weeks': 0.6,
    '1 Month': 1,
    '3 Months': 2.7,
    '6 Months': 5,
    '12 Months': 9
  };

  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];
  const mult = durationMultipliers[duration] || 1;
  const pricePerUnit = selectedService ? selectedService.price : 45000;
  const total = Math.round(pricePerUnit * mult * qty + printCost * qty);

  const handleRequestQuote = () => {
    navigate('/contact', {
      state: {
        serviceId: selectedServiceId,
        duration: duration
      }
    });
    showToast('Estimate carried to inquiry form', 'success');
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-blue-100 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <h3 className="font-grotesk font-bold text-xl text-laxBlue-950">Instant Cost Estimator</h3>
        <span className="badge bg-laxRed-50 text-laxRed-600 border border-red-100">
          <i className="fa-solid fa-bolt"></i> Live pricing
        </span>
      </div>
      <p className="text-sm text-slate-500 font-medium mt-1">
        Select a service & duration to get a transparent estimate.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mt-5">
        <div>
          <label className="lbl">Service</label>
          <select
            value={selectedServiceId}
            onChange={e => setSelectedServiceId(e.target.value)}
            className="field"
          >
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} — ₹{Number(s.price).toLocaleString('en-IN')}/mo
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="lbl">Duration</label>
          <select
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="field"
          >
            <option>1 Week</option>
            <option>2 Weeks</option>
            <option>1 Month</option>
            <option>3 Months</option>
            <option>6 Months</option>
            <option>12 Months</option>
          </select>
        </div>

        <div>
          <label className="lbl">No. of locations</label>
          <input
            type="number"
            min="1"
            max="50"
            value={qty}
            onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="field"
          />
        </div>

        <div>
          <label className="lbl">Need printing?</label>
          <select
            value={printCost}
            onChange={e => setPrintCost(parseInt(e.target.value) || 0)}
            className="field"
          >
            <option value="0">No — I have artwork</option>
            <option value="8500">Yes — Flex print + mount</option>
            <option value="18000">Yes — Premium vinyl + install</option>
          </select>
        </div>
      </div>

      <div className="mt-5 rounded-2xl grad-bg p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs font-bold tracking-widest opacity-80 uppercase">
            ESTIMATED CAMPAIGN COST
          </div>
          <div className="font-grotesk font-bold text-3xl">
            ₹{total.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-blue-200 font-semibold mt-0.5">
            {selectedService?.name} • ₹{pricePerUnit.toLocaleString('en-IN')}/mo × {duration} × {qty} site{qty > 1 ? 's' : ''}
            {printCost > 0 ? ` + print ₹${printCost.toLocaleString('en-IN')}/site` : ''}
          </div>
        </div>

        <button
          onClick={handleRequestQuote}
          className="bg-white text-laxBlue-800 font-extrabold px-5 py-3 rounded-xl text-sm hover:bg-laxBlue-900 hover:text-white transition flex items-center justify-center gap-1.5 shadow"
        >
          Request Quote <i className="fa-solid fa-arrow-right text-xs"></i>
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500">
        <i className="fa-solid fa-shield-halved text-green-600"></i> No hidden charges • GST invoice • Photos of every site included
      </div>
    </div>
  );
}
