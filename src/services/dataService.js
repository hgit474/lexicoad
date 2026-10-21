import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  initialSettings,
  initialServices,
  initialLocations,
  initialServiceLocations,
  initialCampaigns,
  initialInquiries,
  initialMedia,
  initialClients,
  initialListings
} from '../lib/initialData';

const STORAGE_KEY = 'laxico_db_v4';

const normalizeBusinessSettings = (settings = {}) => ({
  ...initialSettings,
  ...settings
});
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
      const parsed = JSON.parse(raw);
      let updated = false;
      const collections = [
        ['services', initialServices],
        ['locations', initialLocations],
        ['service_locations', initialServiceLocations],
        ['campaigns', initialCampaigns],
        ['inquiries', initialInquiries],
        ['media', initialMedia],
        ['clients', initialClients],
        ['listings', initialListings]
      ];

      collections.forEach(([key, defaults]) => {
        if (!Array.isArray(parsed[key]) || parsed[key].length === 0) {
          parsed[key] = [...defaults];
          updated = true;
        }
      });

      if (!parsed.settings || typeof parsed.settings !== 'object') {
        parsed.settings = { ...initialSettings };
        updated = true;
      }

      if (updated) {
        saveLocalDB(parsed);
      }
      return parsed;
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
    clients: [...initialClients],
    listings: [...initialListings]
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
    clients: [...initialClients],
    listings: [...initialListings]
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

// Export database as MySQL .sql dump
export const exportMySQLDump = async () => {
  const db = await getAllData();
  const escapeVal = (val) => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    if (typeof val === 'boolean') return val ? 1 : 0;
    if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
    return `'${String(val).replace(/'/g, "''").replace(/\n/g, '\\n')}'`;
  };

  let sql = `-- ==============================================================================\n`;
  sql += `-- Laxico Advertising MySQL 8.0 Dump\n`;
  sql += `-- Generated at: ${new Date().toISOString()}\n`;
  sql += `-- ==============================================================================\n\n`;
  sql += `SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\n\n`;

  // Services
  if (db.services && db.services.length) {
    sql += `-- Services Table Data\n`;
    db.services.forEach(s => {
      sql += `INSERT INTO \`services\` (\`id\`, \`name\`, \`type\`, \`genre\`, \`sub_type\`, \`chain_or_brand\`, \`audience_metric\`, \`min_spend\`, \`price\`, \`rating\`, \`popularity\`, \`status\`, \`dims\`, \`durations\`, \`cities\`, \`image\`, \`description\`) VALUES (${escapeVal(s.id)}, ${escapeVal(s.name)}, ${escapeVal(s.type)}, ${escapeVal(s.genre || s.type)}, ${escapeVal(s.sub_type || '')}, ${escapeVal(s.chain_or_brand || '')}, ${escapeVal(s.audience_metric || '')}, ${escapeVal(s.min_spend || s.price)}, ${escapeVal(s.price)}, ${escapeVal(s.rating)}, ${escapeVal(s.popularity)}, ${escapeVal(s.status)}, ${escapeVal(s.dims)}, ${escapeVal(s.durations)}, ${escapeVal(s.cities)}, ${escapeVal(s.image)}, ${escapeVal(s.description)}) ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);\n`;
    });
    sql += `\n`;
  }

  // Locations
  if (db.locations && db.locations.length) {
    sql += `-- Locations Table Data\n`;
    db.locations.forEach(l => {
      sql += `INSERT INTO \`locations\` (\`id\`, \`name\`, \`city\`, \`zone\`, \`footfall\`, \`status\`, \`price_mult\`, \`lat\`, \`lng\`, \`address\`) VALUES (${escapeVal(l.id)}, ${escapeVal(l.name)}, ${escapeVal(l.city)}, ${escapeVal(l.zone)}, ${escapeVal(l.footfall)}, ${escapeVal(l.status)}, ${escapeVal(l.price_mult || 1)}, ${escapeVal(l.lat)}, ${escapeVal(l.lng)}, ${escapeVal(l.address)}) ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);\n`;
    });
    sql += `\n`;
  }

  // Service Locations Pivot
  if (db.service_locations && db.service_locations.length) {
    sql += `-- Service Locations Mapping\n`;
    db.service_locations.forEach(sl => {
      sql += `INSERT IGNORE INTO \`service_locations\` (\`id\`, \`service_id\`, \`location_id\`) VALUES (${escapeVal(sl.id)}, ${escapeVal(sl.service_id)}, ${escapeVal(sl.location_id)});\n`;
    });
    sql += `\n`;
  }

  // Inquiries
  if (db.inquiries && db.inquiries.length) {
    sql += `-- Inquiries Table Data\n`;
    db.inquiries.forEach(i => {
      sql += `INSERT INTO \`inquiries\` (\`id\`, \`name\`, \`phone\`, \`email\`, \`company\`, \`service_id\`, \`location_id\`, \`duration\`, \`budget\`, \`has_artwork\`, \`message\`, \`stage\`) VALUES (${escapeVal(i.id)}, ${escapeVal(i.name)}, ${escapeVal(i.phone)}, ${escapeVal(i.email)}, ${escapeVal(i.company)}, ${escapeVal(i.service_id)}, ${escapeVal(i.location_id)}, ${escapeVal(i.duration)}, ${escapeVal(i.budget)}, ${escapeVal(i.has_artwork)}, ${escapeVal(i.message)}, ${escapeVal(i.stage || 'New')});\n`;
    });
    sql += `\n`;
  }

  // Listings (Admin Excel Managed)
  if (db.listings && db.listings.length) {
    sql += `-- Listings Table Data (Excel Imported)\n`;
    db.listings.forEach(l => {
      sql += `INSERT INTO \`listings\` (\`id\`, \`category\`, \`subcategory\`, \`title\`, \`location\`, \`price\`, \`media_type\`, \`reach\`, \`description\`, \`image_url\`) VALUES (${escapeVal(l.id)}, ${escapeVal(l.category)}, ${escapeVal(l.subcategory)}, ${escapeVal(l.title)}, ${escapeVal(l.location)}, ${escapeVal(l.price)}, ${escapeVal(l.media_type)}, ${escapeVal(l.reach)}, ${escapeVal(l.description)}, ${escapeVal(l.image_url)}) ON DUPLICATE KEY UPDATE \`title\`=VALUES(\`title\`), \`price\`=VALUES(\`price\`);\n`;
    });
    sql += `\n`;
  }

  sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

  const blob = new Blob([sql], { type: 'application/sql' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'lexicoad_mysql_dump.sql';
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
  const listings = await getListings();
  return { settings, services, locations, service_locations, campaigns, inquiries, media, listings };
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
      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          const db = getLocalDB();
          db.services = data;
          saveLocalDB(db);
        }
        return data;
      }
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
      const { error } = await supabase.from('services').upsert(service);
      if (error) console.error('Supabase saveService error:', error);
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
      if (!error && Array.isArray(data)) {
        const db = getLocalDB();
        db.locations = data;
        saveLocalDB(db);
        return data;
      }
      if (error) console.error('Supabase getLocations error:', error);
    } catch (err) {
      console.warn('Supabase locations read failed, using local:', err);
    }
  }
  const db = getLocalDB();
  return db.locations || [];
};

