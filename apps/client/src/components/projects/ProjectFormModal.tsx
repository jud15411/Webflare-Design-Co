import React, { useState, useEffect } from 'react';
// 1. Import the shared type
import { type ProjectFormData } from '../../types/projects';
import './ProjectFormModal.css';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 2. Update onSubmit to accept the shared type
  onSubmit: (projectData: ProjectFormData) => void;
  initialData?: ProjectFormData | null;
  category: 'Cybersecurity' | 'Web Development';
}

const projectStatuses = ['Not Started', 'In Progress', 'On Hold', 'Completed'];

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  category,
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'Not Started',
    category: category,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'Not Started',
        category: category,
      });
    }
  }, [initialData, category, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value as any }));
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
