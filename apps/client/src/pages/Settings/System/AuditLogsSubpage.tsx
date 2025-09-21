import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import '../Settings.css';

interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

interface AuditLogsSubpageProps {
  onBack: () => void;
}

const AuditLogsSubpage: React.FC<AuditLogsSubpageProps> = ({ onBack }) => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setError('');
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/v1/audit`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(data);
    } catch (err) {
      setError('Failed to fetch audit logs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLogs();
    }
  }, [token]);

  if (loading) {
    return <div>Loading audit logs...</div>;
  }

  if (error || logs.length === 0) {
    return <div>{error || 'No audit logs found.'}</div>;
  }

  return (
    <div className="settings-subpage">
      <header className="subpage-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h2>Audit Logs</h2>
      </header>
      <main className="settings-main">
        <div className="settings-section">
          <h3>Recent System Activity</h3>
          <p>A chronological log of all major system actions and changes.</p>
          <table className="settings-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.user}</td>
                  <td>{log.action}</td>
                  <td>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AuditLogsSubpage;
