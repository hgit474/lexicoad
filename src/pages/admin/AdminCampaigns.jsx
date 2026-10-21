import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getCampaigns,
  getServices,
  getLocations,
  saveCampaign,
  deleteCampaign,
  deleteCampaignsBulk,
  clearAllCampaigns,
  rollbackToExampleCampaigns,
  cycleCampaignStatus,
  uploadImage
} from '../../services/dataService';
import { useSite } from '../../context/SiteContext';

export default function AdminCampaigns() {
  const location = useLocation();
  const [campaigns, setCampaigns] = useState([]);
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);

  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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
    title: '',
    client: '',
    service_id: '',
    location_id: '',
    start_date: '',
    end_date: '',
    budget: 250000,
    status: 'Scheduled',
    artwork: '',
    notes: ''
  });

  const { showToast, openLightbox } = useSite();

  const loadData = async () => {
    const [camps, svcs, locs] = await Promise.all([
      getCampaigns(),
      getServices(),
      getLocations()
    ]);
    setCampaigns(camps);
    setServices(svcs);
    setLocations(locs);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleOpen = (e) => {
      if (!e.detail || e.detail.action === 'campaigns') {
        openAddModal();
      }
    };
    window.addEventListener('admin-open-modal', handleOpen);
    if (location.state?.openAdd) {
      openAddModal();
    }
    return () => window.removeEventListener('admin-open-modal', handleOpen);
  }, [location.state]);

  const filtered = campaigns.filter(c => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.title.toLowerCase().includes(q) && !c.client.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const fmtK = (n) => {
    n = Number(n || 0);
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return '₹' + (n / 1000).toFixed(0) + 'K';
    return '₹' + n.toLocaleString('en-IN');
  };

  const statusColors = {
    Live: 'bg-green-500 text-white',
    Scheduled: 'bg-amber-400 text-black',
    Paused: 'bg-slate-500 text-white',
    Completed: 'bg-blue-600 text-white'
  };

  const openAddModal = () => {
    setEditingId(null);
    const now = new Date();
    const future = new Date(Date.now() + 30 * 864e5);
    setForm({
      title: '',
      client: '',
      service_id: services[0]?.id || '',
      location_id: locations[0]?.id || '',
      start_date: now.toISOString().slice(0, 10),
      end_date: future.toISOString().slice(0, 10),
      budget: 250000,
      status: 'Scheduled',
      artwork: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?q=80&w=800',
      notes: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingId(c.id);
    setForm({
      title: c.title,
      client: c.client,
      service_id: c.service_id,
      location_id: c.location_id,
      start_date: c.start_date,
      end_date: c.end_date,
      budget: c.budget,
      status: c.status,
      artwork: c.artwork,
      notes: c.notes || ''
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, 'campaigns');
      setForm(prev => ({ ...prev, artwork: url }));
      showToast('Campaign artwork uploaded', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.client.trim()) {
      showToast('Title and client name are required', 'error');
      return;
    }

    const campaignObj = {
      id: editingId || `cp_${Math.random().toString(36).slice(2, 9)}`,
      title: form.title.trim(),
      client: form.client.trim(),
      service_id: form.service_id || null,
      location_id: form.location_id || null,
      start_date: form.start_date,
      end_date: form.end_date,
      budget: parseInt(form.budget) || 100000,
      status: form.status,
      artwork: form.artwork || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80',
      notes: form.notes
    };

    try {
      await saveCampaign(campaignObj);
      showToast('Campaign saved successfully', 'success');
      setModalOpen(false);
      await loadData();
    } catch (err) {
      showToast(err?.message || 'Error saving campaign', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete campaign?')) return;
    try {
      await deleteCampaign(id);
      showToast('Campaign deleted', 'warn');
      await loadData();
    } catch {
      showToast('Error deleting campaign', 'error');
    }
  };

  const handleCycleStatus = async (id) => {
    try {
      const updated = await cycleCampaignStatus(id);
      if (updated) {
        showToast(`Campaign status → ${updated.status}`, 'info');
        await loadData();
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
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
    if (!window.confirm(`Are you sure you want to permanently delete ${ids.length} selected campaign(s)?`)) {
      return;
    }
    setDeletingBulk(true);
    try {
      await deleteCampaignsBulk(ids);
      setSelectedIds(new Set());
      showToast(`Successfully deleted ${ids.length} campaign(s)`, 'success');
      await loadData();
    } catch (err) {
      console.error('Failed to delete campaigns:', err);
      showToast('Failed to delete selected campaigns', 'error');
    } finally {
      setDeletingBulk(false);
    }
  };

  const handleConfirmWipe = async () => {
    if (wipeConfirmText.trim() !== 'DELETE') return;
    setWiping(true);
    try {
      await clearAllCampaigns();
      setCampaigns([]);
      setSelectedIds(new Set());
      setWipeModalOpen(false);
      setWipeStep(1);
      setWipeConfirmText('');
      showToast('All campaigns and mock data permanently wiped from database!', 'success');
    } catch (err) {
      console.error('Failed to wipe campaigns:', err);
      showToast('Failed to wipe campaigns from database', 'error');
    } finally {
      setWiping(false);
    }
  };

  const handleRollback = async () => {
    if (!window.confirm('Restore official example campaigns? This will seed default live & scheduled campaigns.')) {
      return;
    }
    setRollingBack(true);
    try {
      const restored = await rollbackToExampleCampaigns();
      setCampaigns(restored);
      setSelectedIds(new Set());
      showToast(`Restored ${restored.length} default example campaigns!`, 'success');
    } catch (err) {
      console.error('Failed to rollback campaigns:', err);
      showToast('Failed to rollback campaigns', 'error');
    } finally {
      setRollingBack(false);
    }
  };

  return (
    <div className="bg-[#0c1747] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* Controls Bar */}
      <div className="flex flex-wrap gap-3 items-center mb-5">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none cursor-pointer"
        >
          <option value="All">All statuses</option>
          <option>Live</option>
          <option>Scheduled</option>
          <option>Paused</option>
          <option>Completed</option>
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search brand, client..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-laxBlue-600"
          />
        </div>

        {/* Delete Selected Button */}
        {selectedIds.size > 0 && (
          <button
            onClick={handleDeleteSelected}
            disabled={deletingBulk}
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-extrabold px-4 py-3 rounded-xl transition shadow-lg animate-pulse"
            title="Delete selected campaigns"
          >
            <i className={`fa-solid ${deletingBulk ? 'fa-circle-notch fa-spin' : 'fa-trash'}`}></i>
            <span>Delete Selected ({selectedIds.size})</span>
          </button>
        )}

        {/* Rollback to Examples */}
        <button
          onClick={handleRollback}
          disabled={rollingBack}
          className="inline-flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-bold px-4 py-3 rounded-xl transition shadow"
          title="Restore default example campaigns"
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
          className="inline-flex items-center gap-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs sm:text-sm font-bold px-4 py-3 rounded-xl transition shadow"
          title="Wipe all campaigns with double confirmation warning"
        >
          <i className="fa-solid fa-trash-can"></i>
          <span>Wipe All</span>
        </button>

        <button
          onClick={openAddModal}
          className="grad-btn text-white text-sm font-extrabold px-5 py-3 rounded-xl flex items-center gap-1.5 shadow"
        >
          <i className="fa-solid fa-plus"></i> New Campaign
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="overflow-x-auto rounded-2xl overflow-hidden">
        <table className="lax min-w-[980px]">
          <thead>
            <tr>
              <th className="w-10 text-center">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedIds.size === filtered.length}
                  onChange={handleToggleSelectAll}
                  className="cursor-pointer rounded accent-laxRed-500 w-4 h-4"
                  title="Select / Deselect all visible"
                />
              </th>
              <th>Campaign / Artwork</th>
              <th>Client</th>
              <th>Service → Location</th>
              <th>Period</th>
              <th>Budget</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const s = services.find(x => x.id === c.service_id);
              const l = locations.find(x => x.id === c.location_id);
              return (
                <tr key={c.id} className={selectedIds.has(c.id) ? 'bg-red-500/[0.08]' : ''}>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(c.id)}
                      onChange={() => handleToggleSelectOne(c.id)}
                      className="cursor-pointer rounded accent-laxRed-500 w-4 h-4"
                    />
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <img
                        src={c.artwork}
                        alt={c.title}
                        className="w-14 h-11 rounded-lg object-cover cursor-pointer shadow hover:opacity-80 transition"
                        onClick={() => openLightbox(c.artwork, c.title, `Client: ${c.client}`)}
                        onError={(e) => {
                          e.target.src = `https://picsum.photos/seed/${c.id}/200/200`;
                        }}
                      />
                      <div>
                        <div className="font-extrabold text-laxBlue-950">{c.title}</div>
                        <div className="text-xs text-slate-400 font-semibold">
                          {c.start_date} → {c.end_date}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="font-bold text-laxBlue-950">{c.client}</td>

                  <td className="text-xs font-bold text-laxBlue-950">
                    {s?.name || '—'}
                    <br />
                    <span className="text-slate-400 font-normal">→ {l?.name || '—'}</span>
                  </td>

                  <td className="text-xs font-bold whitespace-nowrap text-laxBlue-950">
                    {c.start_date}
                    <br />
                    <span className="text-slate-400">{c.end_date}</span>
                  </td>

                  <td className="font-grotesk font-bold text-laxBlue-950">
                    {fmtK(c.budget)}
                  </td>

                  <td>
                    <span
                      className={`badge ${statusColors[c.status] || 'bg-slate-500 text-white'}`}
                    >
                      {c.status}
                    </span>
                  </td>

                  <td className="text-right whitespace-nowrap">
                    <button
                      onClick={() => handleCycleStatus(c.id)}
                      title="Advance status"
                      className="w-9 h-9 rounded-lg bg-blue-50 text-laxBlue-700 hover:bg-laxBlue-700 hover:text-white transition mr-1.5"
                    >
                      <i className="fa-solid fa-rotate text-xs"></i>
                    </button>

                    <button
                      onClick={() => openEditModal(c)}
                      className="w-9 h-9 rounded-lg bg-blue-50 text-laxBlue-700 hover:bg-laxBlue-700 hover:text-white transition mr-1.5"
                      title="Edit Campaign"
                    >
                      <i className="fa-solid fa-pen text-xs"></i>
                    </button>

                    <button
                      onClick={() => handleDelete(c.id)}
                      className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition"
                      title="Delete Campaign"
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-slate-400 font-bold py-12">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto text-xl mb-2 text-slate-500">
                    <i className="fa-solid fa-bullhorn"></i>
                  </div>
                  No campaigns found.
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <button
                      onClick={handleRollback}
                      className="text-xs font-bold text-amber-300 bg-amber-500/15 px-3.5 py-2 rounded-xl border border-amber-500/30 hover:bg-amber-500/25 transition inline-flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-rotate-left"></i> Restore Default Campaigns
                    </button>
                    <button
                      onClick={openAddModal}
                      className="grad-btn text-white text-xs font-bold px-3.5 py-2 rounded-xl"
                    >
                      + New Campaign
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Campaign Modal */}
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
                {editingId ? 'Edit Campaign' : 'New Campaign'}
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
              <div>
                <label className="lbl">Campaign / brand title *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="field"
                  placeholder="Nike — Just Do It"
                />
              </div>

              <div>
                <label className="lbl">Client name *</label>
                <input
                  required
                  value={form.client}
                  onChange={e => setForm({ ...form, client: e.target.value })}
                  className="field"
                  placeholder="Nike India"
                />
              </div>

              <div>
                <label className="lbl">Service *</label>
                <select
                  value={form.service_id}
                  onChange={e => setForm({ ...form, service_id: e.target.value })}
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
                <label className="lbl">Location *</label>
                <select
                  value={form.location_id}
                  onChange={e => setForm({ ...form, location_id: e.target.value })}
                  className="field"
                >
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} — {l.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="lbl">Start date</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={e => setForm({ ...form, start_date: e.target.value })}
                  className="field"
                />
              </div>

              <div>
                <label className="lbl">End date</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={e => setForm({ ...form, end_date: e.target.value })}
                  className="field"
                />
              </div>

              <div>
                <label className="lbl">Budget (₹)</label>
                <input
                  type="number"
                  value={form.budget}
                  onChange={e => setForm({ ...form, budget: e.target.value })}
                  className="field"
                  placeholder="250000"
                />
              </div>

              <div>
                <label className="lbl">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="field"
                >
                  <option>Live</option>
                  <option>Scheduled</option>
                  <option>Paused</option>
                  <option>Completed</option>
                </select>
              </div>

              <div>
                <label className="lbl">Artwork URL</label>
                <input
                  value={form.artwork.startsWith('data:') ? '' : form.artwork}
                  onChange={e => setForm({ ...form, artwork: e.target.value })}
                  className="field"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="lbl">Or upload artwork file</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="field !py-2 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="lbl">Notes</label>
                <input
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="field"
                  placeholder="Print specs, night lighting, monitoring..."
                />
              </div>

              <div className="sm:col-span-2 mt-2">
                <button
                  type="submit"
                  className="grad-btn w-full text-white font-extrabold py-3.5 rounded-xl shadow-lg"
                >
                  Save Campaign
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
                    Clear All Campaigns & Data?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    This will permanently delete all campaign records from your Supabase / PostgreSQL database and local storage.
                  </p>
                </div>

                <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 text-left text-xs text-red-200/90 flex items-start gap-2.5">
                  <i className="fa-solid fa-circle-info text-red-400 mt-0.5 shrink-0"></i>
                  <span>
                    You can always use <strong>"Rollback Examples"</strong> to restore the official default campaigns anytime.
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
                        <i className="fa-solid fa-trash-can"></i> Permanently Wipe All Campaigns
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
