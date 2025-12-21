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
    {
      name: 'Clients',
      path: '/clients',
      icon: '🏢',
      // Accessible to all branches; the Controller handles data siloing
      branches: ['admin', 'cyber_security', 'web_dev'],
      permission: 'global_view_client_registry',
    },
    {
      name: 'Personnel',
      path: '/users',
      icon: '👥',
      // Strictly for Admin branch to manage users/roles
      branches: ['admin'],
    },
  ].filter((item) => {
    const userPerms = user?.permissions || [];

    // 1. Super Admin bypass
    if (userPerms.includes('*')) return true;

    // 2. If item has a specific permission requirement (like Clients)
    if (item.permission) {
      return userPerms.includes(item.permission);
    }

    // 3. Fallback to branch-based visibility (for Dashboard/Personnel)
    return item.branches?.includes(user?.branch);
  });

  return (
    <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 flex flex-col h-screen transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-black text-xl">W</span>
            </div>
            <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              WebFlare
            </span>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={`flex items-center px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-300'
              }`}>
              <span className="mr-3 text-lg opacity-80">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-100 dark:border-zinc-800">
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
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">
          <span>Logout</span>
          <span>➜</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
