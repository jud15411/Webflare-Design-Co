import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ClientModal from '../components/modals/ClientModal';

const ClientRegistry = ({ user }) => {
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clients/registry');
      setClients(res.data.data || []);
    } catch (err) {
      console.error('Registry Load Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const userPerms = user?.permissions || [];
  const isSuperAdmin = userPerms.includes('*');

  const canViewConsole =
    isSuperAdmin ||
    userPerms.includes('sys_manage_clients') ||
    userPerms.includes('web_manage_clients') ||
    userPerms.includes('cyber_manage_clients');

  const canRegister =
    isSuperAdmin ||
    (user.branch === 'admin' && userPerms.includes('sys_manage_clients'));

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-indigo-500 uppercase tracking-tighter">
            Client Registry
          </h1>
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.3em] mt-1">
            Global Infrastructure Index
          </p>
        </div>

        {canRegister && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
            + Register Client
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 md:p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Querying Database...
            </p>
          </div>
        ) : clients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-150">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800">
                  <th className="p-4 md:p-6 text-left text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                    Client Identity
                  </th>
                  <th className="p-4 md:p-6 text-left text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                    Industry
                  </th>
                  <th className="p-4 md:p-6 text-left text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="p-4 md:p-6 text-right text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                    Operations
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {clients.map((client) => (
                  <tr
                    key={client._id}
                    className="group hover:bg-slate-50/50 dark:hover:bg-indigo-500/5 transition-colors">
                    <td className="p-4 md:p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-black text-indigo-500 border border-slate-200 dark:border-zinc-700">
                          {client.logoUrl ? (
                            <img
                              src={client.logoUrl}
                              alt=""
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            client.name[0]
                          )}
                        </div>
                        <span className="font-bold text-sm md:text-base text-slate-700 dark:text-zinc-100 whitespace-nowrap">
                          {client.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 md:p-6 text-xs md:text-sm font-medium text-slate-500 dark:text-zinc-400">
                      {client.industry}
                    </td>
                    <td className="p-4 md:p-6">
                      <span
                        className={`px-3 py-1 text-[9px] md:text-[10px] font-black uppercase rounded-lg border ${
                          client.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                        }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="p-4 md:p-6 text-right">
                      {canViewConsole ? (
                        <button
                          onClick={() => navigate(`/clients/${client._id}`)}
                          className="px-3 md:px-4 py-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all uppercase tracking-tighter whitespace-nowrap">
                          View Console →
                        </button>
                      ) : (
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest opacity-50">
                          Restricted
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center">
            <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">
              No clients found.
            </p>
          </div>
        )}
      </div>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClientCreated={fetchClients}
      />
    </div>
  );
};

export default ClientRegistry;
