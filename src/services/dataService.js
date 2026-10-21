import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  initialSettings,
  initialServices,
  initialLocations,
  initialServiceLocations,
  initialCampaigns,
  initialInquiries,
  initialMedia,
  initialClients
} from '../lib/initialData';

const STORAGE_KEY = 'laxico_db_v3';

const normalizeBusinessSettings = (settings = {}) => {
  const normalized = { ...settings };
  const oldPhones = ['+91 98110 24680', '011-4155 8899'];
  const oldEmails = ['hello@laxicoads.in', 'sales@laxicoads.in'];

  if (!normalized.phone || oldPhones.includes(normalized.phone)) normalized.phone = '9742313705';
  if (!normalized.phone_alt || oldPhones.includes(normalized.phone_alt)) normalized.phone_alt = '9742313705';
  if (!normalized.whatsapp || oldPhones.includes(normalized.whatsapp)) normalized.whatsapp = '9742313705';
  if (!normalized.email || oldEmails.includes(normalized.email)) normalized.email = 'lexicoadvertising@gmail.com';
  if (!normalized.email_sales || oldEmails.includes(normalized.email_sales)) normalized.email_sales = 'lexicoadvertising@gmail.com';
  if (!normalized.udyam_number) normalized.udyam_number = 'UDYAM-KR-03-0664055';
  if (!normalized.gst_number) normalized.gst_number = '29CTIPS2521P1ZZ';
  if (!normalized.head_office || /Connaught Place|New Delhi/i.test(normalized.head_office)) {
    normalized.head_office = 'No 1 Nandini Complex, Chandra Layout, Bangalore — 560040';
  }
  if (!normalized.map_link || /Connaught|New Delhi/i.test(normalized.map_link)) {
    normalized.map_link = 'https://maps.google.com/?q=No+1+Nandini+Complex+Chandra+Layout+Bangalore+560040';
  }
  if (!normalized.logo_url || normalized.logo_url === '/logo.svg') normalized.logo_url = '/logo.png';
  if (!normalized.favicon_url || normalized.favicon_url === '/logo.svg') normalized.favicon_url = '/logo.png';

  return normalized;
};
// Upload to Supabase Storage when configured; keep the demo fully usable locally.
export const uploadImage = async (file, folder = 'general') => {
  if (!file || !file.type?.startsWith('image/')) {
    throw new Error('Please choose a valid image file');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must be smaller than 10 MB');
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
      const { error } = await supabase.storage.from('site-media').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });
      if (!error) {
        const { data } = supabase.storage.from('site-media').getPublicUrl(path);
        if (data?.publicUrl) return data.publicUrl;
      }
      console.warn('Supabase storage upload failed, falling back to local encoding:', error);
    } catch (err) {
      console.warn('Supabase storage exception, falling back to local encoding:', err);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read image file'));
    reader.readAsDataURL(file);
  });
};

// Helper: load local database
export const getLocalDB = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading local storage:', e);
  }
  const defaultDB = {
    settings: { ...initialSettings },
    services: [...initialServices],
    locations: [...initialLocations],
    service_locations: [...initialServiceLocations],
    campaigns: [...initialCampaigns],
    inquiries: [...initialInquiries],
    media: [...initialMedia],
    clients: [...initialClients]
  };
  saveLocalDB(defaultDB);
  return defaultDB;
};

// Helper: save local database
export const saveLocalDB = (db) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Error saving to local storage:', e);
  }
};

// Reset demo data
export const resetDemoData = async () => {
  const defaultDB = {
    settings: { ...initialSettings },
    services: [...initialServices],
    locations: [...initialLocations],
    service_locations: [...initialServiceLocations],
    campaigns: [...initialCampaigns],
    inquiries: [...initialInquiries],
    media: [...initialMedia],
    clients: [...initialClients]
  };
  saveLocalDB(defaultDB);
  return defaultDB;
};

// Export database as JSON
export const exportDatabase = async () => {
  const db = await getAllData();
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'laxico-database.json';
  a.click();
  return true;
};

// Get all data
export const getAllData = async () => {
  const settings = await getSiteSettings();
  const services = await getServices();
  const locations = await getLocations();
  const service_locations = await getServiceLocations();
  const campaigns = await getCampaigns();
  const inquiries = await getInquiries();
  const media = await getMedia();
  return { settings, services, locations, service_locations, campaigns, inquiries, media };
};

// ==========================================
// 1. SITE SETTINGS (CMS)
// ==========================================
export const getSiteSettings = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      if (!error && data) {
        const normalized = normalizeBusinessSettings(data);
        if (JSON.stringify(normalized) !== JSON.stringify(data)) {
          await supabase.from('site_settings').upsert({ ...normalized, id: 'default' });
        }
        return normalized;
      }
    } catch (err) {
      console.warn('Supabase site_settings read failed, using local:', err);
    }
  }
  const db = getLocalDB();
  const normalized = normalizeBusinessSettings(db.settings || initialSettings);
  if (JSON.stringify(normalized) !== JSON.stringify(db.settings || initialSettings)) {
    db.settings = normalized;
    saveLocalDB(db);
  }
  return normalized;
};

