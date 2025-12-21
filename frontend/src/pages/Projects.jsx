import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import ProjectModal from '../components/modals/ProjectModal';

const Projects = ({ user }) => {
  // UI State
  const [activeBranch, setActiveBranch] = useState(
    user?.branch === 'admin' ? 'web_dev' : user?.branch
  );
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data State
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  // Permission Logic
  const canCreate =
    user?.permissions?.includes('*') ||
    user?.permissions?.includes('web_create_project') ||
    user?.permissions?.includes('cyber_create_project');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        api.get(`/projects?branch=${activeBranch}`),
        api.get('/clients/registry'),
      ]);

      setProjects(pRes.data);

      // FIX: Extract the array from cRes.data.data
      const clientList = cRes.data.data || [];
      setClients(clientList);
    } catch (err) {
      console.error('Operational Fetch Error:', err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeBranch]);

  const handleCreateProject = async (formData) => {
    try {
      await api.post('/projects', formData);
      toast.success('Project manifest committed successfully');
      setIsModalOpen(false);
      fetchData(); // Refresh list after successful creation
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Failed to initialize project';
      toast.error(errorMsg);
    }
  };

  // Filter projects by name or project code
  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-indigo-500 uppercase tracking-tighter transition-colors">
            Operational Projects
          </h1>
          <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.3em] mt-1">
            {activeBranch.replace('_', ' ')} Workstreams
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Admin Branch Switcher */}
          {user?.branch === 'admin' && (
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200 dark:border-zinc-700">
              <button
                onClick={() => setActiveBranch('web_dev')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeBranch === 'web_dev'
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700'
                }`}>
                Web Dev
              </button>
              <button
                onClick={() => setActiveBranch('cyber_security')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeBranch === 'cyber_security'
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700'
                }`}>
                Cyber Security
              </button>
            </div>
          )}

          {/* Create Button */}
          {canCreate && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2">
              <span>+</span> Initialize Project
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search project name or hex code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-6 py-4 text-xs font-bold text-slate-700 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-700 font-black text-[10px] uppercase tracking-widest">
          {filteredProjects.length} Records Found
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
        {loading ? (
          // Skeleton Loader
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 animate-pulse"
            />
          ))
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div
              key={project._id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden">
              {/* Branch Accent Tag */}
              <div
                className={`absolute top-0 right-0 px-6 py-2 rounded-bl-2xl text-[8px] font-black uppercase tracking-widest ${
                  project.branch === 'web_dev'
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                {project.branch.replace('_', ' ')}
              </div>

              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-2xl shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  {project.branch === 'web_dev' ? '🌐' : '🛡️'}
                </div>
                <span className="text-[10px] font-black uppercase text-slate-300 dark:text-zinc-600 mt-2">
                  #{project.code || 'NO-CODE'}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 uppercase tracking-tighter mb-1 group-hover:text-indigo-500 transition-colors">
                {project.name}
              </h3>

              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-4">
                Client: {project.client?.name || 'Internal Dev'}
              </p>

              <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mb-8 font-medium leading-relaxed">
                {project.description ||
                  'No operational parameters defined for this project manifest.'}
              </p>

              <div className="pt-6 border-t border-slate-50 dark:border-zinc-800 flex justify-between items-center">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[8px] font-black text-indigo-600">
                    {project.createdBy?.userName
                      ?.substring(0, 2)
                      .toUpperCase() || '??'}
                  </div>
                </div>
                <button className="text-[10px] font-black text-slate-400 hover:text-indigo-500 uppercase tracking-widest transition-colors">
                  View Manifest
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-slate-50 dark:bg-zinc-900/50 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[3rem] py-24 text-center">
            <span className="text-5xl mb-6 block grayscale">📂</span>
            <h3 className="text-lg font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest">
              Zero Projects Found
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
              No active records in the {activeBranch} database
            </p>
          </div>
        )}
      </div>

      {/* Modal Integration */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
        clients={clients}
        user={user}
        activeBranch={activeBranch}
      />
    </div>
  );
};

export default Projects;
