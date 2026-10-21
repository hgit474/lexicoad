import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getMedia, getServices, saveMedia, deleteMedia, uploadImage } from '../../services/dataService';
import { useSite } from '../../context/SiteContext';

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

  const { showToast, openLightbox } = useSite();

  const loadMedia = async () => {
    const [list, serviceList] = await Promise.all([getMedia(), getServices()]);
    setMediaList(list);
    setServices(serviceList);
  };

  useEffect(() => {
    loadMedia();
  }, []);

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
    <div className="bg-[#0c1747] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* Upload Zone */}
      <form
        ref={formRef}
        onSubmit={handleAddMedia}
        className="rounded-2xl border-2 border-dashed border-white/15 p-6 grid md:grid-cols-4 gap-3 items-end bg-white/[.03]"
      >
        <div>
          <label className="lbl !text-slate-400">Upload image file</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setFile(e.target.files[0])}
            className="text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
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
            <i className="fa-solid fa-cloud-arrow-up"></i> Upload to Library
          </button>
        </div>
      </form>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {mediaList.map(m => (
          <div
            key={m.id}
            className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 group relative flex flex-col justify-between"
          >
            <div
              className="h-40 cursor-pointer overflow-hidden relative"
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
            </div>

            <div className="p-3">
              <div className="text-white text-xs font-bold truncate">{m.title}</div>
              <div className="text-slate-400 text-[11px] font-semibold">{m.tag}</div>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(m.id)}
              className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-600 flex items-center justify-center shadow"
              title="Delete Media"
            >
              <i className="fa-solid fa-trash text-xs"></i>
            </button>
          </div>
        ))}

        {mediaList.length === 0 && (
          <div className="col-span-4 text-center py-12 text-slate-400 font-bold">
            Library is empty. Upload your first artwork above.
          </div>
        )}
      </div>
    </div>
  );
}
