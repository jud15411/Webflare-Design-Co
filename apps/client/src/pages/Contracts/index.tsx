import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ContractsPage.css';

interface Contract {
  _id: string;
  client: {
    clientName: string;
  };
  serviceType: string[];
  status: string;
  createdAt: string;
}

export const ContractsPage: React.FC = () => {
  const { token } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContracts = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const { data } = await axios.get('/api/v1/contracts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContracts(data);
      } catch (error) {
        console.error('Failed to fetch contracts', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, [token]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Contracts</h1>
        <button
          className="add-contract-btn"
          onClick={() => navigate('/contracts/create')}>
          + Create New Contract
        </button>
      </div>

      {loading ? (
        <p>Loading contracts...</p>
      ) : (
        <div className="contracts-list">
          <table className="pro-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Service Type(s)</th>
                <th>Status</th>
                <th>Created On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract._id}>
                  <td>{contract.client.clientName}</td>
                  <td>{contract.serviceType.join(', ')}</td>
                  <td>
                    <span
                      className={`status-badge status-${contract.status.toLowerCase()}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td>{new Date(contract.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => navigate(`/contracts/${contract._id}`)}>
                      View/Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
