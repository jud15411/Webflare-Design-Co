import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './Reports.css';

interface ProjectReport {
  id: number;
  name: string;
  status: 'Completed' | 'In Progress' | 'On Hold';
  client: string;
  revenue: number;
}

interface TicketReport {
  id: number;
  subject: string;
  status: 'Open' | 'Closed' | 'In Progress';
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: string;
}

interface SecurityReport {
  month: string;
  incidents: number;
}

interface ReportsData {
  projects: ProjectReport[];
  tickets: TicketReport[];
  securityIncidents: SecurityReport[];
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const ReportsPage = () => {
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setError('');
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/api/v1/reports`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReports(data);
      } catch (err) {
        setError('Failed to fetch reports.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchReports();
    }
  }, [token]);

  if (loading) {
    return <div className="reports-loading">Loading reports...</div>;
  }

  if (error || !reports) {
    return (
      <div className="reports-error">
        {error || 'No reports data available.'}
      </div>
    );
  }

  const { projects, tickets, securityIncidents } = reports;

  const totalRevenue = projects.reduce(
    (sum, project) => sum + project.revenue,
    0
  );
  const projectsCompleted = projects.filter(
    (p) => p.status === 'Completed'
  ).length;
  const openTickets = tickets.filter((t) => t.status === 'Open').length;

  return (
    <div className="reports-container">
      <header className="reports-header">
        <h1>Company Reports</h1>
        <p>Key performance metrics and data analysis.</p>
      </header>
      <main className="reports-main">
        <section className="reports-summary-cards">
          <div className="summary-card">
            <h3>Total Revenue</h3>
            <p className="summary-value">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h3>Projects Completed</h3>
            <p className="summary-value">{projectsCompleted}</p>
          </div>
          <div className="summary-card">
            <h3>Open Tickets</h3>
            <p className="summary-value">{openTickets}</p>
          </div>
        </section>

        <section className="reports-section">
          <h2>Project Status Overview</h2>
          <div className="reports-table-container">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.name}</td>
                    <td>{project.client}</td>
                    <td>
                      <span
                        className={`status-badge ${project.status
                          .replace(/\s+/g, '-')
                          .toLowerCase()}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>${project.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="reports-section">
          <h2>Security Incidents by Month</h2>
          <div className="bar-chart-container">
            {securityIncidents.map((data) => (
              <div key={data.month} className="bar-container">
                <div
                  className="bar"
                  style={{ height: `${data.incidents * 15}px` }}
                  title={`${data.incidents} incidents`}></div>
                <span className="bar-label">{data.month}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReportsPage;
