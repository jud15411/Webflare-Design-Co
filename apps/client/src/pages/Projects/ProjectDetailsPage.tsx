// ProjectDetailsPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { Chat } from '../../components/Chat/Chat'; 
import { useAuth } from '../../contexts/AuthContext';
import { type Project } from '../../types/projects';
import './ProjectDetailsPage.css';
import API from '../../utils/axios';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const { data } = await API.get<Project>(`/projects/${id}`);
        setProject(data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Failed to fetch project details.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProjectDetails();
    }
  }, [id, token]);

  if (isLoading) {
    return (
      <div className="page-container">
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page-container">
        <p>Project not found.</p>
      </div>
    );
  }

  const isWebDev = project.category === 'Web Development';
  // Determine the CSS class based on the category
  const detailPanelClass = isWebDev ? 'web-dev-panel' : 'security-panel';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{isWebDev ? 'Web Development' : 'Cybersecurity'} Project: {project.name}</h1>
        <button className="back-btn" onClick={() => navigate(-1)}>
          &larr; Back to Projects
        </button>
      </div>
      <div className="project-details-layout">
        
        {/* LEFT PANEL: PROJECT DETAILS (Differentiated) */}
        <div className={`details-panel ${detailPanelClass}`}>
          <h2>Primary Details</h2>
          
          <div className="detail-group">
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Category:</strong> {project.category}</p>
            <p><strong>Client:</strong> {project.client.clientName}</p>
            <p><strong>Started On:</strong> {new Date(project.startDate).toLocaleDateString()}</p>
          </div>

          <div className="detail-group">
            <p><strong>Team Lead:</strong> {project.team[0]?.name || 'N/A'}</p>
            <p><strong>Team Members:</strong> {project.team.map(m => m.name).join(', ') || 'None'}</p>
          </div>

          {/* CATEGORY-SPECIFIC SECTION */}
          {isWebDev && (
            <div className="detail-group">
                <h3>Web Development Specifics</h3>
                {project.website_link ? (
                    <p>
                        <strong>Deployment Link:</strong>{' '}
                        <a href={project.website_link} target="_blank" rel="noopener noreferrer">
                            {project.website_link}
                        </a>
                    </p>
                ) : (
                    <p>No deployment link provided yet.</p>
                )}
            </div>
          )}

          {!isWebDev && (
            <div className="detail-group">
                <h3>Cybersecurity Specifics</h3>
                <p><strong>Scope/Targets:</strong></p>
                {project.target_systems ? (
                    <div className="target-systems-box">
                        {project.target_systems}
                    </div>
                ) : (
                    <p>Scope details not fully defined.</p>
                )}
            </div>
          )}
          
          <div className="detail-group">
            <h3>Description</h3>
            <p>{project.description}</p>
          </div>
          
        </div>
        
        {/* RIGHT PANEL: CHAT (commented out for development) 
        <div className="chat-panel">
          <h2>Project Communication</h2>
          <Chat projectId={id!} />
        </div>
        */}
      </div>
    </div>
  );
};