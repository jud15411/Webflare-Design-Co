import React, { useState, useEffect } from 'react';
import API from '../../../utils/axios';
import { useAuth } from '../../../contexts/AuthContext';
import '../Settings.css';

interface BackupPoint {
  _id: string;
  timestamp: string;
  sizeMB: number;
  type: 'manual' | 'automatic';
}

interface BackupRestoreSubpageProps {
  onBack: () => void;
}

const BackupRestoreSubpage: React.FC<BackupRestoreSubpageProps> = ({
  onBack,
}) => {
  const { token } = useAuth();
  const [backups, setBackups] = useState<BackupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBackups = async () => {
    try {
      setError('');
      setLoading(true);
      // Fix: Update API endpoint to match the backend
      const { data } = await API.get(`/api/v1/settings/system/backup`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBackups(data);
    } catch (err) {
      setError('Failed to fetch backup points.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBackups();
    }
  }, [token]);

  const handleCreateBackup = async () => {
    if (
      window.confirm('Are you sure you want to create a new manual backup?')
    ) {
      try {
        // Fix: Update API endpoint to match the backend
        await API.post(
          `/api/v1/settings/system/backup`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchBackups();
        alert('Backup created successfully!');
      } catch (err) {
        setError('Failed to create backup.');
        console.error(err);
      }
    }
  };

  const handleRestoreBackup = async (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to restore from this backup? This action cannot be undone.'
      )
    ) {
      try {
        // Fix: Update API endpoint to match the backend
        await API.post(
          `/api/v1/settings/system/backup/${id}/restore`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert('Restore initiated successfully.');
      } catch (err) {
        setError('Failed to initiate restore.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div>Loading backup data...</div>;
  }

  return (
    <div className="settings-subpage">
      <header className="subpage-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h2>Backup & Restore</h2>
      </header>
      <main className="settings-main">
        <div className="settings-section">
          <h3>Create Backup</h3>
          <p>Create a new manual backup of the system data.</p>
          <button onClick={handleCreateBackup} className="save-button">
            Create New Backup
          </button>
        </div>
        <div className="settings-section">
          <h3>Recent Backup Points</h3>
          <table className="settings-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Size (MB)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.length > 0 ? (
                backups.map((backup) => (
                  <tr key={backup._id}>
                    <td>{new Date(backup.timestamp).toLocaleString()}</td>
                    <td>{backup.type.toUpperCase()}</td>
                    <td>{backup.sizeMB.toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => handleRestoreBackup(backup._id)}
                        className="delete-button">
                        Restore
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>No backups found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {error && <p className="error-message">{error}</p>}
      </main>
    </div>
  );
};

export default BackupRestoreSubpage;
