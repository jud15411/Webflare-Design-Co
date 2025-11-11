// src/components/projects/WebDevelopmentProjectCard.tsx

import React from 'react';
import { type Project } from '../../../types/projects';
import './WebDevelopmentProjectList.css'; // Use the specific CSS for styling

interface WebDevelopmentProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onViewDetails: (id: string) => void;
}

const getStatusClass = (status: string): string => {
  return `status-${status.toLowerCase().replace(/ /g, '-')}`;
};

export const WebDevelopmentProjectCard: React.FC<WebDevelopmentProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  return (
    <div className="project-card webdev-card">
      <div className="card-header">
        <h3 className="card-title">{project.name}</h3>
        <span className={`status-badge ${getStatusClass(project.status)}`}>
          {project.status}
        </span>
      </div>
      
      <div className="card-body">
        <p className="card-client">
          Client: <strong>{project.client?.clientName || 'N/A'}</strong>
        </p>
        <p className="card-detail">
          <span className="detail-label">Started:</span> {new Date(project.startDate).toLocaleDateString()}
        </p>
        <p className="card-detail">
          <span className="detail-label">Team:</span> {project.team.map((member) => member.name).join(', ') || 'N/A'}
        </p>
        
        {/* Web Development Specific Feature */}
        {project.website_link && (
          <p className="card-link">
            <a href={project.website_link} target="_blank" rel="noopener noreferrer">
              🚀 View Deployment
            </a>
          </p>
        )}
      </div>

      <div className="card-actions">
        <button className="action-button webdev-action-btn" onClick={() => onViewDetails(project._id)}>
          Details & Chat
        </button>
        <button className="action-button webdev-action-btn" onClick={() => onEdit(project)}>
          Edit
        </button>
        <button className="action-button delete-btn" onClick={() => onDelete(project)}>
          Delete
        </button>
      </div>
    </div>
  );
};