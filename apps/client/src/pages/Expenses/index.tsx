import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import CreateExpenseModal from '../../components/Financials/CreateExpenseModal';
import '../Settings/Settings.css'; // Reusing some base styles
import '../../components/Financials/Expenses.css'; // Import new specific styles

interface IExpense {
  _id: string;
  category: string;
  vendor: string;
  amount: number;
  expenseDate: string;
}

const ExpensesPage = () => {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExpenses = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await axios.get('/api/v1/financials/expenses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(data);
    } catch (err) {
      setError('Failed to fetch expenses.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`/api/v1/financials/expenses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchExpenses(); // Refresh list after deletion
      } catch (err) {
        setError('Failed to delete expense.');
        console.error(err);
      }
    }
  };

  const totalExpenses = expenses.reduce(
    (acc, expense) => acc + expense.amount,
    0
  );

  return (
    <>
      <CreateExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExpenseCreated={fetchExpenses}
      />
      <div className="settings-subpage">
        <header className="subpage-header">
          <h2>Expenses</h2>
        </header>
        <main className="settings-main">
          <div className="settings-section">
            <h3>Manage Expenses</h3>
            <p>Log and track all company-related expenses.</p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <button
                className="save-button"
                onClick={() => setIsModalOpen(true)}>
                Log New Expense
              </button>
              <h3>Total: ${totalExpenses.toFixed(2)}</h3>
            </div>
          </div>
          <div className="settings-section">
            <h3>All Expenses</h3>
            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            <table className="settings-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp._id}>
                    <td>{new Date(exp.expenseDate).toLocaleDateString()}</td>
                    <td>{exp.category}</td>
                    <td>{exp.vendor}</td>
                    <td>${exp.amount.toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(exp._id)}
                        className="delete-button">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
};

export default ExpensesPage;
