import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import CreateSubscriptionModal from '../../components/Subscriptions/CreateSubscriptionModal';
import '../Settings/Settings.css';

interface ISubscription {
  _id: string;
  client: { clientName: string };
  serviceName: string;
  renewalDate: string;
  billingCycle: string;
  cost: number;
  status: string;
}

const SubscriptionsPage = () => {
  const { token } = useAuth();
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSubscriptions = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await axios.get('/api/v1/subscriptions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscriptions(data);
    } catch (error) {
      console.error('Failed to fetch subscriptions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await axios.delete(`/api/v1/subscriptions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchSubscriptions();
      } catch (error) {
        console.error('Failed to delete subscription', error);
      }
    }
  };

  return (
    <>
      <CreateSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubscriptionCreated={fetchSubscriptions}
      />
      <div className="settings-subpage">
        <header className="subpage-header">
          <h2>Client Subscriptions</h2>
        </header>
        <main className="settings-main">
          <div className="settings-section">
            <h3>Manage Recurring Revenue</h3>
            <p>Track all active, paused, and canceled client subscriptions.</p>
            <button
              className="save-button"
              onClick={() => setIsModalOpen(true)}>
              New Subscription
            </button>
          </div>
          <div className="settings-section">
            <h3>All Subscriptions</h3>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="settings-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Cycle</th>
                    <th>Cost</th>
                    <th>Next Renewal</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub._id}>
                      <td>{sub.client?.clientName || 'N/A'}</td>
                      <td>{sub.serviceName}</td>
                      <td>{sub.status}</td>
                      <td>{sub.billingCycle}</td>
                      <td>${sub.cost.toFixed(2)}</td>
                      <td>{new Date(sub.renewalDate).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleDelete(sub._id)}
                          className="delete-button">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default SubscriptionsPage;
