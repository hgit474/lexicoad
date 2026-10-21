import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

export default function LoginModal() {
  const { loginModalOpen, setLoginModalOpen, login, settings } = useSite();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  if (!loginModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = login(email, password);
    if (ok) {
      navigate('/admin');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9996] modal-bg flex items-center justify-center p-4 transition-all"
      onClick={() => setLoginModalOpen(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setLoginModalOpen(false)}
          className="absolute top-4 right-5 text-2xl text-slate-400 hover:text-black font-bold"
        >
          ×
        </button>

        <div className="w-14 h-14 rounded-2xl grad-bg flex items-center justify-center text-white font-grotesk font-bold text-2xl shadow-lg overflow-hidden">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt={settings.site_name || 'Logo'} className="w-full h-full object-contain bg-white" />
          ) : (
            settings.logo_badge || 'L'
          )}
        </div>

        <h2 className="font-grotesk font-bold text-2xl mt-4 text-laxBlue-950">Admin Access</h2>
        <p className="text-sm text-slate-500 font-medium">Enter administrator credentials to proceed.</p>

        <form onSubmit={handleSubmit} className="space-y-3 mt-5">
          <div>
            <label className="lbl">Admin ID</label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="field"
              required
            />
          </div>

          <div>
            <label className="lbl">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="field"
              required
            />
          </div>

          <button
            type="submit"
            className="grad-btn w-full text-white font-extrabold py-3.5 rounded-xl shadow-lg mt-2 flex items-center justify-center gap-2"
          >
            Unlock Control Tower <i className="fa-solid fa-key ml-1"></i>
          </button>
        </form>
      </div>
    </div>
  );
}
