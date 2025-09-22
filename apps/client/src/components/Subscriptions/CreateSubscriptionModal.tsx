import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './Subscriptions.css';

interface IClient {
  _id: string;
  clientName: string;
}
interface IUser {
  _id: string;
  name: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionCreated: () => void;
}

const CreateSubscriptionModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubscriptionCreated,
}) => {
  const { token } = useAuth();
  const [clients, setClients] = useState<IClient[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [formData, setFormData] = useState({
    client: '',
    serviceName: '',
    startDate: new Date().toISOString().split('T')[0],
    renewalDate: '',
    billingCycle: 'Monthly',
    cost: '',
    status: 'Active',
    assignedTeamMember: '',
    notes: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    // Fetch clients and users for dropdowns
    const fetchData = async () => {
      try {
        const [clientRes, userRes] = await Promise.all([
          axios.get('/api/v1/clients', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/v1/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setClients(clientRes.data);
        setUsers(userRes.data);
      } catch (error) {
        console.error('Failed to fetch data for form', error);
      }
    };
    fetchData();
  }, [isOpen, token]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/v1/subscriptions',
        {
          ...formData,
          cost: parseFloat(formData.cost),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onSubscriptionCreated();
      onClose();
    } catch (error) {
      console.error('Failed to create subscription', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>New Client Subscription</h2>
        <form onSubmit={handleSubmit}>
          <div className="modal-form">
            <select
              name="client"
              value={formData.client}
              onChange={handleChange}
              required>
              <option value="">-- Select Client --</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.clientName}
                </option>
              ))}
            </select>
            <input
              name="serviceName"
              placeholder="Service Name (e.g., Maintenance Plan)"
              value={formData.serviceName}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="renewalDate"
              value={formData.renewalDate}
              onChange={handleChange}
              required
            />
            <select
              name="billingCycle"
              value={formData.billingCycle}
              onChange={handleChange}>
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Yearly</option>
            </select>
            <input
              type="number"
              name="cost"
              placeholder="Cost per Cycle"
              value={formData.cost}
              onChange={handleChange}
              required
            />
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}>
              <option>Active</option>
              <option>Paused</option>
              <option>Canceled</option>
            </select>
            <select
              name="assignedTeamMember"
              value={formData.assignedTeamMember}
              onChange={handleChange}>
              <option value="">-- Assign Team Member --</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
            <textarea
              className="full-width"
              name="notes"
              placeholder="Notes (discounts, special terms, etc.)"
              value={formData.notes}
              onChange={handleChange}
            />
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="cancel-button">
                Cancel
              </button>
              <button type="submit" className="save-button">
                Save Subscription
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubscriptionModal;
