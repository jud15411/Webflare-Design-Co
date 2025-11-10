// TaskModal/index.tsx

import React, { useState, useEffect, type FormEvent } from 'react';
import './TaskModal.css';

// --- Type Definitions ---
interface User {
  _id: string;
  name: string;
}

interface Project {
  _id: string;
  name: string;
}

// NEW: Sprint Interface
interface Sprint { 
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'Planning' | 'Active' | 'Completed';
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  category: 'Cybersecurity' | 'Web Development';
  dueDate: string;
  assignedTo: User;
  project: Project; 
  storyPoints?: number; // NEW
  sprint?: Sprint | null; // NEW
}

// FIXED: Define the correct type for data passed to onSave (string IDs, required storyPoints)
type TaskDataForSave = Omit<Task, '_id' | 'assignedTo' | 'project' | 'sprint'> & {
    assignedTo: string;
    project: string;
    storyPoints: number; // Required field
    sprint?: string | null; // Optional sprint ID
};


// FIXED: Update TaskModalProps to use the new type and include sprints
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: TaskDataForSave) => void | Promise<void>; 
  task: Task | null;
  users: User[];
  projects: Project[]; 
  sprints: Sprint[]; // NEW: Sprints passed from parent component
}

const getFormattedDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Component ---
export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
  users,
  projects, 
  sprints, // Destructure new sprints prop
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    project: '', 
    dueDate: getFormattedDate(new Date()),
    status: 'To Do' as Task['status'],
    category: 'Web Development' as Task['category'],
    storyPoints: 0, // NEW default for storyPoints
    sprint: '' as string | null, // NEW default for sprint
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        assignedTo: task.assignedTo?._id || '',
        project: task.project?._id || '',
        dueDate: getFormattedDate(new Date(task.dueDate)),
        status: task.status,
        category: task.category,
        storyPoints: task.storyPoints || 0, // NEW
        sprint: task.sprint?._id || '', // NEW
      });
    } else {
      // Reset to default for "Add New"
      setFormData({
        title: '',
        description: '',
        assignedTo: users.length > 0 ? users[0]._id : '',
        project: projects.length > 0 ? projects[0]._id : '',
        dueDate: getFormattedDate(new Date()),
        status: 'To Do',
        category: 'Web Development',
        storyPoints: 0, // NEW
        sprint: '', // NEW
      });
    }
  }, [task, users, projects, isOpen, sprints]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    // Handle number input for storyPoints
    const value = 
      e.target.name === 'storyPoints' 
      ? parseInt(e.target.value) || 0 
      : e.target.value;

    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Convert sprint to null if it's an empty string (to clear the reference in the backend)
    const dataToSave: TaskDataForSave = {
        ...formData,
        sprint: formData.sprint === '' ? null : formData.sprint,
        storyPoints: formData.storyPoints,
    };

    onSave(dataToSave);
  };

  if (!isOpen) return null;

  // Filter for only Planning and Active Sprints to assign tasks
  const availableSprints = sprints.filter(s => s.status === 'Planning' || s.status === 'Active');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{task ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={handleSubmit}>
          {/* Project Selector */}
          <div className="form-group">
            <label htmlFor="project">Project</label>
            <select
              name="project"
              value={formData.project}
              onChange={handleChange}
              required>
              <option value="">Select a Project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>
          {/* NEW: Sprint and Story Points Row */}
          <div className="form-row">
            <div className="form-group">
                <label htmlFor="sprint">Assign to Sprint</label>
                <select
                    name="sprint"
                    value={formData.sprint || ''} // Use empty string for option value to represent null/undefined
                    onChange={handleChange}
                >
                    <option value="">(Backlog)</option>
                    {availableSprints.map((sprint) => (
                        <option key={sprint._id} value={sprint._id}>
                            {sprint.name} ({sprint.status})
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group" style={{ maxWidth: '100px' }}>
                <label htmlFor="storyPoints">Story Points</label>
                <input
                    type="number"
                    name="storyPoints"
                    value={formData.storyPoints}
                    onChange={handleChange}
                    min="0"
                    required
                />
            </div>
          </div>
          {/* End of NEW row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="assignedTo">Assign To</label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                required>
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required>
                <option value="Web Development">Web Development</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};