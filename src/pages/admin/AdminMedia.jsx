import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getMedia, getServices, saveMedia, deleteMedia, uploadImage } from '../../services/dataService';
import { useSite } from '../../context/SiteContext';
import AdminPagination from '../../components/admin/AdminPagination';

export default function AdminMedia() {
  const location = useLocation();
  const formRef = useRef(null);
  const [mediaList, setMediaList] = useState([]);
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('Showcase');
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const { showToast, openLightbox } = useSite();

  const loadMedia = async () => {
    const [list, serviceList] = await Promise.all([getMedia(), getServices()]);
    setMediaList(list || []);
    setServices(serviceList || []);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleCopyUrl = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    showToast('Image URL copied to clipboard!', 'success');
  };

  const filteredMedia = mediaList.filter(m => {
    if (tagFilter !== 'All' && (m.tag || '').toLowerCase() !== tagFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${m.title || ''} ${m.url || ''} ${m.tag || ''}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [tagFilter, searchQuery, itemsPerPage]);

  useEffect(() => {
    const handleOpen = (e) => {
      if (!e.detail || e.detail.action === 'media') {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('admin-open-modal', handleOpen);
    if (location.state?.openAdd) {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    return () => window.removeEventListener('admin-open-modal', handleOpen);
  }, [location.state]);

  const handleAddMedia = async (e) => {
    e.preventDefault();

    let finalUrl = imageUrl.trim();

    if (file) {
      try {
        finalUrl = await uploadImage(file, 'media');
      } catch (err) {
        showToast(err.message, 'error');
        return;
      }
    }

    if (!finalUrl) {
      showToast('Choose a file or paste an image URL', 'error');
      return;
    }

    await commitMedia(finalUrl);
  };

  const commitMedia = async (url) => {
    try {
      const newItem = {
        id: `m_${Math.random().toString(36).slice(2, 9)}`,
        title: title.trim() || 'Untitled Creative',
        tag: tag || 'Showcase',
        service_id: serviceId || null,
        url
      };

      await saveMedia(newItem);
      showToast('Added to media library', 'success');
      setFile(null);
      setImageUrl('');
      setTitle('');
      setServiceId('');
      await loadMedia();
    } catch {
      showToast('Error uploading media', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this media item?')) return;
    try {
      await deleteMedia(id);
      showToast('Media removed', 'warn');
      await loadMedia();
    } catch {
      showToast('Error removing media', 'error');
    }
  };

  return (
    <div className="bg-[#0c1747] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl w-full max-w-full overflow-hidden">
      {/* Upload Zone */}
      <form
        ref={formRef}
        onSubmit={handleAddMedia}
        className="rounded-2xl border-2 border-dashed border-white/15 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-end bg-white/[.03] w-full max-w-full"
      >
        <div>
          <label className="lbl !text-slate-400">Upload image file</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setFile(e.target.files[0])}
            className="text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 w-full"
          />
        </div>

        <div>
          <label className="lbl !text-slate-400">Usage / tag</label>
          <select value={tag} onChange={e => setTag(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none">
            <option>Showcase</option>
            <option>Hero Carousel</option>
            <option>Portfolio</option>
            <option>Campaign</option>
          </select>
        </div>

        <div>
          <label className="lbl !text-slate-400">Or paste image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-laxBlue-600"
          />
        </div>

        <div>
          <label className="lbl !text-slate-400">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Metro campaign"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-laxBlue-600"
          />
        </div>

        <div>
          <label className="lbl !text-slate-400">Attach to service</label>
          <select value={serviceId} onChange={e => setServiceId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none">
            <option value="">All / general gallery</option>
            {services.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="grad-btn w-full text-white text-sm font-extrabold px-5 py-3 rounded-xl shadow flex items-center justify-center gap-1.5"
          >
            <i className="fa-solid fa-cloud-arrow-up"></i> Upload
          </button>
        </div>
      </form>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Showcase', 'Hero Carousel', 'Portfolio', 'Campaign'].map(t => {
            const count = t === 'All' ? mediaList.length : mediaList.filter(m => (m.tag || '').toLowerCase() === t.toLowerCase()).length;
            const isActive = tagFilter.toLowerCase() === t.toLowerCase();
            return (
              <button
                key={t}
                onClick={() => setTagFilter(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                <span>{t}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative max-w-xs w-full">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search media..."
            className="w-full bg-[#040A29] border border-white/15 focus:border-laxBlue-400 rounded-xl py-1.5 pl-8 pr-7 text-xs text-white placeholder-slate-400 outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 w-full max-w-full">
        {(itemsPerPage === 'all'
          ? filteredMedia
          : filteredMedia.slice((currentPage - 1) * Number(itemsPerPage), (currentPage - 1) * Number(itemsPerPage) + Number(itemsPerPage))
        ).map(m => (
          <div
            key={m.id}
            className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 group relative flex flex-col justify-between hover:border-white/20 transition shadow-lg"
          >
            <div
              className="h-44 cursor-pointer overflow-hidden relative bg-black/40"
              onClick={() => openLightbox(m.url, m.title, m.tag)}
            >
              <img
                src={m.url}
                alt={m.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = `https://picsum.photos/seed/${m.id}/500/400`;
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-sm flex items-center gap-1.5">
                  <i className="fa-solid fa-magnifying-glass-plus"></i> Preview
                </span>
              </div>
            </div>

            <div className="p-3">
              <div className="text-white text-xs font-bold truncate" title={m.title}>{m.title}</div>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-blue-300 font-semibold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{m.tag}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyUrl(m.url);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1 transition"
                  title="Copy direct image URL to clipboard"
                >
                  <i className="fa-regular fa-copy text-[11px]"></i> Copy URL
                </button>
              </div>
            </div>

            <div className="absolute top-2 right-2 flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition">
              <a
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-lg bg-black/70 text-white hover:bg-blue-600 flex items-center justify-center shadow transition text-xs"
                title="Open image in new tab"
                onClick={e => e.stopPropagation()}
              >
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(m.id);
                }}
                className="w-7 h-7 rounded-lg bg-black/70 text-white hover:bg-red-600 flex items-center justify-center shadow transition text-xs"
                title="Delete Media"
              >
                <i className="fa-solid fa-trash text-[10px]"></i>
              </button>
            </div>
          </div>
        ))}

        {filteredMedia.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 font-bold">
            {searchQuery || tagFilter !== 'All' ? 'No media found matching criteria.' : 'Library is empty. Upload your first artwork above.'}
          </div>
        )}
      </div>

      {/* Pagination & Next Page Controls */}
      <AdminPagination
        totalItems={filteredMedia.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        itemLabel="media artworks"
        perPageOptions={[4, 8, 12, 24, 'all']}
      />
    </div>
  );
}
