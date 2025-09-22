import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import CreateInvoiceModal from '../../components/Financials/CreateInvoiceModal';
import '../Settings/Settings.css';
import '../../components/Financials/Invoices.css';

interface IInvoice {
  _id: string;
  invoiceNumber: string;
  client: { _id: string; clientName: string };
  project: { _id: string; name: string };
  status: string;
  totalAmount: number;
  dueDate: string;
}

const InvoicesPage = () => {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchInvoices = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await axios.get('/api/v1/financials/invoices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(data);
    } catch (err) {
      setError('Failed to fetch invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`/api/v1/financials/invoices/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchInvoices();
      } catch (err) {
        setError('Failed to delete invoice.');
      }
    }
  };

  return (
    <>
      <CreateInvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInvoiceCreated={fetchInvoices}
      />
      <div className="settings-subpage">
        <header className="subpage-header">
          <h2>Invoices</h2>
        </header>
        <main className="settings-main">
          <div className="settings-section">
            <h3>Manage Invoices</h3>
            <p>Create and manage invoices for client projects.</p>
            <button
              className="save-button"
              onClick={() => setIsModalOpen(true)}>
              Create New Invoice
            </button>
          </div>
          <div className="settings-section">
            <h3>All Invoices</h3>
            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            <table className="settings-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Client</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td>{inv.invoiceNumber}</td>
                    <td>{inv.client?.clientName || 'N/A'}</td>
                    <td>{inv.project?.name || 'N/A'}</td>
                    <td>{inv.status}</td>
                    <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td>${inv.totalAmount.toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(inv._id)}
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

export default InvoicesPage;
