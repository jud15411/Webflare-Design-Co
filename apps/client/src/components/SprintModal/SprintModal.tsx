// Components/SprintModal/SprintModal.tsx

import React, { useState, useEffect, type FormEvent } from 'react';
import './SprintModal.css';

interface Project {
  _id: string;
  name: string;
}

interface Sprint {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Planning' | 'Active' | 'Completed';
  project: string; // Project ID
}

interface SprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    sprintData: Omit<Sprint, '_id' | 'endDate' | 'project'> & {
      project: string;
    },
    isNew: boolean
  ) => void | Promise<void>;
  sprint: Sprint | null; // Null for creation, object for editing
  projects: Project[];
}

const getFormattedDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const SprintModal: React.FC<SprintModalProps> = ({
  isOpen,
  onClose,
  onSave,
  sprint,
  projects,
}) => {
  const today = getFormattedDate(new Date());

  const [formData, setFormData] = useState({
    name: '',
    startDate: today,
    project: '',
    status: 'Planning' as Sprint['status'],
  });

  useEffect(() => {
    if (sprint) {
      setFormData({
        name: sprint.name,
        startDate: getFormattedDate(new Date(sprint.startDate)),
        project: sprint.project,
        status: sprint.status,
      });
    } else {
      setFormData({
        name: `Sprint ${projects.length > 0 ? projects[0].name : ''} - ${today}`,
        startDate: today,
        project: projects.length > 0 ? projects[0]._id : '',
        status: 'Planning',
      });
    }
  }, [sprint, projects, today]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Only allow editing Name, Project, and Status, StartDate for new sprints
    const dataToSave = {
      name: formData.name,
      startDate: formData.startDate,
      project: formData.project,
      status: formData.status,
    };

    onSave(dataToSave, !sprint);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{sprint ? 'Edit Sprint' : 'Create New Sprint'}</h2>
        <form onSubmit={handleSubmit}>
          {/* Project Selector (Only editable on creation) */}
          <div className="form-group">
            <label htmlFor="project">Project</label>
            <select
              name="project"
              value={formData.project}
              onChange={handleChange}
              disabled={!!sprint} // Cannot change project once sprint is created
              required>
              <option value="">Select a Project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
            {sprint && <p className="modal-hint">Project cannot be changed.</p>}
          </div>

          <div className="form-group">
            <label htmlFor="name">Sprint Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                disabled={!!sprint} // Cannot change start date once sprint is created
                required
              />
              {sprint && <p className="modal-hint">Duration: 3 Weeks</p>}
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required>
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              {sprint ? 'Save Changes' : 'Create Sprint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};