import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const ClientConsole = ({ user }) => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const res = await api.get(`/clients/${id}`);
      setClient(res.data.data || res.data);
    } catch (err) {
      console.error('Error fetching client:', err);
    } finally {
      setLoading(false);
    }
  };

  const userPermissions = user?.permissions || [];
  const isSuperAdmin = userPermissions.includes('*');

  const hasPermission = (perm) => {
    if (isSuperAdmin) return true;
    return userPermissions.includes(perm);
  };

  const canEditCurrentTab = () => {
    if (isSuperAdmin) return true;
    if (activeTab === 'overview' || activeTab === 'admin') {
      return user.branch === 'admin' && hasPermission('sys_manage_clients');
    }
    if (activeTab === 'web') {
      return (
        (user.branch === 'web_dev' || user.branch === 'admin') &&
        hasPermission('web_manage_clients')
      );
    }
    if (activeTab === 'cyber') {
      return (
        (user.branch === 'cyber_security' || user.branch === 'admin') &&
        hasPermission('cyber_manage_clients')
      );
    }
    return false;
  };

  const handleSave = async () => {
    try {
      await api.patch(`/clients/${id}`, { updates: editData });
      setIsEditing(false);
      fetchClient();
    } catch (err) {
      alert(err.response?.data?.message || 'Unauthorized Action');
    }
  };

  if (loading || !client)
    return (
      <div className="p-20 font-black animate-pulse text-center">
        INITIALIZING SECURE CONSOLE...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 md:px-0">
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shrink-0">
            {client.name[0]}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter dark:text-white">
              {client.name}
            </h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
              {client.industry} // {client.status}
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto justify-center">
          {canEditCurrentTab() && !isEditing && (
            <button
              onClick={() => {
                setEditData({ ...client });
                setIsEditing(true);
              }}
              className="w-full md:w-auto bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase">
              Edit {activeTab}
            </button>
          )}
          {isEditing && (
            <div className="flex gap-3 w-full justify-center">
              <button
                onClick={() => setIsEditing(false)}
                className="text-zinc-400 text-[10px] font-black uppercase px-4">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase">
                Save {activeTab}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TABS - Horizontal Scroll for mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
        {['overview', 'web', 'cyber', 'admin'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setIsEditing(false);
            }}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div className="bg-white dark:bg-zinc-900 p-6 md:p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm min-h-125">
        {/* Responsive Grid applied to all tabs: grid-cols-1 on small, md:grid-cols-2 on desktop */}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-400 uppercase">
                Client Name
              </label>
              {isEditing ? (
                <input
                  className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl dark:text-white border-none"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                />
              ) : (
                <p className="text-lg font-bold dark:text-white">
                  {client.name}
                </p>
              )}
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-400 uppercase">
                Status
              </label>
              {isEditing ? (
                <select
                  className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl dark:text-white border-none"
                  value={editData.status}
                  onChange={(e) =>
                    setEditData({ ...editData, status: e.target.value })
                  }>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              ) : (
                <p className="text-lg font-bold text-indigo-500">
                  {client.status}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Similar pattern applied to Web, Cyber, and Admin tabs */}
        {activeTab === 'web' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase">
                  Production URL
                </label>
                {isEditing ? (
                  <input
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl dark:text-white border-none"
                    value={editData.webData?.productionUrl || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        webData: {
                          ...editData.webData,
                          productionUrl: e.target.value,
                        },
                      })
                    }
                  />
                ) : (
                  <p className="font-bold dark:text-white break-all">
                    {client.webData?.productionUrl || 'Not Set'}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase">
                  Tech Stack (CSV)
                </label>
                {isEditing ? (
                  <input
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl dark:text-white border-none"
                    value={editData.webData?.techStack?.join(', ') || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        webData: {
                          ...editData.webData,
                          techStack: e.target.value
                            .split(',')
                            .map((s) => s.trim()),
                        },
                      })
                    }
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {client.webData?.techStack?.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-1 bg-zinc-800 text-[10px] font-black rounded text-zinc-400 uppercase">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Note: In your real file, repeat the grid-cols-1 md:grid-cols-2 for Cyber and Admin sections as well */}
        {activeTab === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {/* Content here similarly updated to grid-cols-1 */}
            <div className="space-y-6">
              <label className="text-[10px] font-black text-zinc-400 uppercase">
                Contract Annual Value
              </label>
              <p className="text-2xl font-black dark:text-white">
                ${client.adminData?.contractValue?.toLocaleString()}
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <label className="text-[10px] font-black text-indigo-500 uppercase block mb-4">
                Primary Contact
              </label>
              <p className="text-sm font-bold dark:text-white">
                {client.adminData?.primaryContact?.name || '---'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientConsole;
