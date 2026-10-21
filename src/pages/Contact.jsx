import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getServices, getLocations, getServiceLocations, saveInquiry, getWhatsAppInquiryUrl } from '../services/dataService';
import AvailabilityChecker from '../components/AvailabilityChecker';
import { useSite } from '../context/SiteContext';

const defaultFaqs = [
  {
    q: 'How fast can my ad go live?',
    a: '48 hours from artwork approval — including printing, mounting and illumination. Airport & metro sites may need 72 hrs for security clearance.'
  },
  {
    q: 'Are your sites government-approved?',
    a: 'Yes. Every Laxico site carries MCD / DMRC / AAI / railway approvals. We share permit copies with your invoice.'
  },
  {
    q: 'Do you handle printing?',
    a: 'In-house plant in Delhi. 720 DPI flex, vinyl & backlit from ₹8,500 per site with free installation.'
  },
  {
    q: 'How do I get proof my ad is displayed?',
    a: 'Geo-tagged day + night photos every week on WhatsApp, plus a completion report with traffic data.'
  },
  {
    q: 'What is the minimum booking?',
    a: 'Street kiosks: 20 poles / 1 month. Billboards & transit: 1 site / 1 month. LEDs: 1 week.'
  }
];

const parseFaqs = (value) => {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultFaqs;
  } catch {
    return defaultFaqs;
  }
};

