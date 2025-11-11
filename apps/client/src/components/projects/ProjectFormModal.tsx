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
  users: User[]; 
}

const projectStatuses = ['Not Started', 'In Progress', 'On Hold', 'Completed'];

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  category,
  clients,
  users, 
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'Not Started',
    category: category,
    client: '',
    team: [], 
    website_link: '', 
    startDate: new Date().toISOString().substring(0, 10), // New required field
    target_systems: '', // New category-specific field
  });

  useEffect(() => {
    const defaultClient = clients.length > 0 ? clients[0]._id : '';
    
    if (initialData) {
      // Ensure date is formatted correctly for the input type="date"
      const formattedStartDate = initialData.startDate 
        ? new Date(initialData.startDate).toISOString().substring(0, 10) 
        : new Date().toISOString().substring(0, 10);
        
      setFormData({
        ...initialData,
        // Ensure category-specific fields are initialized, handling old data structure
        website_link: initialData.website_link || '',
        target_systems: (initialData as any).target_systems || '', 
        startDate: formattedStartDate,
      } as ProjectFormData);
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'Not Started',
        category: category,
        client: defaultClient,
        team: [], 
        website_link: '', 
        startDate: new Date().toISOString().substring(0, 10),
        target_systems: '',
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

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, team: selectedIds }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client && clients.length > 0) {
      alert('Please select a client.');
      return;
    }
    onSubmit(formData);
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Edit Project' : `Add New ${category} Project`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content project-form-modal" onClick={(e) => e.stopPropagation()}> 
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>{modalTitle}</h2>
            <button
              type="button"
              className="modal-close-button"
              onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="modal-body form-body">
            
            {/* 1. Universal Fields: Client, Name */}
            <div className="form-group-row">
                <div className="form-group half-width">
                  <label htmlFor="client">Client</label>
                  <select
                    id="client"
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    required
                  >
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.clientName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group half-width">
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
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="A brief overview of the project's goals and scope..."
                required
              />
            </div>

            {/* 2. Category-Specific Fields */}
            {category === 'Web Development' && (
              <div className="form-group">
                <label htmlFor="website_link">Deployment URL (Optional)</label>
                <input
                  type="url"
                  id="website_link"
                  name="website_link"
                  value={formData.website_link || ''}
                  onChange={handleChange}
                  placeholder="https://client-staging-link.com"
                />
              </div>
            )}

            {category === 'Cybersecurity' && (
              <div className="form-group">
                <label htmlFor="target_systems">Target Systems/Scope</label>
                <textarea
                  id="target_systems"
                  name="target_systems"
                  value={formData.target_systems || ''}
                  onChange={handleChange}
                  placeholder="e.g., Target IP range: 192.168.1.0/24, or Target application: ClientPortal API"
                  required
                />
              </div>
            )}
            
            {/* 3. Universal Fields: Status, Dates */}
            <div className="form-group-row">
                <div className="form-group half-width">
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
                <div className="form-group half-width">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
            </div>

            {/* 4. Universal Field: Team */}
            <div className="form-group">
              <label htmlFor="team">Assign Team Members (Hold Ctrl/Cmd to select multiple)</label>
              <select
                id="team"
                name="team"
                multiple 
                value={formData.team}
                onChange={handleTeamChange}
                className="multi-select" 
              >
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
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