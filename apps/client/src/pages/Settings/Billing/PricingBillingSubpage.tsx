import React, { useState, useEffect } from 'react';
import API from '../../../utils/axios';
import { useAuth } from '../../../contexts/AuthContext';
import '../Settings.css';

interface BillingSettings {
  currency: string;
  taxRate: number;
  paymentProviders: string[];
}

interface PricingBillingSubpageProps {
  onBack: () => void;
}

const PricingBillingSubpage: React.FC<PricingBillingSubpageProps> = ({
  onBack,
}) => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<BillingSettings | null>(null); // Start as null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;
      try {
        const { data } = await API.get(`/settings/billing/pricing`, {
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
    fetchSettings();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Ensure settings is not null before updating
    if (settings) {
      setSettings({
        ...settings,
        [name]: name === 'taxRate' ? Number(value) : value,
      });
    }
  };

  // Note: Tax rate is handled as a direct percentage in the input now for simplicity.
  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (settings) {
      setSettings({ ...settings, taxRate: Number(e.target.value) });
    }
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (settings) {
      const providers = checked
        ? [...settings.paymentProviders, value]
        : settings.paymentProviders.filter((p) => p !== value);
      setSettings({ ...settings, paymentProviders: providers });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await API.put(
        `/settings/billing/pricing`,
        {
          ...settings,
          taxRate: settings.taxRate / 100, // Convert back to decimal for saving
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Billing settings updated successfully!');
    } catch (err) {
      setError('Failed to update settings.');
      console.error(err);
    }
  };

  return (
    <div className="settings-subpage">
      <header className="subpage-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h2>Pricing & Billing Settings</h2>
      </header>
      <main className="settings-main">
        {loading && <p>Loading billing settings...</p>}
        {error && <p className="error-message">{error}</p>}
        {/* Only render the form when settings data is available */}
        {settings && !loading && (
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
                  value={settings.taxRate * 100} // Display as a percentage
                  onChange={handleTaxChange}
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
              <button type="submit" className="save-button">
                Save Changes
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default PricingBillingSubpage;
