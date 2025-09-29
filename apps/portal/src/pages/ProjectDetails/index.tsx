import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../utils/axios'; // Import the new axios instance
import { AxiosError } from 'axios'; // Import AxiosError for better error typing
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { FeedbackModal } from './FeedbackModal';
import './ProjectDetailsPage.css';

// --- Type Definitions ---
interface TeamMember {
  _id: string;
  name: string;
}

interface ProjectDetails {
  _id: string;
  name: string;
  description: string;
  status: string;
  category: string;
  startDate: string;
  team: TeamMember[];
  website_link?: string;
}

interface ApiError {
  message: string;
}

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // Token is still useful here for the dependency array to trigger fetch on login
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id || !token) {
        navigate('/portal/dashboard'); // Corrected path
        return;
      }
      try {
        const response = await API.get<ProjectDetails>(`/portal/projects/${id}`);
        setProject(response.data);
      } catch (err) {
        const axiosError = err as AxiosError<ApiError>;
        const message =
          axiosError.response?.data?.message ||
          'Project not found or you do not have access.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, token, navigate]);

  const handleFeedbackSubmitted = () => {
    showNotification('Thank you, your feedback has been submitted!');
  };

  if (loading) return <div className="details-loading">Loading Project...</div>;
  if (error) return <div className="details-error">{error}</div>;
  if (!project) return null;

  return (
    <div className="project-details-page">
      <div className="details-header">
        <Link to="/portal/dashboard" className="back-link">
          &larr; Back to Dashboard
        </Link>
        <div>
          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="feedback-btn">
            Provide Feedback
          </button>
          <span
            className={`status-badge status-${project.status
              .toLowerCase()
              .replace(' ', '-')}`}>
            {project.status}
          </span>
        </div>
      </div>

      <div className="details-content">
        <h1>{project.name}</h1>
        <p className="project-category">{project.category}</p>

        <div className="details-card">
          <h3>Project Overview</h3>
          <p>{project.description}</p>
        </div>

        {project.category === 'Web Development' && project.website_link && (
          <div className="details-card">
            <h3>Website Link</h3>
            <p>
              You can view the live project here:{' '}
              <a
                href={project.website_link}
                target="_blank"
                rel="noopener noreferrer">
                {project.website_link}
              </a>
            </p>
          </div>
        )}

        <div className="details-grid">
          <div className="details-card">
            <h3>Timeline</h3>
            <p>
              <strong>Start Date:</strong>{' '}
              {new Date(project.startDate).toLocaleDateString()}
            </p>
          </div>
          <div className="details-card">
            <h3>Assigned Team</h3>
            <ul>
              {project.team.length > 0 ? (
                project.team.map((member) => (
                  <li key={member._id}>{member.name}</li>
                ))
              ) : (
                <li>No team members assigned.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {isFeedbackModalOpen && (
        <FeedbackModal
          itemType="project"
          itemId={project._id}
          itemName={project.name}
          onClose={() => setIsFeedbackModalOpen(false)}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}
    </div>
  );
};

export default ProjectDetailsPage;