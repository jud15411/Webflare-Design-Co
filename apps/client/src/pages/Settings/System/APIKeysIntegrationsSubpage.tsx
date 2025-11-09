import React, { useState, useEffect } from 'react';
import API from '../../../utils/axios';
import { useAuth } from '../../../contexts/AuthContext';
import '../Settings.css';

interface ApiKey {
  _id: string;
  name: string;
  key: string;
  accessLevel: 'read' | 'write' | 'full';
  createdAt: string;
}

interface APIKeysIntegrationsSubpageProps {
  onBack: () => void;
}

const APIKeysIntegrationsSubpage: React.FC<APIKeysIntegrationsSubpageProps> = ({
  onBack,
}) => {
  const { token } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', accessLevel: 'read' });

  const fetchKeys = async () => {
    try {
      setError('');
      setLoading(true);
      // Fix: Update API endpoint to match the backend
      const { data } = await API.get(`/settings/system/integrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKeys(data);
    } catch (err) {
      setError('Failed to fetch API keys.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchKeys();
    }
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Fix: Update API endpoint to match the backend
      await API.post(`/settings/system/integrations`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ name: '', accessLevel: 'read' });
      fetchKeys(); // Refresh list
    } catch (err) {
      setError('Failed to add API key.');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      try {
        // Fix: Update API endpoint to match the backend
        await API.delete(`/settings/system/integrations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchKeys(); // Refresh list
      } catch (err) {
        setError('Failed to delete API key.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div>Loading API keys...</div>;
  }

  return (
    <div className="settings-subpage">
      <header className="subpage-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h2>API Keys & Integrations</h2>
      </header>
      <main className="settings-main">
        <div className="settings-section">
          <h3>Generate New API Key</h3>
          <form onSubmit={handleAddKey} className="settings-form">
            <input
              type="text"
              name="name"
              placeholder="Integration Name (e.g., Stripe)"
              value={form.name}
              onChange={handleChange}
              required
            />
            <select
              name="accessLevel"
              value={form.accessLevel}
              onChange={handleChange}
              required>
              <option value="read">Read Only</option>
              <option value="write">Write</option>
              <option value="full">Full Access</option>
            </select>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="save-button">
              Generate Key
            </button>
          </form>
        </div>
        <div className="settings-section">
          <h3>Existing API Keys</h3>
          <div className="api-key-list">
            {keys.length > 0 ? (
              <table className="settings-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Key</th>
                    <th>Access</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr key={key._id}>
                      <td>{key.name}</td>
                      <td>
                        <code>{key.key}</code>
                      </td>
                      <td>{key.accessLevel.toUpperCase()}</td>
                      <td>{new Date(key.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleDelete(key._id)}
                          className="delete-button">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No API keys found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default APIKeysIntegrationsSubpage;
