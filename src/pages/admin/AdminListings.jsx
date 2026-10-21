import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import {
  getListings,
  saveListing,
  deleteListing,
  uploadImage
} from '../../services/dataService';
import { downloadListingsTemplate } from '../../lib/excelTemplate';

export default function AdminListings() {
  const { showToast } = useSite();
  const location = useLocation();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Form State
  const defaultForm = {
    category: 'Transit',
    subcategory: 'Transport',
    title: '',
    location: 'Delhi NCR',
    price: 50000,
    media_type: 'Bus',
    reach: 500000,
    description: '',
    image_url: ''
  };
  const [form, setForm] = useState(defaultForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getListings();
      setListings(data);
    } catch (err) {
      console.error('Failed to load listings:', err);
      showToast('Failed to load listings from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Category & Subcategory options
  const categoryOptions = useMemo(() => {
    const cats = [...new Set(listings.map(l => l.category).filter(Boolean))].sort();
    return ['All', ...cats];
  }, [listings]);

  const subcategoryOptions = useMemo(() => {
    let relevantListings = listings;
    if (selectedCategory !== 'All') {
      relevantListings = relevantListings.filter(l => (l.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }
    const subs = [...new Set(relevantListings.map(l => l.subcategory).filter(Boolean))].sort();
    return ['All', ...subs];
  }, [listings, selectedCategory]);

  // When category changes, reset subcategory if it is not in the new category
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubcategory('All');
  };

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      if (selectedCategory !== 'All' && (item.category || '').toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (selectedSubcategory !== 'All' && (item.subcategory || '').toLowerCase() !== selectedSubcategory.toLowerCase()) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const text = `${item.title || ''} ${item.location || ''} ${item.media_type || ''} ${item.description || ''} ${item.category || ''} ${item.subcategory || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [listings, selectedCategory, selectedSubcategory, searchQuery]);

  const openAddModal = () => {
    setEditingItem(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      category: item.category || 'Transit',
      subcategory: item.subcategory || 'Transport',
      title: item.title || '',
      location: item.location || '',
      price: item.price || 0,
      media_type: item.media_type || 'Standard',
      reach: item.reach || '',
      description: item.description || '',
      image_url: item.image_url || ''
    });
    setModalOpen(true);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const url = await uploadImage(file, 'listings');
      setForm(prev => ({ ...prev, image_url: url }));
      showToast('Image uploaded successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.category.trim() || !form.subcategory.trim() || !form.title.trim()) {
      showToast('Category, Subcategory, and Title are required', 'warning');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      showToast('Price must be a valid positive number', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...(editingItem?.id ? { id: editingItem.id } : {}),
        category: form.category.trim(),
        subcategory: form.subcategory.trim(),
        title: form.title.trim(),
        location: form.location.trim() || 'Pan India',
        price: Number(form.price),
        media_type: form.media_type.trim() || 'Standard',
        reach: form.reach !== '' && form.reach !== null ? Number(form.reach) : null,
        description: form.description.trim() || null,
        image_url: form.image_url.trim() || null
      };

      await saveListing(payload);
      showToast(editingItem ? 'Listing updated!' : 'New listing created!', 'success');
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving listing:', err);
      showToast('Failed to save listing', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete listing "${item.title}"?`)) return;
    try {
      await deleteListing(item.id);
      showToast('Listing deleted successfully', 'success');
      setListings(prev => prev.filter(l => l.id !== item.id));
    } catch (err) {
      console.error('Failed to delete listing:', err);
      showToast('Failed to delete listing', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#071343]/80 backdrop-blur border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-laxBlue-500/15 border border-laxBlue-400/30 text-laxBlue-300 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <i className="fa-solid fa-layer-group"></i> SUPABASE / POSTGRES TABLE `listings`
          </div>
          <h2 className="text-xl sm:text-2xl font-grotesk font-bold text-white">
            Manage Service Listings
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Live database view of service listings grouped by category & subcategory. Edit or delete existing inventory, or bulk upload via Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => downloadListingsTemplate()}
            className="inline-flex items-center gap-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3.5 py-2.5 rounded-xl transition shadow"
            title="Download formatted .xlsx template"
          >
            <i className="fa-solid fa-file-excel"></i> Template
          </button>
          <Link
            to="/admin/upload-services"
            className="inline-flex items-center gap-2 bg-laxBlue-600/30 hover:bg-laxBlue-600/50 text-blue-200 border border-blue-500/30 text-xs font-bold px-3.5 py-2.5 rounded-xl transition"
          >
            <i className="fa-solid fa-cloud-arrow-up"></i> Upload Excel
          </Link>
          <button
            onClick={openAddModal}
            className="grad-btn text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition inline-flex items-center gap-1.5"
          >
            <i className="fa-solid fa-plus"></i> Add Listing
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#071343]/60 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, location, media type..."
            className="w-full bg-[#040A29]/70 border border-white/10 focus:border-laxBlue-400 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#040A29]/70 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 font-bold">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              {categoryOptions.map(cat => (
                <option key={cat} value={cat} className="bg-[#071343] text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#040A29]/70 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 font-bold">Subcategory:</span>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              {subcategoryOptions.map(sub => (
                <option key={sub} value={sub} className="bg-[#071343] text-white">
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {(selectedCategory !== 'All' || selectedSubcategory !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedSubcategory('All');
                setSearchQuery('');
              }}
              className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1"
            >
              <i className="fa-solid fa-xmark"></i> Clear
            </button>
          )}
        </div>
      </div>

      {/* Total Count Badge */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white">{filteredListings.length}</strong> listings
          {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
          {selectedSubcategory !== 'All' && ` / "${selectedSubcategory}"`}
        </span>
        <button
          onClick={loadData}
          className="hover:text-white transition flex items-center gap-1"
        >
          <i className="fa-solid fa-rotate-right text-[10px]"></i> Refresh
        </button>
      </div>

      {/* Listings Table */}
      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#071343]/60 shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-bold bg-[#040A29]/80 uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Listing / Title</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Subcategory</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Media Type</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4">Reach</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium">
            {loading ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-400">
                  <i className="fa-solid fa-circle-notch fa-spin text-xl mb-2 block text-laxBlue-400"></i>
                  Loading listings from Supabase...
                </td>
              </tr>
            ) : filteredListings.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto text-xl mb-2 text-slate-500">
                    <i className="fa-solid fa-filter-circle-xmark"></i>
                  </div>
                  No service listings found matching the filters.
                  <div className="mt-3">
                    <button
                      onClick={openAddModal}
                      className="grad-btn text-white text-xs font-bold px-4 py-2 rounded-xl"
                    >
                      + Add New Listing
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredListings.map(item => (
                <tr key={item.id} className="hover:bg-white/[0.03] transition">
                  {/* Title & Image */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3 min-w-[220px]">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://picsum.photos/seed/${item.id}/200/200`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                            <i className="fa-solid fa-image"></i>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-bold font-grotesk truncate max-w-[260px]">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[260px]">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                      {item.category}
                    </span>
                  </td>

                  {/* Subcategory */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                      {item.subcategory}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-location-dot text-laxRed-400 text-[10px]"></i>
                      <span>{item.location}</span>
                    </div>
                  </td>

                  {/* Media Type */}
                  <td className="py-3.5 px-4">
                    <span className="bg-white/10 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                      {item.media_type}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4">
                    <span className="text-emerald-400 font-grotesk font-bold text-sm">
                      ₹{Number(item.price).toLocaleString('en-IN')}
                    </span>
                  </td>

                  {/* Reach */}
                  <td className="py-3.5 px-4 text-slate-300">
                    {item.reach ? (
                      <span className="flex items-center gap-1 text-[11px]">
                        <i className="fa-solid fa-users text-slate-400 text-[10px]"></i>
                        {Number(item.reach).toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        to={`/category/${encodeURIComponent(item.category)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 flex items-center justify-center transition"
                        title="View Public Category Page"
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                      </Link>
                      <button
                        onClick={() => openEditModal(item)}
                        className="w-8 h-8 rounded-lg bg-blue-500/15 hover:bg-blue-500/30 text-blue-300 flex items-center justify-center transition"
                        title="Edit Listing"
                      >
                        <i className="fa-solid fa-pen text-[10px]"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="w-8 h-8 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-300 flex items-center justify-center transition"
                        title="Delete Listing"
                      >
                        <i className="fa-solid fa-trash text-[10px]"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Listing Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#071343] border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center text-xs"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl grad-btn flex items-center justify-center text-white text-base">
                <i className={editingItem ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-plus'}></i>
              </div>
              <div>
                <h3 className="text-lg font-grotesk font-bold text-white">
                  {editingItem ? 'Edit Service Listing' : 'Add New Service Listing'}
                </h3>
                <p className="text-xs text-slate-400">
                  Fill listing schema details to sync directly with Supabase
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Transit, Outdoor, Airport"
                    className="w-full bg-[#040A29] border border-white/15 focus:border-laxBlue-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                  />
                </div>

                {/* Subcategory */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Subcategory *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.subcategory}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                    placeholder="e.g. Transport, Metro Networks"
                    className="w-full bg-[#040A29] border border-white/15 focus:border-laxBlue-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Listing Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. City Express Low-Floor AC Bus Branding"
                  className="w-full bg-[#040A29] border border-white/15 focus:border-laxBlue-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Delhi NCR, Mumbai"
                    className="w-full bg-[#040A29] border border-white/15 focus:border-laxBlue-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="45000"
                    className="w-full bg-[#040A29] border border-white/15 focus:border-laxBlue-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                  />
                </div>

                {/* Media Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Media Type
                  </label>
                  <input
                    type="text"
                    value={form.media_type}
                    onChange={(e) => setForm({ ...form, media_type: e.target.value })}
                    placeholder="e.g. Bus, Metro, Train"
                    className="w-full bg-[#040A29] border border-white/15 focus:border-laxBlue-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Reach */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Estimated Reach (numeric, optional)
                </label>
                <input
                  type="number"
                  value={form.reach}
                  onChange={(e) => setForm({ ...form, reach: e.target.value })}
                  placeholder="e.g. 650000"
                  className="w-full bg-[#040A29] border border-white/15 focus:border-laxBlue-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                />
              </div>

              {/* Image URL & Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Listing Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-[#040A29] border border-white/15 focus:border-laxBlue-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                  />
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2.5 rounded-xl border border-white/15 flex items-center gap-1 shrink-0">
                    <i className="fa-solid fa-upload"></i>
                    <span>{uploadingImg ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {form.image_url && (
                  <div className="mt-2 h-20 w-36 rounded-xl overflow-hidden border border-white/10 bg-slate-900">
                    <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description of the media listing and exposure details..."
                  className="w-full bg-[#040A29] border border-white/15 focus:border-laxBlue-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                ></textarea>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="grad-btn text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow transition disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i> Saving...
                    </>
                  ) : editingItem ? (
                    'Save Changes'
                  ) : (
                    'Create Listing'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
