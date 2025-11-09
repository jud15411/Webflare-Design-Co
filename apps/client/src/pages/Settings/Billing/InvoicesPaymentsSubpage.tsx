import React, { useState, useEffect } from 'react';
import API from '../../../utils/axios';
import { useAuth } from '../../../contexts/AuthContext';
import '../Settings.css';

interface InvoiceSettings {
  templates: string[];
  rules: string[];
}

interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
}

interface InvoicesPaymentsSubpageProps {
  onBack: () => void;
}

const InvoicesPaymentsSubpage: React.FC<InvoicesPaymentsSubpageProps> = ({
  onBack,
}) => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [invoices, setInvoices] = useState<RecentInvoice[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newRule, setNewRule] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setError('');
        setLoading(true);
        const [settingsRes, invoicesRes] = await Promise.all([
          // Fix: Updated API endpoints to match the new backend routes
          API.get(`/settings/billing/invoices/settings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          API.get(`/settings/billing/invoices/recent`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setSettings(settingsRes.data);
        setInvoices(invoicesRes.data);
      } catch (err) {
        setError('Failed to fetch data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchAllData();
    }
  }, [token]);

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // The backend does not support this route yet, but we will keep the endpoint as a placeholder for future implementation
      await API.post(
        `/settings/billing/invoices/rules`,
        { rule: newRule },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Payment rule added successfully!');
      setNewRule('');
      // Manually update the settings state since backend is in-memory
      setSettings((prev) =>
        prev ? { ...prev, rules: [...prev.rules, newRule] } : null
      );
    } catch (err) {
      setError('Failed to add rule.');
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading invoice settings...</div>;
  }

  if (error || !settings || !invoices) {
    return <div>{error || 'Could not load invoice settings.'}</div>;
  }

  return (
    <div className="settings-subpage">
      <header className="subpage-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h2>Invoices & Payments</h2>
      </header>
      <main className="settings-main">
        <div className="settings-section">
          <h3>Invoice Settings</h3>
          <div className="settings-card-grid">
            <div className="settings-card">
              <h4>Invoice Templates</h4>
              <ul>
                {settings.templates.map((template) => (
                  <li key={template}>{template}</li>
                ))}
              </ul>
            </div>
            <div className="settings-card">
              <h4>Payment Providers</h4>
              <p>Connect to a payment provider to accept payments online.</p>
              <button>Connect Stripe</button>
            </div>
          </div>
        </div>
        <div className="settings-section">
          <h3>Payment Rules</h3>
          <form onSubmit={handleAddRule} className="settings-form">
            <input
              type="text"
              placeholder="Add a new payment rule..."
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              required
            />
            <button type="submit" className="save-button">
              Add Rule
            </button>
          </form>
          <ul>
            {settings.rules.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        </div>
        <div className="settings-section">
          <h3>Recent Invoices</h3>
          <table className="settings-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.clientName}</td>
                  <td>${invoice.amount.toLocaleString()}</td>
                  <td>
                    <span
                      className={`status-badge status-${invoice.status.toLowerCase()}`}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default InvoicesPaymentsSubpage;