export const saveLocation = async (location) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('locations').upsert(location);
      if (error) {
        console.error('Supabase saveLocation error:', error);
        throw new Error(`Database save failed: ${error.message}`);
      }
    } catch (err) {
      console.error('Supabase saveLocation exception:', err);
      throw err;
    }
  }

  const db = getLocalDB();
  const existingIdx = db.locations.findIndex(l => l.id === location.id);
  if (existingIdx >= 0) {
    db.locations[existingIdx] = { ...db.locations[existingIdx], ...location };
  } else {
    db.locations.push(location);
  }
  saveLocalDB(db);
  return location;
};

export const deleteLocation = async (id) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('locations').delete().eq('id', id);
      if (error) console.error('Supabase deleteLocation error:', error);
      await supabase.from('service_locations').delete().eq('location_id', id);
    } catch (err) {
      console.warn('Supabase deleteLocation failed:', err);
    }
  }

  const db = getLocalDB();
  db.locations = db.locations.filter(l => l.id !== id);
  db.service_locations = db.service_locations.filter(m => m.location_id !== id);
  saveLocalDB(db);
  return true;
};

export const deleteLocationsBulk = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return true;
  const idSet = new Set(ids);
  const db = getLocalDB();
  db.locations = (db.locations || []).filter(l => !idSet.has(l.id));
  db.service_locations = (db.service_locations || []).filter(m => !idSet.has(m.location_id));
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('locations').delete().in('id', ids);
      await supabase.from('service_locations').delete().in('location_id', ids);
    } catch (err) {
      console.warn('Supabase deleteLocationsBulk failed:', err);
    }
  }
  return true;
};

