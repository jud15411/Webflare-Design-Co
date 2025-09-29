import React, { useState, useEffect } from 'react';
import { type ProjectFormData, type User } from '../../types/projects';
import './ProjectFormModal.css';

interface Client {
  _id: string;
  clientName: string;
}

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: ProjectFormData) => void;
  initialData?: ProjectFormData | null;
  category: 'Cybersecurity' | 'Web Development';
  clients: Client[];
  users: User[]; // Add users prop
}

const projectStatuses = ['Not Started', 'In Progress', 'On Hold', 'Completed'];

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  category,
  clients,
  users, // Destructure users
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'Not Started',
    category: category,
    client: '',
    team: [], // Add team to initial form data
    website_link: '', // Add website_link to form data
  });

  useEffect(() => {
    const defaultClient = clients.length > 0 ? clients[0]._id : '';
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'Not Started',
        category: category,
        client: defaultClient,
        team: [], // Ensure team is an empty array for new projects
        website_link: '', // Default to empty for new projects
      });
    }
  }, [initialData, category, isOpen, clients]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Special handler for the multi-select
  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, team: selectedIds }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditing = !!initialData;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>{isEditing ? 'Edit Project' : 'Add New Project'}</h2>
            <button
              type="button"
              className="modal-close-button"
              onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="modal-body form-body">
            {/* ... Client, Project Name, Description inputs remain the same */}
            <div className="form-group">
              <label htmlFor="name">Project Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            {category === 'Web Development' && (
              <div className="form-group">
                <label htmlFor="website_link">Website Link (Optional)</label>
                <input
                  type="url"
                  id="website_link"
                  name="website_link"
                  value={formData.website_link || ''}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="team">Assign Team Members</label>
              <select
                id="team"
                name="team"
                multiple // This allows selecting multiple options
                value={formData.team}
                onChange={handleTeamChange}
                className="multi-select" // Add a class for specific styling
              >
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}>
                {projectStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="modal-button cancel"
              onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-button confirm primary">
              {isEditing ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};