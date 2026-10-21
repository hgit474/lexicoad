import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getInquiries,
  getServices,
  getLocations,
  saveInquiry,
  updateInquiryStage,
  updateInquiryFollowup,
  deleteInquiry,
  convertInquiryToCampaign
} from '../../services/dataService';
import { useSite } from '../../context/SiteContext';

export default function AdminInquiries() {
  const location = useLocation();
  const [inquiries, setInquiries] = useState([]);
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);

  const [stageFilter, setStageFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    service_id: '',
    location_id: '',
    budget: '₹50,000 - ₹1,00,000',
    duration: '1 Month',
    message: ''
  });

  const { showToast } = useSite();
  const navigate = useNavigate();

  const stages = ['New', 'Contacted', 'Quoted', 'Converted', 'Closed'];

  const stageColors = {
    New: 'bg-amber-400 text-black',
    Contacted: 'bg-blue-600 text-white',
    Quoted: 'bg-violet-600 text-white',
    Converted: 'bg-green-500 text-white',
    Closed: 'bg-slate-500 text-white'
  };

  const loadData = async () => {
    const [inqs, svcs, locs] = await Promise.all([
      getInquiries(),
      getServices(),
      getLocations()
    ]);
    setInquiries(inqs);
    setServices(svcs);
    setLocations(locs);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setAddForm({
      name: '',
      phone: '',
      email: '',
      company: '',
      service_id: services[0]?.id || '',
      location_id: locations[0]?.id || '',
      budget: '₹50,000 - ₹1,00,000',
      duration: '1 Month',
      message: ''
    });
    setAddModalOpen(true);
  };

  useEffect(() => {
    const handleOpen = (e) => {
      if (!e.detail || e.detail.action === 'inquiries') {
        openAddModal();
      }
    };
    window.addEventListener('admin-open-modal', handleOpen);
    if (location.state?.openAdd) {
      openAddModal();
    }
    return () => window.removeEventListener('admin-open-modal', handleOpen);
  }, [location.state, services, locations]);

  const handleCreateInquiry = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.phone.trim()) {
      showToast('Name and phone are required', 'error');
      return;
    }

    const newLead = {
      id: `inq_${Math.random().toString(36).slice(2, 9)}`,
      name: addForm.name.trim(),
      phone: addForm.phone.trim(),
      email: addForm.email.trim() || 'contact@client.com',
      company: addForm.company.trim() || 'Direct Client',
      service_id: addForm.service_id || (services[0] ? services[0].id : null),
      location_id: addForm.location_id || (locations[0] ? locations[0].id : null),
      budget: addForm.budget || '₹50,000 - ₹1,00,000',
      duration: addForm.duration || '1 Month',
      stage: 'New',
      followup: '—',
      message: addForm.message.trim() || 'Manual lead entry via admin panel.',
      date: new Date().toISOString().split('T')[0]
    };

    try {
      await saveInquiry(newLead);
      showToast('New lead created successfully', 'success');
      setAddModalOpen(false);
      await loadData();
    } catch {
      showToast('Error saving lead', 'error');
    }
  };

  const filtered = inquiries.filter(i => {
    if (stageFilter !== 'All' && i.stage !== stageFilter) return false;
    return true;
  });

  const handleStageChange = async (id, newStage) => {
    await updateInquiryStage(id, newStage);
    showToast(`Lead stage → ${newStage}`, 'info');
    await loadData();
  };

  const handleFollowupChange = async (id, newDate) => {
    await updateInquiryFollowup(id, newDate || '—');
    showToast('Follow-up scheduled', 'success');
    await loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry?')) return;
    await deleteInquiry(id);
    showToast('Inquiry deleted', 'warn');
    await loadData();
  };

  const handleConvert = async (id) => {
    try {
      const camp = await convertInquiryToCampaign(id);
      if (camp) {
        showToast('Lead converted to campaign!', 'success');
        setLeadModalOpen(false);
        navigate('/admin/campaigns');
      }
    } catch {
      showToast('Error converting lead', 'error');
    }
  };

  const openLeadModal = (lead) => {
    setSelectedLead(lead);
    setLeadModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Stage Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {['All', ...stages].map(s => {
          const count = s === 'All' ? inquiries.length : inquiries.filter(i => i.stage === s).length;
          const isActive = stageFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className="filter-btn !bg-[#0c1747] !text-slate-300 !border-white/10"
              style={
                isActive
                  ? {
                      background: 'linear-gradient(90deg,#0B3DFF,#E11D2E)',
                      color: '#fff',
                      borderColor: 'transparent'
                    }
                  : {}
              }
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Inquiries Table */}
      <div className="bg-[#0c1747] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="overflow-x-auto rounded-2xl overflow-hidden">
          <table className="lax min-w-[900px]">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Service / Location</th>
                <th>Budget</th>
                <th>Stage</th>
                <th>Follow-up</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => {
                const s = services.find(x => x.id === q.service_id);
                const l = locations.find(x => x.id === q.location_id);
                return (
                  <tr key={q.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl grad-bg flex items-center justify-center text-white font-extrabold shadow">
                          {(q.name || '?')[0]}
                        </div>
                        <div>
                          <div className="font-extrabold text-laxBlue-950">{q.name}</div>
                          <div className="text-xs text-slate-400 font-semibold">
                            {q.phone} • {q.company}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="text-xs font-bold text-laxBlue-950">
                      {s?.name || '—'}
                      <br />
                      <span className="text-slate-400 font-normal">
                        {l?.name || '—'} • {q.duration}
                      </span>
                    </td>

                    <td className="font-bold text-xs text-laxBlue-950">{q.budget}</td>

                    <td>
                      <select
                        value={q.stage}
                        onChange={e => handleStageChange(q.id, e.target.value)}
                        className={`badge ${stageColors[q.stage] || 'bg-slate-500 text-white'} border-0 cursor-pointer outline-none font-bold`}
                      >
                        {stages.map(st => (
                          <option key={st} value={st} className="text-black bg-white">
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <input
                        type="date"
                        value={q.followup && q.followup !== '—' ? q.followup : ''}
                        onChange={e => handleFollowupChange(q.id, e.target.value)}
                        className="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1.5 outline-none text-laxBlue-950 bg-white"
                      />
                    </td>

                    <td className="text-right whitespace-nowrap">
                      <button
                        onClick={() => openLeadModal(q)}
                        className="w-9 h-9 rounded-lg bg-blue-50 text-laxBlue-700 hover:bg-laxBlue-700 hover:text-white transition mr-1.5"
                        title="View Details"
                      >
                        <i className="fa-solid fa-eye text-xs"></i>
                      </button>

                      <button
                        onClick={() => handleConvert(q.id)}
                        className="w-9 h-9 rounded-lg bg-green-50 text-green-700 hover:bg-green-600 hover:text-white transition mr-1.5"
                        title="Convert to Campaign"
                      >
                        <i className="fa-solid fa-arrow-right-arrow-left text-xs"></i>
                      </button>

                      <button
                        onClick={() => handleDelete(q.id)}
                        className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition"
                        title="Delete Lead"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-slate-400 font-bold py-8">
                    No leads in this stage.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kanban Pipeline Board */}
      <div className="mt-4">
        <h3 className="text-white font-grotesk font-bold text-lg mb-3">Pipeline Board</h3>
        <div className="grid md:grid-cols-5 gap-3">
          {stages.map(st => {
            const items = inquiries.filter(i => i.stage === st);
            return (
              <div key={st} className="lead-col p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className={`badge ${stageColors[st]}`}>{st}</span>
                  <span className="text-xs font-extrabold text-slate-400">{items.length}</span>
                </div>

                <div className="space-y-2">
                  {items.slice(0, 4).map(q => {
                    const s = services.find(x => x.id === q.service_id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => openLeadModal(q)}
                        className="bg-white rounded-xl p-3 shadow-sm cursor-pointer hover:shadow-md transition"
                      >
                        <div className="font-extrabold text-xs text-laxBlue-950 truncate">
                          {q.name}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 truncate">
                          {s?.name || 'Outdoor Media'}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400 mt-1">
                          {q.budget}
                        </div>
                      </div>
                    );
                  })}

                  {items.length === 0 && (
                    <div className="text-[11px] font-bold text-slate-500 text-center py-6">
                      — empty —
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead Detail Modal */}
      {leadModalOpen && selectedLead && (
        <div
          className="fixed inset-0 z-[9996] modal-bg flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setLeadModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-laxBlue-950 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-grotesk font-bold text-2xl text-laxBlue-950">Lead Details</h2>
              <button
                type="button"
                onClick={() => setLeadModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="mt-4">
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                <div className="font-grotesk font-bold text-lg">{selectedLead.name}</div>
                <div className="text-sm font-semibold text-slate-500">
                  {selectedLead.company} • {selectedLead.email} • {selectedLead.phone}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="lbl">Service</div>
                  <div className="font-bold">
                    {services.find(x => x.id === selectedLead.service_id)?.name || '—'}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="lbl">Location</div>
                  <div className="font-bold">
                    {locations.find(x => x.id === selectedLead.location_id)?.name || '—'}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="lbl">Duration / Budget</div>
                  <div className="font-bold">
                    {selectedLead.duration} • {selectedLead.budget}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="lbl">Date</div>
                  <div className="font-bold">{selectedLead.date}</div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 mt-3 text-sm font-medium text-slate-600 italic">
                "{selectedLead.message || '—'}"
              </div>

              <div className="flex gap-2 mt-4">
                <select
                  value={selectedLead.stage}
                  onChange={e => handleStageChange(selectedLead.id, e.target.value)}
                  className="field flex-1"
                >
                  {stages.map(o => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setLeadModalOpen(false)}
                  className="grad-btn text-white font-bold px-5 rounded-xl text-sm"
                >
                  Close
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleConvert(selectedLead.id)}
                className="w-full mt-3 bg-laxBlue-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-laxBlue-700 transition"
              >
                Convert to Campaign →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Inquiry / Lead Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full text-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl grad-btn flex items-center justify-center text-white text-lg">
                <i className="fa-solid fa-inbox"></i>
              </div>
              <div>
                <h3 className="font-grotesk font-bold text-xl text-laxBlue-950">Add New Lead</h3>
                <p className="text-xs text-slate-500 font-semibold">Enter customer or inquiry details</p>
              </div>
            </div>

            <form onSubmit={handleCreateInquiry} className="space-y-3.5 text-xs font-bold">
              <div>
                <label className="lbl block mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Verma"
                  value={addForm.name}
                  onChange={e => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                  className="field w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="lbl block mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={addForm.phone}
                    onChange={e => setAddForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="field w-full"
                  />
                </div>
                <div>
                  <label className="lbl block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="client@brand.com"
                    value={addForm.email}
                    onChange={e => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                    className="field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="lbl block mb-1">Company / Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Tata Motors / Zomato"
                  value={addForm.company}
                  onChange={e => setAddForm(prev => ({ ...prev, company: e.target.value }))}
                  className="field w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="lbl block mb-1">Service</label>
                  <select
                    value={addForm.service_id}
                    onChange={e => setAddForm(prev => ({ ...prev, service_id: e.target.value }))}
                    className="field w-full"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lbl block mb-1">Target Location</label>
                  <select
                    value={addForm.location_id}
                    onChange={e => setAddForm(prev => ({ ...prev, location_id: e.target.value }))}
                    className="field w-full"
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="lbl block mb-1">Budget Range</label>
                  <input
                    type="text"
                    placeholder="₹50K - ₹2L"
                    value={addForm.budget}
                    onChange={e => setAddForm(prev => ({ ...prev, budget: e.target.value }))}
                    className="field w-full"
                  />
                </div>
                <div>
                  <label className="lbl block mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="1 Month"
                    value={addForm.duration}
                    onChange={e => setAddForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="lbl block mb-1">Notes / Message</label>
                <textarea
                  rows="2"
                  placeholder="Client requirements, specific unipolar hoardings requested..."
                  value={addForm.message}
                  onChange={e => setAddForm(prev => ({ ...prev, message: e.target.value }))}
                  className="field w-full"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 grad-btn text-white py-2.5 rounded-xl font-extrabold shadow"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
