import React, { useState, useEffect, type FormEvent } from 'react';
import { useAuth, type User } from '../../contexts/AuthContext';
import './TeamPage.css';
import { ConfirmationModal } from '../../components/Common/ConfirmationModal/ConfirmationModal';

// Define the types used in this component
type TeamMember = Omit<User, 'id'> & {
  _id: string;
  isActive: boolean;
  role: any;
}; // Role can be an object after migration
interface Role {
  _id: string;
  name: string;
}

export const TeamPage: React.FC = () => {
  const { token } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  // State for the "Add User" form
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: '', // Will be populated with the first role's ID
  });

  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<TeamMember | null>(null);
  const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<TeamMember | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!token) return;
      try {
        // We'll set loading true at the start of the combined fetch
        const response = await fetch('/api/v1/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch team members.');
        const data: TeamMember[] = await response.json();
        setTeam(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    const fetchRoles = async () => {
      if (!token) return;
      try {
        const response = await fetch('/api/v1/roles', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setRoles(data);
          if (data.length > 0 && !newUser.role) {
            setNewUser((prev) => ({ ...prev, role: data[0]._id }));
          }
        }
      } catch (err: any) {
        // Handle role fetch error separately if desired
        console.error('Failed to fetch roles', err);
      }
    };

    const fetchAllData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTeam(), fetchRoles()]);
      setIsLoading(false);
    };

    if (token) {
      fetchAllData();
    }
  }, [token]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to add user.');
      }
      // Manually trigger a re-fetch of team members to get updated list
      const teamResponse = await fetch('/api/v1/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedTeam = await teamResponse.json();
      setTeam(updatedTeam);

      // Reset form, ensuring default role is set
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: roles.length > 0 ? roles[0]._id : '',
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openRemoveUserModal = (user: TeamMember) => {
    setUserToRemove(user);
    setIsModalOpen(true);
  };

  const handleConfirmRemoveUser = async () => {
    if (!userToRemove) return;
    setError(null);
    try {
      await fetch(`/api/v1/users/${userToRemove._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeam(team.filter((user) => user._id !== userToRemove._id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsModalOpen(false);
      setUserToRemove(null);
    }
  };

  const openToggleStatusModal = (user: TeamMember) => {
    setUserToToggle(user);
    setIsToggleStatusModalOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!userToToggle) return;
    setError(null);
    try {
      await fetch(`/api/v1/users/${userToToggle._id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeam(
        team.map((user) =>
          user._id === userToToggle._id
            ? { ...user, isActive: !user.isActive }
            : user
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsToggleStatusModalOpen(false);
      setUserToToggle(null);
    }
  };

  return (
    <div className="team-page-container">
      <h1>Team Management</h1>

      <div className="team-management-layout">
        <div className="add-user-card">
          <h2>Add New Staff Member</h2>
          <form onSubmit={handleAddUser}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                required>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="add-user-button">
              Add User
            </button>
          </form>
        </div>

        <div className="team-list-card">
          <h2>Current Team</h2>
          {isLoading ? (
            <p>Loading team...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <table className="team-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.map((user) => (
                  <tr
                    key={user._id}
                    className={!user.isActive ? 'inactive-user' : ''}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge`}>
                        {user.role?.name || 'N/A'}
                      </span>
                    </td>
                    <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                    <td>
                      <button
                        className="toggle-status-button"
                        onClick={() => openToggleStatusModal(user)}>
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="remove-button"
                        onClick={() => openRemoveUserModal(user)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmRemoveUser}
        title="Confirm User Removal"
        message={
          <>
            Are you sure you want to remove{' '}
            <strong>{userToRemove?.name}</strong>?<br />
            This action cannot be undone.
          </>
        }
        confirmText="Remove User"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={isToggleStatusModalOpen}
        onClose={() => setIsToggleStatusModalOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        title={`Confirm User ${
          userToToggle?.isActive ? 'Deactivation' : 'Activation'
        }`}
        message={
          <>
            Are you sure you want to{' '}
            {userToToggle?.isActive ? 'deactivate' : 'activate'}{' '}
            <strong>{userToToggle?.name}</strong>?
          </>
        }
        confirmText={userToToggle?.isActive ? 'Deactivate' : 'Activate'}
        variant="primary"
      />
    </div>
  );
};
