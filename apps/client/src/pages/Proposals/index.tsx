import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import CreateProposalModal from '../../components/Financials/CreateProposalModal';
import '../Settings/Settings.css';
import '../../components/Financials/Proposals.css'; // Import the new CSS

interface IProposal {
  _id: string;
  client: { _id: string; clientName: string };
  status: string;
  totalAmount: number;
  createdAt: string;
}

const ProposalsPage = () => {
  const { token } = useAuth();
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/v1/financials/proposals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProposals(data);
    } catch (err) {
      setError('Failed to fetch proposals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProposals();
    }
  }, [token]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      try {
        await axios.delete(`/api/v1/financials/proposals/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchProposals(); // Refresh list
      } catch (err) {
        setError('Failed to delete proposal.');
      }
    }
  };

  return (
    <>
      <CreateProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProposalCreated={fetchProposals}
      />
      <div className="settings-subpage">
        <header className="subpage-header">
          <h2>Proposals</h2>
        </header>
        <main className="settings-main">
          <div className="settings-section">
            <h3>Manage Proposals</h3>
            <p>Create, view, and manage client proposals.</p>
            <button
              className="save-button"
              onClick={() => setIsModalOpen(true)}>
              Create New Proposal
            </button>
          </div>
          <div className="settings-section">
            <h3>All Proposals</h3>
            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            <table className="settings-table">
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => (
                  <tr key={p._id}>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>{p.client?.clientName || 'N/A'}</td>
                    <td>{p.status}</td>
                    <td>${p.totalAmount.toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="delete-button">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProposalsPage;
