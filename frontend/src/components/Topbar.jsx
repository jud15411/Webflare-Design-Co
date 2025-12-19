import React from 'react';
import { useConfig } from '../context/ConfigContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ user, setUser }) => {
  const { darkMode, toggleDarkMode } = useConfig();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      localStorage.removeItem('user_profile');
      localStorage.removeItem('isAuthenticated');
      if (setUser) setUser(null);
      navigate('/login');
    }
  };

  const getActionLabel = () => {
    switch (user?.branch) {
      case 'admin':
        return 'New User';
      case 'cyber_security':
        return 'New Scan';
      case 'web_dev':
        return 'New Project';
      default:
        return 'Action';
    }
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
      {/* Branch Identity Badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Branch:
        </span>
        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
          {user?.branch?.replace('_', ' ')}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-xl transition-colors"
          title="Toggle Theme">
          {darkMode ? '🌙' : '☀️'}
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-zinc-800 mx-2"></div>

        <button
          onClick={handleLogout}
          className="text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-red-500 transition-colors">
          Logout
        </button>

        <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
          + {getActionLabel()}
        </button>
      </div>
    </header>
  );
};

export default Topbar;
