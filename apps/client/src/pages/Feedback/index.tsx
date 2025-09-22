import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmationModal } from '../../components/Common/ConfirmationModal/ConfirmationModal'; // 1. Import the modal
import './FeedbackPage.css';

// Interfaces for feedback data
interface ProjectFeedback {
  _id: string;
  name: string;
  client: { clientName: string };
  clientFeedback: string;
}
interface TaskFeedback {
  _id: string;
  title: string;
  project: {
    name: string;
    client: { clientName: string };
  };
  clientFeedback: string;
}

// Type to hold info for the confirmation modal
type FeedbackItem = {
  type: 'project' | 'task';
  id: string;
  name: string;
};

export const FeedbackPage: React.FC = () => {
  const { token } = useAuth();
  const [projectFeedback, setProjectFeedback] = useState<ProjectFeedback[]>([]);
  const [taskFeedback, setTaskFeedback] = useState<TaskFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Add state to manage the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackToAcknowledge, setFeedbackToAcknowledge] =
    useState<FeedbackItem | null>(null);

  const fetchFeedback = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/feedback', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch feedback data.');
      }
      const data = await response.json();
      setProjectFeedback(data.projects);
      setTaskFeedback(data.tasks);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [token]);

  // 3. Create a handler to OPEN the modal
  const handleAcknowledgeClick = (item: FeedbackItem) => {
    setFeedbackToAcknowledge(item);
    setIsModalOpen(true);
  };

  // 4. Rename the main logic to be the CONFIRM handler
  const handleConfirmAcknowledge = async () => {
    if (!feedbackToAcknowledge) return;

    const { type, id } = feedbackToAcknowledge;

    try {
      const response = await fetch(`/api/v1/feedback/${type}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Server responded with an error.');
      }
      // Close modal and refetch feedback to update the list
      setIsModalOpen(false);
      setFeedbackToAcknowledge(null);
      fetchFeedback();
    } catch (error) {
      alert('Failed to acknowledge feedback. Please try again.');
      console.error(error);
      setIsModalOpen(false);
      setFeedbackToAcknowledge(null);
    }
  };

  if (isLoading)
    return <div className="page-container">Loading feedback...</div>;
  if (error)
    return (
      <div className="page-container">
        <p className="error-message">{error}</p>
      </div>
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Client Feedback</h1>
      </div>

      <section className="feedback-section">
        <h2>Project Feedback</h2>
        {projectFeedback.length > 0 ? (
          <div className="feedback-grid">
            {projectFeedback.map((item) => (
              <div key={item._id} className="feedback-card">
                <h4>
                  {item.name} <span>({item.client.clientName})</span>
                </h4>
                <p className="feedback-content">"{item.clientFeedback}"</p>
                <button
                  className="acknowledge-btn"
                  onClick={() =>
                    handleAcknowledgeClick({
                      type: 'project',
                      id: item._id,
                      name: item.name,
                    })
                  }>
                  Acknowledge & Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-feedback-message">No new project feedback.</p>
        )}
      </section>

      <section className="feedback-section">
        <h2>Task Feedback</h2>
        {taskFeedback.length > 0 ? (
          <div className="feedback-grid">
            {taskFeedback.map((item) => (
              <div key={item._id} className="feedback-card">
                <h4>
                  {item.title}{' '}
                  <span>
                    ({item.project.client.clientName} - {item.project.name})
                  </span>
                </h4>
                <p className="feedback-content">"{item.clientFeedback}"</p>
                <button
                  className="acknowledge-btn"
                  onClick={() =>
                    handleAcknowledgeClick({
                      type: 'task',
                      id: item._id,
                      name: item.title,
                    })
                  }>
                  Acknowledge & Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-feedback-message">No new task feedback.</p>
        )}
      </section>

      {/* 5. Render the ConfirmationModal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAcknowledge}
        title="Confirm Acknowledgement"
        message={
          <>
            Are you sure you want to acknowledge and remove this feedback for{' '}
            <strong>{feedbackToAcknowledge?.name}</strong>?
          </>
        }
        confirmText="Acknowledge"
        variant="danger"
      />
    </div>
  );
};
