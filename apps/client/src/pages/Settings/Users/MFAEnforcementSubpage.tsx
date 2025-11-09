import React, { useState, useEffect } from 'react';
import API from '../../../utils/axios';
import { useAuth } from '../../../contexts/AuthContext';
import '../Settings.css';

type UserRole = 'ceo' | 'developer' | 'cto' | 'sales';

interface MfaSettings {
  enabled: boolean;
  requiredForRoles: UserRole[];
}

interface MFAEnforcementSubpageProps {
  onBack: () => void;
}

const MFAEnforcementSubpage: React.FC<MFAEnforcementSubpageProps> = ({
  onBack,
}) => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<MfaSettings | null>(null); // Start as null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const allRoles: UserRole[] = ['ceo', 'developer', 'cto', 'sales'];

  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;
      try {
        const { data } = await API.get(`/settings/users/mfa`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSettings(data);
      } catch (err) {
        setError('Failed to fetch MFA settings.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [token]);

  const handleToggleMfa = () => {
    setSettings((prev) => (prev ? { ...prev, enabled: !prev.enabled } : null));
  };

  const handleRoleChange = (role: UserRole) => {
    setSettings((prev) => {
      if (!prev) return null;
      const isRequired = prev.requiredForRoles.includes(role);
      const updatedRoles = isRequired
        ? prev.requiredForRoles.filter((r) => r !== role)
        : [...prev.requiredForRoles, role];
      return { ...prev, requiredForRoles: updatedRoles };
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      await API.put(`/settings/users/mfa`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('MFA settings updated successfully!');
    } catch (err) {
      setError('Failed to save settings.');
      console.error(err);
    }
  };

  return (
    <div className="settings-subpage">
      <header className="subpage-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h2>MFA Enforcement</h2>
      </header>
      <main className="settings-main">
        {loading && <p>Loading MFA settings...</p>}
        {error && <p className="error-message">{error}</p>}
        {/* Only render the form when settings data is available */}
        {settings && !loading && (
          <>
            <div className="settings-section">
              <h3>Global Policy</h3>
              <div className="toggle-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={handleToggleMfa}
                  />
                  Enable MFA for all accounts
                </label>
              </div>
            </div>
            <div className="settings-section">
              <h3>Role-Based Requirements</h3>
              <p>Require MFA for specific user roles.</p>
              <div className="permissions-list">
                {allRoles.map((role) => (
                  <label key={role} className="permission-item">
                    <input
                      type="checkbox"
                      checked={settings.requiredForRoles.includes(role)}
                      onChange={() => handleRoleChange(role)}
                    />
                    Require MFA for {role.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
            <button onClick={handleSave} className="save-button">
              Save Changes
            </button>
          </>
        )}
      </main>
    </div>
  );
};

export default MFAEnforcementSubpage;
