import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSiteSettings, saveSiteSettings } from '../services/dataService';
import { initialSettings } from '../lib/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const SESSION_STORAGE_KEY = 'laxico_admin_session';
const SESSION_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

const getValidSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      // Legacy fallback check: if legacy flag without timestamp, invalidate for security
      localStorage.removeItem('laxico_admin_auth');
      localStorage.removeItem('laxico_admin_user');
      return null;
    }
    const session = JSON.parse(raw);
    if (session && session.user && session.expiresAt && session.expiresAt > Date.now()) {
      return session;
    }
    // Expired or invalid
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem('laxico_admin_auth');
    localStorage.removeItem('laxico_admin_user');
    return null;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem('laxico_admin_auth');
    localStorage.removeItem('laxico_admin_user');
    return null;
  }
};

const SiteContext = createContext();

export const SiteProvider = ({ children }) => {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [lightbox, setLightbox] = useState({ isOpen: false, src: '', title: '', sub: '' });
  const [adminSession, setAdminSession] = useState(() => getValidSession());
  const isAdmin = Boolean(adminSession && adminSession.expiresAt > Date.now());
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Load initial settings
  const loadSettings = async () => {
    try {
      const data = await getSiteSettings();
      if (data) {
        setSettings(prev => ({ ...prev, ...data }));
        applyHeadUpdates(data);
      }
    } catch (err) {
      console.error('Failed to load site settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Update dynamic browser tab title and favicon
  const applyHeadUpdates = (data) => {
    if (!data) return;
    // Title
    const titleText = data.meta_title || `${data.site_name || 'Laxico Advertising'} — Billboard & Poster Placements`;
    document.title = titleText;
    const titleEl = document.getElementById('app-title');
    if (titleEl) titleEl.innerText = titleText;

    // Favicon
    const faviconUrl = data.favicon_url?.trim() || '/logo.png';
    if (faviconUrl) {
      let link = document.getElementById('app-favicon');
      if (!link) {
        link = document.createElement('link');
        link.id = 'app-favicon';
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    }
  };

  // Save updated settings to CMS
  const updateSettings = async (newSettings) => {
    try {
      const saved = await saveSiteSettings(newSettings);
      setSettings(saved);
      applyHeadUpdates(saved);
      showToast('Settings saved successfully!', 'success');
      return saved;
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('Failed to save settings', 'error');
      throw err;
    }
  };

  // Toast Notification System
  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Global Lightbox
  const openLightbox = (src, title = '', sub = '') => {
    setLightbox({ isOpen: true, src, title, sub });
  };
  const closeLightbox = () => {
    setLightbox(prev => ({ ...prev, isOpen: false }));
  };

  const adminUser = adminSession?.user || '';

  // Periodic check for session expiration
  useEffect(() => {
    const interval = setInterval(() => {
      if (adminSession && adminSession.expiresAt <= Date.now()) {
        logout();
        showToast('Admin session expired. Please sign in again.', 'warning');
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [adminSession]);

  // Initial Supabase Session Sync
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user?.email) {
          const emailUser = data.session.user.email;
          const session = {
            user: emailUser,
            token: data.session.access_token,
            isSupabase: true,
            loginTime: Date.now(),
            expiresAt: Date.now() + SESSION_DURATION_MS
          };
          setAdminSession(session);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
          localStorage.setItem('laxico_admin_auth', 'true');
          localStorage.setItem('laxico_admin_user', emailUser);
        }
      }).catch(err => console.warn('Supabase getSession error:', err));

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email) {
          const emailUser = session.user.email;
          const newSession = {
            user: emailUser,
            token: session.access_token,
            isSupabase: true,
            loginTime: Date.now(),
            expiresAt: Date.now() + SESSION_DURATION_MS
          };
          setAdminSession(newSession);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
          localStorage.setItem('laxico_admin_auth', 'true');
          localStorage.setItem('laxico_admin_user', emailUser);
        } else if (event === 'SIGNED_OUT') {
          setAdminSession(null);
          localStorage.removeItem(SESSION_STORAGE_KEY);
          localStorage.removeItem('laxico_admin_auth');
          localStorage.removeItem('laxico_admin_user');
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe?.();
      };
    }
  }, []);

  // Auth: Supabase Auth Email/Password + ENV Fallback
  const login = async (identifier, password) => {
    const rawId = (identifier || '').trim();
    const cleanId = rawId.toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Try Supabase Auth email/password if Supabase is configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: rawId,
          password: cleanPass
        });
        if (!error && data?.user) {
          const userIdentifier = data.user.email || rawId;
          const newSession = {
            user: userIdentifier,
            token: data.session?.access_token || `session_${Date.now()}`,
            isSupabase: true,
            loginTime: Date.now(),
            expiresAt: Date.now() + SESSION_DURATION_MS
          };
          setAdminSession(newSession);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
          localStorage.setItem('laxico_admin_auth', 'true');
          localStorage.setItem('laxico_admin_user', userIdentifier);
          setLoginModalOpen(false);
          showToast(`Welcome back, ${userIdentifier}!`, 'success');
          return true;
        }
      } catch (err) {
        console.warn('Supabase signInWithPassword attempt failed:', err);
      }
    }

    // 2. Fallback to ENV-configured Admin credentials
    const adminPairs = [];

    // Format 1: VITE_ADMIN_CREDS="user1:pass1,user2:pass2,user3:pass3"
    const envCredsStr = import.meta.env.VITE_ADMIN_CREDS || '';
    if (envCredsStr) {
      envCredsStr.split(',').forEach(pair => {
        const parts = pair.split(':');
        if (parts.length >= 2) {
          const u = parts[0].trim().toLowerCase();
          const p = parts.slice(1).join(':').trim();
          if (u && p) adminPairs.push({ user: u, pass: p });
        }
      });
    }

    // Format 2: VITE_ADMIN_USERS="user1,user2" & VITE_ADMIN_PASSWORDS="pass1,pass2" or VITE_ADMIN_USER & VITE_ADMIN_PASS
    const envUsersStr = import.meta.env.VITE_ADMIN_USERS || import.meta.env.VITE_ADMIN_USER || '';
    const envPassStr = import.meta.env.VITE_ADMIN_PASSWORDS || import.meta.env.VITE_ADMIN_PASS || '';

    const envUsers = envUsersStr.split(',').map(u => u.trim().toLowerCase()).filter(Boolean);
    const envPasses = envPassStr.split(',').map(p => p.trim()).filter(Boolean);

    // If no credentials configured at all, alert user
    if (adminPairs.length === 0 && envUsers.length === 0 && !isSupabaseConfigured()) {
      showToast('Admin credentials not configured. Please set VITE_ADMIN_USER and VITE_ADMIN_PASS in your .env file or configure Supabase.', 'error');
      return false;
    }

    const isDirectMatch = adminPairs.some(a => a.user === cleanId && a.pass === cleanPass);
    const isListMatch = envUsers.length > 0 && envPasses.length > 0 && envUsers.includes(cleanId) && envPasses.includes(cleanPass);

    if (isDirectMatch || isListMatch) {
      const newSession = {
        user: cleanId,
        token: `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        loginTime: Date.now(),
        expiresAt: Date.now() + SESSION_DURATION_MS
      };
      setAdminSession(newSession);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
      localStorage.setItem('laxico_admin_auth', 'true');
      localStorage.setItem('laxico_admin_user', cleanId);
      setLoginModalOpen(false);
      showToast(`Welcome back, ${cleanId}!`, 'success');
      return true;
    } else {
      showToast('Invalid Admin ID/Email or Password', 'error');
      return false;
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    setAdminSession(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem('laxico_admin_auth');
    localStorage.removeItem('laxico_admin_user');
    showToast('Logged out securely', 'info');
  };

  return (
    <SiteContext.Provider
      value={{
        settings,
        loading,
        updateSettings,
        refreshSettings: loadSettings,
        toasts,
        showToast,
        removeToast,
        lightbox,
        openLightbox,
        closeLightbox,
        isAdmin,
        adminUser,
        login,
        logout,
        loginModalOpen,
        setLoginModalOpen
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => useContext(SiteContext);
