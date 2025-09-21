import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import '../Settings.css';

interface ApiKey {
  id: number;
  name: string;
  key: string;
  accessLevel: 'read' | 'write' | 'full';
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

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
      const { data } = await axios.get(`${API_URL}/api/v1/integrations`, {
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
      await axios.post(`${API_URL}/api/v1/integrations`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ name: '', accessLevel: 'read' });
      fetchKeys(); // Refresh list
    } catch (err) {
      setError('Failed to add API key.');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      try {
        await axios.delete(`${API_URL}/api/v1/integrations/${id}`, {
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
                    <tr key={key.id}>
                      <td>{key.name}</td>
                      <td>
                        <code>{key.key}</code>
                      </td>
                      <td>{key.accessLevel.toUpperCase()}</td>
                      <td>{new Date(key.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleDelete(key.id)}
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
