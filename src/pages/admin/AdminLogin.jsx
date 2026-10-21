import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';

export default function AdminLogin() {
  const { isAdmin, login, settings } = useSite();
  const navigate = useNavigate();

  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect directly to admin dashboard
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!adminId.trim() || !password.trim()) {
      setError('Please enter both Admin ID and Password');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const success = login(adminId, password);
      setLoading(false);
      if (success) {
        navigate('/admin');
      } else {
        setError('Invalid Admin ID or Password');
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#040A29] text-white flex flex-col justify-between relative overflow-hidden font-jakarta select-none">
      {/* Ambient background glow & grid */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-laxBlue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-laxRed-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute inset-0 hero-grid opacity-30 pointer-events-none"></div>

      {/* Top Bar Header */}
      <header className="relative z-10 p-6 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-3 group">
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.site_name}
              className="h-10 max-w-[150px] object-contain rounded-lg"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl grad-bg flex items-center justify-center text-white font-grotesk font-bold text-xl shadow-lg transition-transform group-hover:scale-105">
              {settings.logo_badge || 'L'}
            </div>
          )}
          <div>
            <div className="font-grotesk font-bold text-base tracking-tight text-white">
              {settings.logo_text || 'LAXICO'} <span className="text-laxRed-400">{settings.logo_subtext || 'ADS'}</span>
            </div>
            <div className="text-[9px] font-extrabold tracking-[.25em] text-slate-400">
              CONTROL TOWER
            </div>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10"
        >
          <i className="fa-solid fa-arrow-left text-[10px]"></i> Back to Website
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#071343]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/60 relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 grad-bg"></div>

            {/* Badge & Lock Icon */}
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center gap-2 bg-laxBlue-500/15 border border-laxBlue-400/30 text-laxBlue-300 text-xs font-bold px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-laxBlue-400 animate-pulse"></span>
                RESTRICTED PORTAL
              </div>
              <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                <i className="fa-solid fa-shield-halved text-sm"></i>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-grotesk font-bold tracking-tight text-white">
              Admin Login
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              Enter credentials to access the Laxico CMS Control Tower
            </p>

            {/* Error Alert */}
            {error && (
              <div className="mt-4 p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2.5 animate-shake">
                <i className="fa-solid fa-triangle-exclamation text-red-400 text-sm flex-shrink-0"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* ID / Email field */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-300 uppercase mb-1.5">
                  Admin ID or Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <i className="fa-solid fa-user-shield text-xs"></i>
                  </span>
                  <input
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="Enter Admin ID"
                    autoFocus
                    required
                    className="w-full bg-[#040A29]/70 border border-white/15 focus:border-laxBlue-400 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:ring-2 focus:ring-laxBlue-500/30"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-300 uppercase mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <i className="fa-solid fa-lock text-xs"></i>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full bg-[#040A29]/70 border border-white/15 focus:border-laxBlue-400 rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:ring-2 focus:ring-laxBlue-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white transition"
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full grad-btn text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-laxBlue-900/40 hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i> Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Control Tower <i className="fa-solid fa-arrow-right ml-1 text-xs"></i>
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-slate-500 text-[11px] mt-6">
            Laxico Advertising Control Tower &copy; {new Date().getFullYear()} • Secure 256-bit Encrypted
          </p>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 p-4 text-center text-slate-500 text-xs">
        Billboard & Poster Placements Across India
      </footer>
    </div>
  );
}
