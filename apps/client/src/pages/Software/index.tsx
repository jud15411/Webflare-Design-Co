import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './Software.css';
import { ConfirmationModal } from '../../components/Common/ConfirmationModal/ConfirmationModal';
import EditSoftwareModal from '../../components/Software/EditSoftwareModal';

interface SoftwareAsset {
  _id: string;
  name: string;
  licenseKey: string;
  purchaseDate: string;
  assignedTo: string;
  assignedToName: string;
  notes?: string;
}

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
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [assetToDeleteId, setAssetToDeleteId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<SoftwareAsset | null>(null);
  const { token } = useAuth();

  // NOTE: You will need a way to get the `assignedTo` (user ID)
  // from the user name. This example uses a hardcoded ID for now.
  const [hardcodedAssignedToId] = useState('6549a1d37446e16f5c8845e2');

  const fetchAssets = async () => {
    try {
      setError('');
      setLoading(true);
      const { data } = await axios.get(`/api/v1/software`, {
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
        `/api/v1/software`,
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

  const handleDeleteClick = (id: string) => {
    setAssetToDeleteId(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!assetToDeleteId) return;
    try {
      await axios.delete(`/api/v1/software/${assetToDeleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAssets();
    } catch (err) {
      setError('Failed to delete asset.');
      console.error(err);
    } finally {
      setIsConfirmModalOpen(false);
      setAssetToDeleteId(null);
    }
  };

  const handleEditClick = (asset: SoftwareAsset) => {
    setEditingAsset(asset);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingAsset(null);
  };

  return (
    <div className="kb-page-container">
      <header className="kb-header">
        <h1>Software Asset Management</h1>
        <p>Manage all company software licenses and assets.</p>
      </header>

      <div className="kb-layout">
        <section className="kb-create-form-card">
          <h2>Add New Software</h2>
          <form onSubmit={handleSubmit} className="kb-form">
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
            {error && <p className="kb-error">{error}</p>}
            <button type="submit" className="kb-btn-submit">
              Add Asset
            </button>
          </form>
        </section>

        <section className="kb-list-card">
          <h2>Existing Assets</h2>
          {loading ? (
            <div className="kb-loading">Loading assets...</div>
          ) : assets.length > 0 ? (
            <div className="kb-assets-grid">
              {assets.map((asset) => (
                <div key={asset._id} className="kb-asset-card">
                  <h3>{asset.name}</h3>
                  <p className="kb-asset-meta">
                    <b>License Key:</b> {asset.licenseKey}
                    <br />
                    <b>Assigned To:</b> {asset.assignedToName}
                    <br />
                    <b>Purchased:</b>{' '}
                    {new Date(asset.purchaseDate).toLocaleDateString()}
                  </p>
                  {asset.notes && (
                    <p className="kb-asset-notes">
                      <b>Notes:</b> {asset.notes}
                    </p>
                  )}
                  <div className="kb-asset-actions">
                    <button
                      onClick={() => handleEditClick(asset)}
                      className="kb-btn-edit">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(asset._id)}
                      className="kb-btn-delete">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="kb-no-assets">No software assets found.</div>
          )}
        </section>
      </div>

      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirm Deletion"
          message="Are you sure you want to permanently delete this software asset?"
          confirmText="Delete"
          variant="danger"
        />
      )}

      {isEditModalOpen && (
        <EditSoftwareModal
          asset={editingAsset}
          onClose={closeEditModal}
          onAssetUpdated={fetchAssets}
        />
      )}
    </div>
  );
};

export default SoftwarePage;
