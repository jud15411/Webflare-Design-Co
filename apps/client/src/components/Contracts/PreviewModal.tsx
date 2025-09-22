import React from 'react';
import './PreviewModal.css';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  onExport: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  htmlContent,
  onExport,
}) => {
  if (!isOpen) return null;

  return (
    <div className="preview-modal-overlay">
      <div className="preview-modal-content">
        <div className="preview-modal-header">
          <h2>Contract Preview</h2>
          <div className="preview-actions">
            <button onClick={onExport} className="export-btn">
              Export as PDF
            </button>
            <button onClick={onClose} className="close-btn">
              &times;
            </button>
          </div>
        </div>
        <div
          className="preview-body"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};
