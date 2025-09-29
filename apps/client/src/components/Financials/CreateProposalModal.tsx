import React, { useState, useEffect } from 'react';
import API from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';
import './Proposals.css';

interface IClient {
  _id: string;
  clientName: string;
}

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProposalCreated: () => void;
}

const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  isOpen,
  onClose,
  onProposalCreated,
}) => {
  const { token, user } = useAuth();
  const [clients, setClients] = useState<IClient[]>([]);
  const [formData, setFormData] = useState({
    client: '',
    contactPerson: '',
    projectTitle: '',
    projectOverview: '',
    goals: '',
    scopeOfWork: '',
    deliverables: '',
    startDate: '',
    completionDate: '',
    milestones: '',
    lineItems: [{ description: '', quantity: 1, price: 0 }],
    totalAmount: 0,
    paymentTerms: '50% upfront, 50% on completion',
    assumptions: '',
    exclusions: '',
    legalTerms: '',
    assignedTeamMember: user?.name || '',
    internalStatus: 'Draft',
    status: 'Draft',
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await API.get('/api/v1/financials/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClients(data);
      } catch (error) {
        console.error('Failed to fetch clients', error);
      }
    };
    if (isOpen && token) {
      fetchClients();
    }
  }, [isOpen, token]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const items = [...formData.lineItems];
    items[index] = { ...items[index], [name]: value };
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

  const calculateTotal = () => {
    const total = formData.lineItems.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );
    setFormData((prev) => ({ ...prev, totalAmount: total }));
  };

  useEffect(calculateTotal, [formData.lineItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/api/v1/financials/proposals', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onProposalCreated();
      onClose();
    } catch (error) {
      console.error('Failed to create proposal', error);
      // You can add error handling feedback here
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Create New Proposal</h2>
        <form onSubmit={handleSubmit}>
          {/* Client Information */}
          <div className="form-section">
            <h3>Client Information</h3>
            <select
              name="client"
              value={formData.client}
              onChange={handleChange}
              required>
              <option value="">Select a Client</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.clientName}
                </option>
              ))}
            </select>
            <input
              name="contactPerson"
              placeholder="Contact Person & Email"
              value={formData.contactPerson}
              onChange={handleChange}
              required
            />
            <input
              name="projectTitle"
              placeholder="Project Title"
              value={formData.projectTitle}
              onChange={handleChange}
              required
            />
          </div>

          {/* Project Overview */}
          <div className="form-section">
            <h3>Project Overview</h3>
            <textarea
              name="projectOverview"
              placeholder="Short description of the project"
              value={formData.projectOverview}
              onChange={handleChange}
              required
            />
            <textarea
              name="goals"
              placeholder="Goals & Objectives"
              value={formData.goals}
              onChange={handleChange}
            />
          </div>

          {/* Scope of Work */}
          <div className="form-section">
            <h3>Scope & Deliverables</h3>
            <textarea
              name="scopeOfWork"
              placeholder="Detailed list of tasks/services"
              value={formData.scopeOfWork}
              onChange={handleChange}
              required
            />
            <textarea
              name="deliverables"
              placeholder="Deliverables (e.g., 'Custom website with 6 pages')"
              value={formData.deliverables}
              onChange={handleChange}
            />
          </div>

          {/* Timeline */}
          <div className="form-section">
            <h3>Timeline</h3>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="completionDate"
              value={formData.completionDate}
              onChange={handleChange}
              required
            />
            <textarea
              name="milestones"
              placeholder="Milestones (optional)"
              value={formData.milestones}
              onChange={handleChange}
            />
          </div>

          {/* Pricing */}
          <div className="form-section">
            <h3>Pricing</h3>
            {formData.lineItems.map((item, index) => (
              <div key={index} className="line-item">
                <input
                  name="description"
                  placeholder="Service Description"
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
            <input
              name="paymentTerms"
              placeholder="Payment Terms"
              value={formData.paymentTerms}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="save-button">
              Save Proposal
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

export default CreateProposalModal;
