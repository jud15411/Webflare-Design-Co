import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmationModal } from '../Common/ConfirmationModal/ConfirmationModal';
import { ProjectFormModal } from './ProjectFormModal';
import {
  type Project,
  type ProjectFormData,
  type ProjectClient,
  type User,
} from '../../types/projects';
import './ProjectList.css';

interface ProjectListProps {
  category: 'Cybersecurity' | 'Web Development';
}

interface Client extends ProjectClient {}

const getStatusClass = (status: string): string => {
  return `status-${status.toLowerCase().replace(/ /g, '-')}`;
};

export const ProjectList: React.FC<ProjectListProps> = ({ category }) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!token) return;
      setIsLoading(true);
      setError(null);
      try {
        const [projectsResponse, clientsResponse, usersResponse] =
          await Promise.all([
            fetch(`/api/v1/projects?category=${encodeURIComponent(category)}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`/api/v1/clients`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`/api/v1/users`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        if (!projectsResponse.ok) throw new Error('Failed to fetch projects.');
        if (!clientsResponse.ok) throw new Error('Failed to fetch clients.');
        if (!usersResponse.ok) throw new Error('Failed to fetch users.');

        const projectsData: Project[] = await projectsResponse.json();
        const clientsData: Client[] = await clientsResponse.json();
        const usersData: User[] = await usersResponse.json();

        setProjects(projectsData);
        setClients(clientsData);
        setUsers(usersData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [category, token]);

  // --- FIX: Add the missing handler functions ---

  const handleOpenAddModal = () => {
    setProjectToEdit(null);
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
      {/* ... rest of the JSX remains the same */}
      {!isLoading && !error && (
        <div className="table-container">
          <table className="pro-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Client</th>
                <th>Assigned Team</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project._id}>
                    <td>{project.name}</td>
                    <td>{project.client?.clientName || 'N/A'}</td>
                    <td>
                      {project.team.map((member) => member.name).join(', ') ||
                        'N/A'}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          project.status
                        )}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-button"
                        onClick={() => navigate(`/projects/${project._id}`)}>
                        Chat & Details
                      </button>
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
                  <td colSpan={5} className="no-projects-message">
                    There are currently no {category} projects.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ProjectFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={
          projectToEdit
            ? {
                ...projectToEdit,
                client: projectToEdit.client._id,
                team: projectToEdit.team.map((member) => member._id),
              }
            : null
        }
        category={category}
        clients={clients}
        users={users}
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
