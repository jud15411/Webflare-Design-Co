import React, { useState, useEffect } from 'react';
import API from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';
import { ClientModal } from '../../components/Clients/ClientModal';
import { useNavigate } from 'react-router-dom';
import { type Client } from '../../types/client'; // Import the updated Client interface
import './ClientsPage.css';


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
      // The backend now merges portal access status into the client object
      const { data } = await API.get(`/clients`, { 
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients', error);
      // NOTE: In a real app, show a notification to the user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [token]); 

  const handleOpenModal = (client: Client | null) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = (didUpdate = false) => {
    setIsModalOpen(false);
    setSelectedClient(null);
    if (didUpdate) {
      fetchClients(); // Refresh list if a client was added/edited
    }
  };

  if (loading) {
    return <div className="page-container">Loading clients...</div>;
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Clients Management ({clients.length})</h1>
        <button onClick={() => handleOpenModal(null)} className="add-client-btn">
          Add New Client
        </button>
      </header>

      {clients.length === 0 ? (
        <p className="no-data-message">No clients found. Click 'Add New Client' to get started.</p>
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
                    .map((service: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, index: React.Key | null | undefined) => (
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