export const saveSiteSettings = async (settings) => {
  const db = getLocalDB();
  db.settings = { ...db.settings, ...settings, updated_at: new Date().toISOString() };
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('site_settings')
        .upsert({ ...db.settings, id: 'default' });
    } catch (err) {
      console.warn('Supabase site_settings save failed:', err);
    }
  }
  return db.settings;
};

// ==========================================
// 2. SERVICES
// ==========================================
export const getServices = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('popularity', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase services read failed, using local:', err);
    }
  }
  const db = getLocalDB();
  return db.services || [];
};

export const saveService = async (service, mappedLocationIds = null) => {
  const db = getLocalDB();
  const existingIdx = db.services.findIndex(s => s.id === service.id);
  if (existingIdx >= 0) {
    db.services[existingIdx] = { ...db.services[existingIdx], ...service };
  } else {
    db.services.push(service);
  }

  // Update mappings if provided
  if (Array.isArray(mappedLocationIds)) {
    db.service_locations = db.service_locations.filter(m => m.service_id !== service.id);
    mappedLocationIds.forEach(lid => {
      db.service_locations.push({
        id: `sl_${Math.random().toString(36).slice(2, 9)}`,
        service_id: service.id,
        location_id: lid
      });
    });
  }
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('services').upsert(service);
      if (Array.isArray(mappedLocationIds)) {
        await supabase.from('service_locations').delete().eq('service_id', service.id);
        if (mappedLocationIds.length > 0) {
          const rows = mappedLocationIds.map(lid => ({
            id: `sl_${Math.random().toString(36).slice(2, 9)}`,
            service_id: service.id,
            location_id: lid
          }));
          await supabase.from('service_locations').insert(rows);
        }
      }
    } catch (err) {
      console.warn('Supabase saveService failed:', err);
    }
  }
  return service;
};

export const deleteService = async (id) => {
  const db = getLocalDB();
  db.services = db.services.filter(s => s.id !== id);
  db.service_locations = db.service_locations.filter(m => m.service_id !== id);
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('services').delete().eq('id', id);
      await supabase.from('service_locations').delete().eq('service_id', id);
    } catch (err) {
      console.warn('Supabase deleteService failed:', err);
    }
  }
  return true;
};

// ==========================================
// 3. LOCATIONS
// ==========================================
export const getLocations = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('locations').select('*');
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase locations read failed, using local:', err);
    }
  }
  const db = getLocalDB();
  return db.locations || [];
};

export const saveLocation = async (location) => {
  const db = getLocalDB();
  const existingIdx = db.locations.findIndex(l => l.id === location.id);
  if (existingIdx >= 0) {
    db.locations[existingIdx] = { ...db.locations[existingIdx], ...location };
  } else {
    db.locations.push(location);
  }
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('locations').upsert(location);
    } catch (err) {
      console.warn('Supabase saveLocation failed:', err);
    }
  }
  return location;
};

export const deleteLocation = async (id) => {
  const db = getLocalDB();
  db.locations = db.locations.filter(l => l.id !== id);
  db.service_locations = db.service_locations.filter(m => m.location_id !== id);
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('locations').delete().eq('id', id);
      await supabase.from('service_locations').delete().eq('location_id', id);
    } catch (err) {
      console.warn('Supabase deleteLocation failed:', err);
    }
  }
  return true;
};

// ==========================================
// 4. SERVICE_LOCATIONS
// ==========================================
export const getServiceLocations = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('service_locations').select('*');
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase service_locations read failed, using local:', err);
    }
  }
  const db = getLocalDB();
  return db.service_locations || [];
};

// ==========================================
// 5. CAMPAIGNS
// ==========================================
export const getCampaigns = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('start_date', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase campaigns read failed, using local:', err);
    }
  }
  const db = getLocalDB();
  return db.campaigns || [];
};

export const saveCampaign = async (campaign) => {
  const db = getLocalDB();
  const existingIdx = db.campaigns.findIndex(c => c.id === campaign.id);
  if (existingIdx >= 0) {
    db.campaigns[existingIdx] = { ...db.campaigns[existingIdx], ...campaign };
  } else {
    db.campaigns.unshift(campaign);
  }

  // Update location status if campaign is Live
  if (campaign.status === 'Live' && campaign.location_id) {
    const loc = db.locations.find(l => l.id === campaign.location_id);
    if (loc) loc.status = 'Occupied';
  }
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('campaigns').upsert(campaign);
    } catch (err) {
      console.warn('Supabase saveCampaign failed:', err);
    }
  }
  return campaign;
};

export const deleteCampaign = async (id) => {
  const db = getLocalDB();
  db.campaigns = db.campaigns.filter(c => c.id !== id);
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('campaigns').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteCampaign failed:', err);
    }
  }
  return true;
};