export default function Contact() {
  const routerLocation = useLocation();
  const { showToast, settings } = useSite();
  const faqs = parseFaqs(settings.contact_faqs);

  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [serviceLocations, setServiceLocations] = useState([]);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [duration, setDuration] = useState('1 Month');
  const [budget, setBudget] = useState('₹50K – ₹2L');
  const [message, setMessage] = useState('');
  const [hasArtwork, setHasArtwork] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    Promise.all([getServices(), getLocations(), getServiceLocations()]).then(([svcs, locs, sl]) => {
      const active = svcs.filter(s => s.status === 'Active');
      setServices(active);
      setLocations(locs);
      setServiceLocations(sl);

      // Pre-select service from route state or first
      const preService = routerLocation.state?.serviceId || (active[0] ? active[0].id : '');
      setServiceId(preService);

      if (routerLocation.state?.duration) {
        setDuration(routerLocation.state.duration);
      }

      // Pre-select mapped location
      const mapped = sl.filter(m => m.service_id === preService).map(m => m.location_id);
      const validLocs = locs.filter(l => mapped.includes(l.id));
      setLocationId(validLocs.length > 0 ? validLocs[0].id : (locs[0] ? locs[0].id : ''));
    });
  }, [routerLocation.state]);

  const handleServiceChange = (sid) => {
    setServiceId(sid);
    const mapped = serviceLocations.filter(m => m.service_id === sid).map(m => m.location_id);
    const validLocs = locations.filter(l => mapped.includes(l.id));
    setLocationId(validLocs.length > 0 ? validLocs[0].id : (locations[0]?.id || ''));
  };

  const getFilteredLocations = () => {
    const mapped = serviceLocations.filter(m => m.service_id === serviceId).map(m => m.location_id);
    const validLocs = locations.filter(l => mapped.includes(l.id));
    return validLocs.length > 0 ? validLocs : locations;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedService = services.find(service => service.id === serviceId);
    const selectedLocation = locations.find(location => location.id === locationId);
    const inquiry = {
      id: `iq_${Math.random().toString(36).slice(2, 9)}`,
      name,
      phone,
      email,
      company: company || '—',
      service_id: serviceId,
      location_id: locationId,
      duration,
      budget,
      message: message + (hasArtwork ? ' [Client has artwork ready]' : ''),
      stage: 'New',
      date: new Date().toISOString().slice(0, 10),
      followup: '—',
      service_name: selectedService?.name,
      location_name: selectedLocation?.name
    };
    try {
      await saveInquiry(inquiry);
      window.open(getWhatsAppInquiryUrl(settings.whatsapp || '9742313705', inquiry), '_blank', 'noopener,noreferrer');
      showToast('Inquiry submitted — strategist will call in 4 hrs', 'success');
      setName('');
      setPhone('');
      setEmail('');
      setCompany('');
      setMessage('');
      setHasArtwork(false);
    } catch {
      showToast('Error submitting inquiry', 'error');
    }
  };

  return (
    <div>
      {/* Top Banner */}
      <div className="grad-bg relative overflow-hidden">
        <div className="absolute inset-0 hero-grid"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-14 grid lg:grid-cols-2 gap-8 items-end">
          <div>
            <span className="section-label text-red-300">{settings.contact_label || 'Get a quote'}</span>
            <h1 className="font-grotesk font-bold text-white text-4xl sm:text-5xl mt-2">
              {settings.contact_title || 'Contact / Inquiry'}
            </h1>
            <p className="text-blue-100 mt-3 font-medium max-w-xl">
              {settings.contact_description || 'Select your service & location. Our strategist replies with photos, footfall & pricing within 4 working hours.'}
            </p>
          </div>

          <div className="flex gap-4 lg:justify-end">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-white flex items-center gap-3 shadow-lg">
              <div className="w-11 h-11 rounded-xl bg-green-500 flex items-center justify-center text-xl shadow">
                <i className="fa-solid fa-headset"></i>
              </div>
              <div>
                <div className="font-extrabold text-sm">{settings.contact_response_title || '4-hr response'}</div>
                <div className="text-xs text-blue-100 font-medium">{settings.support_hours || 'Mon–Sat, 10am–7pm'}</div>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-white hidden sm:flex items-center gap-3 shadow-lg">
              <div className="w-11 h-11 rounded-xl bg-laxRed-500 flex items-center justify-center text-xl shadow">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div>
                <div className="font-extrabold text-sm">{settings.contact_approved_title || '100% Approved'}</div>
                <div className="text-xs text-blue-100 font-medium">Govt. compliant sites</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-5 gap-8 items-start">
        {/* Left Col: Request Form */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-blue-100 shadow-card p-6 sm:p-8">
          <h2 className="font-grotesk font-bold text-2xl text-laxBlue-950">
            Request a callback & quote
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Fields marked * are required. Your inquiry lands directly in our admin lead pipeline.
          </p>

          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="lbl">Full name *</label>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="field"
                placeholder="e.g. Priya Sharma"
              />
            </div>

            <div>
              <label className="lbl">Phone *</label>
              <input
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="field"
                placeholder="+91 ..."
              />
            </div>

            <div>
              <label className="lbl">Email *</label>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="field"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="lbl">Company / Brand</label>
              <input
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="field"
                placeholder="Brand name"
              />
            </div>

            <div>
              <label className="lbl">Select service *</label>
              <select
                value={serviceId}
                onChange={e => handleServiceChange(e.target.value)}
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
              <label className="lbl">Preferred location *</label>
              <select
                value={locationId}
                onChange={e => setLocationId(e.target.value)}
                className="field"
              >
                {getFilteredLocations().map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.city}
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
              <label className="lbl">Approx. budget</label>
              <select
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="field"
              >
                <option>Under ₹50K</option>
                <option>₹50K – ₹2L</option>
                <option>₹2L – ₹5L</option>
                <option>₹5L – ₹15L</option>
                <option>₹15L+</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="lbl">Campaign goal / message</label>
              <textarea
                rows="4"
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="field"
                placeholder="Tell us about your product, launch date, target city..."
              ></textarea>
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <input
                type="checkbox"
                id="inqArtCheck"
                checked={hasArtwork}
                onChange={e => setHasArtwork(e.target.checked)}
                className="w-5 h-5 accent-blue-700 cursor-pointer"
              />
              <label htmlFor="inqArtCheck" className="text-sm font-bold text-laxBlue-900 cursor-pointer">
                I already have campaign artwork ready for print
              </label>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="grad-btn w-full text-white font-extrabold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
              >
                Submit Inquiry <i className="fa-solid fa-paper-plane text-xs"></i>
              </button>
              <p className="text-center text-xs text-slate-400 font-semibold mt-3">
                <i className="fa-solid fa-lock mr-1"></i> Your details are safe. We never share client data.
              </p>
            </div>
          </form>
        </div>

        {/* Right Col: Info & Live Availability */}
        <div className="space-y-5 lg:col-span-2">
          {/* Prefer to talk? card */}
          <div className="rounded-3xl grad-bg-2 p-6 text-white relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 hero-grid"></div>
            <div className="relative">
              <h3 className="font-grotesk font-bold text-lg">Prefer to talk?</h3>
              <div className="mt-4 space-y-3 text-sm font-semibold">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <a href={`tel:${settings.phone || '9742313705'}`} className="hover:underline">
                    {settings.phone || '9742313705'}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <i className="fa-brands fa-whatsapp"></i>
                  </div>
                  <a
                    href={`https://wa.me/91${settings.whatsapp || '9742313705'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    WhatsApp: {settings.whatsapp || '9742313705'}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <a
                    href={`mailto:${settings.email || 'lexicoadvertising@gmail.com'}`}
                    className="break-all hover:underline"
                  >
                    {settings.email || 'lexicoadvertising@gmail.com'}
                  </a>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <span>{settings.head_office || 'No 1 Nandini Complex, Chandra Layout, Bangalore 560040'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Availability Checker */}
          <AvailabilityChecker />
        </div>
      </div>

      {/* Dedicated FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 pb-16 pt-6">
        <div className="text-center mb-8">
          <span className="section-label text-laxRed-600">Common Queries</span>
          <h2 className="font-grotesk font-bold text-2xl sm:text-3xl text-laxBlue-950 mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-2 max-w-lg mx-auto">
            Everything you need to know about our outdoor advertising, campaign timelines, and printing.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-blue-100 p-6 sm:p-8 shadow-card space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-blue-100 rounded-2xl overflow-hidden transition-colors">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left font-extrabold text-sm sm:text-base text-laxBlue-950 hover:bg-slate-50/70 transition"
                >
                  <span>{faq.q}</span>
                  <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-laxBlue-700 shrink-0 font-bold text-base">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-blue-50">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
