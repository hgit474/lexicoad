import React from 'react';
import { useSite } from '../context/SiteContext';

export default function ToastBox() {
  const { toasts, removeToast } = useSite();

  const colors = {
    info: '#0B3DFF',
    success: '#16a34a',
    error: '#E11D2E',
    warn: '#f59e0b'
  };

  const icons = {
    info: 'fa-circle-info',
    success: 'fa-circle-check',
    error: 'fa-triangle-exclamation',
    warn: 'fa-bell'
  };

  return (
    <div className="fixed top-20 right-4 z-[9998] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="toast-item pointer-events-auto cursor-pointer"
          style={{ borderLeftColor: colors[t.type] || '#0B3DFF' }}
          onClick={() => removeToast(t.id)}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base"
            style={{
              background: `${colors[t.type] || '#0B3DFF'}22`,
              color: colors[t.type] || '#0B3DFF'
            }}
          >
            <i className={`fa-solid ${icons[t.type] || 'fa-circle-info'}`}></i>
          </div>
          <div className="text-sm">
            <div className="font-extrabold text-white leading-tight">{t.message}</div>
            <div className="text-slate-400 text-xs font-semibold mt-0.5">Laxico Advertising • just now</div>
          </div>
        </div>
      ))}
    </div>
  );
}
