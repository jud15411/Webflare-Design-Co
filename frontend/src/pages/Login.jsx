import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useConfig } from '../context/ConfigContext';

const Login = ({ setUser }) => {
  const { businessName } = useConfig();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ userName: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', formData);
      if (setUser) setUser(response.data.user);
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.status === 401 ? 'Authentication error' : 'Server error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tighter text-zinc-900 dark:text-zinc-50">
            {businessName}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-medium">
            Identity Management
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                Username
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 outline-none text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, userName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 outline-none text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 dark:bg-indigo-600 text-white font-bold py-4 rounded-xl transition-all hover:opacity-90 disabled:opacity-70 shadow-lg shadow-indigo-500/20 active:scale-95">
              {loading ? 'Authenticating...' : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
