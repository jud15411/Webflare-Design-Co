import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { PortfolioModal } from '../../components/Website/PortfolioModal';
import { ConfirmationModal } from '../../components/Common/ConfirmationModal/ConfirmationModal';

interface PortfolioItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
  category: 'Web Development' | 'Cybersecurity' | 'Consulting';
  isActive: boolean;
}

const PortfolioPage = () => {
    const { token } = useAuth();
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<PortfolioItem | null>(null);

    const fetchPortfolioItems = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/v1/admin/website/portfolio', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPortfolioItems(data);
        } catch (err) {
            setError('Failed to fetch portfolio items.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchPortfolioItems();
        }
    }, [token]);

    const handleSaveItem = async (itemData: Omit<PortfolioItem, '_id'>) => {
        const url = editingItem
            ? `/api/v1/admin/website/portfolio/${editingItem._id}`
            : '/api/v1/admin/website/portfolio';
        const method = editingItem ? 'put' : 'post';

        try {
            await axios[method](url, itemData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchPortfolioItems();
            setIsModalOpen(false);
            setEditingItem(null);
        } catch (err) {
            setError('Failed to save portfolio item.');
        }
    };

    const handleDeleteItem = async () => {
        if (!itemToDelete) return;

        try {
            await axios.delete(`/api/v1/admin/website/portfolio/${itemToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchPortfolioItems();
            setIsConfirmModalOpen(false);
            setItemToDelete(null);
        } catch (err) {
            setError('Failed to delete portfolio item.');
        }
    };

    return (
        <>
            <PortfolioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveItem}
                item={editingItem}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteItem}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the portfolio item "${itemToDelete?.title}"?`}
                variant="danger"
            />
            <div className="page-container">
                <div className="page-header">
                    <h1>Manage Portfolio</h1>
                    <button className="add-project-button" onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
                        + Add Portfolio Item
                    </button>
                </div>
                {loading && <p>Loading portfolio items...</p>}
                {error && <p className="error-message">{error}</p>}
                <div className="table-container">
                    <table className="pro-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {portfolioItems.map(item => (
                                <tr key={item._id}>
                                    <td>{item.title}</td>
                                    <td>{item.category}</td>
                                    <td>
                                        <span className={`status-badge ${item.isActive ? 'status-completed' : 'status-on-hold'}`}>
                                            {item.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-button" onClick={() => { setEditingItem(item); setIsModalOpen(true); }}>Edit</button>
                                        <button className="action-button" onClick={() => { setItemToDelete(item); setIsConfirmModalOpen(true); }}>Delete</button>
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

export default PortfolioPage;