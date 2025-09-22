import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './ClientDetailsPage.css';

// Interface remains the same
interface Client {
  _id: string;
  clientName: string;
  primaryContact: { name: string; role: string; email: string; phone?: string };
  additionalContacts: {
    name: string;
    role: string;
    email: string;
    phone?: string;
  }[];
  status: string;
  address?: string;
  website?: string;
  industry?: string;
  servicesPurchased: string[];
  assignedProjects: { _id: string; name: string }[];
  assignedTeamMembers: { _id: string; name: string }[];
  contractStartDate?: string;
  contractEndDate?: string;
  billingDetails: {
    paymentMethod?: string;
    subscriptionPlan?: string;
    outstandingBalance?: number;
  };
  securitySlaLevel?: string;
  incidentHistory: string[];
  preferredCommunicationMethod?: string;
  portalAccessGranted?: boolean;
}

export const ClientDetailsPage: React.FC = () => {
  const { token } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientDetails = async () => {
    // Made it a standalone function
    if (!token || !id) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/v1/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClient(data);
    } catch (err) {
      setError('Failed to fetch client details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDetails();
  }, [token, id]);

  const handleTogglePortalAccess = async () => {
    if (!client) return;
    try {
      // No need to get data back, just refetch on success
      await axios.patch(
        `/api/v1/clients/${client._id}/portal-access`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Refetch the client data to ensure UI is in sync with the database
      fetchClientDetails();
    } catch (err) {
      setError('Failed to update portal access.');
    }
  };

  if (loading)
    return (
      <div className="page-container">
        <p>Loading client details...</p>
      </div>
    );
  if (error)
    return (
      <div className="page-container">
        <p className="error-message">{error}</p>
      </div>
    );
  if (!client)
    return (
      <div className="page-container">
        <p>Client not found.</p>
      </div>
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{client.clientName}</h1>
        <button className="back-btn" onClick={() => navigate('/clients')}>
          &larr; Back to Clients
        </button>
      </div>

      <div className="client-details-grid">
        <div className="details-card">
          <h3>Primary Contact</h3>
          <p>
            <strong>Name:</strong> {client.primaryContact.name}
          </p>
          <p>
            <strong>Role:</strong> {client.primaryContact.role}
          </p>
          <p>
            <strong>Email:</strong> {client.primaryContact.email}
          </p>
        </div>

        <div className="details-card">
          <h3>Company Info</h3>
          <p>
            <strong>Status:</strong> {client.status}
          </p>
          <p>
            <strong>Industry:</strong> {client.industry || 'N/A'}
          </p>
          <p>
            <strong>Website:</strong>{' '}
            <a href={client.website} target="_blank" rel="noopener noreferrer">
              {client.website}
            </a>
          </p>
        </div>

        <div className="details-card">
          <h3>Services & Engagement</h3>
          <p>
            <strong>Services:</strong> {client.servicesPurchased.join(', ')}
          </p>
          <p>
            <strong>Assigned Team:</strong>{' '}
            {client.assignedTeamMembers.map((m) => m.name).join(', ')}
          </p>
        </div>
        <div className="details-card">
          <h3>Client Portal</h3>
          <p>
            <strong>Status:</strong>{' '}
            {/* Check if portalAccessGranted is true */}
            {client.portalAccessGranted ? 'Access Granted' : 'Access Denied'}
          </p>
          <button
            onClick={handleTogglePortalAccess}
            className="portal-access-btn">
            {/* Change button text based on the same check */}
            {client.portalAccessGranted ? 'Revoke Access' : 'Grant Access'}
          </button>
        </div>
      </div>
    </div>
  );
};
