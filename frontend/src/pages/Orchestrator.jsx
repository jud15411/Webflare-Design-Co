import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Orchestrator = ({ user }) => {
  // Tabs & UI State
  const [activeTab, setActiveTab] = useState('users');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Search State
  const [userSearch, setUserSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [permSearch, setPermSearch] = useState('');

  // Data State
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [availablePerms, setAvailablePerms] = useState([]);

  // Selection State for Matrix Layout
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  // New Role Form State
  const [newRole, setNewRole] = useState({
    name: '',
    branch: user?.branch === 'admin' ? 'web_dev' : user?.branch,
  });

  const isAdmin = user?.branch === 'admin';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, rRes, pRes] = await Promise.all([
        api.get('/orchestrator/users'),
        api.get('/orchestrator/roles'),
        api.get('/orchestrator/permissions/list'),
      ]);

      setUsers(uRes.data);
      setRoles(rRes.data);

      const permsData = Array.isArray(pRes.data)
        ? pRes.data
        : Object.values(pRes.data || {});
      setAvailablePerms(permsData);

      if (rRes.data.length > 0 && !selectedRoleId) {
        setSelectedRoleId(rRes.data[0]._id);
      }
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/orchestrator/roles', newRole);
      setRoles([...roles, res.data]);
      setSelectedRoleId(res.data._id);
      setShowRoleModal(false);
      setNewRole({ name: '', branch: isAdmin ? 'web_dev' : user?.branch });
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating role');
    }
  };

  const togglePerm = async (role, permission) => {
    if (role.isSystemRole) return;

    const hasPerm = role.permissions.includes(permission);
    const updatedPerms = hasPerm
      ? role.permissions.filter((p) => p !== permission)
      : [...role.permissions, permission];

    try {
      const res = await api.patch(`/orchestrator/roles/${role._id}`, {
        permissions: updatedPerms,
      });
      setRoles(roles.map((r) => (r._id === role._id ? res.data : r)));
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const activeRole =
    roles.find((r) => r._id === selectedRoleId) ||
    (roles.length > 0 ? roles[0] : null);

  // Filtered Lists
  const filteredUsers = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.userName}`
      .toLowerCase()
      .includes(userSearch.toLowerCase())
  );

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(roleSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 md:px-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-indigo-500 uppercase tracking-tighter">
            Personnel Orchestrator
          </h1>
          <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.3em] mt-1">
            Access Control & Registry Management
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200 dark:border-zinc-700 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-zinc-400'
            }`}>
            Personnel
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'roles'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-zinc-400'
            }`}>
            Permission Matrix
          </button>
        </div>
      </div>

      {/* Personnel Tab Content */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search identity or username..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-6 py-4 text-xs font-bold text-slate-700 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
            />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-175">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800">
                    <th className="p-6 text-left text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                      Identity
                    </th>
                    <th className="p-6 text-left text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                      Branch Scope
                    </th>
                    <th className="p-6 text-left text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                      Security Role
                    </th>
                    <th className="p-6 text-right text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u._id}
                      className="group hover:bg-slate-50/50 dark:hover:bg-indigo-500/5">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xs shrink-0 uppercase">
                            {u.userName.substring(0, 2)}
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="font-bold text-slate-700 dark:text-zinc-100">
                              {u.firstName} {u.lastName}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">
                              @{u.userName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 text-[9px] font-black uppercase rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                          {u.branch.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-6 text-xs font-bold text-indigo-500 uppercase">
                        {u.role?.name || 'Unassigned'}
                      </td>
                      <td className="p-6 text-right">
                        <button className="text-[10px] font-black text-slate-400 hover:text-indigo-500 uppercase tracking-widest transition-colors">
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Permission Matrix Tab Content */}
      {activeTab === 'roles' && (
        <div className="flex flex-col lg:flex-row bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-sm min-h-150">
          {/* Mobile Role Selector / Sidebar */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-zinc-800 flex flex-col bg-slate-50/30 dark:bg-zinc-950/20">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                  Roles
                </h3>
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                  +
                </button>
              </div>
              <input
                type="text"
                placeholder="Search roles..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-[10px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            {/* Horizontal scroll for roles on mobile, vertical for desktop */}
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto p-4 gap-3 lg:gap-2 no-scrollbar lg:h-125">
              {filteredRoles.map((role) => (
                <button
                  key={role._id}
                  onClick={() => setSelectedRoleId(role._id)}
                  className={`shrink-0 lg:shrink w-48 lg:w-full flex flex-col items-start p-4 rounded-2xl transition-all border ${
                    selectedRoleId === role._id
                      ? 'bg-white dark:bg-zinc-800 shadow-md border-indigo-200 dark:border-indigo-500/30'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800/50 border-transparent'
                  }`}>
                  <span
                    className={`text-xs font-black uppercase tracking-tight ${
                      selectedRoleId === role._id
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}>
                    {role.name}
                  </span>
                  <span className="text-[8px] font-bold opacity-40 uppercase mt-1">
                    Scope: {role.branch}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Matrix Content Area */}
          <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-hidden">
            {activeRole ? (
              <>
                <div className="p-6 md:p-8 border-b border-slate-50 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100 uppercase tracking-tighter">
                      {activeRole.name}
                    </h2>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">
                      {activeRole.isSystemRole
                        ? 'Protected System Role'
                        : 'Custom Permission Set'}
                    </p>
                  </div>
                  <input
                    type="text"
                    placeholder="Search permissions..."
                    value={permSearch}
                    onChange={(e) => setPermSearch(e.target.value)}
                    className="w-full sm:w-64 bg-slate-50 dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  />
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {availablePerms
                      .filter((p) => {
                        const matchesSearch = p
                          .toLowerCase()
                          .includes(permSearch.toLowerCase());
                        if (!matchesSearch) return false;
                        if (p === '*' || p.startsWith('global_')) return true;
                        if (activeRole.branch === 'admin')
                          return p.startsWith('sys_');
                        if (activeRole.branch === 'web_dev')
                          return p.startsWith('web_');
                        if (activeRole.branch === 'cyber_security')
                          return p.startsWith('cyber_');
                        return false;
                      })
                      .map((p) => (
                        <label
                          key={p}
                          className={`flex items-center p-4 rounded-2xl border transition-all cursor-pointer group ${
                            activeRole.permissions.includes(p)
                              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10'
                              : 'border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                          } ${
                            activeRole.isSystemRole
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}>
                          <input
                            type="checkbox"
                            disabled={activeRole.isSystemRole}
                            checked={activeRole.permissions.includes(p)}
                            onChange={() => togglePerm(activeRole, p)}
                            className="w-5 h-5 rounded-lg border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="ml-4 flex flex-col truncate">
                            <span
                              className={`text-[10px] font-black uppercase tracking-tight ${
                                activeRole.permissions.includes(p)
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-slate-500 dark:text-zinc-500'
                              }`}>
                              {p.split('_').slice(1).join(' ')}
                            </span>
                            <span className="text-[8px] font-bold text-slate-400 dark:text-zinc-600 uppercase">
                              {p.split('_')[0]} Manifest
                            </span>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400">
                <span className="text-4xl mb-4">🛡️</span>
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Select a role profile
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Role Creation Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-4xl p-8 shadow-2xl border border-white/10 dark:border-zinc-800">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">
              New Role Identity
            </h3>
            <form onSubmit={handleCreateRole} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Role Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. Lead Developer"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                />
              </div>

              {isAdmin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Branch Access
                  </label>
                  <select
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold outline-none"
                    value={newRole.branch}
                    onChange={(e) =>
                      setNewRole({ ...newRole, branch: e.target.value })
                    }>
                    <option value="web_dev">Web Development</option>
                    <option value="cyber_security">Cybersecurity</option>
                    <option value="admin">Administrative</option>
                  </select>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                  Initialize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orchestrator;
