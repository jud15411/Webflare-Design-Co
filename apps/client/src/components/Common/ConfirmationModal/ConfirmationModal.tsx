import React from 'react';
import './ConfirmationModal.css';

// Define the props the modal will accept
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode; // Use ReactNode for flexible content
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger'; // For styling the confirm button
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
}) => {
  // Don't render the modal if it's not open
  if (!isOpen) {
    return null;
  }

  // Prevent clicks inside the modal from closing it
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalContentClick}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="modal-button cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className={`modal-button confirm ${variant}`}
            onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
