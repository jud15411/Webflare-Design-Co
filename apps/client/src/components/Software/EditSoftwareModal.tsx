import React, { useState, useEffect } from 'react';
import API from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';
import '../../pages/Software/Software.css'; // Reusing the same CSS

interface SoftwareAsset {
  _id: string;
  name: string;
  licenseKey: string;
  purchaseDate: string;
  assignedTo: string;
  assignedToName: string;
  notes?: string;
}

interface EditSoftwareModalProps {
  asset: SoftwareAsset | null;
  onClose: () => void;
  onAssetUpdated: () => void;
}

const EditSoftwareModal = ({
  asset,
  onClose,
  onAssetUpdated,
}: EditSoftwareModalProps) => {
  const [form, setForm] = useState({
    name: asset?.name || '',
    licenseKey: asset?.licenseKey || '',
    purchaseDate: asset?.purchaseDate.substring(0, 10) || '',
    assignedToName: asset?.assignedToName || '',
    notes: asset?.notes || '',
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (asset) {
      setForm({
        name: asset.name,
        licenseKey: asset.licenseKey,
        purchaseDate: asset.purchaseDate.substring(0, 10),
        assignedToName: asset.assignedToName,
        notes: asset.notes || '',
      });
    }
  }, [asset]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !token) return;

    setIsSaving(true);
    setError('');

    try {
      await API.put(`/software/${asset._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onAssetUpdated();
      onClose();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'Failed to update asset. Please try again.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!asset) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Software Asset</h2>
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
          <div className="modal-actions">
            <button type="submit" className="kb-btn-submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="kb-btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSoftwareModal;
