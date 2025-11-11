// src/components/projects/CybersecurityProjectCard.tsx

import React from 'react';
import { type Project } from '../../../types/projects';
import './CybersecurityProjectList.css'; // Use the specific CSS for styling

interface CybersecurityProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onViewDetails: (id: string) => void;
}

const getStatusClass = (status: string): string => {
  return `status-${status.toLowerCase().replace(/ /g, '-')}`;
};

export const CybersecurityProjectCard: React.FC<CybersecurityProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  // Placeholder: Risk scoring logic (e.g., 'Low', 'Medium', 'High')
  const getRiskLevel = () => {
    // In a real app, this would be calculated from a separate risk score field.
    if (project.status === 'In Progress') return 'High';
    if (project.status === 'Completed') return 'Low';
    return 'Medium';
  };
  
  const riskLevel = getRiskLevel();

  return (
    <div className="project-card security-card">
      <div className="card-header">
        <h3 className="card-title">{project.name}</h3>
        <div className={`risk-level risk-${riskLevel.toLowerCase()}`}>
          Risk: {riskLevel}
        </div>
      </div>
      
      <div className="card-body">
        <p className="card-client">
          Client: <strong>{project.client?.clientName || 'N/A'}</strong>
        </p>
        <p className="card-detail">
          <span className="detail-label">Status:</span> 
          <span className={`status-badge ${getStatusClass(project.status)}`}>
            {project.status}
          </span>
        </p>
        
        {/* Cybersecurity Specific Feature */}
        {project.target_systems && (
          <p className="card-scope">
            Scope: **{project.target_systems.split('\n')[0].substring(0, 40)}...**
          </p>
        )}
      </div>

      <div className="card-actions">
        <button className="action-button security-action-btn" onClick={() => onViewDetails(project._id)}>
          Audit Report
        </button>
        <button className="action-button security-action-btn" onClick={() => onEdit(project)}>
          Edit
        </button>
        <button className="action-button delete-btn" onClick={() => onDelete(project)}>
          Delete
        </button>
      </div>
    </div>
  );
};