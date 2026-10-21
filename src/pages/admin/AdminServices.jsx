import React, { useState, useEffect } from 'react';
import {
  getServices,
  getLocations,
  getServiceLocations,
  saveService,
  deleteService,
  uploadImage
} from '../../services/dataService';
import { useSite } from '../../context/SiteContext';

export default function AdminServices() {
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

  const getMappedCount = (serviceId) => {
    return serviceLocations.filter(m => m.service_id === serviceId).length;
  };

  const filtered = services.filter(s => {
    if (typeFilter !== 'All' && s.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.type.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      name: '',
      type: 'Transit',
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
      type: form.type,
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
      rating: parseFloat(form.rating) || 4.5,
      status: form.status,
      description: form.description,
      popularity: editingId ? (services.find(s => s.id === editingId)?.popularity || 75) : 75
    };

    try {
      await saveService(serviceObj, form.selectedLocationIds);
      showToast('Service saved + locations mapped', 'success');
      setModalOpen(false);
      await loadData();
    } catch {
      showToast('Error saving service', 'error');
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
    <div className="bg-[#0c1747] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-laxBlue-600"
          />
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none cursor-pointer"
        >
          <option value="All">All types</option>
          <option>Transit</option>
          <option>Outdoor</option>
          <option>Airport</option>
          <option>Retail</option>
          <option>Digital</option>
          <option>Street Furniture</option>
        </select>

        <button
          onClick={openAddModal}
          className="grad-btn text-white text-sm font-extrabold px-5 py-3 rounded-xl flex items-center gap-1.5 shadow"
        >
          <i className="fa-solid fa-plus"></i> Add Service
        </button>
      </div>

      {/* Services Table */}
      <div className="overflow-x-auto rounded-2xl overflow-hidden">
        <table className="lax min-w-[860px]">
          <thead>
            <tr>
              <th>Service</th>
              <th>Type</th>
              <th>Cities</th>
              <th>Locations</th>
              <th>Price / mo</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const mappedCount = getMappedCount(s.id);
              return (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img
                        src={s.image}
                        alt={s.name}
                        className="w-12 h-12 rounded-xl object-cover shadow"
                        onError={(e) => {
                          e.target.src = `https://picsum.photos/seed/${s.id}/200/200`;
                        }}
                      />
                      <div>
                        <div className="font-extrabold text-laxBlue-950">{s.name}</div>
                        <div className="text-xs text-slate-400 font-semibold">
                          ★ {s.rating} • {(s.durations || '').split(',')[0]}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="badge bg-blue-50 text-laxBlue-700 border border-blue-200">
                      {s.type}
                    </span>
                  </td>

                  <td className="font-semibold text-slate-600 max-w-[180px]">
                    {(s.cities || '—').split(',').map(city => city.trim()).filter(Boolean).join(', ') || '—'}
                  </td>

                  <td className="font-bold text-laxBlue-950">{mappedCount} mapped</td>

                  <td className="font-grotesk font-bold text-laxBlue-950">
                    ₹{Number(s.price).toLocaleString('en-IN')}
                  </td>

                  <td>
                    <button
                      onClick={() => handleToggleStatus(s)}
                      className={`badge cursor-pointer transition ${
                        s.status === 'Active'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-slate-100 text-slate-500 border'
                      }`}
                    >
                      {s.status}
                    </button>
                  </td>

                  <td className="text-right whitespace-nowrap">
                    <button
                      onClick={() => openEditModal(s)}
                      className="w-9 h-9 rounded-lg bg-blue-50 text-laxBlue-700 hover:bg-laxBlue-700 hover:text-white transition mr-1.5"
                    >
                      <i className="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition"
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-slate-400 font-bold py-8">
                  No services found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Service Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[9996] modal-bg flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 my-8 text-laxBlue-950 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-grotesk font-bold text-2xl text-laxBlue-950">
                {editingId ? 'Edit Service' : 'Add Service'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4 mt-5">
              <div className="sm:col-span-2">
                <label className="lbl">Service name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="field"
                  placeholder="e.g. Metro Station Ads"
                />
              </div>

              <div>
                <label className="lbl">Type *</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="field"
                >
                  <option>Transit</option>
                  <option>Outdoor</option>
                  <option>Airport</option>
                  <option>Retail</option>
                  <option>Digital</option>
                  <option>Street Furniture</option>
                </select>
              </div>

              <div>
                <label className="lbl">Base price / month (₹) *</label>
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
                <label className="lbl">Available cities</label>
                <input
                  value={form.cities}
                  onChange={e => setForm({ ...form, cities: e.target.value })}
                  className="field"
                  placeholder="New Delhi, Mumbai, Bengaluru"
                />
                <p className="text-[11px] text-slate-400 mt-1">Comma-separated. Users can filter services by these cities.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="lbl">Description</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="field"
                  placeholder="Where it appears, sizes, audience..."
                ></textarea>
              </div>

              <div className="sm:col-span-2 border-t border-blue-100 pt-4 mt-1">
                <div className="text-xs font-extrabold tracking-widest text-slate-400 uppercase mb-3">Service detail tabs</div>
              </div>

              <div>
                <label className="lbl">Lead time / overview</label>
                <input value={form.lead_time} onChange={e => setForm({ ...form, lead_time: e.target.value })} className="field" placeholder="48 hours + print" />
              </div>
              <div>
                <label className="lbl">Lighting specification</label>
                <input value={form.lighting} onChange={e => setForm({ ...form, lighting: e.target.value })} className="field" placeholder="Front-lit / Backlit" />
              </div>
              <div>
                <label className="lbl">Print specification</label>
                <input value={form.print_spec} onChange={e => setForm({ ...form, print_spec: e.target.value })} className="field" placeholder="720 DPI flex / vinyl" />
              </div>
              <div>
                <label className="lbl">Reporting</label>
                <input value={form.reporting} onChange={e => setForm({ ...form, reporting: e.target.value })} className="field" placeholder="Weekly geo-tagged photos" />
              </div>
              <div className="sm:col-span-2">
                <label className="lbl">Inquiry steps (separate with |)</label>
                <input value={form.inquiry_process} onChange={e => setForm({ ...form, inquiry_process: e.target.value })} className="field" placeholder="Call within 4 working hours|Quote + media plan|Go live in 48 hrs" />
              </div>

              <div>
                <label className="lbl">Dimensions</label>
                <input
                  value={form.dims}
                  onChange={e => setForm({ ...form, dims: e.target.value })}
                  className="field"
                  placeholder="e.g. 20 × 10 ft, Backlit"
                />
              </div>

              <div>
                <label className="lbl">Duration options (comma separated)</label>
                <input
                  value={form.durations}
                  onChange={e => setForm({ ...form, durations: e.target.value })}
                  className="field"
                  placeholder="1 Week, 2 Weeks, 1 Month, 3 Months"
                />
              </div>

              <div>
                <label className="lbl">Image URL</label>
                <input
                  value={form.image.startsWith('data:') ? '' : form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  className="field"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="lbl">Or upload image file</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="field !py-2 text-xs"
                />
              </div>

              <div>
                <label className="lbl">Rating (0–5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.rating}
                  onChange={e => setForm({ ...form, rating: e.target.value })}
                  className="field"
                />
              </div>

              <div>
                <label className="lbl">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="field"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              {/* Service_Locations Mapping Checkboxes */}
              <div className="sm:col-span-2">
                <label className="lbl">Included Locations (Service_Locations mapping)</label>
                <div className="grid sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto border border-blue-100 rounded-2xl p-3 bg-blue-50/50">
                  {locations.map(l => {
                    const isChecked = form.selectedLocationIds.includes(l.id);
                    return (
                      <label
                        key={l.id}
                        className={`flex items-center gap-2 text-sm font-bold bg-white border rounded-xl px-3 py-2 cursor-pointer transition ${
                          isChecked ? 'border-laxBlue-600 bg-blue-50/40 text-laxBlue-950' : 'border-blue-100 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleLocation(l.id)}
                          className="accent-blue-700 w-4 h-4 cursor-pointer"
                        />
                        <span className="truncate">
                          {l.name} <span className="text-slate-400 font-semibold">• {l.city}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="sm:col-span-2 mt-2">
                <button
                  type="submit"
                  className="grad-btn w-full text-white font-extrabold py-3.5 rounded-xl shadow-lg"
                >
                  Save Service & Locations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
