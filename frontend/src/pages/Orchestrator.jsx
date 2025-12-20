import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Orchestrator = ({ user }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [availablePerms, setAvailablePerms] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Role Form State
  const [newRole, setNewRole] = useState({ name: '', branch: 'web_dev' });

  const isAdmin = user?.branch === 'admin';

  const fetchData = async () => {
    try {
      const [uRes, rRes, pRes] = await Promise.all([
        api.get('/orchestrator/users', { withCredentials: true }),
        api.get('/orchestrator/roles', { withCredentials: true }),
        api.get('/orchestrator/permissions/list', {
          withCredentials: true,
        }),
      ]);
      setUsers(uRes.data);
      setRoles(rRes.data);
      setAvailablePerms(pRes.data);
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
      await api.post('/orchestrator/roles', newRole, {
        withCredentials: true,
      });
      setShowRoleModal(false);
      setNewRole({ name: '', branch: 'web_dev' });
      fetchData();
    } catch (err) {
      alert(
        'Creation failed: ' + (err.response?.data?.message || 'Internal Error')
      );
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-10 md:p-20 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-bold animate-pulse uppercase tracking-tighter text-center">
          Synchronizing Security Protocols...
        </p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 transition-colors duration-300">
      {/* HEADER: Stacked on mobile, row on desktop */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Orchestrator
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Authorized Authority:{' '}
            <span className="uppercase font-mono text-blue-600 dark:text-blue-400">
              {user.branch} branch
            </span>
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowRoleModal(true)}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 md:py-3 rounded-xl font-bold transition-all transform active:scale-95 shadow-xl shadow-blue-500/20">
            + Create New Role
          </button>
        )}
      </div>

      {/* MODAL: Added p-4 to ensure it doesn't touch screen edges on small phones */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl transition-all">
            <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white">
              Provision New Role
            </h2>
            <form onSubmit={handleCreateRole} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-widest">
                  Role Designation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Senior Systems Analyst"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-slate-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-widest">
                  Branch Affiliation
                </label>
                <select
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-slate-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 outline-none appearance-none"
                  value={newRole.branch}
                  onChange={(e) =>
                    setNewRole({ ...newRole, branch: e.target.value })
                  }>
                  <option value="web_dev">Web Development</option>
                  <option value="cyber_security">Cybersecurity</option>
                  <option value="admin">System Administration</option>
                </select>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                  <span className="font-bold">Inheritance Active:</span> This
                  role will automatically inherit base permissions.
                </p>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-bold transition-colors py-2">
                  Discard
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 px-8 py-3 rounded-xl font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all">
                  Commit Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NAVIGATION TABS: Overflow-x-auto handles many tabs on small screens */}
      <div className="flex overflow-x-auto space-x-8 md:space-x-12 border-b border-zinc-200 dark:border-zinc-800 mb-10 no-scrollbar">
        {['users', 'roles'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 text-xs font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
              activeTab === tab
                ? 'text-blue-600'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
            }`}>
            {tab === 'users' ? 'Personnel Registry' : 'Permission Matrix'}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'users' ? (
          <UserTable users={users} roles={roles} setUsers={setUsers} />
        ) : (
          <RoleMatrix
            roles={roles}
            setRoles={setRoles}
            availablePerms={availablePerms}
          />
        )}
      </div>
    </div>
  );
};

/* --- USER REGISTRY TABLE --- */
const UserTable = ({ users, roles, setUsers }) => {
  const updateRole = async (userId, roleId) => {
    try {
      await api.patch(
        `/orchestrator/users/${userId}/role`,
        { roleId },
        { withCredentials: true }
      );
      const roleName = roles.find((r) => r._id === roleId)?.name;
      setUsers(
        users.map((u) =>
          u._id === userId
            ? { ...u, role: { ...u.role, name: roleName, _id: roleId } }
            : u
        )
      );
    } catch (err) {
      alert('Role update rejected: Security policy mismatch.');
    }
  };

  return (
    /* WRAPPER: Added overflow-x-auto to allow horizontal scrolling on mobile */
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-150">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-6 md:px-8 py-6">Identity Profile</th>
              <th className="px-6 md:px-8 py-6">Branch Access</th>
              <th className="px-6 md:px-8 py-6">Active Designation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {users.map((u) => (
              <tr
                key={u._id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                <td className="px-6 md:px-8 py-6">
                  <div className="font-black text-slate-900 dark:text-white">
                    {u.firstName} {u.lastName}
                  </div>
                  <div className="text-xs text-zinc-400 font-mono">
                    ID: {u.userName}
                  </div>
                </td>
                <td className="px-6 md:px-8 py-6">
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-lg uppercase border border-blue-100 dark:border-blue-500/20">
                    {u.branch}
                  </span>
                </td>
                <td className="px-6 md:px-8 py-6">
                  <select
                    className="bg-transparent text-sm font-bold text-slate-700 dark:text-zinc-300 focus:ring-0 outline-none cursor-pointer hover:text-blue-600 transition-colors min-w-35"
                    value={u.role?._id}
                    onChange={(e) => updateRole(u._id, e.target.value)}>
                    {roles
                      .filter((r) => r.branch === u.branch)
                      .map((r) => (
                        <option
                          key={r._id}
                          value={r._id}
                          className="bg-white dark:bg-zinc-900">
                          {r.name}
                        </option>
                      ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* --- PERMISSION MATRIX --- */
const RoleMatrix = ({ roles, setRoles, availablePerms }) => {
  const togglePerm = async (role, perm) => {
    const updated = role.permissions.includes(perm)
      ? role.permissions.filter((p) => p !== perm)
      : [...role.permissions, perm];

    try {
      await api.patch(
        `/orchestrator/roles/${role._id}`,
        { permissions: updated },
        { withCredentials: true }
      );
      setRoles(
        roles.map((r) =>
          r._id === role._id ? { ...r, permissions: updated } : r
        )
      );
    } catch (err) {
      alert('Permission change denied.');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:gap-8">
      {roles.map((role) => (
        <div
          key={role._id}
          className="p-6 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl md:rounded-4xl shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {role.name}
              </h3>
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mt-1">
                {role.branch} branch authority
              </p>
            </div>
            {role.isSystemRole && (
              <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-black px-4 py-1.5 rounded-full border border-amber-200 dark:border-amber-500/20 uppercase">
                System Role
              </span>
            )}
          </div>

          {/* ADAPTIVE GRID: Adjusted columns for all screen breakpoints */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {availablePerms.map((p) => (
              <label
                key={p}
                className={`flex items-center p-4 rounded-2xl border transition-all cursor-pointer group ${
                  role.permissions.includes(p)
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/5'
                    : 'border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}>
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    disabled={role.isSystemRole}
                    checked={role.permissions.includes(p)}
                    onChange={() => togglePerm(role, p)}
                    className="w-5 h-5 rounded-lg border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-blue-600 focus:ring-blue-500 transition-all disabled:opacity-30"
                  />
                </div>
                <span
                  className={`ml-4 text-[11px] font-black uppercase tracking-tight transition-colors ${
                    role.permissions.includes(p)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                  }`}>
                  {p.replace(/_/g, ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orchestrator;
