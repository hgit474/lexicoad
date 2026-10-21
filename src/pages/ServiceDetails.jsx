import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getServices,
  getLocations,
  getServiceLocations,
  getCampaigns,
  getMedia,
  saveInquiry,
  getWhatsAppInquiryUrl
} from '../services/dataService';
import { useSite } from '../context/SiteContext';

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openLightbox, showToast, settings } = useSite();

  const [service, setService] = useState(null);
  const [locations, setLocations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  // Quick calculator state (Tab 0)
  const [calcDuration, setCalcDuration] = useState('1 Month');
  const [calcQty, setCalcQty] = useState(2);

  // Dedicated Inquiry Form state (Tab 5)
  const [inqForm, setInqForm] = useState({
    name: '',
    phone: '',
    email: '',
    location_id: '',
    message: ''
  });

  useEffect(() => {
    Promise.all([
      getServices(),
      getLocations(),
      getServiceLocations(),
      getCampaigns(),
      getMedia()
    ]).then(([svcs, locs, sl, camps, med]) => {
      const found = svcs.find(s => s.id === id);
      if (!found) {
        navigate('/services');
        return;
      }
      setService(found);

      const mappedLocIds = sl.filter(m => m.service_id === found.id).map(m => m.location_id);
      const mappedLocs = locs.filter(l => mappedLocIds.includes(l.id));
      setLocations(mappedLocs);

      const mappedCamps = camps.filter(c => c.service_id === found.id);
      setCampaigns(mappedCamps);

      const svcMedia = med.filter(m => m.service_id === found.id);
      setMediaList(svcMedia.length > 0 ? svcMedia : med.slice(0, 6));

      if (mappedLocs.length > 0) {
        setInqForm(prev => ({ ...prev, location_id: mappedLocs[0].id }));
      }
    });
  }, [id, navigate]);

  if (!service) return null;

  const durationMultipliers = {
    '1 Week': 0.35,
    '2 Weeks': 0.6,
    '1 Month': 1,
    '3 Months': 2.7,
    '6 Months': 5,
    '12 Months': 9
  };

  const straightRatios = {
    '1 Week': 0.25,
    '2 Weeks': 0.5,
    '1 Month': 1,
    '3 Months': 3,
    '6 Months': 6,
    '12 Months': 12
  };

  const durs = (service.durations || '1 Month')
    .split(',')
    .map(d => d.trim())
    .filter(Boolean);
  const inquirySteps = (service.inquiry_process || 'Call within 4 working hours|Quote + media plan|Go live in 48 hrs')
    .split('|')
    .map(step => step.trim())
    .filter(Boolean);

  const totalFootfall = locations.reduce((sum, l) => sum + (Number(l.footfall) || 0), 0);
  const footfallFormatted =
    totalFootfall >= 100000
      ? (totalFootfall / 100000).toFixed(1) + 'L'
      : totalFootfall.toLocaleString('en-IN');

  const calcMult = durationMultipliers[calcDuration] || 1;
  const quickTotal = Math.round(service.price * calcMult * calcQty);

  const handleQuickEstimateContinue = () => {
    navigate('/contact', {
      state: {
        serviceId: service.id,
        duration: calcDuration
      }
    });
  };

  const handlePricingSelect = (d) => {
    setActiveTab(5);
    setCalcDuration(d);
    showToast(`"${d}" selected — complete the inquiry`, 'info');
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    const selectedLocation = locations.find(location => location.id === inqForm.location_id);
    const inquiry = {
      id: `iq_${Math.random().toString(36).slice(2, 9)}`,
      name: inqForm.name,
      phone: inqForm.phone,
      email: inqForm.email,
      company: '—',
      service_id: service.id,
      location_id: inqForm.location_id || (locations[0]?.id || ''),
      duration: calcDuration || '1 Month',
      budget: '—',
      message: inqForm.message || `Inquiry for ${service.name}`,
      stage: 'New',
      date: new Date().toISOString().slice(0, 10),
      followup: '—',
      service_name: service.name,
      location_name: selectedLocation?.name
    };
    try {
      await saveInquiry(inquiry);
      window.open(getWhatsAppInquiryUrl(settings.whatsapp || '9742313705', inquiry), '_blank', 'noopener,noreferrer');
      showToast('Inquiry sent! We reply within 4 working hours.', 'success');
      setInqForm({ name: '', phone: '', email: '', location_id: locations[0]?.id || '', message: '' });
    } catch {
      showToast('Failed to submit inquiry', 'error');
    }
  };

  const tabs = ['Overview', 'Locations', 'Gallery', 'Pricing', 'Specifications', 'Inquiry'];

  return (
    <div className="pb-16">
      {/* Header Banner */}
      <div className="relative grad-bg overflow-hidden">
        <div className="absolute inset-0 hero-grid"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-10">
          <Link
            to="/services"
            className="text-blue-200 text-sm font-bold hover:text-white mb-4 inline-flex items-center gap-2"
          >
            <i className="fa-solid fa-arrow-left"></i> Back to all services
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="chip bg-white text-laxBlue-800">{service.type}</span>
                <span
                  className={`chip ${
                    service.status === 'Active' ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'
                  }`}
                >
                  {service.status}
                </span>
                <span className="chip bg-laxRed-600 text-white">★ {service.rating} rated</span>
              </div>

              <h1 className="font-grotesk font-bold text-white text-4xl sm:text-5xl mt-4">
                {service.name}
              </h1>

              <p className="text-blue-100 mt-4 font-medium leading-relaxed max-w-xl">
                {service.description}
              </p>

              <div className="grid grid-cols-3 gap-3 mt-6 max-w-md">
                <div
                  className="rounded-2xl p-3 border border-white/15 text-center"
                  style={{ background: 'rgba(255,255,255,.08)' }}
                >
                  <div className="text-white font-grotesk font-bold text-xl">{locations.length}</div>
                  <div className="text-blue-200 text-[11px] font-bold">LOCATIONS</div>
                </div>

                <div
                  className="rounded-2xl p-3 border border-white/15 text-center"
                  style={{ background: 'rgba(255,255,255,.08)' }}
                >
                  <div className="text-white font-grotesk font-bold text-xl">{footfallFormatted}</div>
                  <div className="text-blue-200 text-[11px] font-bold">DAILY REACH</div>
                </div>

                <div
                  className="rounded-2xl p-3 border border-white/15 text-center"
                  style={{ background: 'rgba(255,255,255,.08)' }}
                >
                  <div className="text-white font-grotesk font-bold text-xl">{campaigns.length}</div>
                  <div className="text-blue-200 text-[11px] font-bold">LIVE PROOFS</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 relative">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-[320px] object-cover"
                onError={(e) => {
                  e.target.src = `https://picsum.photos/seed/${service.id}/1000/600`;
                }}
              />
              <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between">
                <div>
                  <div className="text-white font-grotesk font-bold text-2xl">
                    ₹{Number(service.price).toLocaleString('en-IN')}
                    <span className="text-sm font-bold text-blue-200">/month / site</span>
                  </div>
                  <div className="text-blue-200 text-xs font-bold">{service.dims}</div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab(5)}
                  className="bg-white text-laxBlue-900 font-extrabold text-sm px-5 py-3 rounded-xl hover:bg-laxRed-600 hover:text-white transition shadow"
                >
                  Enquire Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tabName, idx) => (
            <button
              key={tabName}
              onClick={() => setActiveTab(idx)}
              className={`tab-btn ${activeTab === idx ? 'active' : ''}`}
            >
              {tabName}
            </button>
          ))}
        </div>

        {/* Tab 0: Overview */}
        {activeTab === 0 && (
          <div className="mt-6 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-blue-100 p-7 shadow-card">
              <h3 className="font-grotesk font-bold text-xl text-laxBlue-950">Service Description</h3>
              <p className="text-slate-600 font-medium mt-3 leading-relaxed">
                {service.description} This service is managed end-to-end by Laxico — site booking, municipal
                permissions, printing, mounting, illumination checks and weekly photo reporting are all included
                in the plan.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mt-6">
                {[
                  { icon: 'fa-shield-halved', title: '100% permission-safe', desc: 'MCD / DMRC / AAI approved inventory only' },
                  { icon: 'fa-bolt', title: '48-hr go-live', desc: 'Print + mount + lights-on within 2 days' },
                  { icon: 'fa-camera', title: 'Weekly photo proof', desc: 'Geo-tagged day & night display photos' },
                  { icon: 'fa-headset', title: 'Dedicated manager', desc: 'Single WhatsApp thread for your campaign' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 rounded-2xl bg-blue-50/70 border border-blue-100 p-4">
                    <div className="tick bg-white text-laxBlue-700 shadow-sm">
                      <i className={`fa-solid ${item.icon}`}></i>
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-laxBlue-950">{item.title}</div>
                      <div className="text-xs text-slate-500 font-semibold">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-laxBlue-950 rounded-3xl p-7 text-white relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 hero-grid"></div>
              <div className="relative">
                <h3 className="font-grotesk font-bold text-xl">Quick Estimate</h3>
                <div className="space-y-3 mt-4">
                  <div>
                    <label className="lbl !text-slate-400">Duration</label>
                    <select
                      value={calcDuration}
                      onChange={e => setCalcDuration(e.target.value)}
                      className="field"
                    >
                      {durs.map(d => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="lbl !text-slate-400">Locations</label>
                    <input
                      type="number"
                      value={calcQty}
                      min="1"
                      max="30"
                      onChange={e => setCalcQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="field"
                    />
                  </div>

                  <div className="rounded-2xl grad-bg p-4 text-center">
                    <div className="text-xs font-bold tracking-widest opacity-80 uppercase">TOTAL</div>
                    <div className="font-grotesk font-bold text-3xl">
                      ₹{quickTotal.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickEstimateContinue}
                    className="w-full bg-white text-laxBlue-900 font-extrabold py-3 rounded-xl text-sm shadow hover:bg-laxRed-500 hover:text-white transition"
                  >
                    Continue to Inquiry →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Locations */}
        {activeTab === 1 && (
          <div className="mt-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {locations.map(l => (
                <div
                  key={l.id}
                  className="bg-white rounded-3xl overflow-hidden border border-blue-100 card-hover shadow-sm"
                >
                  <div className="img-zoom h-44 relative">
                    <img
                      src={l.image}
                      alt={l.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/seed/${l.id}/600/400`;
                      }}
                    />
                    <span
                      className={`chip absolute top-3 left-3 ${
                        l.status === 'Available' ? 'bg-green-500 text-white' : 'bg-amber-400 text-black'
                      }`}
                    >
                      {l.status === 'Available' ? 'Available slot' : 'High demand'}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="font-grotesk font-bold text-laxBlue-950">{l.name}</div>
                    <div className="text-xs font-bold text-slate-500 mt-1">
                      <i className="fa-solid fa-location-dot text-laxRed-500 mr-1"></i>
                      {l.city} • {l.zone} Zone
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs font-bold text-slate-500">
                      <span>
                        <i className="fa-solid fa-users text-laxBlue-600 mr-1"></i>
                        {Number(l.footfall).toLocaleString('en-IN')}/day
                      </span>
                      <span>{l.size}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {locations.length === 0 && (
              <div className="text-center text-slate-400 font-bold py-10">No locations mapped yet.</div>
            )}
          </div>
        )}

        {/* Tab 2: Gallery */}
        {activeTab === 2 && (
          <div className="mt-6">
            <div className="gallery-masonry">
              {mediaList.map(m => (
                <div
                  key={m.id}
                  className="masonry-item shadow-card group"
                  onClick={() => openLightbox(m.url, m.title, m.tag)}
                >
                  <img
                    src={m.url}
                    alt={m.title}
                    className="w-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/seed/${m.id}/700/500`;
                    }}
                  />
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="text-white font-bold text-sm">{m.title}</div>
                    <div className="text-blue-200 text-xs font-semibold">{m.tag}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-slate-400 mt-3">
              <i className="fa-solid fa-circle-info mr-1"></i> Gallery pulls live from Admin → Media Library for this service.
            </p>
          </div>
        )}

        {/* Tab 3: Pricing */}
        {activeTab === 3 && (
          <div className="mt-6 bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="lax min-w-[640px]">
                <thead>
                  <tr>
                    <th>Duration</th>
                    <th>Multiplier</th>
                    <th>Price / site</th>
                    <th>You save</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {durs.map(d => {
                    const mult = durationMultipliers[d] || 1;
                    const price = Math.round(service.price * mult);
                    const straight = service.price * (straightRatios[d] || 1);
                    const save = Math.max(0, straight - price);
                    return (
                      <tr key={d}>
                        <td className="font-extrabold">{d}</td>
                        <td>×{mult}</td>
                        <td className="font-grotesk font-bold text-laxBlue-800">
                          ₹{price.toLocaleString('en-IN')}
                        </td>
                        <td>
                          {save > 0 ? (
                            <span className="badge bg-green-50 text-green-700 border border-green-200">
                              Save ₹{save.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs font-bold">—</span>
                          )}
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            onClick={() => handlePricingSelect(d)}
                            className="text-xs font-extrabold text-laxRed-600 hover:underline"
                          >
                            Select →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-5 bg-blue-50/60 text-xs font-semibold text-slate-500">
              + GST 18% • Printing from ₹8,500/site • Mounting & illumination included • Night patrol free on 3M+ plans
            </div>
          </div>
        )}

        {/* Tab 4: Specifications */}
        {activeTab === 4 && (
          <div className="mt-6 space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 spec-grid">
              <div>
                <div className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase">
                  DIMENSIONS
                </div>
                <div className="font-extrabold mt-1 text-laxBlue-950">{service.dims}</div>
              </div>
              <div>
                <div className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase">
                  DURATION OPTIONS
                </div>
                <div className="font-extrabold mt-1 text-laxBlue-950">{service.durations}</div>
              </div>
              <div>
                <div className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase">
                  MINIMUM BOOKING
                </div>
                <div className="font-extrabold mt-1 text-laxBlue-950">{durs[0] || '1 Month'}</div>
              </div>
              <div>
                <div className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase">
                  LEAD TIME
                </div>
                  <div className="font-extrabold mt-1 text-laxBlue-950">{service.lead_time || '48 hours + print'}</div>
              </div>
              <div>
                <div className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase">
                  LIGHTING
                </div>
                  <div className="font-extrabold mt-1 text-laxBlue-950">{service.lighting || 'Front-lit / Backlit, dusk–11pm'}</div>
              </div>
              <div>
                <div className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase">
                  PRINT SPEC
                </div>
                  <div className="font-extrabold mt-1 text-laxBlue-950">{service.print_spec || '720 DPI flex / vinyl, weatherproof'}</div>
              </div>
              <div>
                <div className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase">
                  REPORTING
                </div>
                  <div className="font-extrabold mt-1 text-laxBlue-950">{service.reporting || 'Weekly geo-tagged photos'}</div>
              </div>
              <div>
                <div className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase">
                  SERVICE RATING
                </div>
                <div className="font-extrabold mt-1 text-laxBlue-950">★ {service.rating} / 5</div>
              </div>
            </div>

            {/* Past Campaigns */}
            <div className="bg-white rounded-3xl border border-blue-100 p-6 shadow-sm">
              <h4 className="font-grotesk font-bold text-laxBlue-950 text-lg">
                Past campaigns on this service
              </h4>
              <div className="grid sm:grid-cols-3 gap-4 mt-4">
                {campaigns.map(c => (
                  <div
                    key={c.id}
                    className="rounded-2xl overflow-hidden border border-slate-100 cursor-pointer card-hover"
                    onClick={() => openLightbox(c.artwork, c.title, c.client)}
                  >
                    <img
                      src={c.artwork}
                      alt={c.title}
                      className="h-32 w-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/seed/${c.id}/500/300`;
                      }}
                    />
                    <div className="p-3">
                      <div className="font-extrabold text-sm text-laxBlue-950">{c.title}</div>
                      <div className="text-xs text-slate-500 font-semibold">
                        {c.client} • {c.status}
                      </div>
                    </div>
                  </div>
                ))}

                {campaigns.length === 0 && (
                  <div className="text-sm text-slate-400 font-bold col-span-3 py-4">
                    No recorded campaigns yet for this service.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Inquiry */}
        {activeTab === 5 && (
          <div className="mt-6 grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-blue-100 p-7 shadow-card">
              <h3 className="font-grotesk font-bold text-xl text-laxBlue-950">
                Enquire for {service.name}
              </h3>
              <form onSubmit={handleInquirySubmit} className="grid sm:grid-cols-2 gap-4 mt-5">
                <div>
                  <label className="lbl">Name *</label>
                  <input
                    required
                    value={inqForm.name}
                    onChange={e => setInqForm({ ...inqForm, name: e.target.value })}
                    className="field"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="lbl">Phone *</label>
                  <input
                    required
                    value={inqForm.phone}
                    onChange={e => setInqForm({ ...inqForm, phone: e.target.value })}
                    className="field"
                    placeholder="+91 ..."
                  />
                </div>
                <div>
                  <label className="lbl">Email *</label>
                  <input
                    required
                    type="email"
                    value={inqForm.email}
                    onChange={e => setInqForm({ ...inqForm, email: e.target.value })}
                    className="field"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className="lbl">Location</label>
                  <select
                    value={inqForm.location_id}
                    onChange={e => setInqForm({ ...inqForm, location_id: e.target.value })}
                    className="field"
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.name} — {l.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="lbl">Message</label>
                  <textarea
                    rows="3"
                    value={inqForm.message}
                    onChange={e => setInqForm({ ...inqForm, message: e.target.value })}
                    className="field"
                    placeholder="Launch date, target audience..."
                  ></textarea>
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="grad-btn w-full text-white font-extrabold py-3.5 rounded-xl shadow">
                    Send Inquiry
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-3xl grad-bg-2 p-7 text-white relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 hero-grid"></div>
              <div className="relative">
                <h3 className="font-grotesk font-bold text-xl">What happens next?</h3>
                <div className="mt-5 space-y-4">
                  {inquirySteps.map((title, idx) => {
                    const icons = ['fa-phone', 'fa-file-invoice', 'fa-rocket'];
                    const descriptions = [
                      'A strategist confirms availability & shares site photos.',
                      'Transparent rate card with footfall & map.',
                      'Print, mount, light — with photo proof.'
                    ];
                    return (
                    <div key={idx} className="flex gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                        <i className={`fa-solid ${icons[idx] || 'fa-circle-check'}`}></i>
                      </div>
                      <div>
                        <div className="font-bold text-sm">{title}</div>
                        <div className="text-blue-200 text-sm">{descriptions[idx] || 'Our team will guide you through the next step.'}</div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
