import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';
import './ContractDetailsPage.css';
import { PreviewModal } from '../../components/Contracts/PreviewModal';

// Define the shape of the contract data
interface Contract {
  _id: string;
  client: {
    _id: string;
    clientName: string;
  };
  serviceType: string[];
  status: string;
  contractData: Record<string, string>;
  createdAt: string;
}

export const ContractDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  const fetchContract = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/contracts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContract(data);
      setFormData(data.contractData);
    } catch (error) {
      console.error('Failed to fetch contract details', error);
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveChanges = async () => {
    try {
      await API.put(
        `/contracts/${id}`,
        { contractData: formData },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsEditing(false);
      fetchContract(); // Refresh data
    } catch (error) {
      console.error('Failed to save changes', error);
    }
  };

  const handlePreview = async () => {
    setIsPreviewLoading(true);
    setPreviewError('');
    try {
      // Request HTML format for the preview
      const { data } = await API.get(`/contracts/${id}/generate`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPreviewHtml(data);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('Failed to generate preview', error);
      setPreviewError('Could not generate preview.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await API.get(
        `/contracts/${id}/generate?format=pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute(
        'download',
        `contract-${contract?.client.clientName || id}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(fileURL);
      link.remove();
    } catch (error) {
      console.error('Failed to export PDF', error);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading contract...</p>
      </div>
    );
  }
  if (!contract) {
    return (
      <div className="page-container">
        <p>Contract not found.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Contract Details</h1>
        <button className="back-btn" onClick={() => navigate('/contracts')}>
          &larr; Back to Contracts
        </button>
      </div>

      <div className="contract-details-layout">
        <div className="contract-actions-panel">
          <h3>{contract.client.clientName}</h3>
          <p>
            <strong>Service(s):</strong> {contract.serviceType.join(', ')}
          </p>
          <p>
            <strong>Status:</strong>
            <span
              className={`status-badge status-${contract.status.toLowerCase()}`}>
              {contract.status}
            </span>
          </p>
          <hr />
          <div className="action-buttons">
            {isEditing ? (
              <>
                <button className="save-btn" onClick={handleSaveChanges}>
                  Save Changes
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  Edit Details
                </button>
                <button
                  onClick={handlePreview}
                  className="preview-btn"
                  disabled={isPreviewLoading}>
                  {isPreviewLoading ? 'Generating...' : 'Preview Contract'}
                </button>
              </>
            )}
          </div>
          {previewError && <p className="error-message">{previewError}</p>}
        </div>

        <div className="contract-data-panel">
          <h3>Contract Information</h3>
          <div className="form-fields-grid">
            {Object.entries(formData).map(([key, value]) => (
              <div className="form-group" key={key}>
                <label>{key.replace(/_/g, ' ')}</label>
                <input
                  type="text"
                  name={key}
                  value={value}
                  onChange={handleFormChange}
                  readOnly={!isEditing}
                  className={isEditing ? 'editable' : ''}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        htmlContent={previewHtml}
        onExport={handleExport}
      />
    </div>
  );
};