export const cycleCampaignStatus = async (id) => {
  const db = getLocalDB();
  const c = db.campaigns.find(x => x.id === id);
  if (!c) return null;
  const order = ['Scheduled', 'Live', 'Paused', 'Completed'];
  const nextIdx = (order.indexOf(c.status) + 1) % order.length;
  c.status = order[nextIdx];
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('campaigns').update({ status: c.status }).eq('id', id);
    } catch (err) {
      console.warn('Supabase cycle status failed:', err);
    }
  }
  return c;
};

// ==========================================
// 6. INQUIRIES
// ==========================================
export const getInquiries = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase inquiries read failed, using local:', err);
    }
  }
  const db = getLocalDB();
  return db.inquiries || [];
};

export const saveInquiry = async (inquiry) => {
  const db = getLocalDB();
  const existingIdx = db.inquiries.findIndex(i => i.id === inquiry.id);
  if (existingIdx >= 0) {
    db.inquiries[existingIdx] = { ...db.inquiries[existingIdx], ...inquiry };
  } else {
    db.inquiries.unshift(inquiry);
  }
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      const {
        service_name: _serviceName,
        location_name: _locationName,
        client_name: _clientName,
        ...databaseInquiry
      } = inquiry;
      const { error } = await supabase.from('inquiries').upsert(databaseInquiry);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase saveInquiry failed:', err);
      throw new Error(`Backend inquiry save failed: ${err.message}`);
    }
  }
  return inquiry;
};

export const getWhatsAppInquiryUrl = (number, inquiry) => {
  const cleanNumber = String(number || '').replace(/[^\d]/g, '');
  const message = [
    'New website inquiry',
    `Name: ${inquiry.name || inquiry.client_name || ''}`,
    `Phone: ${inquiry.phone || ''}`,
    `Email: ${inquiry.email || ''}`,
    inquiry.company ? `Company: ${inquiry.company}` : '',
    inquiry.service_name ? `Service: ${inquiry.service_name}` : '',
    inquiry.location_name ? `Location: ${inquiry.location_name}` : '',
    inquiry.duration ? `Duration: ${inquiry.duration}` : '',
    inquiry.budget ? `Budget: ${inquiry.budget}` : '',
    inquiry.message ? `Message: ${inquiry.message}` : ''
  ].filter(Boolean).join('\n');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

export const updateInquiryStage = async (id, stage) => {
  const db = getLocalDB();
  const inq = db.inquiries.find(i => i.id === id);
  if (inq) inq.stage = stage;
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('inquiries').update({ stage }).eq('id', id);
    } catch (err) {
      console.warn('Supabase updateInquiryStage failed:', err);
    }
  }
  return inq;
};

export const updateInquiryFollowup = async (id, followup) => {
  const db = getLocalDB();
  const inq = db.inquiries.find(i => i.id === id);
  if (inq) inq.followup = followup;
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('inquiries').update({ followup }).eq('id', id);
    } catch (err) {
      console.warn('Supabase updateInquiryFollowup failed:', err);
    }
  }
  return inq;
};

export const deleteInquiry = async (id) => {
  const db = getLocalDB();
  db.inquiries = db.inquiries.filter(i => i.id !== id);
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('inquiries').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteInquiry failed:', err);
    }
  }
  return true;
};

export const convertInquiryToCampaign = async (inquiryId) => {
  const db = getLocalDB();
  const inq = db.inquiries.find(i => i.id === inquiryId);
  if (!inq) return null;

  const newCampaign = {
    id: `cp_${Math.random().toString(36).slice(2, 9)}`,
    title: `${inq.company && inq.company !== '—' ? inq.company : inq.name} — Campaign`,
    client: inq.company && inq.company !== '—' ? inq.company : inq.name,
    service_id: inq.service_id,
    location_id: inq.location_id,
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
    budget: 150000,
    status: 'Scheduled',
    artwork: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?q=80&w=800&auto=format&fit=crop',
    notes: `Converted from inquiry ${inq.id}`
  };

  db.campaigns.unshift(newCampaign);
  inq.stage = 'Converted';
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('campaigns').insert(newCampaign);
      await supabase.from('inquiries').update({ stage: 'Converted' }).eq('id', inquiryId);
    } catch (err) {
      console.warn('Supabase convertInquiryToCampaign failed:', err);
    }
  }
  return newCampaign;
};

// ==========================================
// 7. MEDIA LIBRARY
// ==========================================
export const getMedia = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('media').select('*');
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase media read failed, using local:', err);
    }
  }
  const db = getLocalDB();
  return db.media || [];
};

export const saveMedia = async (mediaItem) => {
  const db = getLocalDB();
  db.media.unshift(mediaItem);
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('media').upsert(mediaItem);
    } catch (err) {
      console.warn('Supabase saveMedia failed:', err);
    }
  }
  return mediaItem;
};

export const deleteMedia = async (id) => {
  const db = getLocalDB();
  db.media = db.media.filter(m => m.id !== id);
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('media').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteMedia failed:', err);
    }
  }
  return true;
};
