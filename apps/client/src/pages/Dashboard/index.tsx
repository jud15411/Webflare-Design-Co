import { useState, useEffect } from 'react';
import API from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext'; // Assuming you have an AuthContext
import './Dashboard.css';

interface Metrics {
  activeClients: number;
  projectsCompleted: number;
  totalRevenue: number;
  openTasks: number;
}

export const DashboardPage = () => {
  const { token, logout } = useAuth(); // Get token and logout from context
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!token) return;
      try {
        const { data } = await API.get('/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMetrics(data);
      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error(err);
      }
    };

    fetchMetrics();
  }, [token]);

  if (error) {
    return (
      <div className="dashboard-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return <div className="dashboard-container">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome to the Dashboard!</h1>
        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </header>
      <main className="dashboard-main">
        <p className="welcome-message">
          Here's a snapshot of your business activity.
        </p>
        <div className="metrics-grid">
          <div className="metric-card">
            <h2>Active Clients</h2>
            <p className="metric-value">{metrics.activeClients}</p>
          </div>
          <div className="metric-card">
            <h2>Projects Completed (This Month)</h2>
            <p className="metric-value">{metrics.projectsCompleted}</p>
          </div>
          <div className="metric-card">
            <h2>Total Revenue</h2>
            <p className="metric-value">
              ${metrics.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="metric-card">
            <h2>Open Tasks</h2>
            <p className="metric-value">{metrics.openTasks}</p>
          </div>
        </div>
      </main>
    </div>
  );
};
