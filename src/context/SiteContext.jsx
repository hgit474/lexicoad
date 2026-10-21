import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSiteSettings, saveSiteSettings } from '../services/dataService';
import { initialSettings } from '../lib/initialData';

const SiteContext = createContext();

export const SiteProvider = ({ children }) => {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [lightbox, setLightbox] = useState({ isOpen: false, src: '', title: '', sub: '' });
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('laxico_admin_auth') === 'true';
  });
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

  // Auth: Pure ENV-controlled Admin credentials (no hardcoded fallbacks)
  const login = (identifier, password) => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

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

    // Format 2: VITE_ADMIN_USERS="user1,user2" & VITE_ADMIN_PASSWORDS="pass1,pass2"
    const envUsersStr = import.meta.env.VITE_ADMIN_USERS || import.meta.env.VITE_ADMIN_USER || '';
    const envPassStr = import.meta.env.VITE_ADMIN_PASSWORDS || import.meta.env.VITE_ADMIN_PASS || '';

    const envUsers = envUsersStr.split(',').map(u => u.trim().toLowerCase()).filter(Boolean);
    const envPasses = envPassStr.split(',').map(p => p.trim()).filter(Boolean);

    const isDirectMatch = adminPairs.some(a => a.user === cleanId && a.pass === cleanPass);
    const isListMatch = envUsers.length > 0 && envPasses.length > 0 && envUsers.includes(cleanId) && envPasses.includes(cleanPass);

    if (isDirectMatch || isListMatch) {
      setIsAdmin(true);
      localStorage.setItem('laxico_admin_auth', 'true');
      setLoginModalOpen(false);
      showToast('Welcome back, Admin!', 'success');
      return true;
    } else {
      showToast('Invalid Admin ID or Password', 'error');
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('laxico_admin_auth');
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
