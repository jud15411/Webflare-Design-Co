import React, { useState, useEffect } from 'react';
import API from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';
import './Invoices.css';

interface IClient {
  _id: string;
  clientName: string;
}
interface IProject {
  _id: string;
  name: string;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: () => void;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onInvoiceCreated,
}) => {
  const { token } = useAuth();
  const [clients, setClients] = useState<IClient[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    project: '',
    lineItems: [{ description: '', quantity: 1, price: 0 }],
    totalAmount: 0,
    issueDate: '',
    dueDate: '',
    status: 'Draft',
  });

  // Fetch clients when modal opens
  useEffect(() => {
    const fetchClients = async () => {
      if (!token) return;
      try {
        const { data } = await API.get('/api/v1/financials/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClients(data);
      } catch (error) {
        console.error('Failed to fetch clients', error);
      }
    };
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen, token]);

  // Fetch projects when a client is selected
  useEffect(() => {
    const fetchProjects = async () => {
      if (!selectedClient || !token) return;
      try {
        const { data } = await API.get(
          `/api/v1/financials/clients/${selectedClient}/projects`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects', error);
        setProjects([]);
      }
    };
    fetchProjects();
  }, [selectedClient, token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClient(e.target.value);
    setFormData((prev) => ({ ...prev, project: '' }));
  };

  const handleLineItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const items = [...formData.lineItems];
    items[index] = { ...items[index], [e.target.name]: e.target.value };
    setFormData((prev) => ({ ...prev, lineItems: items }));
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { description: '', quantity: 1, price: 0 },
      ],
    }));
  };

  useEffect(() => {
    const total = formData.lineItems.reduce(
      (acc, item) => acc + Number(item.quantity) * Number(item.price),
      0
    );
    setFormData((prev) => ({ ...prev, totalAmount: total }));
  }, [formData.lineItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post(
        '/api/v1/financials/invoices',
        {
          ...formData,
          client: selectedClient,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onInvoiceCreated();
      onClose();
    } catch (error) {
      console.error('Failed to create invoice', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Create New Invoice</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Client & Project</h3>
            <select
              value={selectedClient}
              onChange={handleClientChange}
              required>
              <option value="">Select a Client</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.clientName}
                </option>
              ))}
            </select>
            <select
              name="project"
              value={formData.project}
              onChange={handleChange}
              required
              disabled={!selectedClient}>
              <option value="">Select a Project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <h3>Invoice Details</h3>
            <input
              name="invoiceNumber"
              placeholder="Invoice Number (e.g., INV-001)"
              value={formData.invoiceNumber}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-section">
            <h3>Line Items</h3>
            {formData.lineItems.map((item, index) => (
              <div key={index} className="line-item">
                <input
                  name="description"
                  placeholder="Service/Product"
                  value={item.description}
                  onChange={(e) => handleLineItemChange(index, e)}
                />
                <input
                  type="number"
                  name="quantity"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleLineItemChange(index, e)}
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => handleLineItemChange(index, e)}
                />
              </div>
            ))}
            <button type="button" onClick={addLineItem}>
              Add Item
            </button>
            <h4>Total: ${formData.totalAmount.toFixed(2)}</h4>
          </div>

          <div className="modal-actions">
            <button type="submit" className="save-button">
              Create Invoice
            </button>
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;
