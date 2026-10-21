import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getLocations,
  getServices,
  getServiceLocations,
  saveLocation,
  deleteLocation,
  uploadImage
} from '../../services/dataService';
import { useSite } from '../../context/SiteContext';

export default function AdminLocations() {
  const location = useLocation();
  const [locations, setLocations] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceLocations, setServiceLocations] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    city: 'New Delhi',
    zone: 'Central',
    footfall: 100000,
    size: '40 × 20 ft Unipole',
    status: 'Available',
    image: ''
  });

  const { showToast } = useSite();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, 'locations');
      setForm(prev => ({ ...prev, image: url }));
      showToast('Location image uploaded', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const loadData = async () => {
    const [locs, svcs, sl] = await Promise.all([
      getLocations(),
      getServices(),
      getServiceLocations()
    ]);
    setLocations(locs);
    setServices(svcs);
    setServiceLocations(sl);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleOpen = (e) => {
      if (!e.detail || e.detail.action === 'locations') {
        openAddModal();
      }
    };
    window.addEventListener('admin-open-modal', handleOpen);
    if (location.state?.openAdd) {
      openAddModal();
    }
    return () => window.removeEventListener('admin-open-modal', handleOpen);
  }, [location.state]);

  const filtered = locations.filter(l => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (l.name + l.city + l.zone).toLowerCase().includes(q);
    }
    return true;
  });

  const getMappedServices = (locId) => {
    const svcIds = serviceLocations.filter(m => m.location_id === locId).map(m => m.service_id);
    return services.filter(s => svcIds.includes(s.id));
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      name: '',
      city: 'New Delhi',
      zone: 'Central',
      footfall: 150000,
      size: '20 × 10 ft Backlit',
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800'
    });
    setModalOpen(true);
  };

  const openEditModal = (loc) => {
    setEditingId(loc.id);
    setForm({
      name: loc.name,
      city: loc.city,
      zone: loc.zone || 'Central',
      footfall: loc.footfall,
      size: loc.size,
      status: loc.status,
      image: loc.image
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Location name is required', 'error');
      return;
    }

    const locObj = {
      id: editingId || `loc_${Math.random().toString(36).slice(2, 9)}`,
      name: form.name.trim(),
      city: form.city.trim(),
      zone: form.zone,
      footfall: parseInt(form.footfall) || 50000,
      size: form.size.trim(),
      status: form.status,
      image: form.image || 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800'
    };

    try {
      await saveLocation(locObj);
      showToast('Location saved successfully', 'success');
      setModalOpen(false);
      await loadData();
    } catch (err) {
      showToast(err?.message || 'Error saving location', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete location and its mappings?')) return;
    try {
      await deleteLocation(id);
      showToast('Location deleted', 'warn');
      await loadData();
    } catch {
      showToast('Error deleting location', 'error');
    }
  };

  const handleInlineStatus = async (loc, newStatus) => {
    const updated = { ...loc, status: newStatus };
    await saveLocation(updated);
    showToast(`Status updated to ${newStatus}`, 'info');
    await loadData();
  };

  const stColor = {
    Available: '#16a34a',
    Occupied: '#f59e0b',
    Maintenance: '#64748b'
  };

  return (
    <div className="bg-[#0c1747] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* Search and Action */}
      <div className="flex flex-wrap gap-3 items-center mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search locations, cities..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-laxBlue-600"
          />
        </div>

        <button
          onClick={openAddModal}
          className="grad-btn text-white text-sm font-extrabold px-5 py-3 rounded-xl flex items-center gap-1.5 shadow"
        >
          <i className="fa-solid fa-plus"></i> Add Location
        </button>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(l => {
          const mappedSvcs = getMappedServices(l.id);
          return (
            <div
              key={l.id}
              className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex flex-col justify-between"
            >
              <div>
                <div className="h-36 relative">
                  <img
                    src={l.image}
                    alt={l.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/seed/${l.id}/600/300`;
                    }}
                  />
                  <span className="chip absolute top-3 left-3 bg-black/60 text-white backdrop-blur flex items-center gap-1.5">
                    <span
                      className="status-dot"
                      style={{ background: stColor[l.status] || '#64748b' }}
                    ></span>
                    {l.status}
                  </span>
                  <span className="chip absolute top-3 right-3 bg-white/90 text-laxBlue-900 font-bold">
                    {l.city}
                  </span>
                </div>

                <div className="p-4">
                  <div className="text-white font-bold text-base leading-tight">{l.name}</div>
                  <div className="text-slate-400 text-xs font-bold mt-1">
                    {l.size} • {Number(l.footfall).toLocaleString('en-IN')}/day • {l.zone} Zone
                  </div>

                  {/* Mapped Services Tags */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {mappedSvcs.map(s => (
                      <span
                        key={s.id}
                        className="text-[10px] font-extrabold bg-white/10 text-blue-200 px-2 py-0.5 rounded-full"
                      >
                        {s.name}
                      </span>
                    ))}
                    {mappedSvcs.length === 0 && (
                      <span className="text-[10px] font-bold text-slate-500">
                        No service mapped
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="flex gap-2 mt-2 pt-3 border-t border-white/10 items-center">
                  <select
                    value={l.status}
                    onChange={e => handleInlineStatus(l, e.target.value)}
                    className="flex-1 bg-white/10 border border-white/10 rounded-lg px-2 py-2 text-xs text-white font-bold outline-none cursor-pointer"
                  >
                    <option className="bg-[#0c1747]">Available</option>
                    <option className="bg-[#0c1747]">Occupied</option>
                    <option className="bg-[#0c1747]">Maintenance</option>
                  </select>

                  <button
                    onClick={() => openEditModal(l)}
                    className="w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-blue-600 transition flex items-center justify-center"
                    title="Edit Location"
                  >
                    <i className="fa-solid fa-pen text-xs"></i>
                  </button>

                  <button
                    onClick={() => handleDelete(l.id)}
                    className="w-9 h-9 rounded-lg bg-white/10 text-red-300 hover:bg-red-600 hover:text-white transition flex items-center justify-center"
                    title="Delete Location"
                  >
                    <i className="fa-solid fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center text-slate-400 font-bold py-10">
            No locations found.
          </div>
        )}
      </div>

      {/* Add / Edit Location Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[9996] modal-bg flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-laxBlue-950 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-grotesk font-bold text-2xl text-laxBlue-950">
                {editingId ? 'Edit Location' : 'Add Location'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4 mt-5">
              <div className="sm:col-span-2">
                <label className="lbl">Location name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="field"
                  placeholder="e.g. Central Metro Hub — Concourse"
                />
              </div>

              <div>
                <label className="lbl">City *</label>
                <input
                  required
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  className="field"
                  placeholder="New Delhi"
                />
              </div>

              <div>
                <label className="lbl">Zone</label>
                <select
                  value={form.zone}
                  onChange={e => setForm({ ...form, zone: e.target.value })}
                  className="field"
                >
                  <option>North</option>
                  <option>South</option>
                  <option>East</option>
                  <option>West</option>
                  <option>Central</option>
                </select>
              </div>

              <div>
                <label className="lbl">Daily footfall</label>
                <input
                  type="number"
                  value={form.footfall}
                  onChange={e => setForm({ ...form, footfall: e.target.value })}
                  className="field"
                  placeholder="250000"
                />
              </div>

              <div>
                <label className="lbl">Size / format</label>
                <input
                  value={form.size}
                  onChange={e => setForm({ ...form, size: e.target.value })}
                  className="field"
                  placeholder="40 × 20 ft Unipole"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="lbl">Image URL</label>

                              <div className="sm:col-span-2">
                                <label className="lbl">Or upload image file</label>
                                <input type="file" accept="image/*" onChange={handleFileUpload} className="field !py-2 text-xs" />
                              </div>
                <input
                  value={form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  className="field"
                  placeholder="https://..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="lbl">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="field"
                >
                  <option>Available</option>
                  <option>Occupied</option>
                  <option>Maintenance</option>
                </select>
              </div>

              <div className="sm:col-span-2 mt-2">
                <button
                  type="submit"
                  className="grad-btn w-full text-white font-extrabold py-3.5 rounded-xl shadow-lg"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
