import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmationModal } from '../Common/ConfirmationModal/ConfirmationModal';
import { ProjectFormModal } from './ProjectFormModal';
import { type Project, type ProjectFormData } from '../../types/projects';
import './ProjectList.css';

interface ProjectListProps {
  category: 'Cybersecurity' | 'Web Development';
}

// Helper function to map a project's status to a CSS class for styling
const getStatusClass = (status: string): string => {
  return `status-${status.toLowerCase().replace(/ /g, '-')}`;
};

export const ProjectList: React.FC<ProjectListProps> = ({ category }) => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for managing the form modal (for creating/editing)
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  // State for managing the delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Fetch projects when the component mounts or the category/token changes
  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/v1/projects?category=${encodeURIComponent(category)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch projects.');
        }
        const data: Project[] = await response.json();
        setProjects(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [category, token]);

  // --- Modal Handler Functions ---

  const handleOpenAddModal = () => {
    setProjectToEdit(null); // Ensure we're in "add" mode
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setProjectToEdit(project);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  // --- API Call Functions ---

  const handleFormSubmit = async (projectData: ProjectFormData) => {
    setError(null);
    const isEditing = !!projectData._id;
    const url = isEditing
      ? `/api/v1/projects/${projectData._id}`
      : '/api/v1/projects';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${isEditing ? 'update' : 'create'} project.`
        );
      }

      const savedProject: Project = await response.json();

      if (isEditing) {
        setProjects(
          projects.map((p) => (p._id === savedProject._id ? savedProject : p))
        );
      } else {
        setProjects([...projects, savedProject]);
      }
      setIsFormModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    setError(null);
    try {
      const response = await fetch(`/api/v1/projects/${projectToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to delete project.');
      }

      setProjects(projects.filter((p) => p._id !== projectToDelete._id));
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{category} Projects</h1>
        <button className="add-project-button" onClick={handleOpenAddModal}>
          Add New Project
        </button>
      </div>

      {isLoading && <p>Loading projects...</p>}
      {error && <p className="error-message">{error}</p>}

      {!isLoading && !error && (
        <div className="table-container">
          <table className="pro-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project._id}>
                    <td>{project.name}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          project.status
                        )}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>{new Date(project.startDate).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="action-button"
                        onClick={() => handleOpenEditModal(project)}>
                        Edit
                      </button>
                      <button
                        className="action-button"
                        onClick={() => handleOpenDeleteModal(project)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="no-projects-message">
                    There are currently no {category} projects.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Render Modals --- */}
      <ProjectFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={projectToEdit}
        category={category}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Project Deletion"
        message={
          <>
            Are you sure you want to delete the project{' '}
            <strong>{projectToDelete?.name}</strong>?
            <br />
            This action cannot be undone.
          </>
        }
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