export const clearAllLocations = async () => {
  const db = getLocalDB();
  db.locations = [];
  db.service_locations = [];
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) console.warn('Supabase clearAllLocations error:', error);
      await supabase.from('service_locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (err) {
      console.warn('Supabase clearAllLocations failed:', err);
    }
  }
  return true;
};

export const rollbackToExampleLocations = async () => {
  const db = getLocalDB();
  const demoLocations = Array.isArray(initialLocations) ? [...initialLocations] : [];
  const demoServiceLocations = Array.isArray(initialServiceLocations) ? [...initialServiceLocations] : [];
  db.locations = demoLocations;
  db.service_locations = demoServiceLocations;
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('service_locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (demoLocations.length > 0) {
        await supabase.from('locations').upsert(demoLocations);
      }
      if (demoServiceLocations.length > 0) {
        await supabase.from('service_locations').upsert(demoServiceLocations);
      }
    } catch (err) {
      console.warn('Supabase rollbackToExampleLocations failed:', err);
    }
  }
  return demoLocations;
};

// ==========================================
// 4. SERVICE_LOCATIONS
// ==========================================
export const getServiceLocations = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('service_locations').select('*');
      if (!error && Array.isArray(data)) {
        const db = getLocalDB();
        db.service_locations = data;
        saveLocalDB(db);
        return data;
      }
      if (error) console.error('Supabase getServiceLocations error:', error);
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
      if (!error && Array.isArray(data)) {
        const db = getLocalDB();
        db.campaigns = data;
        saveLocalDB(db);
        return data;
      }
      if (error) console.error('Supabase getCampaigns error:', error);
    } catch (err) {
      console.warn('Supabase campaigns read failed, using local:', err);
    }
  }
  const db = getLocalDB();
  return db.campaigns || [];
};

export const saveCampaign = async (campaign) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('campaigns').upsert(campaign);
      if (error) {
        console.error('Supabase saveCampaign error:', error);
        throw new Error(`Database save failed: ${error.message}`);
      }
    } catch (err) {
      console.error('Supabase saveCampaign exception:', err);
      throw err;
    }
  }

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

export const deleteCampaignsBulk = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return true;
  const idSet = new Set(ids);
  const db = getLocalDB();
  db.campaigns = (db.campaigns || []).filter(c => !idSet.has(c.id));
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('campaigns').delete().in('id', ids);
    } catch (err) {
      console.warn('Supabase deleteCampaignsBulk failed:', err);
    }
  }
  return true;
};

export const clearAllCampaigns = async () => {
  const db = getLocalDB();
  db.campaigns = [];
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('campaigns').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) console.warn('Supabase clearAllCampaigns error:', error);
    } catch (err) {
      console.warn('Supabase clearAllCampaigns failed:', err);
    }
  }
  return true;
};

export const rollbackToExampleCampaigns = async () => {
  const db = getLocalDB();
  const demoCampaigns = Array.isArray(initialCampaigns) ? [...initialCampaigns] : [];
  db.campaigns = demoCampaigns;
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('campaigns').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (demoCampaigns.length > 0) {
        await supabase.from('campaigns').upsert(demoCampaigns);
      }
    } catch (err) {
      console.warn('Supabase rollbackToExampleCampaigns failed:', err);
    }
  }
  return demoCampaigns;
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
      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          const db = getLocalDB();
          db.inquiries = data;
          saveLocalDB(db);
        }
        return data;
      }
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
      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          const db = getLocalDB();
          db.media = data;
          saveLocalDB(db);
        }
        return data;
      }
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

// ==========================================
// 10. LISTINGS (Admin-Managed via Excel / CRUD)
// ==========================================
export const generateListingUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getListings = async (filters = {}) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('listings').select('*').order('created_at', { ascending: false });
      if (filters.category && filters.category !== 'All') {
        query = query.ilike('category', filters.category);
      }
      if (filters.subcategory && filters.subcategory !== 'All') {
        query = query.ilike('subcategory', filters.subcategory);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        if (data.length > 0 && !filters.category && !filters.subcategory) {
          const db = getLocalDB();
          db.listings = data;
          saveLocalDB(db);
        }
        return data;
      }
    } catch (err) {
      console.warn('Supabase listings read failed, using local:', err);
    }
  }
  const db = getLocalDB();
  let list = db.listings || [];
  if (filters.category && filters.category !== 'All') {
    list = list.filter(l => (l.category || '').toLowerCase() === filters.category.toLowerCase());
  }
  if (filters.subcategory && filters.subcategory !== 'All') {
    list = list.filter(l => (l.subcategory || '').toLowerCase() === filters.subcategory.toLowerCase());
  }
  return list;
};

