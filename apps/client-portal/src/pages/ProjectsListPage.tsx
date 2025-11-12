import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/axios';
import { useClientAuth } from '../contexts/ClientAuthContext';
import './DashboardPage.css';

interface ProjectListItem {
  _id: string;
  name: string;
  status: string;
  category: string;
  startDate?: string;
  endDate?: string;
}

export const ProjectsListPage: React.FC = () => {
  const { user } = useClientAuth();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await API.get('/client-portal/projects');
        setProjects(data);
      } catch (e) {
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <div className="dashboard-content">Loading projects...</div>;
  if (error) return <div className="dashboard-content">{error}</div>;

  return (
    <div className="portal-dashboard">
      <header className="dashboard-header">
        <h1>{user?.clientName || 'Client'} Projects</h1>
        <Link to="/dashboard" className="logout-button">Back</Link>
      </header>

      <main className="dashboard-content">
        <h2>Your Projects</h2>
        <div className="info-box">
          {projects.length === 0 ? (
            <p>No projects found.</p>
          ) : (
            <ul>
              {projects.map((p) => (
                <li key={p._id} style={{ marginBottom: 12 }}>
                  <Link to={`/projects/${p._id}`}>{p.name}</Link>
                  <div style={{ fontSize: 12, color: '#6c757d' }}>
                    {p.category} • {p.status}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
