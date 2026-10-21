import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getServices,
  getLocations,
  getServiceLocations,
  saveService,
  deleteService,
  uploadImage
} from '../../services/dataService';
import { useSite } from '../../context/SiteContext';
import { MEDIA_GENRES } from '../../components/BrowseByGenre';

export default function AdminServices() {
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [serviceLocations, setServiceLocations] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'Transit',
    genre: 'Transit',
    sub_type: '',
    chain_or_brand: '',
    audience_metric: '',
    min_spend: 10000,
    cities: '',
    lead_time: '',
    lighting: '',
    print_spec: '',
    reporting: '',
    inquiry_process: '',
    price: 45000,
    dims: '',
    durations: '1 Week, 2 Weeks, 1 Month, 3 Months',
    image: '',
    rating: 4.7,
    status: 'Active',
    description: '',
    selectedLocationIds: []
  });

  const { showToast } = useSite();

  const loadData = async () => {
    const [svcs, locs, sl] = await Promise.all([
      getServices(),
      getLocations(),
      getServiceLocations()
    ]);
    setServices(svcs);
    setLocations(locs);
    setServiceLocations(sl);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleOpen = (e) => {
      if (!e.detail || e.detail.action === 'services') {
        openAddModal();
      }
    };
    window.addEventListener('admin-open-modal', handleOpen);
    if (location.state?.openAdd) {
      openAddModal();
    }
    return () => window.removeEventListener('admin-open-modal', handleOpen);
  }, [location.state]);

  const getMappedCount = (serviceId) => {
    return serviceLocations.filter(m => m.service_id === serviceId).length;
  };

  const filtered = services.filter(s => {
    const sGenre = s.genre || s.type;
    if (typeFilter !== 'All' && sGenre !== typeFilter && s.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchText = (s.name + ' ' + sGenre + ' ' + (s.sub_type || '') + ' ' + (s.chain_or_brand || '')).toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      name: '',
      type: 'Transit',
      genre: 'Transit',
      sub_type: '',
      chain_or_brand: '',
      audience_metric: '',
      min_spend: 10000,
      cities: '',
      lead_time: '48 hours + print',
      lighting: 'Front-lit / Backlit, dusk–11pm',
      print_spec: '720 DPI flex / vinyl, weatherproof',
      reporting: 'Weekly geo-tagged photos',
      inquiry_process: 'Call within 4 working hours|Quote + media plan|Go live in 48 hrs',
      price: 45000,
      dims: '20 × 10 ft • Backlit',
      durations: '1 Week, 2 Weeks, 1 Month, 3 Months, 6 Months, 12 Months',
      image: '',
      rating: 4.7,
      status: 'Active',
      description: '',
      selectedLocationIds: []
    });
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingId(service.id);
    const mappedIds = serviceLocations
      .filter(m => m.service_id === service.id)
      .map(m => m.location_id);

    setForm({
      name: service.name,
      type: service.type,
      genre: service.genre || service.type,
      sub_type: service.sub_type || '',
      chain_or_brand: service.chain_or_brand || '',
      audience_metric: service.audience_metric || '',
      min_spend: service.min_spend || Math.round(service.price * 0.35),
      cities: service.cities || serviceLocations
        .filter(m => m.service_id === service.id)
        .map(m => locations.find(l => l.id === m.location_id)?.city)
        .filter(Boolean)
        .filter((city, index, list) => list.indexOf(city) === index)
        .join(', '),
      lead_time: service.lead_time || '48 hours + print',
      lighting: service.lighting || 'Front-lit / Backlit, dusk–11pm',
      print_spec: service.print_spec || '720 DPI flex / vinyl, weatherproof',
      reporting: service.reporting || 'Weekly geo-tagged photos',
      inquiry_process: service.inquiry_process || 'Call within 4 working hours|Quote + media plan|Go live in 48 hrs',
      price: service.price,
      dims: service.dims || '',
      durations: service.durations || '',
      image: service.image || '',
      rating: service.rating || 4.7,
      status: service.status || 'Active',
      description: service.description || '',
      selectedLocationIds: mappedIds
    });
    setModalOpen(true);
  };

  const handleToggleLocation = (locId) => {
    setForm(prev => {
      const exists = prev.selectedLocationIds.includes(locId);
      return {
        ...prev,
        selectedLocationIds: exists
          ? prev.selectedLocationIds.filter(id => id !== locId)
          : [...prev.selectedLocationIds, locId]
      };
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, 'services');
      setForm(prev => ({ ...prev, image: url }));
      showToast('Service image uploaded', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      showToast('Service name & price are required', 'error');
      return;
    }

    const serviceObj = {
      id: editingId || `svc_${Math.random().toString(36).slice(2, 9)}`,
      name: form.name.trim(),
      type: form.genre || form.type,
      genre: form.genre || form.type,
      sub_type: form.sub_type.trim(),
      chain_or_brand: form.chain_or_brand.trim(),
      audience_metric: form.audience_metric.trim(),
      min_spend: parseInt(form.min_spend) || Math.round(parseInt(form.price) * 0.35),
      cities: form.cities.trim(),
      lead_time: form.lead_time.trim(),
      lighting: form.lighting.trim(),
      print_spec: form.print_spec.trim(),
      reporting: form.reporting.trim(),
      inquiry_process: form.inquiry_process.trim(),
      price: parseInt(form.price) || 0,
      dims: form.dims,
      durations: form.durations,
      image: form.image || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800',
      rating: parseFloat(form.rating) || 4.7,
      status: form.status,
      description: form.description,
      popularity: editingId ? (services.find(s => s.id === editingId)?.popularity || 75) : 75
    };

    try {
      await saveService(serviceObj, form.selectedLocationIds);
      showToast('Service saved + locations mapped', 'success');
      setModalOpen(false);
      await loadData();
    } catch (err) {
      showToast(err?.message || 'Error saving service', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service and its location mappings?')) return;
    try {
      await deleteService(id);
      showToast('Service deleted', 'warn');
      await loadData();
    } catch {
      showToast('Error deleting service', 'error');
    }
  };

  const handleToggleStatus = async (service) => {
    const nextStatus = service.status === 'Active' ? 'Inactive' : 'Active';
    const updated = { ...service, status: nextStatus };
    await saveService(updated);
    showToast(`Service ${nextStatus.toLowerCase()}`, 'info');
    await loadData();
  };

  return (
    <div className="bg-[#0c1747] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search media by name, chain, or genre..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-laxBlue-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-bold outline-none cursor-pointer"
          >
            <option value="All">All Media Genres</option>
            {MEDIA_GENRES.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <button
            onClick={openAddModal}
            className="grad-btn text-white text-xs sm:text-sm font-extrabold px-4 py-3 rounded-xl flex items-center gap-2 shadow shrink-0"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add Media</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-white/5 text-white uppercase text-[11px] font-extrabold tracking-wider border-b border-white/10">
            <tr>
              <th className="py-3 px-4">Media Property</th>
              <th className="py-3 px-4">Genre & Format</th>
              <th className="py-3 px-4">Audience Metric</th>
              <th className="py-3 px-4">Pricing</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium">
            {filtered.map(service => {
              const minSpend = service.min_spend || Math.round(service.price * 0.35);
              const locCount = getMappedCount(service.id);

              return (
                <tr key={service.id} className="hover:bg-white/5 transition">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-900 shrink-0"
                        onError={e => {
                          e.target.src = `https://picsum.photos/seed/${service.id}/100/100`;
                        }}
                      />
                      <div className="min-w-0">
                        <div className="text-white font-grotesk font-bold truncate max-w-[220px]">
                          {service.name}
                        </div>
                        {service.chain_or_brand && (
                          <div className="text-xs text-laxRed-400 font-semibold truncate">
                            {service.chain_or_brand}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400">
                          {locCount} mapped locations
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="chip bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold">
                      {service.genre || service.type}
                    </span>
                    {service.sub_type && (
                      <div className="text-xs text-slate-400 font-semibold mt-1">
                        {service.sub_type}
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-xs text-white font-semibold flex items-center gap-1.5 max-w-[200px] truncate">
                      <i className="fa-solid fa-users text-blue-400 text-xs shrink-0"></i>
                      <span>{service.audience_metric || 'High urban dwell'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Rating: ★ {service.rating || 4.7}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-grotesk font-bold text-white">
                      ₹{Number(minSpend).toLocaleString('en-IN')}
                      <span className="text-[10px] text-slate-400 font-normal"> min spend</span>
                    </div>
                    <div className="text-xs text-slate-400 font-semibold">
                      ₹{Number(service.price).toLocaleString('en-IN')}/mo
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleStatus(service)}
                      className={`text-xs font-extrabold px-3 py-1 rounded-full transition ${
                        service.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {service.status}
                    </button>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(service)}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition"
                        title="Edit"
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 flex items-center justify-center text-xs transition"
                        title="Delete"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Visible only on mobile screens) */}
      <div className="md:hidden space-y-3">
        {filtered.map(service => {
          const minSpend = service.min_spend || Math.round(service.price * 0.35);

          return (
            <div
              key={service.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3"
            >
              <div className="flex gap-3 items-center">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-900 shrink-0"
                  onError={e => {
                    e.target.src = `https://picsum.photos/seed/${service.id}/100/100`;
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="chip bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                      {service.genre || service.type}
                    </span>
                    {service.chain_or_brand && (
                      <span className="chip bg-white/10 text-white text-[10px]">
                        {service.chain_or_brand}
                      </span>
                    )}
                  </div>
                  <div className="text-white font-grotesk font-bold text-sm truncate mt-1">
                    {service.name}
                  </div>
                  {service.audience_metric && (
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      👥 {service.audience_metric}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Min Spend</span>
                  <div className="font-grotesk font-bold text-white text-base leading-tight">
                    ₹{Number(minSpend).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(service)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      service.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {service.status}
                  </button>

                  <button
                    onClick={() => openEditModal(service)}
                    className="p-2 bg-white/10 rounded-lg text-white text-xs"
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>

                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 bg-red-500/20 text-red-300 rounded-lg text-xs"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Service Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-laxBlue-950 my-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-grotesk font-bold text-2xl text-laxBlue-950">
                  {editingId ? 'Edit Media Property' : 'Add Media Property'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure inventory details, genre, audience footfall and pricing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-lg text-slate-700 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4 mt-5">
              <div className="sm:col-span-2">
                <label className="lbl">Property Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="field"
                  placeholder="e.g. PVR INOX Phoenix Mall (Screen 1 - 4)"
                />
              </div>

              <div>
                <label className="lbl">Media Genre *</label>
                <select
                  value={form.genre}
                  onChange={e => setForm({ ...form, genre: e.target.value, type: e.target.value })}
                  className="field font-bold"
                >
                  {MEDIA_GENRES.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="lbl">Chain / Brand Name</label>
                <input
                  value={form.chain_or_brand}
                  onChange={e => setForm({ ...form, chain_or_brand: e.target.value })}
                  className="field"
                  placeholder="e.g. PVR INOX, Cinepolis, Metro Rail"
                />
              </div>

              <div>
                <label className="lbl">Ad Option / Sub-Type</label>
                <input
                  value={form.sub_type}
                  onChange={e => setForm({ ...form, sub_type: e.target.value })}
                  className="field"
                  placeholder="e.g. On-Screen Video Ad, Unipole, Aerobridge"
                />
              </div>

              <div>
                <label className="lbl">Audience Metric</label>
                <input
                  value={form.audience_metric}
                  onChange={e => setForm({ ...form, audience_metric: e.target.value })}
                  className="field"
                  placeholder="e.g. 280 Seats/Screen • 4.2L+ Footfall"
                />
              </div>

              <div>
                <label className="lbl">Min Spend (₹) *</label>
                <input
                  type="number"
                  required
                  value={form.min_spend}
                  onChange={e => setForm({ ...form, min_spend: e.target.value })}
                  className="field"
                  placeholder="11400"
                />
              </div>

              <div>
                <label className="lbl">Base Monthly Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  className="field"
                  placeholder="45000"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="lbl">Available Cities</label>
                <input
                  value={form.cities}
                  onChange={e => setForm({ ...form, cities: e.target.value })}
                  className="field"
                  placeholder="Mumbai, Bengaluru, Delhi NCR, Hyderabad"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="lbl">Description</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="field"
                  placeholder="Describe location, audience profile, view angles..."
                ></textarea>
              </div>

              <div>
                <label className="lbl">Dimensions</label>
                <input
                  value={form.dims}
                  onChange={e => setForm({ ...form, dims: e.target.value })}
                  className="field"
                  placeholder="e.g. 2K DCP • 10s Spot"
                />
              </div>

              <div>
                <label className="lbl">Durations</label>
                <input
                  value={form.durations}
                  onChange={e => setForm({ ...form, durations: e.target.value })}
                  className="field"
                  placeholder="1 Week, 2 Weeks, 1 Month"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="lbl">Image URL or Upload</label>
                <div className="flex gap-2">
                  <input
                    value={form.image.startsWith('data:') ? '' : form.image}
                    onChange={e => setForm({ ...form, image: e.target.value })}
                    className="field flex-1"
                    placeholder="https://..."
                  />
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-3 rounded-2xl flex items-center gap-1.5 shrink-0">
                    <i className="fa-solid fa-upload"></i> Upload
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Location Mapping Checkboxes */}
              <div className="sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
                <label className="lbl">Map to Physical Sites ({form.selectedLocationIds.length} selected)</label>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-2xl p-3 space-y-1.5 bg-slate-50">
                  {locations.map(loc => {
                    const isChecked = form.selectedLocationIds.includes(loc.id);
                    return (
                      <label
                        key={loc.id}
                        className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer p-1 rounded hover:bg-white"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleLocation(loc.id)}
                          className="w-4 h-4 rounded text-laxBlue-600 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-semibold">{loc.name}</span>
                        <span className="text-slate-400">({loc.city})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="grad-btn text-white text-xs font-extrabold px-6 py-3 rounded-xl shadow"
                >
                  {editingId ? 'Save Changes' : 'Create Media Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
