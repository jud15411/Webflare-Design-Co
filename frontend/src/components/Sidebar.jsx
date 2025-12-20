import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ user, closeSidebar }) => {
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
      branches: ['admin', 'cyber_security', 'web_dev'],
    },
    { name: 'Personnel', path: '/users', icon: '👥', branches: ['admin'] },
    // ... add others as needed
  ].filter(
    (item) =>
      user?.permissions?.includes('SUPER_ADMIN') ||
      item.branches.includes(user?.branch)
  );

  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col h-screen transition-colors">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">
            W
          </div>
          <span className="font-black text-xl text-slate-800 dark:text-zinc-100 tracking-tighter">
            WEBFLARE
          </span>
        </div>
        {/* CLOSE BUTTON FOR MOBILE */}
        <button onClick={closeSidebar} className="lg:hidden text-slate-400">
          ✕
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
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm'
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
            src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=6366f1&color=fff`}
            className="w-9 h-9 rounded-full"
            alt="profile"
          />
          <div className="truncate">
            <p className="text-xs font-black text-slate-800 dark:text-zinc-200 truncate uppercase tracking-tighter">
              {user?.firstName}
            </p>
            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
