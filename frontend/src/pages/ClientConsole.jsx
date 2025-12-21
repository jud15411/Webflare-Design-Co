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

  // --- UPDATED PERMISSION LOGIC ---
  // Matches your JSON: { "user": { "permissions": ["*"], "branch": "admin" ... } }
  const userPermissions = user?.permissions || [];
  const isSuperAdmin = userPermissions.includes('*');

  const hasPermission = (perm) => {
    if (isSuperAdmin) return true;
    return userPermissions.includes(perm);
  };

  const canEditCurrentTab = () => {
    if (isSuperAdmin) return true; // Master Override

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
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
            {client.name[0]}
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter dark:text-white">
              {client.name}
            </h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
              {client.industry} // {client.status}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {canEditCurrentTab() && !isEditing && (
            <button
              onClick={() => {
                setEditData({ ...client });
                setIsEditing(true);
              }}
              className="bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase">
              Edit {activeTab}
            </button>
          )}
          {isEditing && (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="text-zinc-400 text-[10px] font-black uppercase">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase">
                Save {activeTab}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        {['overview', 'web', 'cyber', 'admin'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setIsEditing(false);
            }}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div className="bg-white dark:bg-zinc-900 p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm min-h-125">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-10">
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

        {/* WEB TAB - All Model Fields */}
        {activeTab === 'web' && (
          <div className="grid grid-cols-2 gap-10">
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
                  <p className="font-bold dark:text-white">
                    {client.webData?.productionUrl || 'Not Set'}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase">
                  Staging URL
                </label>
                {isEditing ? (
                  <input
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl dark:text-white border-none"
                    value={editData.webData?.stagingUrl || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        webData: {
                          ...editData.webData,
                          stagingUrl: e.target.value,
                        },
                      })
                    }
                  />
                ) : (
                  <p className="font-bold dark:text-white">
                    {client.webData?.stagingUrl || 'Not Set'}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase">
                  Hosting Provider
                </label>
                {isEditing ? (
                  <input
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl dark:text-white border-none"
                    value={editData.webData?.hostingProvider || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        webData: {
                          ...editData.webData,
                          hostingProvider: e.target.value,
                        },
                      })
                    }
                  />
                ) : (
                  <p className="font-bold dark:text-white">
                    {client.webData?.hostingProvider || 'Unknown'}
                  </p>
                )}
              </div>
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
                  <div className="flex gap-2">
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

        {/* CYBER TAB - All Model Fields */}
        {activeTab === 'cyber' && (
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase">
                  Security Tier
                </label>
                {isEditing ? (
                  <input
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl dark:text-white border-none"
                    value={editData.cyberData?.securityTier || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        cyberData: {
                          ...editData.cyberData,
                          securityTier: e.target.value,
                        },
                      })
                    }
                  />
                ) : (
                  <p className="font-bold text-emerald-500">
                    {client.cyberData?.securityTier || 'Standard'}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase">
                  Compliance Requirements
                </label>
                {isEditing ? (
                  <input
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl dark:text-white border-none"
                    value={
                      editData.cyberData?.complianceRequirements?.join(', ') ||
                      ''
                    }
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        cyberData: {
                          ...editData.cyberData,
                          complianceRequirements: e.target.value
                            .split(',')
                            .map((s) => s.trim()),
                        },
                      })
                    }
                  />
                ) : (
                  <p className="font-bold dark:text-white">
                    {client.cyberData?.complianceRequirements?.join(', ') ||
                      'None'}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase">
                  IP Whitelist
                </label>
                {isEditing ? (
                  <textarea
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl dark:text-white border-none font-mono text-xs"
                    rows="4"
                    value={editData.cyberData?.ipWhitelist?.join('\n') || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        cyberData: {
                          ...editData.cyberData,
                          ipWhitelist: e.target.value.split('\n'),
                        },
                      })
                    }
                  />
                ) : (
                  <p className="font-mono text-xs text-zinc-400">
                    {client.cyberData?.ipWhitelist?.join(', ') || 'Global'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ADMIN TAB - All Model Fields */}
        {activeTab === 'admin' && (
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase">
                  Contract Annual Value
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl dark:text-white border-none"
                    value={editData.adminData?.contractValue || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        adminData: {
                          ...editData.adminData,
                          contractValue: e.target.value,
                        },
                      })
                    }
                  />
                ) : (
                  <p className="text-2xl font-black dark:text-white">
                    ${client.adminData?.contractValue?.toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase">
                  Billing Cycle
                </label>
                {isEditing ? (
                  <select
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl dark:text-white border-none"
                    value={editData.adminData?.billingCycle}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        adminData: {
                          ...editData.adminData,
                          billingCycle: e.target.value,
                        },
                      })
                    }>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                  </select>
                ) : (
                  <p className="font-bold dark:text-white">
                    {client.adminData?.billingCycle || 'N/A'}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <label className="text-[10px] font-black text-indigo-500 uppercase block mb-4">
                Primary Contact
              </label>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-zinc-400 block">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      className="w-full bg-white dark:bg-zinc-900 mt-1 p-2 rounded-lg text-sm"
                      value={editData.adminData?.primaryContact?.name || ''}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          adminData: {
                            ...editData.adminData,
                            primaryContact: {
                              ...editData.adminData.primaryContact,
                              name: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm font-bold dark:text-white">
                      {client.adminData?.primaryContact?.name || '---'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      className="w-full bg-white dark:bg-zinc-900 mt-1 p-2 rounded-lg text-sm"
                      value={editData.adminData?.primaryContact?.email || ''}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          adminData: {
                            ...editData.adminData,
                            primaryContact: {
                              ...editData.adminData.primaryContact,
                              email: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm font-bold dark:text-white">
                      {client.adminData?.primaryContact?.email || '---'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientConsole;
