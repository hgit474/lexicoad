import { createClient } from '@supabase/supabase-js';

// Keys can be configured in Admin UI (stored in localStorage) or via .env
export const getStoredCredentials = () => {
  try {
    const url = localStorage.getItem('laxico_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
    const key = localStorage.getItem('laxico_supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    return { url: url.trim(), key: key.trim() };
  } catch {
    return {
      url: import.meta.env.VITE_SUPABASE_URL || '',
      key: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    };
  }
};

let credentials = getStoredCredentials();

export const isSupabaseConfigured = () => {
  return Boolean(
    credentials.url && 
    credentials.key && 
    credentials.url.startsWith('https://') &&
    credentials.key.length > 20
  );
};

export const createSupabaseInstance = (customUrl, customKey) => {
  const url = customUrl || credentials.url;
  const key = customKey || credentials.key;
  if (!url || !key) return null;
  try {
    return createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
};

export let supabase = isSupabaseConfigured() ? createSupabaseInstance() : null;

export const updateSupabaseCredentials = (url, key) => {
  try {
    if (url && key) {
      localStorage.setItem('laxico_supabase_url', url.trim());
      localStorage.setItem('laxico_supabase_key', key.trim());
    } else {
      localStorage.removeItem('laxico_supabase_url');
      localStorage.removeItem('laxico_supabase_key');
    }
    credentials = getStoredCredentials();
    supabase = isSupabaseConfigured() ? createSupabaseInstance() : null;
    return true;
  } catch (err) {
    console.error('Error updating Supabase credentials:', err);
    return false;
  }
};

export const getSupabaseConfig = () => {
  return {
    url: credentials.url,
    key: credentials.key,
    isConfigured: isSupabaseConfigured()
  };
};

export const testSupabaseConnection = async (testUrl, testKey) => {
  try {
    const client = createSupabaseInstance(testUrl, testKey);
    if (!client) return { success: false, message: 'Invalid URL or Key format' };
    
    // Test simple query
    const { error } = await client.from('services').select('id', { head: true, count: 'exact' });
    if (error) {
      if (error.code === '42P01') {
        return { 
          success: true, 
          tableMissing: true, 
          message: 'Connected to Supabase! (Note: Tables are not created yet. Please execute supabase/schema.sql in your Supabase SQL Editor)' 
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected to Supabase successfully with active tables!' };
  } catch (err) {
    return { success: false, message: err.message || 'Connection failed' };
  }
};
