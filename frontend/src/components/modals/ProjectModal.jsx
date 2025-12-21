import React, { useState } from 'react';

const ProjectModal = ({
  isOpen,
  onClose,
  onSubmit,
  clients,
  user,
  activeBranch,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    clientId: '', // Internally tracked
    branch: user?.branch === 'admin' ? activeBranch : user?.branch,
    status: 'active', // Added to support model default
    configuration: {
      environment: 'production',
      priority: 'medium',
      tags: '',
    },
  });

  const [clientSearch, setClientSearch] = useState('');

  if (!isOpen) return null;

  const filteredClients = Array.isArray(clients)
    ? clients.filter((c) =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase())
      )
    : [];

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedId =
      typeof formData.clientId === 'object'
        ? formData.clientId.toString()
        : formData.clientId;

    // BACKEND ALIGNMENT: Map 'clientId' to 'client' to match Project.js
    const finalPayload = {
      name: formData.name,
      code: formData.code,
      description: formData.description,
      branch: formData.branch,
      status: formData.status,
      client: selectedId, // Required field in model
      // Any extra configs can be passed here
      metadata: {
        ...formData.configuration,
        tags: formData.configuration.tags.split(',').map((t) => t.trim()),
      },
    };

    if (!finalPayload.client) {
      alert('Selection Error: Please attach a client from the registry.');
      return;
    }

    onSubmit(finalPayload);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Initialize Project Manifest
            </h3>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">
              Branch: {formData.branch.replace('_', ' ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-rose-500 text-xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Identity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                Project Name
              </label>
              <input
                required
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 text-xs font-bold"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                Project Code
              </label>
              <input
                required
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 text-xs font-bold"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
              />
            </div>
          </div>

          {/* Section 2: Client Selection (The Required Relation) */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
              Attach Client Registry
            </label>
            <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-zinc-900">
              <input
                type="text"
                placeholder="Filter Registry..."
                className="w-full bg-transparent p-4 text-xs font-bold border-b border-slate-200 dark:border-zinc-800 outline-none"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
              <div className="max-h-32 overflow-y-auto p-2 space-y-1">
                {filteredClients.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => {
                      console.log('Selected Client ID:', c._id); // Add this log
                      const idAsString = String(c._id);
                      setFormData({ ...formData, clientId: idAsString });
                    }}
                    className={`p-3 rounded-xl text-[10px] font-black uppercase cursor-pointer transition-all ${
                      formData.clientId === c._id
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500'
                    }`}>
                    {c.name} {formData.clientId === c._id && '✓'}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Configurations */}
          <div className="bg-slate-50 dark:bg-zinc-900/50 p-6 rounded-4xl border border-slate-100 dark:border-zinc-800 space-y-4">
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
              Technical Configurations
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">
                  Priority Level
                </label>
                <select
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-bold appearance-none"
                  value={formData.configuration.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      configuration: {
                        ...formData.configuration,
                        priority: e.target.value,
                      },
                    })
                  }>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">
                  Project Status
                </label>
                <select
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-bold appearance-none"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2">
                Meta Tags (Comma Separated)
              </label>
              <input
                placeholder="api, frontend, security"
                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-bold"
                value={formData.configuration.tags}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    configuration: {
                      ...formData.configuration,
                      tags: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
              Scope Summary
            </label>
            <textarea
              rows="2"
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 text-xs font-bold"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50">
              Discard
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
              Commit Manifest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
