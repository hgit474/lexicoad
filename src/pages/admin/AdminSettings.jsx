import React, { useState, useEffect } from 'react';
import { useSite } from '../../context/SiteContext';
import { uploadImage } from '../../services/dataService';
import {
  getSupabaseConfig,
  updateSupabaseCredentials,
  testSupabaseConnection
} from '../../lib/supabase';
import GenreBadgesModal from '../../components/admin/GenreBadgesModal';

export default function AdminSettings() {
  const { settings, updateSettings, showToast } = useSite();
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);

  // CMS Form State
  const [form, setForm] = useState({
    site_name: '',
    tagline: '',
    featured_brands: '',
    brand_subtitle: '',
    logo_text: '',
    logo_subtext: '',
    logo_badge: '',
    logo_url: '',
    favicon_url: '',
    meta_title: '',
    meta_description: '',
    phone: '',
    phone_alt: '',
    whatsapp: '',
    email: '',
    email_sales: '',
    udyam_number: '',
    gst_number: '',
    support_hours: '',
    head_office: '',
    office_mumbai: '',
    office_bengaluru: '',
    map_link: '',
    cities: '',
    active_sites_count: '',
    campaigns_count: 1250,
    locations_count: 248,
    retention_rate: 98,
    about_label: 'Since 2025',
    about_title: '',
    about_description: '',
    about_mission: '',
    about_vision: '',
    about_retention_title: '',
    about_retention_description: '',
    about_timeline: '[]',
    about_team: '[]',
    contact_label: '',
    contact_title: '',
    contact_description: '',
    contact_response_title: '',
    contact_approved_title: '',
    contact_faqs: '[]',
    social_links: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: ''
    }
  });

  // Supabase Configuration State
  const [sbConfig, setSbConfig] = useState({
    url: '',
    key: '',
    isConfigured: false
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState(null);

  useEffect(() => {
    if (settings) {
      setForm({
        site_name: settings.site_name || 'Laxico Advertising',
        tagline: settings.tagline || 'Billboard & Poster Placements Across India',
        featured_brands: settings.featured_brands || 'NIKE, ZOMATO, SAMSUNG, HDFC BANK, COCA-COLA, AMAZON, TATA, SWIGGY, BOAT, MYNTRA',
        brand_subtitle: settings.brand_subtitle || 'OUTDOOR • TRANSIT • DIGITAL',
        logo_text: settings.logo_text || 'LAXICO',
        logo_subtext: settings.logo_subtext || 'ADS',
        logo_badge: settings.logo_badge || 'L',
        logo_url: settings.logo_url || '/logo.png',
        favicon_url: settings.favicon_url || '/logo.png',
        meta_title: settings.meta_title || 'Laxico Advertising — Billboard & Poster Placements Across India',
        meta_description: settings.meta_description || '',
        phone: settings.phone || '9742313705',
        phone_alt: settings.phone_alt || '9742313705',
        whatsapp: settings.whatsapp || '9742313705',
        email: settings.email || 'lexicoadvertising@gmail.com',
        email_sales: settings.email_sales || 'lexicoadvertising@gmail.com',
        udyam_number: settings.udyam_number || 'UDYAM-KR-03-0664055',
        gst_number: settings.gst_number || '29CTIPS2521P1ZZ',
        support_hours: settings.support_hours || 'Mon–Sat • 10:00 AM – 7:00 PM IST',
        head_office: settings.head_office || 'No 1 Nandini Complex, Chandra Layout, Bangalore — 560040',
        office_mumbai: settings.office_mumbai || '',
        office_bengaluru: settings.office_bengaluru || '',
        map_link: settings.map_link || 'https://maps.google.com/?q=No+1+Nandini+Complex+Chandra+Layout+Bangalore+560040',
        cities: settings.cities || 'Delhi • Mumbai • Bengaluru • Hyderabad',
        active_sites_count: settings.active_sites_count || '248',
        campaigns_count: settings.campaigns_count || 1250,
        locations_count: settings.locations_count || 248,
        retention_rate: settings.retention_rate || 98,
        about_label: settings.about_label || 'Since 2025',
        about_title: settings.about_title || '',
        about_description: settings.about_description || '',
        about_mission: settings.about_mission || '',
        about_vision: settings.about_vision || '',
        about_retention_title: settings.about_retention_title || '',
        about_retention_description: settings.about_retention_description || '',
        about_timeline: settings.about_timeline || '[]',
        about_team: settings.about_team || '[]',
        contact_label: settings.contact_label || '',
        contact_title: settings.contact_title || '',
        contact_description: settings.contact_description || '',
        contact_response_title: settings.contact_response_title || '',
        contact_approved_title: settings.contact_approved_title || '',
        contact_faqs: settings.contact_faqs || '[]',
        social_links: {
          facebook: settings.social_links?.facebook || 'https://facebook.com',
          instagram: settings.social_links?.instagram || 'https://instagram.com',
          twitter: settings.social_links?.twitter || 'https://twitter.com',
          youtube: settings.social_links?.youtube || 'https://youtube.com'
        }
      });
    }

    const cfg = getSupabaseConfig();
    setSbConfig(cfg);
  }, [settings]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, 'branding');
      setForm(prev => ({ ...prev, logo_url: url }));
      showToast('Logo uploaded', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
  const handleFaviconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, 'branding');
      setForm(prev => ({ ...prev, favicon_url: url }));
      showToast('Favicon uploaded', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveCMS = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(form);
    } catch {
      showToast('Error updating settings', 'error');
    }
  };

  const handleTestSupabase = async () => {
    setTestingConnection(true);
    setConnectionMessage(null);
    try {
      const res = await testSupabaseConnection(sbConfig.url, sbConfig.key);
      setConnectionMessage({
        success: res.success,
        text: res.message
      });
      if (res.success) {
        showToast('Supabase connected successfully!', 'success');
      } else {
        showToast('Connection failed: ' + res.message, 'error');
      }
    } catch (err) {
      setConnectionMessage({
        success: false,
        text: err.message || 'Connection error'
      });
      showToast('Connection test error', 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveSupabaseCredentials = () => {
    if (sbConfig.url && sbConfig.key) {
      updateSupabaseCredentials(sbConfig.url, sbConfig.key);
      setSbConfig(getSupabaseConfig());
      showToast('Supabase credentials saved in Control Tower!', 'success');
    } else {
      updateSupabaseCredentials('', '');
      setSbConfig(getSupabaseConfig());
      showToast('Supabase credentials cleared. Using local storage.', 'info');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. BRAND & IDENTITY CMS */}
      <div className="bg-[#0c1747] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl grad-btn flex items-center justify-center text-white text-lg shadow">
            <i className="fa-solid fa-paintbrush"></i>
          </div>
          <div>
            <h3 className="text-white font-grotesk font-bold text-xl">Brand & Identity CMS</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Live updates to Site Name, Logo, Favicon, and Branding across the entire website
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveCMS} className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="lbl !text-slate-300">Site Name (Main Title)</label>
              <input
                type="text"
                value={form.site_name}
                onChange={e => setForm({ ...form, site_name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-laxBlue-600"
                placeholder="Laxico Advertising"
                required
              />
            </div>

            <div>
              <label className="lbl !text-slate-300">Logo Text (Header Brand)</label>
              <input
                type="text"
                value={form.logo_text}
                onChange={e => setForm({ ...form, logo_text: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-laxBlue-600"
                placeholder="LAXICO"
              />
            </div>

            <div>
              <label className="lbl !text-slate-300">Logo Subtext (Accent)</label>
              <input
                type="text"
                value={form.logo_subtext}
                onChange={e => setForm({ ...form, logo_subtext: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-laxBlue-600"
                placeholder="ADS"
              />
            </div>

            <div>
              <label className="lbl !text-slate-300">Logo Badge Letter</label>
              <input
                type="text"
                maxLength="3"
                value={form.logo_badge}
                onChange={e => setForm({ ...form, logo_badge: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-laxBlue-600"
                placeholder="L"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="lbl !text-slate-300">Brand Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={e => setForm({ ...form, tagline: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-laxBlue-600"
                placeholder="Billboard & Poster Placements Across India"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="lbl !text-slate-300">Featured Brands (comma separated)</label>
              <input
                type="text"
                value={form.featured_brands}
                onChange={e => setForm({ ...form, featured_brands: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-laxBlue-600"
                placeholder="NIKE, ZOMATO, SAMSUNG, HDFC BANK"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">These names appear in the scrolling strip below the hero carousel.</p>
            </div>

            {/* Genre Badges (HOT / TRENDING) Manager Trigger Card */}
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl bg-gradient-to-r from-laxRed-950/30 via-purple-950/20 to-transparent border border-laxRed-500/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-laxRed-500/20 text-laxRed-400 flex items-center justify-center text-lg border border-laxRed-500/30 shrink-0">
                  <i className="fa-solid fa-tags"></i>
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    Media Genre Badges (HOT / TRENDING / POPULAR)
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-laxRed-500/20 text-laxRed-300 border border-laxRed-500/30">CMS</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Customize the tags, labels, and colors displayed on the 12 media channels in the "Browse Media by Genre" section.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBadgeModalOpen(true)}
                className="grad-btn text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow shrink-0"
              >
                <i className="fa-solid fa-pen-to-square"></i>
                <span>Manage Badges</span>
              </button>
            </div>
          </div>

          {/* Logo & Favicon Image Pickers */}
          <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-white/10">
            {/* Custom Logo */}
            <div className="rounded-2xl bg-white/[.03] border border-white/10 p-4">
              <label className="lbl !text-slate-300 mb-2">Custom Logo Image</label>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="Logo" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg grad-bg flex items-center justify-center font-bold text-lg text-white">
                      {form.logo_badge || 'L'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-300 font-bold">Logo Preview</div>
                  <div className="text-[11px] text-slate-400">
                    {form.logo_url ? 'Using custom image' : 'Using gradient letter badge'}
                  </div>
                </div>
              </div>

              <input
                type="text"
                value={form.logo_url.startsWith('data:') ? '' : form.logo_url}
                onChange={e => setForm({ ...form, logo_url: e.target.value })}
                placeholder="Paste Logo URL (PNG/SVG)..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mb-2 outline-none"
              />

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-white/10 file:text-white"
                />
                {form.logo_url && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, logo_url: '' })}
                    className="text-xs text-red-400 hover:text-red-300 font-bold ml-auto"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Custom Favicon */}
            <div className="rounded-2xl bg-white/[.03] border border-white/10 p-4">
              <label className="lbl !text-slate-300 mb-2">Browser Tab Favicon</label>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {form.favicon_url ? (
                    <img src={form.favicon_url} alt="Favicon" className="w-8 h-8 object-contain" />
                  ) : (
                    <i className="fa-solid fa-globe text-2xl text-blue-400"></i>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-300 font-bold">Favicon Preview</div>
                  <div className="text-[11px] text-slate-400">
                    Updates the browser tab icon instantly
                  </div>
                </div>
              </div>

              <input
                type="text"
                value={form.favicon_url.startsWith('data:') ? '' : form.favicon_url}
                onChange={e => setForm({ ...form, favicon_url: e.target.value })}
                placeholder="Paste Favicon URL (.ico / .svg / .png)..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mb-2 outline-none"
              />

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconUpload}
                  className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-white/10 file:text-white"
                />
                {form.favicon_url && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, favicon_url: '' })}
                    className="text-xs text-red-400 hover:text-red-300 font-bold ml-auto"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SEO / Meta */}
          <div className="pt-4 border-t border-white/10 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="lbl !text-slate-300">Browser Page Title (&lt;title&gt;)</label>
              <input
                type="text"
                value={form.meta_title}
                onChange={e => setForm({ ...form, meta_title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-laxBlue-600"
                placeholder="Laxico Advertising — Billboard & Poster Placements"
              />
            </div>

            <div>
              <label className="lbl !text-slate-300">Brand Header Subtitle</label>
              <input
                type="text"
                value={form.brand_subtitle}
                onChange={e => setForm({ ...form, brand_subtitle: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-laxBlue-600"
                placeholder="OUTDOOR • TRANSIT • DIGITAL"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="lbl !text-slate-300">Meta Description</label>
              <textarea
                rows="2"
                value={form.meta_description}
                onChange={e => setForm({ ...form, meta_description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-laxBlue-600"
                placeholder="Brief summary for search engines and social sharing..."
              />
            </div>
          </div>

          {/* 2. Contact Details & Offices */}
          <div className="pt-6 border-t border-white/10">
            <h4 className="text-white font-grotesk font-bold text-lg mb-3">Contact & Offices</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="lbl !text-slate-300">Primary Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  placeholder="9742313705"
                />
              </div>

              <div>
                <label className="lbl !text-slate-300">Alternate Phone</label>
                <input
                  type="text"
                  value={form.phone_alt}
                  onChange={e => setForm({ ...form, phone_alt: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  placeholder="9742313705"
                />
              </div>

              <div>
                <label className="lbl !text-slate-300 flex items-center gap-1.5">
                  <i className="fa-brands fa-whatsapp text-emerald-400"></i> WhatsApp Number
                </label>
                <input
                  type="text"
                  value={form.whatsapp}
                  onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  placeholder="9742313705"
                />
              </div>

              <div>
                <label className="lbl !text-slate-300">General Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  placeholder="lexicoadvertising@gmail.com"
                />
              </div>

              <div>
                <label className="lbl !text-slate-300">Sales Email</label>
                <input
                  type="email"
                  value={form.email_sales}
                  onChange={e => setForm({ ...form, email_sales: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  placeholder="lexicoadvertising@gmail.com"
                />
              </div>

              <div>
                <label className="lbl !text-slate-300">UDYAM Registration Number</label>
                <input
                  type="text"
                  value={form.udyam_number}
                  onChange={e => setForm({ ...form, udyam_number: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  placeholder="UDYAM-KR-03-0664055"
                />
              </div>

              <div>
                <label className="lbl !text-slate-300">GST Number</label>
                <input
                  type="text"
                  value={form.gst_number}
                  onChange={e => setForm({ ...form, gst_number: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  placeholder="29CTIPS2521P1ZZ"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="lbl !text-slate-300">Operating Hours</label>
                <input
                  type="text"
                  value={form.support_hours}
                  onChange={e => setForm({ ...form, support_hours: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  placeholder="Mon–Sat • 10:00 AM – 7:00 PM IST"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="lbl !text-slate-300">Head Office Address</label>
                <input
                  type="text"
                  value={form.head_office}
                  onChange={e => setForm({ ...form, head_office: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  placeholder="No 1 Nandini Complex, Chandra Layout, Bangalore 560040"
                />
              </div>

              <div>
                <label className="lbl !text-slate-300">Mumbai Office</label>
                <input type="text" value={form.office_mumbai} onChange={e => setForm({ ...form, office_mumbai: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none" placeholder="BKC Office, Mumbai" />
              </div>
              <div>
                <label className="lbl !text-slate-300">Bengaluru Office</label>
                <input type="text" value={form.office_bengaluru} onChange={e => setForm({ ...form, office_bengaluru: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none" placeholder="HSR Office, Bengaluru" />
              </div>
              <div>
                <label className="lbl !text-slate-300">Google Maps Link</label>
                <input type="url" value={form.map_link} onChange={e => setForm({ ...form, map_link: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none" placeholder="https://maps.google.com/?q=..." />
              </div>

              <div>
                <label className="lbl !text-slate-300">Active Sites Display Count</label>
                <input
                  type="text"
                  value={form.active_sites_count}
                  onChange={e => setForm({ ...form, active_sites_count: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  placeholder="248"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="lbl !text-slate-300">Cities (Top Bar String)</label>
                <input
                  type="text"
                  value={form.cities}
                  onChange={e => setForm({ ...form, cities: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  placeholder="Delhi • Mumbai • Bengaluru • Hyderabad"
                />
              </div>
            </div>
          </div>

          {/* About Page Content */}
          <div className="pt-6 border-t border-white/10">
            <h4 className="text-white font-grotesk font-bold text-lg mb-1">About Page Content</h4>
            <p className="text-xs text-slate-400 mb-4">Team and Journey stay hidden until you add valid entries below.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="lbl !text-slate-300">About eyebrow</label>
                <input
                  value={form.about_label}
                  onChange={e => setForm({ ...form, about_label: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  placeholder="Since 2025"
                />
              </div>
              <div>
                <label className="lbl !text-slate-300">About title</label>
                <input value={form.about_title} onChange={e => setForm({ ...form, about_title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none" placeholder="About Laxico" />
              </div>
              <div className="sm:col-span-2">
                <label className="lbl !text-slate-300">About description</label>
                <textarea rows="2" value={form.about_description} onChange={e => setForm({ ...form, about_description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none" />
              </div>
              <div>
                <label className="lbl !text-slate-300">Mission</label>
                <textarea rows="3" value={form.about_mission} onChange={e => setForm({ ...form, about_mission: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none" />
              </div>
              <div>
                <label className="lbl !text-slate-300">Vision</label>
                <textarea rows="3" value={form.about_vision} onChange={e => setForm({ ...form, about_vision: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none" />
              </div>
              <div>
                <label className="lbl !text-slate-300">Retention card title</label>
                <input value={form.about_retention_title} onChange={e => setForm({ ...form, about_retention_title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none" />
              </div>
              <div>
                <label className="lbl !text-slate-300">Retention card description</label>
                <textarea rows="2" value={form.about_retention_description} onChange={e => setForm({ ...form, about_retention_description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="lbl !text-slate-300">Our Journey (JSON array)</label>
                <textarea
                  rows="6"
                  value={form.about_timeline}
                  onChange={e => setForm({ ...form, about_timeline: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono outline-none"
                  placeholder='[{"year":"2025","title":"Started","desc":"Our journey began."}]'
                />
              </div>
              <div className="sm:col-span-2">
                <label className="lbl !text-slate-300">Leadership / Team (JSON array)</label>
                <textarea
                  rows="6"
                  value={form.about_team}
                  onChange={e => setForm({ ...form, about_team: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono outline-none"
                  placeholder='[{"name":"Name","role":"Founder","desc":"Profile","initials":"N"}]'
                />
              </div>
            </div>
          </div>

          {/* Contact Page Content */}
          <div className="pt-6 border-t border-white/10">
            <h4 className="text-white font-grotesk font-bold text-lg mb-1">Contact Page Content</h4>
            <p className="text-xs text-slate-400 mb-4">Edit the contact banner, response cards and FAQ list.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <input value={form.contact_label} onChange={e => setForm({ ...form, contact_label: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none" placeholder="Get a quote" />
              <input value={form.contact_title} onChange={e => setForm({ ...form, contact_title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none" placeholder="Contact / Inquiry" />
              <textarea rows="2" value={form.contact_description} onChange={e => setForm({ ...form, contact_description: e.target.value })} className="sm:col-span-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none" placeholder="Contact page description" />
              <input value={form.contact_response_title} onChange={e => setForm({ ...form, contact_response_title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none" placeholder="4-hr response" />
              <input value={form.contact_approved_title} onChange={e => setForm({ ...form, contact_approved_title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none" placeholder="100% Approved" />
              <textarea rows="6" value={form.contact_faqs} onChange={e => setForm({ ...form, contact_faqs: e.target.value })} className="sm:col-span-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono outline-none" placeholder='[{"q":"Question?","a":"Answer."}]' />
            </div>
          </div>

          {/* Social Links */}
          <div className="pt-6 border-t border-white/10">
            <h4 className="text-white font-grotesk font-bold text-lg mb-3">Social Profiles</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="lbl !text-slate-300 flex items-center gap-1.5">
                  <i className="fa-brands fa-facebook text-blue-400"></i> Facebook URL
                </label>
                <input
                  type="text"
                  value={form.social_links?.facebook || ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      social_links: { ...form.social_links, facebook: e.target.value }
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  placeholder="https://facebook.com/laxicoads"
                />
              </div>

              <div>
                <label className="lbl !text-slate-300 flex items-center gap-1.5">
                  <i className="fa-brands fa-instagram text-pink-400"></i> Instagram URL
                </label>
                <input
                  type="text"
                  value={form.social_links?.instagram || ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      social_links: { ...form.social_links, instagram: e.target.value }
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  placeholder="https://instagram.com/laxicoads"
                />
              </div>

              <div>
                <label className="lbl !text-slate-300">Twitter / X URL</label>
                <input
                  type="text"
                  value={form.social_links?.twitter || ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      social_links: { ...form.social_links, twitter: e.target.value }
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  placeholder="https://twitter.com/laxicoads"
                />
              </div>

              <div>
                <label className="lbl !text-slate-300">YouTube URL</label>
                <input
                  type="text"
                  value={form.social_links?.youtube || ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      social_links: { ...form.social_links, youtube: e.target.value }
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  placeholder="https://youtube.com/@laxicoads"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="grad-btn text-white font-extrabold px-8 py-3.5 rounded-xl shadow-lg flex items-center gap-2"
            >
              <i className="fa-solid fa-floppy-disk"></i> Save CMS Brand & Content Changes
            </button>
          </div>
        </form>
      </div>

      {/* 2. SUPABASE BACKEND CLOUD CONNECTION */}
      <div className="bg-[#0c1747] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-lg shadow">
              <i className="fa-solid fa-cloud"></i>
            </div>
            <div>
              <h3 className="text-white font-grotesk font-bold text-xl">
                Supabase Backend Cloud Connection
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Connect your live Supabase PostgreSQL database or run offline on persistent storage
              </p>
            </div>
          </div>

          <span
            className={`badge ${
              sbConfig.isConfigured
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full mr-1"
              style={{ background: sbConfig.isConfigured ? '#10b981' : '#f59e0b' }}
            ></span>
            {sbConfig.isConfigured ? 'Supabase Connected' : 'Local Storage Mode'}
          </span>
        </div>

        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="lbl !text-slate-300">Supabase Project URL</label>
              <input
                type="text"
                value={sbConfig.url}
                onChange={e => setSbConfig({ ...sbConfig, url: e.target.value })}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-laxBlue-600"
              />
            </div>

            <div>
              <label className="lbl !text-slate-300">Supabase Anon Public API Key</label>
              <input
                type="password"
                value={sbConfig.key}
                onChange={e => setSbConfig({ ...sbConfig, key: e.target.value })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-laxBlue-600"
              />
            </div>
          </div>

          {connectionMessage && (
            <div
              className={`rounded-2xl p-4 text-xs sm:text-sm font-bold border flex items-center gap-2 ${
                connectionMessage.success
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/15 border-red-500/30 text-red-300'
              }`}
            >
              <i
                className={`fa-solid ${
                  connectionMessage.success ? 'fa-circle-check text-emerald-400' : 'fa-circle-exclamation text-red-400'
                }`}
              ></i>
              {connectionMessage.text}
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={testingConnection || !sbConfig.url || !sbConfig.key}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-5 py-3 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
            >
              <i className="fa-solid fa-satellite-dish"></i>
              {testingConnection ? 'Testing Connection...' : 'Test Connection'}
            </button>

            <button
              type="button"
              onClick={handleSaveSupabaseCredentials}
              className="grad-btn text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow flex items-center gap-2"
            >
              <i className="fa-solid fa-cloud-arrow-up"></i> Save & Apply Credentials
            </button>

            {sbConfig.isConfigured && (
              <button
                type="button"
                onClick={() => {
                  updateSupabaseCredentials('', '');
                  setSbConfig(getSupabaseConfig());
                  showToast('Reverted to Local Storage mode', 'info');
                }}
                className="text-xs text-red-400 hover:text-red-300 font-bold px-4 py-3"
              >
                Disconnect Supabase
              </button>
            )}
          </div>

          <div className="rounded-2xl bg-black/40 border border-white/10 p-4 text-xs text-slate-300 leading-relaxed mt-4">
            <div className="font-bold text-white mb-1 flex items-center gap-1.5">
              <i className="fa-solid fa-lightbulb text-amber-400"></i> Setup Instructions for Supabase:
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-slate-400">
              <li>Open your project on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">Supabase.com</a>.</li>
              <li>Go to <strong>Project Settings → API</strong> and copy your Project URL and Anon Key into the inputs above.</li>
              <li>Go to the <strong>SQL Editor</strong> in your Supabase dashboard and run the entire script found in <code className="text-emerald-300 font-mono">supabase/schema.sql</code>.</li>
              <li>Click <strong>Test Connection</strong> above to verify table availability!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Genre Badges Manager Modal */}
      <GenreBadgesModal
        isOpen={badgeModalOpen}
        onClose={() => setBadgeModalOpen(false)}
      />
    </div>
  );
}