export const getListingsByCategory = async (category) => {
  return getListings({ category });
};

export const bulkInsertListings = async (newRows = []) => {
  if (!Array.isArray(newRows) || newRows.length === 0) {
    return { success: true, count: 0, data: [] };
  }

  const rowsWithMeta = newRows.map(row => ({
    id: row.id || generateListingUUID(),
    category: String(row.category || '').trim(),
    subcategory: String(row.subcategory || '').trim(),
    title: String(row.title || '').trim(),
    location: String(row.location || 'Pan India').trim(),
    price: Number(row.price) || 0,
    media_type: String(row.media_type || row.subcategory || 'Standard').trim(),
    reach: row.reach !== undefined && row.reach !== null && row.reach !== '' ? Number(row.reach) : null,
    description: row.description ? String(row.description).trim() : null,
    image_url: row.image_url ? String(row.image_url).trim() : null,
    created_at: row.created_at || new Date().toISOString()
  }));

  // Update local DB cache
  const db = getLocalDB();
  const existingListings = db.listings || [];
  db.listings = [...rowsWithMeta, ...existingListings];
  saveLocalDB(db);

  // If Supabase is configured, bulk insert
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('listings').insert(rowsWithMeta);
      if (error) {
        console.warn('Supabase bulkInsertListings error:', error);
        return { success: false, error: error.message, count: rowsWithMeta.length, data: rowsWithMeta };
      }
    } catch (err) {
      console.warn('Supabase bulkInsertListings exception:', err);
      return { success: false, error: err.message, count: rowsWithMeta.length, data: rowsWithMeta };
    }
  }

  return { success: true, count: rowsWithMeta.length, data: rowsWithMeta };
};

export const saveListing = async (listing) => {
  const db = getLocalDB();
  const itemToSave = {
    ...listing,
    id: listing.id || generateListingUUID(),
    category: String(listing.category || '').trim(),
    subcategory: String(listing.subcategory || '').trim(),
    title: String(listing.title || '').trim(),
    location: String(listing.location || 'Pan India').trim(),
    price: Number(listing.price) || 0,
    media_type: String(listing.media_type || 'Standard').trim(),
    reach: listing.reach !== undefined && listing.reach !== null && listing.reach !== '' ? Number(listing.reach) : null,
    description: listing.description || null,
    image_url: listing.image_url || null,
    created_at: listing.created_at || new Date().toISOString()
  };

  const existingIdx = (db.listings || []).findIndex(l => l.id === itemToSave.id);
  if (existingIdx >= 0) {
    db.listings[existingIdx] = itemToSave;
  } else {
    db.listings = [itemToSave, ...(db.listings || [])];
  }
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('listings').upsert(itemToSave);
    } catch (err) {
      console.warn('Supabase saveListing failed:', err);
    }
  }

  return itemToSave;
};

export const deleteListing = async (id) => {
  const db = getLocalDB();
  db.listings = (db.listings || []).filter(l => l.id !== id);
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('listings').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteListing failed:', err);
    }
  }
  return true;
};

export const deleteListingsBulk = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return true;
  const idSet = new Set(ids);
  const db = getLocalDB();
  db.listings = (db.listings || []).filter(l => !idSet.has(l.id));
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('listings').delete().in('id', ids);
    } catch (err) {
      console.warn('Supabase deleteListingsBulk failed:', err);
    }
  }
  return true;
};

export const clearAllListings = async () => {
  const db = getLocalDB();
  db.listings = [];
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('listings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) console.warn('Supabase clearAllListings error:', error);
    } catch (err) {
      console.warn('Supabase clearAllListings failed:', err);
    }
  }
  return true;
};

export const rollbackToExampleListings = async () => {
  const db = getLocalDB();
  const demoListings = Array.isArray(initialListings) ? [...initialListings] : [];
  db.listings = demoListings;
  saveLocalDB(db);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('listings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (demoListings.length > 0) {
        await supabase.from('listings').upsert(demoListings);
      }
    } catch (err) {
      console.warn('Supabase rollbackToExampleListings failed:', err);
    }
  }
  return demoListings;
};

