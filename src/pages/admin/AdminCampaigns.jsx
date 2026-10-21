import React, { useState, useEffect } from 'react';
import {
  getCampaigns,
  getServices,
  getLocations,
  saveCampaign,
  deleteCampaign,
  cycleCampaignStatus,
  uploadImage
} from '../../services/dataService';
import { useSite } from '../../context/SiteContext';

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);

  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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
                <tr key={c.id}>
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
                <td colSpan="7" className="text-center text-slate-400 font-bold py-8">
                  No campaigns found.
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
    </div>
  );
}
