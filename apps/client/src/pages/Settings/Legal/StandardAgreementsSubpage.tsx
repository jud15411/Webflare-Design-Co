import React, { useState, useEffect } from 'react';
import API from '../../../utils/axios';
import { useAuth } from '../../../contexts/AuthContext';
import '../Settings.css';

interface Agreement {
  _id: string;
  title: string;
  content: string;
}

interface StandardAgreementsSubpageProps {
  onBack: () => void;
}

const StandardAgreementsSubpage: React.FC<StandardAgreementsSubpageProps> = ({
  onBack,
}) => {
  const { token } = useAuth();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', content: '' });

  const fetchAgreements = async () => {
    try {
      setError('');
      setLoading(true);
      // Fix: Updated API endpoint to match the new backend route
      const { data } = await API.get(`/api/v1/settings/legal/agreements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgreements(data);
    } catch (err) {
      setError('Failed to fetch agreements.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAgreements();
    }
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Fix: Updated API endpoint to match the new backend route
      await API.post(`/api/v1/settings/legal/agreements`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ title: '', content: '' });
      fetchAgreements(); // Refresh list
    } catch (err) {
      setError('Failed to add agreement.');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this agreement?')) {
      try {
        // Fix: Updated API endpoint to match the new backend route
        await API.delete(`/api/v1/settings/legal/agreements/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchAgreements(); // Refresh list
      } catch (err) {
        setError('Failed to delete agreement.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div>Loading agreements...</div>;
  }

  return (
    <div className="settings-subpage">
      <header className="subpage-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h2>Standard Agreements</h2>
      </header>
      <main className="settings-main">
        <div className="settings-section">
          <h3>Add New Agreement</h3>
          <form onSubmit={handleAddAgreement} className="settings-form">
            <input
              type="text"
              name="title"
              placeholder="Agreement Title"
              value={form.title}
              onChange={handleChange}
              required
            />
            <textarea
              name="content"
              placeholder="Agreement Content"
              value={form.content}
              onChange={handleChange}
              required
            />
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="save-button">
              Add Agreement
            </button>
          </form>
        </div>
        <div className="settings-section">
          <h3>Existing Agreements</h3>
          <div className="agreements-list">
            {agreements.length > 0 ? (
              agreements.map((agreement) => (
                <div key={agreement._id} className="agreement-card">
                  <h4>{agreement.title}</h4>
                  <p className="agreement-content-preview">
                    {agreement.content.substring(0, 150)}...
                  </p>
                  <button
                    onClick={() => handleDelete(agreement._id)}
                    className="delete-button">
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p>No agreements found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StandardAgreementsSubpage;
