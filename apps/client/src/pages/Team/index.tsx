// TeamPage/index.tsx

import React, { useState, useEffect, type FormEvent, useCallback } from 'react';
import API from '../../utils/axios'; // Import the new axios instance
import { AxiosError } from 'axios'; // Import AxiosError for better error typing
import './TeamPage.css';
import { ConfirmationModal } from '../../components/Common/ConfirmationModal/ConfirmationModal';

// --- Type Definitions ---
interface Role {
  _id: string;
  name: string;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: Role;
}

// Define a type for API error responses
interface ApiError {
  message: string;
}

export const TeamPage: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  // State for the "Add User" form
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });

  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<TeamMember | null>(null);
  const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<TeamMember | null>(null);

  const fetchTeamAndRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [teamRes, rolesRes] = await Promise.all([
        API.get<TeamMember[]>('/users'),
        API.get<Role[]>('/roles'),
      ]);

      setTeam(teamRes.data);
      setRoles(rolesRes.data);

      if (rolesRes.data.length > 0 && !newUser.role) {
        setNewUser((prev) => ({ ...prev, role: rolesRes.data[0]._id }));
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message ||
        'Failed to load page data. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [newUser.role]); // Depends on newUser.role to set the initial role

  useEffect(() => {
    fetchTeamAndRoles();
  }, [fetchTeamAndRoles]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await API.post('/users', newUser);
      await fetchTeamAndRoles(); // Re-fetch all data to ensure consistency

      setNewUser({
        name: '',
        email: '',
        password: '',
        role: roles.length > 0 ? roles[0]._id : '',
      });
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || 'Failed to add the user.';
      setError(message);
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
      await API.delete(`/users/${userToRemove._id}`);
      setTeam(team.filter((user) => user._id !== userToRemove._id));
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || 'Failed to remove the user.';
      setError(message);
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
      await API.patch(`/users/${userToToggle._id}/status`);
      setTeam(
        team.map((user) =>
          user._id === userToToggle._id
            ? { ...user, isActive: !user.isActive }
            : user
        )
      );
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || 'Failed to update user status.';
      setError(message);
    } finally {
      setIsToggleStatusModalOpen(false);
      setUserToToggle(null);
    }
  };

  // --- Render Method ---
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