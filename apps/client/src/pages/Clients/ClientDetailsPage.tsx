import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/axios';
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
  const [message, setMessage] = useState<string | null>(null);

  const fetchClient = async () => {
    if (!token || !id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get(`/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClient(data);
    } catch (err) {
      console.error('Failed to fetch client details', err);
      setError('Failed to load client details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [token, id]);

  const handleTogglePortalAccess = async () => {
    if (!token || !client) return;
    try {
      // API call to toggle the access status
      const { data } = await API.patch(
        `/clients/${client._id}/portal-access`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Update local state with the new status
      setClient((prev) =>
        prev
          ? { ...prev, portalAccessGranted: data.portalAccessGranted }
          : null
      );
      setMessage(data.message); // Display success message from backend
      setTimeout(() => setMessage(null), 3000); // Clear message after 3 seconds
    } catch (err: any) {
      console.error('Failed to toggle portal access', err);
      setMessage(
        err.response?.data?.message || 'Failed to toggle portal access.'
      );
      setTimeout(() => setMessage(null), 3000); // Clear message after 3 seconds
    }
  };

  if (loading) return <div className="page-content">Loading...</div>;
  if (error) return <div className="page-content error">{error}</div>;
  if (!client)
    return <div className="page-content">Client not found.</div>;

  return (
    <div className="page-content">
      <button onClick={() => navigate('/clients')} className="back-btn">
        &larr; Back to Clients
      </button>

      <h1 className="page-title">{client.clientName}</h1>
      {message && <div className="success-message">{message}</div>}

      <div className="client-details-grid">
        <div className="details-card">
          <h3>Client Details</h3>
          <p>
            {/* UPDATED: Added status-pill class for styling */}
            <strong>Status:</strong>{' '}
            <span className={`status-pill status-${client.status.toLowerCase()}`}>
              {client.status}
            </span>
          </p>
          <p>
            <strong>Contract Start:</strong>{' '}
            {client.contractStartDate
              ? new Date(client.contractStartDate).toLocaleDateString()
              : 'N/A'}
          </p>
          <p>
            <strong>Contract End:</strong>{' '}
            {client.contractEndDate
              ? new Date(client.contractEndDate).toLocaleDateString()
              : 'N/A'}
          </p>
          <p>
            <strong>SLA Level:</strong> {client.securitySlaLevel || 'N/A'}
          </p>
          <p>
            <strong>Address:</strong> {client.address || 'N/A'}
          </p>
        </div>

        <div className="details-card">
          <h3>Primary Contact</h3>
          <p>
            <strong>Name:</strong> {client.primaryContact.name}
          </p>
          <p>
            <strong>Role:</strong> {client.primaryContact.role}
          </p>
          <p>
            <strong>Phone:</strong> {client.primaryContact.phone || 'N/A'}
          </p>
          <p>
            <strong>Email:</strong> {client.primaryContact.email}
          </p>
        </div>

        <div className="details-card">
          <h3>Company Info</h3>
          <p>
            <strong>Industry:</strong> {client.industry || 'N/A'}
          </p>
          <p>
            <strong>Website:</strong>{' '}
            <a href={client.website} target="_blank" rel="noopener noreferrer">
              {client.website}
            </a>
          </p>
          <p>
            <strong>Communication:</strong>{' '}
            {client.preferredCommunicationMethod || 'N/A'}
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
          <p>
            <strong>Last Balance:</strong> ${client.billingDetails.outstandingBalance ? client.billingDetails.outstandingBalance.toFixed(2) : '0.00'}
          </p>
          <button
            onClick={handleTogglePortalAccess}
            className="portal-access-btn">
            {/* Change button text based on the same check */}
            {client.portalAccessGranted ? 'Revoke Access' : 'Grant Access'}
          </button>
        </div>

        <div className="details-card">
          <h3>Billing Info</h3>
          <p>
            <strong>Payment Method:</strong> {client.billingDetails.paymentMethod || 'N/A'}
          </p>
          <p>
            <strong>Subscription Plan:</strong> {client.billingDetails.subscriptionPlan || 'N/A'}
          </p>
          <p>
            <strong>Incident History:</strong> {client.incidentHistory.length} recorded incidents
          </p>
        </div>

      </div>

      {client.additionalContacts.length > 0 && (
        <>
          <h2 className="section-title">Additional Contacts</h2>
          <div className="client-details-grid">
            {client.additionalContacts.map((contact, index) => (
              <div key={index} className="details-card">
                <h3>{contact.name}</h3>
                <p>
                  <strong>Role:</strong> {contact.role}
                </p>
                <p>
                  <strong>Email:</strong> {contact.email}
                </p>
                <p>
                  <strong>Phone:</strong> {contact.phone || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};