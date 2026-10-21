import React, { useState, useEffect } from 'react';
import { useSite } from '../../context/SiteContext';
import { DEFAULT_FILTER_CONFIG, getParsedFilterConfig } from '../../lib/filterConfig';

export default function FilterConfigModal({ isOpen, onClose }) {
  const { settings, updateSettings, showToast } = useSite();
  const [config, setConfig] = useState(DEFAULT_FILTER_CONFIG);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const parsed = getParsedFilterConfig(settings);
      setConfig(parsed);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleToggle = (key) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTitleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleBracketChange = (index, field, value) => {
    setConfig(prev => {
      const nextBrackets = [...prev.budget_brackets];
      nextBrackets[index] = {
        ...nextBrackets[index],
        [field]: field === 'label' || field === 'id' ? value : Number(value) || 0
      };
      return { ...prev, budget_brackets: nextBrackets };
    });
  };

  const handleAddBracket = () => {
    setConfig(prev => ({
      ...prev,
      budget_brackets: [
        ...prev.budget_brackets,
        {
          id: `bracket_${Date.now()}`,
          label: 'New Bracket',
          min: 10000,
          max: 50000
        }
      ]
    }));
  };

  const handleDeleteBracket = (index) => {
    setConfig(prev => ({
      ...prev,
      budget_brackets: prev.budget_brackets.filter((_, i) => i !== index)
    }));
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all filter settings and budget brackets to default (The Media Ant style)?')) {
      setConfig(DEFAULT_FILTER_CONFIG);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        ...settings,
        filter_config: JSON.stringify(config)
      });
      showToast('Marketplace filters updated successfully!', 'success');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to save filter settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-[#0b1338] border border-white/20 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-sm">
              <i className="fa-solid fa-sliders"></i>
            </div>
            <div>
              <h3 className="font-grotesk font-bold text-white text-base">
                Service Filters Configurator
              </h3>
              <p className="text-[11px] text-slate-400">
                Customize sidebar filters, sections, and budget brackets (The Media Ant style)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-200">
          {/* Section 1: Active Filter Modules */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-grotesk font-bold text-sm text-white uppercase tracking-wider">
                1. Visible Filter Sections
              </label>
              <span className="text-[11px] text-slate-400">Toggle sections on/off</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { key: 'show_location', titleKey: 'location_title', defaultTitle: 'LOCATION', desc: 'Cities & metros search list with counts' },
                { key: 'show_category', titleKey: 'category_title', defaultTitle: 'CATEGORY', desc: 'Media genres (Airport, Transit, Hoardings, etc.)' },
                { key: 'show_format', titleKey: 'format_title', defaultTitle: 'AD OPTIONS', desc: 'Format sub-types with live inventory search' },
                { key: 'show_budget', titleKey: 'budget_title', defaultTitle: 'BUDGET', desc: 'Radio price brackets with inventory counts' },
                { key: 'show_reach', titleKey: 'reach_title', defaultTitle: 'AUDIENCE & REACH', desc: 'Impression & passenger volume tiers' },
                { key: 'show_duration', titleKey: 'duration_title', defaultTitle: 'CAMPAIGN DURATION', desc: 'Booking cycle (15 days, 1M, 3M, Annual)' }
              ].map(sec => (
                <div
                  key={sec.key}
                  className={`p-3.5 rounded-2xl border transition ${
                    config[sec.key] !== false
                      ? 'bg-white/5 border-indigo-500/40 text-white'
                      : 'bg-black/20 border-white/5 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 cursor-pointer font-bold select-none text-white">
                      <input
                        type="checkbox"
                        checked={config[sec.key] !== false}
                        onChange={() => handleToggle(sec.key)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                      />
                      <span>Active</span>
                    </label>

                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-indigo-300">
                      {sec.key.replace('show_', '')}
                    </span>
                  </div>

                  <div className="mt-1">
                    <label className="text-[10px] text-slate-400 block mb-1">Section Label</label>
                    <input
                      type="text"
                      value={config[sec.titleKey] || sec.defaultTitle}
                      onChange={e => handleTitleChange(sec.titleKey, e.target.value)}
                      placeholder={sec.defaultTitle}
                      disabled={config[sec.key] === false}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{sec.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Display Limits & Multi-selection */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
            <label className="font-grotesk font-bold text-sm text-white uppercase tracking-wider block">
              2. Display & Behavior Controls
            </label>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Items Before "+ More" Button
                </label>
                <select
                  value={config.max_visible_items || 5}
                  onChange={e => setConfig(prev => ({ ...prev, max_visible_items: Number(e.target.value) }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer focus:border-indigo-500"
                >
                  <option value={3}>3 Items</option>
                  <option value={4}>4 Items</option>
                  <option value={5}>5 Items (Default)</option>
                  <option value={8}>8 Items</option>
                  <option value={12}>12 Items</option>
                </select>
                <span className="text-[10px] text-slate-400 block mt-1">Controls the accordion fold limit</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Location Selection
                </label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer text-white select-none">
                  <input
                    type="checkbox"
                    checked={config.allow_multi_location !== false}
                    onChange={() => handleToggle('allow_multi_location')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                  />
                  <span>Multi-city select</span>
                </label>
                <span className="text-[10px] text-slate-400 block mt-1">Allow checking multiple cities</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Category Selection
                </label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer text-white select-none">
                  <input
                    type="checkbox"
                    checked={config.allow_multi_category !== false}
                    onChange={() => handleToggle('allow_multi_category')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                  />
                  <span>Multi-genre select</span>
                </label>
                <span className="text-[10px] text-slate-400 block mt-1">Allow checking multiple genres</span>
              </div>
            </div>
          </div>

          {/* Section 3: Budget Brackets Customizer */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="font-grotesk font-bold text-sm text-white uppercase tracking-wider block">
                  3. Budget Range Brackets
                </label>
                <p className="text-[10px] text-slate-400">
                  Defines the radio options shown in the Budget filter
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddBracket}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <i className="fa-solid fa-plus text-[10px]"></i>
                <span>Add Bracket</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {(config.budget_brackets || []).map((b, idx) => (
                <div
                  key={b.id || idx}
                  className="flex items-center gap-2 bg-black/30 border border-white/10 p-2.5 rounded-xl text-xs"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={b.label}
                      onChange={e => handleBracketChange(idx, 'label', e.target.value)}
                      placeholder="Label (e.g. Under ₹25K)"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      value={b.min}
                      onChange={e => handleBracketChange(idx, 'min', e.target.value)}
                      placeholder="Min ₹"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      value={b.max === Infinity ? 999999999 : b.max}
                      onChange={e => handleBracketChange(idx, 'max', e.target.value)}
                      placeholder="Max ₹"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {config.budget_brackets.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteBracket(idx)}
                      className="text-slate-400 hover:text-laxRed-400 p-1.5 transition"
                      title="Delete bracket"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-white/5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1.5"
          >
            <i className="fa-solid fa-arrow-rotate-left text-xs"></i>
            <span>Reset to The Media Ant Defaults</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="grad-btn px-5 py-2 rounded-xl text-white font-extrabold text-xs shadow hover:shadow-lg transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <i className="fa-solid fa-floppy-disk"></i>
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
