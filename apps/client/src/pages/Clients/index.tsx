import React, { useState, useEffect } from 'react';
import API from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';
import { ClientModal } from '../../components/Clients/ClientModal';
import { useNavigate } from 'react-router-dom';
import './ClientsPage.css';

interface Client {
  _id: string;
  clientName: string;
  primaryContact: {
    name: string;
    email: string;
    role: string;
  };
  status: string;
  servicesPurchased: string[];
  assignedTeamMembers: { _id: string; name: string }[];
  portalAccessGranted?: boolean;
}

export const ClientsPage: React.FC = () => {
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const navigate = useNavigate();

  const fetchClients = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [token]);

  const handleOpenModal = (client: Client | null = null) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
    fetchClients();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Client Management</h1>
        <button className="add-client-btn" onClick={() => handleOpenModal()}>
          + Add New Client
        </button>
      </div>

      {loading ? (
        <p>Loading clients...</p>
      ) : (
        <div className="clients-grid">
          {clients.map((client) => (
            <div key={client._id} className="client-card">
              <h3>{client.clientName}</h3>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status-${client.status.toLowerCase()}`}>
                  {client.status}
                </span>
              </p>
              <p>
                <strong>Contact:</strong> {client.primaryContact.name} (
                {client.primaryContact.role})
              </p>
              <p>
                <strong>Portal Access:</strong>{' '}
                {client.portalAccessGranted ? 'Yes' : 'No'}
              </p>
              <div className="services-list">
                <strong>Services:</strong>
                <ul>
                  {client.servicesPurchased
                    .slice(0, 3)
                    .map((service, index) => (
                      <li key={index}>{service}</li>
                    ))}
                </ul>
              </div>

              <div className="card-actions">
                <button onClick={() => handleOpenModal(client)}>Edit</button>
                <button onClick={() => navigate(`/clients/${client._id}`)}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <ClientModal client={selectedClient} onClose={handleCloseModal} />
      )}
    </div>
  );
};
