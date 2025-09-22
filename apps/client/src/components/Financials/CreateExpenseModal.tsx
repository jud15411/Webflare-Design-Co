import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './Expenses.css';

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseCreated: () => void;
}

const CreateExpenseModal: React.FC<CreateExpenseModalProps> = ({
  isOpen,
  onClose,
  onExpenseCreated,
}) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    category: '',
    vendor: '',
    amount: '',
    expenseDate: '',
  });
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(
        '/api/v1/financials/expenses',
        {
          ...formData,
          amount: parseFloat(formData.amount),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onExpenseCreated();
      onClose();
      // Reset form
      setFormData({ category: '', vendor: '', amount: '', expenseDate: '' });
    } catch (err) {
      setError('Failed to log expense. Please check the details.');
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Log New Expense</h2>
        <form onSubmit={handleSubmit}>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required>
            <option value="">Select Category</option>
            <option value="Software">Software & Subscriptions</option>
            <option value="Hardware">Hardware</option>
            <option value="Marketing">Marketing & Advertising</option>
            <option value="Office">Office Supplies</option>
            <option value="Travel">Travel</option>
            <option value="Other">Other</option>
          </select>
          <input
            name="vendor"
            placeholder="Vendor or Store"
            value={formData.vendor}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="expenseDate"
            value={formData.expenseDate}
            onChange={handleChange}
            required
          />

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button type="submit" className="save-button">
              Save Expense
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

export default CreateExpenseModal;
