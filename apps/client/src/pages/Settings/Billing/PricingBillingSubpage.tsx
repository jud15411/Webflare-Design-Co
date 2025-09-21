import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import '../Settings.css';

interface BillingSettings {
  currency: string;
  taxRate: number;
  paymentProviders: string[];
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

interface PricingBillingSubpageProps {
  onBack: () => void;
}

const PricingBillingSubpage: React.FC<PricingBillingSubpageProps> = ({
  onBack,
}) => {
  const { token } = useAuth();
  // Initialize state with default values to prevent null/undefined errors
  const [settings, setSettings] = useState<BillingSettings>({
    currency: 'USD',
    taxRate: 0,
    paymentProviders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/v1/billing`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSettings(data);
      } catch (err) {
        setError('Failed to fetch billing settings.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchSettings();
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: name === 'taxRate' ? Number(value) / 100 : value, // Convert tax rate input back to a decimal
    }));
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSettings((prevSettings) => {
      const providers = checked
        ? [...prevSettings.paymentProviders, value]
        : prevSettings.paymentProviders.filter((p) => p !== value);
      return { ...prevSettings, paymentProviders: providers };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/v1/billing`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Billing settings updated successfully!');
    } catch (err) {
      setError('Failed to update settings.');
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading billing settings...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="settings-subpage">
      <header className="subpage-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h2>Pricing & Billing Settings</h2>
      </header>
      <main className="settings-main">
        <div className="settings-section">
          <h3>Payment Settings</h3>
          <form onSubmit={handleSubmit} className="settings-form">
            <label>
              Currency:
              <input
                type="text"
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Tax Rate (%):
              <input
                type="number"
                name="taxRate"
                value={settings.taxRate * 100}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Payment Providers:
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    value="Stripe"
                    checked={settings.paymentProviders.includes('Stripe')}
                    onChange={handleProviderChange}
                  />
                  Stripe
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="PayPal"
                    checked={settings.paymentProviders.includes('PayPal')}
                    onChange={handleProviderChange}
                  />
                  PayPal
                </label>
              </div>
            </label>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="save-button">
              Save Changes
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PricingBillingSubpage;
