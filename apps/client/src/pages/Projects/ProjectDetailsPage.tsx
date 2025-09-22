import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chat } from '../../components/Chat/Chat';
import './ProjectDetailsPage.css';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="page-container">
        <p>Project ID is missing.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Project Chat & Details</h1>
        <button className="back-btn" onClick={() => navigate(-1)}>
          &larr; Back to Projects
        </button>
      </div>
      <div className="project-details-layout">
        <div className="details-panel">
          {/* You can fetch and display project details here later */}
          <h2>Project Details</h2>
          <p>Details for project {id} will be displayed here.</p>
        </div>
        <div className="chat-panel">
          <h2>Project Communication</h2>
          <Chat projectId={id} />
        </div>
      </div>
    </div>
  );
};
