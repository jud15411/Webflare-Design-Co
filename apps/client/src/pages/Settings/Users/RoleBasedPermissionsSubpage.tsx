import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import '../Settings.css';

type UserRole = 'ceo' | 'developer' | 'cto' | 'sales';

// Define the available features for which permissions can be set
const features = [
  'dashboard',
  'knowledge-base',
  'software-management',
  'reports',
  'settings',
];

interface Permissions {
  [role: string]: string[];
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

interface RoleBasedPermissionsSubpageProps {
  onBack: () => void;
}

const RoleBasedPermissionsSubpage: React.FC<
  RoleBasedPermissionsSubpageProps
> = ({ onBack }) => {
  const { token } = useAuth();
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPermissions = async () => {
    try {
      setError('');
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/v1/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPermissions(data);
    } catch (err) {
      setError('Failed to fetch permissions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPermissions();
    }
  }, [token]);

  const handlePermissionChange = (role: string, feature: string) => {
    setPermissions((prevPermissions) => {
      if (!prevPermissions) return null;

      const currentPermissions = prevPermissions[role];
      const hasPermission = currentPermissions?.includes(feature);

      const updatedPermissions = hasPermission
        ? currentPermissions.filter((p) => p !== feature)
        : [...(currentPermissions || []), feature];

      return {
        ...prevPermissions,
        [role]: updatedPermissions,
      };
    });
  };

  const handleSave = async () => {
    if (!permissions) return;
    try {
      await axios.put(`${API_URL}/api/v1/permissions`, permissions, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Permissions updated successfully!');
    } catch (err) {
      setError('Failed to save permissions.');
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading permissions...</div>;
  }

  if (error || !permissions) {
    return <div>{error || 'No permissions data available.'}</div>;
  }

  // Corrected line to get the list of roles
  const allRoles: UserRole[] = ['ceo', 'developer', 'cto', 'sales'];

  return (
    <div className="settings-subpage">
      <header className="subpage-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h2>Role-Based Permissions</h2>
      </header>
      <main className="settings-main">
        <div className="settings-section">
          <h3>Set Access Controls</h3>
          <p>Grant or revoke access to features for each role.</p>
          <div className="permissions-grid">
            {allRoles.map((role) => (
              <div key={role} className="permission-card">
                <h4>{role.toUpperCase()}</h4>
                <div className="permission-list">
                  {features.map((feature) => (
                    <label key={feature}>
                      <input
                        type="checkbox"
                        checked={permissions[role]?.includes(feature) || false}
                        onChange={() => handlePermissionChange(role, feature)}
                      />
                      {feature
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {error && <p className="error-message">{error}</p>}
          <button onClick={handleSave} className="save-button">
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
};

export default RoleBasedPermissionsSubpage;
