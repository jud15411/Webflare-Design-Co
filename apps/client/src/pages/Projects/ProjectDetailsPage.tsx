import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chat } from '../../components/Chat/Chat';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import { type Project } from '../../types/projects';
import './ProjectDetailsPage.css';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth(); // Get the auth token
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  useEffect(() => {
    // This function now fetches live data from your API
    const fetchProjectDetails = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v1/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Send token for private routes
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch project details.');
        }

        const data: Project = await response.json();
        setProject(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProjectDetails();
    }
  }, [id, token]); // Add token as a dependency

  if (isLoading) {
    return <div className="page-container"><p>Loading project details...</p></div>;
  }

  if (error) {
    return <div className="page-container"><p>Error: {error}</p></div>;
  }

  if (!project) {
    return (
      <div className="page-container">
        <p>Project not found.</p>
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
          <h2>Project Details</h2>
          <div>
            <p>
              <strong>Name:</strong> {project.name}
            </p>
            <p>
              <strong>Description:</strong> {project.description}
            </p>
            <p>
              <strong>Category:</strong> {project.category}
            </p>
            {/* This conditional rendering will now use live data */}
            {project.category === 'Web Development' &&
              project.website_link && (
                <p>
                  <strong>Website:</strong>{' '}
                  <a
                    href={project.website_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.website_link}
                  </a>
                </p>
              )}
          </div>
        </div>
        <div className="chat-panel">
          <h2>Project Communication</h2>
          <Chat projectId={id!} />
        </div>
      </div>
    </div>
  );
};