import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Sidebar = ({ user, setUser, closeSidebar }) => {
  const location = useLocation();
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

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
      branches: ['admin', 'cyber_security', 'web_dev'],
    },
    { name: 'Personnel', path: '/users', icon: '👥', branches: ['admin'] },
  ].filter(
    (item) =>
      user?.permissions?.includes('SUPER_ADMIN') ||
      item.branches.includes(user?.branch)
  );

  return (
    <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 flex flex-col h-screen transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-black text-xl">W</span>
            </div>
            <div>
              {/* Change text-slate-900 to dark:text-indigo-500 (or blue-500) */}
              <h1 className="text-xl font-black text-slate-900 dark:text-indigo-500 tracking-tighter transition-colors duration-300">
                WEBFLARE
              </h1>
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Admin OS
              </p>
            </div>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-slate-400">
            ✕
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 1024) closeSidebar();
            }}
            className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              location.pathname === item.path
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900'
            }`}>
            <span className="mr-3 text-lg opacity-80">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-zinc-800">
        {/* User Card: Swapped bg-slate-50 for dark:bg-zinc-800/50 */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-transparent dark:border-zinc-800 transition-colors duration-300">
          <img
            src={`https://ui-avatars.com/api/?name=${user?.firstName}&background=6366f1&color=fff`}
            className="w-8 h-8 rounded-full border border-white/10"
            alt="user"
          />
          <div className="truncate">
            <p className="text-[10px] font-black text-slate-900 dark:text-zinc-100 uppercase tracking-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase truncate">
              {user?.role?.name || 'Authorized Personnel'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-xs font-black text-slate-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors uppercase tracking-widest">
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
