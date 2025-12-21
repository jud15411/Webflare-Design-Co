// src/components/modals/GlobalErrorModal.jsx
import React from 'react';

const GlobalErrorModal = ({ isOpen, error, onClose }) => {
  if (!isOpen || !error) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-100 p-4">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-4xl p-8 shadow-2xl border border-rose-500/20 animate-in fade-in zoom-in duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            {error.title || 'System Interruption'}
          </h3>

          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
            {error.message ||
              'An unexpected error occurred. Our engineers have been notified.'}
          </p>

          {error.code && (
            <div className="mt-4 p-2 bg-slate-100 dark:bg-zinc-900 rounded-lg">
              <code className="text-[10px] font-mono text-rose-500 uppercase">
                Error Reference: {error.code}
              </code>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalErrorModal;
