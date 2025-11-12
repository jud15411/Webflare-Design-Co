// RolesPage.tsx

import React, { useState, useEffect, type FormEvent } from 'react';
import API from '../../utils/axios'; // Import the new axios instance
import { AxiosError } from 'axios'; // Import AxiosError for better error typing
import { ConfirmationModal } from '../../components/Common/ConfirmationModal/ConfirmationModal';
import './RolesPage.css';

// Define the Role type for the frontend
interface Role {
  _id: string;
  name: string;
  description?: string;
}

// Define a type for API error responses for better type safety
interface ApiError {
  message: string;
}

const INITIAL_FORM_STATE = { name: '', description: '' };

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the form
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  // State for delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  // Fetch roles using the API instance
  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        const response = await API.get<Role[]>('/roles');
        setRoles(response.data);
      } catch (err) {
        const axiosError = err as AxiosError<ApiError>;
        const message =
          axiosError.response?.data?.message ||
          'Failed to fetch roles. Please try again.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoles();
  }, []); 

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectRoleToEdit = (role: Role) => {
    setRoleToEdit(role);
    setFormData({ name: role.name, description: role.description || '' });
  };

  const handleCancelEdit = () => {
    setRoleToEdit(null);
    setFormData(INITIAL_FORM_STATE);
  };

  // Submit form (Create/Update) using the API instance
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const isEditing = !!roleToEdit;

    try {
      let savedRole: Role;
      if (isEditing) {
        // Use API.put for updates
        const response = await API.put<Role>(
          `/roles/${roleToEdit._id}`,
          formData
        );
        savedRole = response.data;
      } else {
        // Use API.post for creation
        const response = await API.post<Role>('/roles', formData);
        savedRole = response.data;
      }

      if (isEditing) {
        setRoles(roles.map((r) => (r._id === savedRole._id ? savedRole : r)));
      } else {
        setRoles([...roles, savedRole]);
      }
      handleCancelEdit(); // Reset form
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || 'Failed to save the role.';
      setError(message);
    }
  };

  const handleOpenDeleteModal = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  // Delete role using the API instance
  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await API.delete(`/roles/${roleToDelete._id}`);
      setRoles(roles.filter((r) => r._id !== roleToDelete._id));
      setIsDeleteModalOpen(false);
      setRoleToDelete(null); // Clear the role to delete
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || 'Failed to delete the role.';
      setError(message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Roles</h1>
      </div>
      {error && <p className="error-message">{error}</p>}

      <div className="roles-page-layout-grid"> {/* Updated class for grid */}
        {/* --- Form Panel (Sidebar) --- */}
        <div className="role-form-panel"> {/* Updated class for form panel */}
          <h2>{roleToEdit ? 'Edit Role' : 'Add New Role'}</h2>
          <form className="role-form" onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="name">Role Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="role-form-buttons">
              {roleToEdit && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancelEdit}>
                  Cancel
                </button>
              )}
              <button type="submit" className="submit-button">
                {roleToEdit ? 'Save Changes' : 'Add Role'}
              </button>
            </div>
          </form>
        </div>

        {/* --- List Panel (Main Content) --- */}
        <div className="role-list-panel"> {/* Updated class for list panel */}
          <h2>Existing Roles</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="role-list">
              <ul>
                {roles.map((role) => (
                  // Entire li is now clickable to select for edit
                  <li 
                    key={role._id} 
                    className="role-list-item"
                    onClick={() => handleSelectRoleToEdit(role)} 
                  >
                    <div className="role-info">
                      <h3>{role.name}</h3>
                      <p>{role.description || 'No description provided.'}</p>
                    </div>
                    <div className="role-actions">
                      <button 
                        className="edit-button" // New class for consistent styling
                        onClick={(e) => {
                          e.stopPropagation(); // Stop propagation to prevent li click
                          handleSelectRoleToEdit(role);
                        }}>
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation(); // Stop propagation to prevent li click
                          handleOpenDeleteModal(role);
                        }}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Role Deletion"
        message={
          <>
            Are you sure you want to delete the{' '}
            <strong>{roleToDelete?.name}</strong> role? This cannot be undone.
          </>
        }
        confirmText="Delete Role"
        variant="danger"
      />
    </div>
  );
};