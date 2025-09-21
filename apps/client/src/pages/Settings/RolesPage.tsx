import React, { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmationModal } from '../../components/Common/ConfirmationModal/ConfirmationModal';
import './RolesPage.css';

// Define the Role type for the frontend
interface Role {
  _id: string;
  name: string;
  description?: string;
}

const INITIAL_FORM_STATE = { name: '', description: '' };

export const RolesPage: React.FC = () => {
  const { token } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the form
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  // State for delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const response = await fetch('/api/v1/roles', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch roles.');
        const data = await response.json();
        setRoles(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoles();
  }, [token]);

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

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const isEditing = !!roleToEdit;
    const url = isEditing ? `/api/v1/roles/${roleToEdit._id}` : '/api/v1/roles';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to save role.');
      }
      const savedRole = await response.json();

      if (isEditing) {
        setRoles(roles.map((r) => (r._id === savedRole._id ? savedRole : r)));
      } else {
        setRoles([...roles, savedRole]);
      }
      handleCancelEdit(); // Reset form
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOpenDeleteModal = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      const response = await fetch(`/api/v1/roles/${roleToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete role.');
      }
      setRoles(roles.filter((r) => r._id !== roleToDelete._id));
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Roles</h1>
      </div>
      {error && <p className="error-message">{error}</p>}

      <div className="roles-page-layout">
        {/* --- Form Card --- */}
        <div className="role-form-card">
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

        {/* --- List Card --- */}
        <div className="role-list-card">
          <h2>Existing Roles</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="role-list">
              <ul>
                {roles.map((role) => (
                  <li key={role._id} className="role-list-item">
                    <div className="role-info">
                      <h3>{role.name}</h3>
                      <p>{role.description}</p>
                    </div>
                    <div className="role-actions">
                      <button onClick={() => handleSelectRoleToEdit(role)}>
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleOpenDeleteModal(role)}>
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
