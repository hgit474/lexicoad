import React, { useState, useEffect } from 'react';
import { useSite } from '../../context/SiteContext';
import { MEDIA_GENRES, DEFAULT_GENRE_BADGES } from '../BrowseByGenre';

export default function GenreBadgesModal({ isOpen, onClose }) {
  const { settings, updateSettings, showToast } = useSite();
  const [badges, setBadges] = useState(DEFAULT_GENRE_BADGES);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (settings?.genre_badges) {
        try {
          const parsed = typeof settings.genre_badges === 'string'
            ? JSON.parse(settings.genre_badges)
            : settings.genre_badges;
          setBadges({ ...DEFAULT_GENRE_BADGES, ...parsed });
        } catch {
          setBadges(DEFAULT_GENRE_BADGES);
        }
      } else {
        setBadges(DEFAULT_GENRE_BADGES);
      }
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleToggle = (genreId) => {
    setBadges(prev => ({
      ...prev,
      [genreId]: {
        ...prev[genreId],
        active: !prev[genreId]?.active
      }
    }));
  };

  const handleTextChange = (genreId, text) => {
    setBadges(prev => ({
      ...prev,
      [genreId]: {
        ...prev[genreId],
        text: text.toUpperCase()
      }
    }));
  };

  const handleColorChange = (genreId, color) => {
    setBadges(prev => ({
      ...prev,
      [genreId]: {
        ...prev[genreId],
        color
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        ...settings,
        genre_badges: JSON.stringify(badges)
      });
      showToast('Genre badges updated successfully!', 'success');
      onClose();
    } catch {
      showToast('Failed to save genre badges', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all genre badges to system defaults?')) {
      setBadges(DEFAULT_GENRE_BADGES);
    }
  };

  const getPillClasses = (color = 'red') => {
    switch (color) {
      case 'amber':
      case 'orange':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'purple':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'emerald':
      case 'green':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'blue':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'red':
      default:
        return 'bg-red-500/20 text-red-300 border-red-500/40';
    }
  };

  const presetLabels = ['HOT', 'TRENDING', 'POPULAR', 'NEW', 'PRIME', 'HIGH DEMAND'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0c1747] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-laxRed-500/20 text-laxRed-400 flex items-center justify-center text-lg border border-laxRed-500/30">
              <i className="fa-solid fa-tags"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Media Genre Badges & Highlights
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                  Live on Homepage & Services
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Toggle and customize the "HOT", "TRENDING", or "POPULAR" tags displayed on each media category.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MEDIA_GENRES.map(genre => {
              const current = badges[genre.id] || { active: false, text: 'HOT', color: 'red' };

              return (
                <div
                  key={genre.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    current.active
                      ? 'bg-white/[0.04] border-white/20'
                      : 'bg-white/[0.01] border-white/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 text-slate-300 flex items-center justify-center text-sm">
                        <i className={genre.icon}></i>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          {genre.name}
                          {current.active && (
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getPillClasses(current.color)}`}>
                              {current.text || 'HOT'}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{genre.tagline}</div>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggle(genre.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        current.active ? 'bg-laxRed-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          current.active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {current.active && (
                    <div className="pt-3 border-t border-white/5 space-y-2.5">
                      {/* Text input and color pick */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={current.text}
                          onChange={(e) => handleTextChange(genre.id, e.target.value)}
                          placeholder="e.g. HOT, TRENDING"
                          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white uppercase font-bold tracking-wider outline-none focus:border-laxRed-500"
                          maxLength={15}
                        />

                        {/* Color Selector */}
                        <div className="flex items-center gap-1 bg-black/30 p-1 rounded-lg border border-white/10">
                          {[
                            { id: 'red', bg: 'bg-red-500', name: 'Red' },
                            { id: 'amber', bg: 'bg-amber-500', name: 'Orange' },
                            { id: 'purple', bg: 'bg-purple-500', name: 'Purple' },
                            { id: 'emerald', bg: 'bg-emerald-500', name: 'Green' },
                            { id: 'blue', bg: 'bg-blue-500', name: 'Blue' }
                          ].map(c => (
                            <button
                              key={c.id}
                              type="button"
                              title={c.name}
                              onClick={() => handleColorChange(genre.id, c.id)}
                              className={`w-5 h-5 rounded-full ${c.bg} transition ${
                                current.color === c.id
                                  ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0c1747] scale-110'
                                  : 'opacity-50 hover:opacity-100'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap gap-1">
                        {presetLabels.map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handleTextChange(genre.id, p)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border transition ${
                              current.text === p
                                ? 'bg-white/20 text-white border-white/40'
                                : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-slate-400 hover:text-white font-semibold underline underline-offset-4 transition"
          >
            Reset to Defaults
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="grad-btn text-white text-xs font-bold px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>}
              <span>Save Badges</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
