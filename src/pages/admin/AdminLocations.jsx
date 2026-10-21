import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getLocations,
  getServices,
  getServiceLocations,
  saveLocation,
  deleteLocation,
  deleteLocationsBulk,
  clearAllLocations,
  rollbackToExampleLocations,
  uploadImage
} from '../../services/dataService';
import { useSite } from '../../context/SiteContext';
import AdminPagination from '../../components/admin/AdminPagination';

export default function AdminLocations() {
  const location = useLocation();
  const [locations, setLocations] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceLocations, setServiceLocations] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deletingBulk, setDeletingBulk] = useState(false);

  // Double Warning Wipe & Rollback State
  const [wipeModalOpen, setWipeModalOpen] = useState(false);
  const [wipeStep, setWipeStep] = useState(1);
  const [wipeConfirmText, setWipeConfirmText] = useState('');
  const [wiping, setWiping] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);

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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  // Paginated Locations Slice
  const paginatedLocations = filtered.slice(
    itemsPerPage === 'all' ? 0 : (currentPage - 1) * Number(itemsPerPage),
    itemsPerPage === 'all' ? filtered.length : (currentPage - 1) * Number(itemsPerPage) + Number(itemsPerPage)
  );

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

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(l => l.id)));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${ids.length} selected location(s)?`)) {
      return;
    }
    setDeletingBulk(true);
    try {
      await deleteLocationsBulk(ids);
      setSelectedIds(new Set());
      showToast(`Successfully deleted ${ids.length} location(s)`, 'success');
      await loadData();
    } catch (err) {
      console.error('Failed to delete locations:', err);
      showToast('Failed to delete selected locations', 'error');
    } finally {
      setDeletingBulk(false);
    }
  };

  const handleConfirmWipe = async () => {
    if (wipeConfirmText.trim() !== 'DELETE') return;
    setWiping(true);
    try {
      await clearAllLocations();
      setLocations([]);
      setServiceLocations([]);
      setSelectedIds(new Set());
      setWipeModalOpen(false);
      setWipeStep(1);
      setWipeConfirmText('');
      showToast('All locations and mock data permanently wiped from database!', 'success');
    } catch (err) {
      console.error('Failed to wipe locations:', err);
      showToast('Failed to wipe locations from database', 'error');
    } finally {
      setWiping(false);
    }
  };

  const handleRollback = async () => {
    if (!window.confirm('Restore official example locations? This will seed default prime outdoor & transit inventory spots.')) {
      return;
    }
    setRollingBack(true);
    try {
      const restored = await rollbackToExampleLocations();
      setLocations(restored);
      setSelectedIds(new Set());
      showToast(`Restored ${restored.length} default example locations!`, 'success');
      await loadData();
    } catch (err) {
      console.error('Failed to rollback locations:', err);
      showToast('Failed to rollback locations', 'error');
    } finally {
      setRollingBack(false);
    }
  };

  return (
    <div className="bg-[#0c1747] border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl w-full max-w-full overflow-hidden">
      {/* Search and Action */}
      <div className="flex flex-wrap gap-2 sm:gap-3 items-center mb-5 w-full">
        <div className="relative flex-1 min-w-[140px] sm:min-w-[200px]">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search locations, cities..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-laxBlue-600"
          />
        </div>

        {/* Select / Deselect All */}
        {filtered.length > 0 && (
          <button
            onClick={handleToggleSelectAll}
            className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs sm:text-sm font-bold px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-xl transition"
            title="Select or deselect all visible locations"
          >
            <input
              type="checkbox"
              readOnly
              checked={selectedIds.size === filtered.length && filtered.length > 0}
              className="accent-laxRed-500 rounded cursor-pointer"
            />
            <span>{selectedIds.size === filtered.length ? 'Deselect All' : 'Select All'}</span>
          </button>
        )}

        {/* Delete Selected Button */}
        {selectedIds.size > 0 && (
          <button
            onClick={handleDeleteSelected}
            disabled={deletingBulk}
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-extrabold px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition shadow-lg animate-pulse"
            title="Delete selected locations"
          >
            <i className={`fa-solid ${deletingBulk ? 'fa-circle-notch fa-spin' : 'fa-trash'}`}></i>
            <span>Delete Selected ({selectedIds.size})</span>
          </button>
        )}

        {/* Rollback to Examples */}
        <button
          onClick={handleRollback}
          disabled={rollingBack}
          className="inline-flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-bold px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition shadow"
          title="Restore default example locations"
        >
          <i className={`fa-solid ${rollingBack ? 'fa-circle-notch fa-spin' : 'fa-rotate-left'}`}></i>
          <span>{rollingBack ? 'Restoring...' : 'Rollback Examples'}</span>
        </button>

        {/* Wipe All (Double Warning) */}
        <button
          onClick={() => {
            setWipeStep(1);
            setWipeConfirmText('');
            setWipeModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs sm:text-sm font-bold px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition shadow"
          title="Wipe all locations with double confirmation warning"
        >
          <i className="fa-solid fa-trash-can"></i>
          <span>Wipe All</span>
        </button>

        <button
          onClick={openAddModal}
          className="grad-btn text-white text-xs sm:text-sm font-extrabold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl flex items-center gap-1.5 shadow"
        >
          <i className="fa-solid fa-plus"></i> Add Location
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 w-full">
        {paginatedLocations.map(l => {
          const mappedSvcs = getMappedServices(l.id);
          return (
            <div
              key={l.id}
              className={`rounded-2xl overflow-hidden bg-white/5 border flex flex-col justify-between transition ${
                selectedIds.has(l.id) ? 'border-red-500/60 bg-red-500/[0.06] ring-2 ring-red-500/30' : 'border-white/10'
              }`}
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
                  <label
                    onClick={e => e.stopPropagation()}
                    className="absolute top-3 left-3 z-10 w-7 h-7 rounded-lg bg-black/70 backdrop-blur border border-white/20 flex items-center justify-center cursor-pointer hover:bg-black/90 transition shadow"
                    title="Select location"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(l.id)}
                      onChange={() => handleToggleSelectOne(l.id)}
                      className="accent-laxRed-500 rounded cursor-pointer w-4 h-4"
                    />
                  </label>
                  <span className="chip absolute top-3 left-12 bg-black/60 text-white backdrop-blur flex items-center gap-1.5">
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
          <div className="sm:col-span-2 xl:col-span-3 text-center py-16 text-slate-400 bg-white/[0.02] border border-white/10 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto text-xl mb-2 text-slate-500">
              <i className="fa-solid fa-location-dot"></i>
            </div>
            <div className="font-bold text-white text-base">No locations found</div>
            <p className="text-xs text-slate-400 mt-1">Database is currently empty or filtered out.</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={handleRollback}
                className="text-xs font-bold text-amber-300 bg-amber-500/15 px-3.5 py-2 rounded-xl border border-amber-500/30 hover:bg-amber-500/25 transition inline-flex items-center gap-1.5"
              >
                <i className="fa-solid fa-rotate-left"></i> Restore Default Locations
              </button>
              <button
                onClick={openAddModal}
                className="grad-btn text-white text-xs font-bold px-3.5 py-2 rounded-xl"
              >
                + Add Location
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination & Next Page Controls */}
      <AdminPagination
        totalItems={filtered.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        itemLabel="locations"
        perPageOptions={[3, 6, 9, 18, 'all']}
      />

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

      {/* DOUBLE WARNING WIPE MODAL */}
      {wipeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#071343] border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => {
                setWipeModalOpen(false);
                setWipeStep(1);
                setWipeConfirmText('');
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            {wipeStep === 1 ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto text-3xl">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-[11px] font-extrabold tracking-wider uppercase mb-2">
                    Warning Step 1 of 2
                  </div>
                  <h3 className="font-grotesk font-bold text-xl sm:text-2xl text-white">
                    Clear All Locations & Inventory?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    This will permanently delete all locations and service mappings from your Supabase / PostgreSQL database and local storage.
                  </p>
                </div>

                <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 text-left text-xs text-red-200/90 flex items-start gap-2.5">
                  <i className="fa-solid fa-circle-info text-red-400 mt-0.5 shrink-0"></i>
                  <span>
                    You can always use <strong>"Rollback Examples"</strong> to restore the official default locations anytime.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setWipeModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setWipeStep(2)}
                    className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-500 text-white shadow-lg transition flex items-center gap-1.5"
                  >
                    <span>Proceed to Final Warning</span>
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto text-3xl animate-pulse shadow-lg shadow-red-900/60">
                  <i className="fa-solid fa-skull-crossbones"></i>
                </div>
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-red-600/30 text-red-200 border border-red-500/50 text-[11px] font-extrabold tracking-wider uppercase mb-2">
                    Final Confirmation Step 2 of 2
                  </div>
                  <h3 className="font-grotesk font-bold text-xl sm:text-2xl text-white">
                    Are you absolutely sure?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    This action is <strong className="text-red-400">IRREVERSIBLE</strong>. Type <span className="font-mono bg-black/40 px-2 py-0.5 rounded text-red-300 font-bold border border-red-500/30">DELETE</span> below to confirm permanent deletion.
                  </p>
                </div>

                <div className="pt-2">
                  <input
                    type="text"
                    value={wipeConfirmText}
                    onChange={(e) => setWipeConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    autoFocus
                    className="w-full bg-[#040A29] border-2 border-red-500/50 focus:border-red-400 rounded-xl py-3 px-4 text-center font-mono text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setWipeStep(1);
                      setWipeConfirmText('');
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    disabled={wipeConfirmText.trim() !== 'DELETE' || wiping}
                    onClick={handleConfirmWipe}
                    className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-xl transition flex items-center gap-2"
                  >
                    {wiping ? (
                      <>
                        <i className="fa-solid fa-circle-notch fa-spin"></i> Wiping Database...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-trash-can"></i> Permanently Wipe All Locations
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
