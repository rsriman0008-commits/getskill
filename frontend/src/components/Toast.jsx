import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgClasses = {
    success: 'bg-emerald-950/85 border-emerald-500/30 text-emerald-200 shadow-emerald-950/40',
    error: 'bg-rose-950/85 border-rose-500/30 text-rose-200 shadow-rose-950/40',
    info: 'bg-indigo-950/85 border-indigo-500/30 text-indigo-200 shadow-indigo-950/40',
    warning: 'bg-amber-950/85 border-amber-500/30 text-amber-200 shadow-amber-950/40'
  }[type];

  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  }[type];

  return (
    <div className={`fixed top-6 right-6 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl animate-slide-up flex items-center gap-3 z-50 ${bgClasses}`}>
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-semibold tracking-wide">{message}</span>
    </div>
  );
};

export default Toast;
