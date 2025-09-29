import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { PricingModal } from '../../components/Website/PricingModal';
import { ConfirmationModal } from '../../components/Common/ConfirmationModal/ConfirmationModal';

interface PricingTier {
  _id: string;
  name: string;
  price: string;
  frequency: 'monthly' | 'yearly' | 'one-time';
  features: string[];
  isFeatured: boolean;
  isActive: boolean;
}

const PricingPage = () => {
    const { token } = useAuth();
    const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState<PricingTier | null>(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [tierToDelete, setTierToDelete] = useState<PricingTier | null>(null);

    const fetchPricingTiers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/v1/admin/website/pricing', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPricingTiers(data);
        } catch (err) {
            setError('Failed to fetch pricing tiers.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchPricingTiers();
        }
    }, [token]);

    const handleSaveTier = async (tierData: Omit<PricingTier, '_id' | 'features'> & { features: string }) => {
        const url = editingTier
            ? `/api/v1/admin/website/pricing/${editingTier._id}`
            : '/api/v1/admin/website/pricing';
        const method = editingTier ? 'put' : 'post';

        try {
            await axios[method](url, {
                ...tierData,
                features: tierData.features.split('\n'),
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchPricingTiers();
            setIsModalOpen(false);
            setEditingTier(null);
        } catch (err) {
            setError('Failed to save pricing tier.');
        }
    };

    const handleDeleteTier = async () => {
        if (!tierToDelete) return;

        try {
            await axios.delete(`/api/v1/admin/website/pricing/${tierToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchPricingTiers();
            setIsConfirmModalOpen(false);
            setTierToDelete(null);
        } catch (err) {
            setError('Failed to delete pricing tier.');
        }
    };

    return (
        <>
            <PricingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTier}
                tier={editingTier}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteTier}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the pricing tier "${tierToDelete?.name}"?`}
                variant="danger"
            />
            <div className="page-container">
                <div className="page-header">
                    <h1>Manage Pricing Tiers</h1>
                    <button className="add-project-button" onClick={() => { setEditingTier(null); setIsModalOpen(true); }}>
                        + Add Tier
                    </button>
                </div>
                {loading && <p>Loading pricing tiers...</p>}
                {error && <p className="error-message">{error}</p>}
                <div className="table-container">
                    <table className="pro-table">
                        <thead>
                            <tr>
                                <th>Tier Name</th>
                                <th>Price</th>
                                <th>Frequency</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pricingTiers.map(tier => (
                                <tr key={tier._id}>
                                    <td>{tier.name}</td>
                                    <td>{tier.price}</td>
                                    <td>{tier.frequency}</td>
                                    <td>
                                        <span className={`status-badge ${tier.isActive ? 'status-completed' : 'status-on-hold'}`}>
                                            {tier.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-button" onClick={() => { setEditingTier(tier); setIsModalOpen(true); }}>Edit</button>
                                        <button className="action-button" onClick={() => { setTierToDelete(tier); setIsConfirmModalOpen(true); }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default PricingPage;