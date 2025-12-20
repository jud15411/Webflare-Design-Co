import React from 'react';
import { useConfig } from '../context/ConfigContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ user, setUser, openSidebar }) => {
  const { darkMode, toggleDarkMode } = useConfig();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('user_profile');
      localStorage.removeItem('isAuthenticated');
      if (setUser) setUser(null);
      navigate('/login');
    }
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-3">
        {/* HAMBURGER MENU BUTTON */}
        <button
          onClick={openSidebar}
          className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-600 dark:text-zinc-400">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Branch:
          </span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase">
            {user?.branch?.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-xl">
          {darkMode ? '🌙' : '☀️'}
        </button>
        <div className="h-6 w-px bg-slate-200 dark:bg-zinc-800"></div>
        <button
          onClick={handleLogout}
          className="hidden sm:block text-xs font-bold text-slate-500 hover:text-red-500 uppercase tracking-tighter">
          Logout
        </button>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
          Quick Action
        </button>
      </div>
    </header>
  );
};

export default Topbar;
