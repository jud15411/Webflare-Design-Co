import React, { useState, useEffect, type FormEvent } from 'react';
import './TaskModal.css';

// --- Type Definitions ---
interface User {
  _id: string;
  name: string;
}

// Add Project interface
interface Project {
  _id: string;
  name: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  category: 'Cybersecurity' | 'Web Development';
  dueDate: string;
  assignedTo: User;
  project: Project; // Update task to include project
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    task: Omit<Task, '_id' | 'assignedTo' | 'project'> & {
      assignedTo: string;
      project: string;
    }
  ) => void;
  task: Task | null;
  users: User[];
  projects: Project[]; // Add projects to props
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
  projects, // Destructure projects from props
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    project: '', // Add project to form state
    dueDate: getFormattedDate(new Date()),
    status: 'To Do' as Task['status'],
    category: 'Web Development' as Task['category'],
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo?._id || '',
        project: task.project?._id || '',
        dueDate: getFormattedDate(new Date(task.dueDate)),
        status: task.status,
        category: task.category,
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
      });
    }
  }, [task, users, projects, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

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
