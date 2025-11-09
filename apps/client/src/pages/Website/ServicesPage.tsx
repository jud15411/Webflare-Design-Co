import { useState, useEffect } from 'react';
import API from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';
import { ServiceModal } from '../../components/Website/ServiceModal';
import { ConfirmationModal } from '../../components/Common/ConfirmationModal/ConfirmationModal';
// Note: You must create and import the ServicesPage.css file for styling!

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
            const { data } = await API.get('/admin/website/services', {
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
            ? `/admin/website/services/${editingService._id}`
            : '/admin/website/services';
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
            await API.delete(`/admin/website/services/${serviceToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchServices();
            setIsConfirmModalOpen(false);
            setServiceToDelete(null);
        } catch (err) {
            setError('Failed to delete service.');
        }
    };

    // Helper functions for cleaner card actions
    const handleOpenEditModal = (service: Service) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (service: Service) => {
        setServiceToDelete(service);
        setIsConfirmModalOpen(true);
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
            
            {/* Main Page Container */}
            <div className="services-page-container">
                <header className="page-header">
                    <h1>Manage Services</h1>
                </header>

                {/* --- TOP SECTION: ADD NEW SERVICE BUTTON/CONTROLS --- */}
                <div className="service-controls-card">
                    <h2>Service Management</h2>
                    <button 
                        className="add-service-button" 
                        onClick={() => { setEditingService(null); setIsModalOpen(true); }}
                    >
                        Add New Service
                    </button>
                </div>

                {loading && <p className="loading-message">Loading services...</p>}
                {error && <p className="error-message">{error}</p>}

                {/* --- BOTTOM SECTION: SERVICE LIST GRID (Replaces Table) --- */}
                <div className="services-list-card">
                    <h2>Existing Services</h2>
                    <div className="services-grid">
                        {!loading && services.length === 0 ? (
                            <p className="no-services">No services found. Click "Add New Service" to get started.</p>
                        ) : (
                            services.map(service => (
                                <div key={service._id} className="service-card">
                                    <div className="service-header">
                                        <h3 className="service-name">{service.name}</h3>
                                        <span 
                                            className={`status-badge ${service.isActive ? 'status-active' : 'status-inactive'}`}
                                        >
                                            {service.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="service-description">{service.description}</p>
                                    
                                    <div className="service-actions">
                                        <button 
                                            className="action-button edit-button" 
                                            onClick={() => handleOpenEditModal(service)}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="action-button delete-button" 
                                            onClick={() => handleOpenDeleteModal(service)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ServicesPage;