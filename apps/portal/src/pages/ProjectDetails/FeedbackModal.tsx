import React, { useState } from 'react';
import API from '../../utils/axios'; // Import the new axios instance
import { AxiosError } from 'axios'; // Import AxiosError for better error typing
import './FeedbackModal.css';

interface FeedbackModalProps {
  itemType: 'project' | 'task';
  itemId: string;
  itemName: string;
  onClose: () => void;
  onFeedbackSubmitted: () => void;
}

interface ApiError {
  message: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  itemType,
  itemId,
  itemName,
  onClose,
  onFeedbackSubmitted,
}) => {
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError('Feedback cannot be empty.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await API.post('/feedback/portal', {
        type: itemType,
        id: itemId,
        feedback,
      });
      onFeedbackSubmitted();
      onClose();
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message ||
        'Failed to submit feedback. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div
        className="feedback-modal-content"
        onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="feedback-modal-header">
            <h3>Feedback for "{itemName}"</h3>
            <button type="button" className="close-btn" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="feedback-modal-body">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please provide your feedback here..."
              required
              rows={5}
            />
            {error && <p className="feedback-error">{error}</p>}
          </div>
          <div className="feedback-modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};