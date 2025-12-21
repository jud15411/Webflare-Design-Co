import React, { useState } from 'react';
import api from '../../api/axios';

const ClientModal = ({ isOpen, onClose, onClientCreated }) => {
  // We initialize with the fields required by Client.js
  const [formData, setFormData] = useState({
    name: '',
    industry: 'Technology',
    status: 'Onboarding',
    logoUrl: '',
    // Primary Contact fields (will be nested into adminData on submit)
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Structure the data to match your Mongoose Model (Client.js)
    const payload = {
      name: formData.name,
      industry: formData.industry,
      status: formData.status,
      logoUrl: formData.logoUrl,
      adminData: {
        primaryContact: {
          name: formData.contactName,
          email: formData.contactEmail,
          phone: formData.contactPhone,
        },
      },
    };

    try {
      await api.post('/clients', payload);
      onClientCreated();
      onClose();
    } catch (err) {
      console.error('Registration failed:', err);
      alert(err.response?.data?.message || 'Error creating client.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Register New Client
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Initial Provisioning & Registry
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-indigo-500 transition-colors text-xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: REGISTRY INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 mb-2 tracking-widest">
                Company Name
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                placeholder="Acme Industries"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 mb-2 tracking-widest">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white">
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="E-commerce">E-commerce</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 mb-2 tracking-widest">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white">
                <option value="Onboarding">Onboarding</option>
                <option value="Active">Active</option>
              </select>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-zinc-800 w-full"></div>

          {/* SECTION 2: PRIMARY CONTACT (Nested in adminData) */}
          <div>
            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">
              Primary Stakeholder
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 mb-2 tracking-widest">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData({ ...formData, contactName: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 mb-2 tracking-widest">
                  Work Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  placeholder="j.doe@acme.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 mb-2 tracking-widest">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black uppercase py-5 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] mt-4">
            {isSubmitting
              ? 'Finalizing Registry...'
              : 'Provision Client Record'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
