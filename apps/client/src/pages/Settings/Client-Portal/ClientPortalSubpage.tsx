import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import '../Settings.css';

interface ClientPortalSettings {
  showInvoices: boolean;
  showProjects: boolean;
  canUploadFiles: boolean;
  userPermissions: Record<string, 'read' | 'write'>;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

interface ClientPortalSubpageProps {
  onBack: () => void;
}

const ClientPortalSubpage: React.FC<ClientPortalSubpageProps> = ({
  onBack,
}) => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<ClientPortalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/v1/client-portal`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSettings(data);
      } catch (err) {
        setError('Failed to fetch client portal settings.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchSettings();
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings((prevSettings) =>
      prevSettings ? { ...prevSettings, [name]: checked } : null
    );
  };

  const handlePermissionChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    role: string
  ) => {
    const { value } = e.target;
    setSettings((prevSettings) => {
      if (!prevSettings) return null;
      return {
        ...prevSettings,
        userPermissions: {
          ...prevSettings.userPermissions,
          [role]: value as 'read' | 'write',
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/v1/client-portal`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Client portal settings updated successfully!');
    } catch (err) {
      setError('Failed to update settings.');
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  if (error || !settings) {
    return <div>{error || 'Could not load settings.'}</div>;
  }

  return (
    <div className="settings-subpage">
      <header className="subpage-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h2>Client Portal Management</h2>
      </header>
      <main className="settings-main">
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="settings-section">
            <h3>Feature Visibility</h3>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="showInvoices"
                  checked={settings.showInvoices}
                  onChange={handleChange}
                />
                Show Invoices to clients
              </label>
              <label>
                <input
                  type="checkbox"
                  name="showProjects"
                  checked={settings.showProjects}
                  onChange={handleChange}
                />
                Show Projects to clients
              </label>
              <label>
                <input
                  type="checkbox"
                  name="canUploadFiles"
                  checked={settings.canUploadFiles}
                  onChange={handleChange}
                />
                Allow clients to upload files
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h3>Permissions by Role</h3>
            {Object.entries(settings.userPermissions).map(
              ([role, permission]) => (
                <div key={role} className="permission-item">
                  <label>
                    {role.toUpperCase()}
                    <select
                      value={permission}
                      onChange={(e) => handlePermissionChange(e, role)}>
                      <option value="read">Read</option>
                      <option value="write">Write</option>
                    </select>
                  </label>
                </div>
              )
            )}
          </div>

          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="save-button">
            Save Changes
          </button>
        </form>
      </main>
    </div>
  );
};

export default ClientPortalSubpage;
