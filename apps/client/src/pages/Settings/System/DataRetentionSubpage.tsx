import React, { useState, useEffect } from 'react';
import API from '../../../utils/axios';
import { useAuth } from '../../../contexts/AuthContext';
import '../Settings.css';

interface DataRetentionPolicy {
  clients: number;
  projects: number;
  invoices: number;
  auditLogs: number;
}

interface DataRetentionSubpageProps {
  onBack: () => void;
}

const DataRetentionSubpage: React.FC<DataRetentionSubpageProps> = ({
  onBack,
}) => {
  const { token } = useAuth();
  const [policy, setPolicy] = useState<DataRetentionPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPolicy = async () => {
    try {
      // Fix: Update API endpoint to match the backend
      const { data } = await API.get(
        `/api/v1/settings/system/data-retention`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPolicy(data);
    } catch (err) {
      setError('Failed to fetch data retention policy.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPolicy();
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPolicy((prevPolicy) =>
      prevPolicy ? { ...prevPolicy, [name]: Number(value) } : null
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Fix: Update API endpoint to match the backend
      await API.put(`/api/v1/settings/system/data-retention`, policy, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Data retention policy updated successfully!');
    } catch (err) {
      setError('Failed to update policy.');
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading data retention policy...</div>;
  }

  if (error || !policy) {
    return <div>{error || 'Could not load data retention policy.'}</div>;
  }

  return (
    <div className="settings-subpage">
      <header className="subpage-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h2>Data Retention</h2>
      </header>
      <main className="settings-main">
        <div className="settings-section">
          <h3>Set Retention Periods (in months)</h3>
          <p>Define how long different types of data are kept on the system.</p>
          <form onSubmit={handleSubmit} className="settings-form">
            <label>
              Client Data:
              <input
                type="number"
                name="clients"
                value={policy.clients}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Project Data:
              <input
                type="number"
                name="projects"
                value={policy.projects}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Invoices:
              <input
                type="number"
                name="invoices"
                value={policy.invoices}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Audit Logs:
              <input
                type="number"
                name="auditLogs"
                value={policy.auditLogs}
                onChange={handleChange}
                required
              />
            </label>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="save-button">
              Save Changes
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default DataRetentionSubpage;
