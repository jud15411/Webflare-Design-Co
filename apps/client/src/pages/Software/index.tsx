import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './Software.css';

interface SoftwareAsset {
  _id: string;
  name: string;
  licenseKey: string;
  purchaseDate: string;
  assignedTo: string;
  assignedToName: string;
  notes?: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const SoftwarePage = () => {
  const [assets, setAssets] = useState<SoftwareAsset[]>([]);
  const [form, setForm] = useState({
    name: '',
    licenseKey: '',
    purchaseDate: '',
    assignedToName: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // NOTE: You will need a way to get the `assignedTo` (user ID)
  // from the user name. This example uses a hardcoded ID for now.
  const [hardcodedAssignedToId] = useState('6549a1d37446e16f5c8845e2');

  const fetchAssets = async () => {
    try {
      setError('');
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/v1/software`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssets(data);
    } catch (err) {
      setError('Failed to fetch software assets.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAssets();
    }
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(
        `${API_URL}/api/v1/software`,
        { ...form, assignedTo: hardcodedAssignedToId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm({
        name: '',
        licenseKey: '',
        purchaseDate: '',
        assignedToName: '',
        notes: '',
      });
      fetchAssets();
    } catch (err) {
      setError(
        'Failed to create software asset. Check for duplicate license keys.'
      );
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await axios.delete(`${API_URL}/api/v1/software/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchAssets();
      } catch (err) {
        setError('Failed to delete asset.');
        console.error(err);
      }
    }
  };

  return (
    <div className="software-container">
      <header className="software-header">
        <h1>Software Asset Management</h1>
        <p>Manage all company software licenses and assets.</p>
      </header>

      <div className="software-content">
        <section className="software-create-form">
          <h2>Add New Software</h2>
          <form onSubmit={handleSubmit} className="software-form">
            <input
              type="text"
              name="name"
              placeholder="Software Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="licenseKey"
              placeholder="License Key"
              value={form.licenseKey}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="purchaseDate"
              value={form.purchaseDate}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="assignedToName"
              placeholder="Assigned To (User Name)"
              value={form.assignedToName}
              onChange={handleChange}
              required
            />
            <textarea
              name="notes"
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={handleChange}></textarea>
            {error && <p className="software-error">{error}</p>}
            <button type="submit" className="software-btn-submit">
              Add Asset
            </button>
          </form>
        </section>

        <section className="software-asset-list">
          <h2>Existing Assets</h2>
          {loading ? (
            <div className="software-loading">Loading assets...</div>
          ) : assets.length > 0 ? (
            <div className="software-assets-grid">
              {assets.map((asset) => (
                <div key={asset._id} className="software-asset-card">
                  <h3>{asset.name}</h3>
                  <p>
                    **License Key:** {asset.licenseKey}
                    <br />
                    **Assigned To:** {asset.assignedToName}
                    <br />
                    **Purchased:**{' '}
                    {new Date(asset.purchaseDate).toLocaleDateString()}
                  </p>
                  {asset.notes && (
                    <p className="asset-notes">**Notes:** {asset.notes}</p>
                  )}
                  <button
                    onClick={() => handleDelete(asset._id)}
                    className="software-btn-delete">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="software-no-assets">No software assets found.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SoftwarePage;
