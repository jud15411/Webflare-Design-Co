import React, { useState, useEffect } from 'react';
import API from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';
import './ClientModal.css';

// Define a clear interface for the client data passed to the modal
interface Client {
  _id: string;
  clientName: string;
  primaryContact: { name: string; role: string; email: string };
  status: string;
  servicesPurchased: string[];
  // Add other client properties here as your model expands
}

interface ClientModalProps {
  client: Client | null;
  onClose: () => void;
}

// Define the shape of our form data
type FormData = Omit<Partial<Client>, '_id'> & {
  clientName: string;
  primaryContact: { name: string; role: string; email: string };
  status: 'Active' | 'Inactive' | 'Prospect' | 'Lead' | 'Suspended';
  servicesPurchased: string[];
};

// Define a clear initial state for the form
const initialState: FormData = {
  clientName: '',
  primaryContact: { name: '', role: '', email: '' },
  status: 'Active',
  servicesPurchased: [],
};

export const ClientModal: React.FC<ClientModalProps> = ({
  client,
  onClose,
}) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialState);

  useEffect(() => {
    if (client) {
      // If editing, populate the form with the client's data
      setFormData({
        clientName: client.clientName || '',
        primaryContact: client.primaryContact || {
          name: '',
          role: '',
          email: '',
        },
        status: (client.status as FormData['status']) || 'Active',
        servicesPurchased: client.servicesPurchased || [],
      });
    } else {
      // If adding, reset to the initial state
      setFormData(initialState);
    }
  }, [client]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle nested properties like primaryContact.name
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.') as [keyof FormData, string];

      if (
        typeof formData[parentKey] === 'object' &&
        formData[parentKey] !== null
      ) {
        setFormData((prev) => ({
          ...prev,
          [parentKey]: {
            ...(prev[parentKey] as object),
            [childKey]: value,
          },
        }));
      }
    } else {
      // Handle top-level properties
      setFormData((prev) => ({
        ...prev,
        [name as keyof FormData]: value,
      }));
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const services = checked
        ? [...prev.servicesPurchased, value]
        : prev.servicesPurchased.filter((s) => s !== value);
      return { ...prev, servicesPurchased: services };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (client) {
        await API.put(`/clients/${client._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await API.post(`/clients`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save client', error);
      // Optionally, set an error state here to show a message to the user
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{client ? 'Edit Client' : 'Add New Client'}</h2>
        <form onSubmit={handleSubmit}>
          {/* Basic Info Section */}
          <fieldset>
            <legend>Basic Information</legend>
            <div className="form-group">
              <label>Client Name</label>
              <input
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Name</label>
              <input
                name="primaryContact.name"
                value={formData.primaryContact.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Role</label>
              <input
                name="primaryContact.role"
                value={formData.primaryContact.role}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                name="primaryContact.email"
                value={formData.primaryContact.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Prospect">Prospect</option>
                <option value="Lead">Lead</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </fieldset>

          {/* Services Section */}
          <fieldset>
            <legend>Services</legend>
            <div className="checkbox-group">
              {['Web Dev', 'Cybersecurity', 'Hosting', 'Consulting'].map(
                (service) => (
                  <label key={service}>
                    <input
                      type="checkbox"
                      value={service}
                      checked={formData.servicesPurchased.includes(service)}
                      onChange={handleServiceChange}
                    />
                    {service}
                  </label>
                )
              )}
            </div>
          </fieldset>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save Client</button>
          </div>
        </form>
      </div>
    </div>
  );
};
