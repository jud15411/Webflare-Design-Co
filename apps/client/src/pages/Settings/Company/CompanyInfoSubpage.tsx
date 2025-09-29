import React, { useState, useEffect } from 'react';
import API from '../../../utils/axios';
import { useAuth } from '../../../contexts/AuthContext';
import '../Settings.css';

interface CompanyInfo {
  companyName: string;
  address: string;
  contactEmail: string;
}

interface CompanyInfoSubpageProps {
  onBack: () => void;
}

const CompanyInfoSubpage: React.FC<CompanyInfoSubpageProps> = ({ onBack }) => {
  const { token } = useAuth();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const { data } = await API.get(`/api/v1/settings/company-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompanyInfo(data);
      } catch (err) {
        setError('Failed to fetch company information.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchCompanyInfo();
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyInfo({ ...companyInfo!, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.put(`/api/v1/settings/company-info`, companyInfo, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Company information updated successfully!');
      onBack(); // Go back to the main settings page after successful update
    } catch (err) {
      setError('Failed to update company information.');
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading company information...</div>;
  }

  if (error || !companyInfo) {
    return <div>{error || 'Could not load company information.'}</div>;
  }

  return (
    <div className="settings-subpage">
      <header className="subpage-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h2>Company Information</h2>
      </header>
      <div className="settings-section">
        <form onSubmit={handleSubmit} className="settings-form">
          <label>
            Company Name:
            <input
              type="text"
              name="companyName"
              value={companyInfo.companyName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Address:
            <input
              type="text"
              name="address"
              value={companyInfo.address}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Contact Email:
            <input
              type="text"
              name="contactEmail"
              value={companyInfo.contactEmail}
              onChange={handleChange}
              required
            />
          </label>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="save-button">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanyInfoSubpage;
