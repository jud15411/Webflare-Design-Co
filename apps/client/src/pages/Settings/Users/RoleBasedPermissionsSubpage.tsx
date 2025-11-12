import React, { useState, useEffect } from 'react';
import API from '../../../utils/axios';
import { useAuth } from '../../../contexts/AuthContext';
import './RoleBasedPermissions.css'; // Updated CSS import
import { navLinks, type NavItem } from '../../../components/Sidebar/navlinks';

interface Role {
  _id: string;
  name: string;
}

const getFeatures = (items: NavItem[]): string[] => {
  let features: string[] = [];
  items.forEach((item) => {
    features.push(item.key);
    if (item.children) {
      features = features.concat(getFeatures(item.children));
    }
  });
  return features;
};

const allFeatures = getFeatures(navLinks.ceo); // Use CEO navlinks as the source of all features

interface Permissions {
  [roleName: string]: string[];
}

interface RoleBasedPermissionsSubpageProps {
  onBack: () => void;
}

const RoleBasedPermissionsSubpage: React.FC<
  RoleBasedPermissionsSubpageProps
> = ({ onBack }) => {
  const { token } = useAuth();
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPermissionsAndRoles = async () => {
    try {
      setError('');
      setLoading(true);
      const [permissionsRes, rolesRes] = await Promise.all([
        API.get(`/settings/users/permissions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        API.get(`/roles`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setPermissions(permissionsRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      setError('Failed to fetch permissions or roles.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPermissionsAndRoles();
    }
  }, [token]);

  const handlePermissionChange = (roleName: string, feature: string) => {
    setPermissions((prevPermissions) => {
      if (!prevPermissions) return null;

      const currentPermissions = prevPermissions[roleName];
      const hasPermission = currentPermissions?.includes(feature);

      const updatedPermissions = hasPermission
        ? currentPermissions.filter((p) => p !== feature)
        : [...(currentPermissions || []), feature];

      return {
        ...prevPermissions,
        [roleName]: updatedPermissions,
      };
    });
  };

  const handleSave = async () => {
    if (!permissions) return;
    try {
      await API.put(
        `/settings/users/permissions`,
        { permissions },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Permissions updated successfully!');
    } catch (err) {
      setError('Failed to save permissions.');
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading permissions...</div>;
  }

  if (error || !permissions || !roles) {
    return <div>{error || 'No permissions data available.'}</div>;
  }

  return (
    <div className="settings-subpage role-permissions-page">
      <header className="subpage-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h2>Role-Based Permissions</h2>
      </header>
      <main className="settings-main">
        <div className="settings-section">
          <div className="section-header">
            <h3>Set Access Controls</h3>
            <p>Grant or revoke access to pages for each role.</p>
          </div>
          
          <div className="permissions-grid">
            {roles.map((role) => (
              <div key={role._id} className="permission-card">
                <h4>{role.name.toUpperCase()}</h4>
                <div className="permission-list">
                  {allFeatures.map((feature) => (
                    <label key={feature} className="permission-item">
                      <input
                        type="checkbox"
                        checked={
                          permissions[role.name]?.includes(feature) || false
                        }
                        onChange={() =>
                          handlePermissionChange(role.name, feature)
                        }
                      />
                      <span className="feature-name">
                        {feature
                          .replace(/-/g, ' ')
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="save-action-bar">
            <button onClick={handleSave} className="save-button">
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoleBasedPermissionsSubpage;