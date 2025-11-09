import React, { useState, useEffect } from 'react';
import API from '../../../utils/axios';
import { useAuth } from '../../../contexts/AuthContext';
import '../Settings.css';

// Fix: Use a type for better compatibility
type Service = {
  _id: string;
  name: string;
  price: number;
  description: string;
};

interface ServicesManagementSubpageProps {
  onBack: () => void;
}

const ServicesManagementSubpage: React.FC<ServicesManagementSubpageProps> = ({
  onBack,
}) => {
  const { token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', price: 0, description: '' });

  const fetchServices = async () => {
    try {
      setError('');
      setLoading(true);
      // Fix: Update API endpoint to match the backend
      const { data } = await API.get(
        `/settings/company-info/services`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setServices(data);
    } catch (err) {
      setError('Failed to fetch services.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchServices();
    }
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Fix: Update API endpoint to match the backend
      await API.post(`/settings/company-info/services`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ name: '', price: 0, description: '' });
      fetchServices(); // Refresh list
    } catch (err) {
      setError('Failed to add service.');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        // Fix: Update API endpoint to match the backend
        await API.delete(`/settings/company-info/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchServices(); // Refresh list
      } catch (err) {
        setError('Failed to delete service.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div>Loading services...</div>;
  }

  return (
    <div className="settings-subpage">
      <header className="subpage-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h2>Services Management</h2>
      </header>
      <div className="settings-section">
        <h3>Add New Service</h3>
        <form onSubmit={handleAddService} className="settings-form">
          <input
            type="text"
            name="name"
            placeholder="Service Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="save-button">
            Add Service
          </button>
        </form>
      </div>
      <div className="settings-section">
        <h3>Existing Services</h3>
        <div className="settings-card-grid">
          {services.length > 0 ? (
            services.map((service) => (
              <div key={service._id} className="settings-card">
                <h4>{service.name}</h4>
                <p>
                  <strong>Price:</strong> ${service.price.toLocaleString()}
                </p>
                <p>{service.description}</p>
                <button
                  onClick={() => handleDelete(service._id)}
                  className="delete-button">
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p>No services found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesManagementSubpage;
