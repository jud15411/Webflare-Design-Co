import { useState, useEffect } from 'react';
import './Dashboard.css'; // Assuming you have a CSS file for styling

interface Metrics {
  activeClients: number;
  projectsCompleted: number;
  securityIncidentsResolved: number;
  openTickets: number;
}

export const DashboardPage = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  // Simulate fetching data from an API
  useEffect(() => {
    // Sample data to be used until a real API is set up
    const sampleMetrics: Metrics = {
      activeClients: 15,
      projectsCompleted: 7,
      securityIncidentsResolved: 3,
      openTickets: 5,
    };

    // Simulate a network delay
    setTimeout(() => {
      setMetrics(sampleMetrics);
    }, 500);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login'; // Simple redirect
  };

  if (!metrics) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome to the Dashboard!</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main className="dashboard-main">
        <p className="welcome-message">You are logged in.</p>
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
            <h2>Security Incidents Resolved</h2>
            <p className="metric-value">{metrics.securityIncidentsResolved}</p>
          </div>
          <div className="metric-card">
            <h2>Open Tickets</h2>
            <p className="metric-value">{metrics.openTickets}</p>
          </div>
        </div>
      </main>
    </div>
  );
};
