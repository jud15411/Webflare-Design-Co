import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../utils/axios';
import './DashboardPage.css';

interface ProjectDetail {
  _id: string;
  name: string;
  description: string;
  status: string;
  category: string;
  startDate?: string;
  endDate?: string;
  client?: { clientName: string };
  team?: Array<{ _id: string; name: string; email: string }>;
  website_link?: string;
  target_systems?: string;
}

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await API.get(`/client-portal/projects/${id}`);
        setProject(data);
      } catch (e) {
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProject();
  }, [id]);

  return (
    <div className="portal-dashboard">
      <header className="dashboard-header">
        <h1>Project Details</h1>
        <Link to="/projects" className="logout-button">Back to Projects</Link>
      </header>

      <main className="dashboard-content">
        {loading && <div>Loading...</div>}
        {error && <div>{error}</div>}
        {project && (
          <div className="info-box">
            <h2 style={{ marginTop: 0 }}>{project.name}</h2>
            <p>{project.description}</p>
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Category:</strong> {project.category}</p>
            <p><strong>Start Date:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>End Date:</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</p>
            {project.website_link && (
              <p><strong>Website:</strong> <a href={project.website_link} target="_blank" rel="noreferrer">{project.website_link}</a></p>
            )}
            {project.target_systems && (
              <p><strong>Target Systems:</strong> {project.target_systems}</p>
            )}

            {project.team && project.team.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <strong>Team:</strong>
                <ul>
                  {project.team.map((m) => (
                    <li key={m._id}>{m.name} ({m.email})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
