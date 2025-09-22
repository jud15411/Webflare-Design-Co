import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import '../Settings.css';

interface ClientPortalSettings {
  showInvoices: boolean;
  showProjects: boolean;
  showTasks: boolean; // <-- Add this line
  canUploadFiles: boolean;
}

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
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(
          `/api/v1/settings/billing/client-portal`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSettings(data);
      } catch (err) {
        setError('Failed to fetch client portal settings.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setError('');
    if (!settings) return;

    try {
      await axios.put(`/api/v1/settings/billing/client-portal`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage('Client portal settings updated successfully!');
    } catch (err) {
      setError('Failed to update settings.');
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  if (error && !settings) {
    return <div>{error}</div>;
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
            <p>Choose which modules are visible to clients in their portal.</p>
            {settings && (
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="showProjects"
                    checked={settings.showProjects}
                    onChange={handleChange}
                  />
                  Show Projects
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="showInvoices"
                    checked={settings.showInvoices}
                    onChange={handleChange}
                  />
                  Show Invoices
                </label>
                {/* Add Show Tasks checkbox */}
                <label>
                  <input
                    type="checkbox"
                    name="showTasks"
                    checked={settings.showTasks}
                    onChange={handleChange}
                  />
                  Show Tasks
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="canUploadFiles"
                    checked={settings.canUploadFiles}
                    onChange={handleChange}
                  />
                  Allow clients to upload files (Feature coming soon)
                </label>
              </div>
            )}
          </div>

          {error && <p className="error-message">{error}</p>}
          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}
          <button type="submit" className="save-button">
            Save Changes
          </button>
        </form>
      </main>
    </div>
  );
};

export default ClientPortalSubpage;
