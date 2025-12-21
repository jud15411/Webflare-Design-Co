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
      name: 'Projects',
      path: '/projects',
      icon: '📂',
      branches: ['admin', 'cyber_security', 'web_dev'],
      // Specific permissions required for non-admins
      requiredPermissions: ['web_view_projects', 'cyber_view_projects'],
    },
    {
      name: 'Clients',
      path: '/clients',
      icon: '🏢',
      branches: ['admin', 'cyber_security', 'web_dev'],
      // Global permission required for non-admins
      requiredPermissions: ['global_view_client_registry'],
    },
    {
      name: 'Personnel',
      path: '/users',
      icon: '👥',
      branches: ['admin'],
    },
  ].filter((item) => {
    // 1. SuperAdmin bypass: If they have the wildcard, show everything
    if (user?.permissions?.includes('*')) return true;

    // 2. Branch Check: Is the user's branch allowed to see this item?
    const branchAllowed = item.branches.includes(user?.branch);
    if (!branchAllowed) return false;

    // 3. Admin Branch bypass: Admins see all items allowed for their branch regardless of specific permissions
    if (user?.branch === 'admin') return true;

    // 4. Permission Check: For non-admins, does their role have the required permission?
    if (item.requiredPermissions) {
      return item.requiredPermissions.some((p) =>
        user?.permissions?.includes(p)
      );
    }

    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
            W
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Webflare
          </span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={`flex items-center px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-300'
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
              {user?.role || 'Authorized Personnel'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200">
          <span>🚪</span>
          Terminate Session
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
