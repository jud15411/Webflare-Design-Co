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
    <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col h-screen transition-colors">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">
              W
            </div>
            <span className="font-black text-slate-800 dark:text-white">
              WEBFLARE
            </span>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-slate-400">
            ✕
          </button>
        </div>

        {/* MOBILE LOGOUT */}
        <button
          onClick={handleLogout}
          className="lg:hidden w-full mb-4 flex items-center px-4 py-3 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20 shadow-sm">
          <span className="mr-3 text-lg">⬅️</span> Logout
        </button>
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
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}>
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl">
          <img
            src={`https://ui-avatars.com/api/?name=${user?.firstName}`}
            className="w-8 h-8 rounded-full"
            alt="user"
          />
          <div className="truncate">
            <p className="text-[10px] font-black text-slate-800 dark:text-zinc-200 uppercase">
              {user?.firstName}
            </p>
            <p className="text-[9px] font-bold text-indigo-500 uppercase">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
