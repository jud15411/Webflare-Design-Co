import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; //
import { useConfig } from '../context/ConfigContext'; //

const Login = ({ setUser }) => {
  const { businessName } = useConfig(); //
  const navigate = useNavigate(); //
  const [loading, setLoading] = useState(false); //
  const [error, setError] = useState(''); //
  const [formData, setFormData] = useState({ userName: '', password: '' }); //

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Calls the backend using the axios utility withCredentials enabled
      const response = await api.post('/auth/login', formData);

      // 1. Update the global state passed from App.jsx
      if (setUser) {
        setUser(response.data.user);
      }

      // 2. Set a flag so ProtectedRoute knows we are logged in
      // (Used because JS cannot read the HttpOnly cookie directly)
      localStorage.setItem('isAuthenticated', 'true');

      // 3. Navigate to the dashboard upon success
      navigate('/dashboard');
    } catch (err) {
      // Logic to differentiate error types for the user
      if (err.response?.status === 401) {
        // - Generic error for wrong username OR password
        setError('Authentication error');
      } else if (err.response?.status === 500) {
        // - Specific server error messaging
        setError(
          `There is a server error. Please contact the IT Department of ${businessName}`
        );
      } else {
        // Fallback for network timeouts or other unexpected issues
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-100 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tighter text-zinc-900 dark:text-zinc-50">
            {businessName}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-medium">
            Identity Management
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl shadow-sm">
          {error && (
            <div
              className={`mb-4 p-3 border text-sm rounded-xl ${
                error.includes('IT Department')
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              placeholder="Username"
              required
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none outline-none dark:text-white"
              onChange={(e) =>
                setFormData({ ...formData, userName: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none outline-none dark:text-white"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold py-3 rounded-xl transition-all hover:opacity-90 disabled:opacity-70">
              {loading ? 'Authenticating...' : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
