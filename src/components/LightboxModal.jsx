import React from 'react';
import { useSite } from '../context/SiteContext';

export default function LightboxModal() {
  const { lightbox, closeLightbox } = useSite();

  if (!lightbox.isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9997] lightbox-bg flex items-center justify-center p-4 transition-all"
      onClick={closeLightbox}
    >
      <button
        type="button"
        className="absolute top-5 right-6 text-white text-3xl hover:text-red-400 font-bold z-10 transition-colors"
        onClick={closeLightbox}
      >
        ×
      </button>

      <div
        className="max-w-4xl w-full"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={lightbox.src}
          alt={lightbox.title || 'Preview'}
          className="w-full max-h-[75vh] object-cover rounded-2xl shadow-2xl"
          onError={(e) => {
            e.target.src = 'https://picsum.photos/seed/laxpreview/1000/600';
          }}
        />
        <div className="mt-3 flex items-center justify-between glass-dark rounded-2xl p-4">
          <div>
            <div className="text-white font-bold text-base">{lightbox.title}</div>
            <div className="text-slate-300 text-sm font-medium">{lightbox.sub}</div>
          </div>
          <button
            onClick={closeLightbox}
            className="grad-btn text-white text-sm font-bold px-5 py-2.5 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
