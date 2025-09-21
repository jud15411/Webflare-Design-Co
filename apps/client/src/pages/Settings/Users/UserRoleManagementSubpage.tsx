import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import '../Settings.css';

// Fix: Replaced the enum with a union of string literals to be compatible with 'erasableSyntaxOnly'
type UserRole = 'ceo' | 'developer' | 'cto' | 'sales';

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

interface UserRoleManagementSubpageProps {
  onBack: () => void;
}

const UserRoleManagementSubpage: React.FC<UserRoleManagementSubpageProps> = ({
  onBack,
}) => {
  const { token } = useAuth();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setError('');
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/v1/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await axios.put(
        `${API_URL}/api/v1/users/${userId}`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUsers(); // Refresh the user list
    } catch (err) {
      setError('Failed to update user role.');
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
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
        <h2>User & Role Management</h2>
      </header>
      <main className="settings-main">
        <div className="settings-section">
          <h3>Staff Accounts</h3>
          <p>Manage roles for each staff member.</p>
          <table className="settings-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value as UserRole)
                      }>
                      {['ceo', 'developer', 'cto', 'sales'].map((role) => (
                        <option key={role} value={role}>
                          {role.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{/* Add a delete button in the future if needed */}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default UserRoleManagementSubpage;
