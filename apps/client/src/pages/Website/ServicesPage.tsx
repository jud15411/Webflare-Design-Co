import { useState, useEffect } from 'react';
import API from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';
import { ServiceModal } from '../../components/Website/ServiceModal';
import { ConfirmationModal } from '../../components/Common/ConfirmationModal/ConfirmationModal';

interface Service {
  _id: string;
  name: string;
  description: string;
  icon?: string;
  isActive: boolean;
}

const ServicesPage = () => {
    const { token } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);


    const fetchServices = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/api/v1/admin/website/services', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setServices(data);
        } catch (err) {
            setError('Failed to fetch services.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchServices();
        }
    }, [token]);

    const handleSaveService = async (serviceData: Omit<Service, '_id'>) => {
        const url = editingService
            ? `/api/v1/admin/website/services/${editingService._id}`
            : '/api/v1/admin/website/services';
        const method = editingService ? 'put' : 'post';

        try {
            await API[method](url, serviceData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchServices();
            setIsModalOpen(false);
            setEditingService(null);
        } catch (err) {
            setError('Failed to save service.');
        }
    };

    const handleDeleteService = async () => {
        if (!serviceToDelete) return;

        try {
            await API.delete(`/api/v1/admin/website/services/${serviceToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchServices();
            setIsConfirmModalOpen(false);
            setServiceToDelete(null);
        } catch (err) {
            setError('Failed to delete service.');
        }
    };


    return (
        <>
            <ServiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveService}
                service={editingService}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteService}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the service "${serviceToDelete?.name}"?`}
                variant="danger"
            />
            <div className="page-container">
                <div className="page-header">
                    <h1>Manage Services</h1>
                    <button className="add-project-button" onClick={() => { setEditingService(null); setIsModalOpen(true); }}>
                        + Add Service
                    </button>
                </div>
                {loading && <p>Loading services...</p>}
                {error && <p className="error-message">{error}</p>}
                <div className="table-container">
                    <table className="pro-table">
                        <thead>
                            <tr>
                                <th>Service Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(service => (
                                <tr key={service._id}>
                                    <td>{service.name}</td>
                                    <td>{service.description}</td>
                                    <td>
                                        <span className={`status-badge ${service.isActive ? 'status-completed' : 'status-on-hold'}`}>
                                            {service.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-button" onClick={() => { setEditingService(service); setIsModalOpen(true); }}>Edit</button>
                                        <button className="action-button" onClick={() => { setServiceToDelete(service); setIsConfirmModalOpen(true); }}>Delete</button>
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

export default ServicesPage;