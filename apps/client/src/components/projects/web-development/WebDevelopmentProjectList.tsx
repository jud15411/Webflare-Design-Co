// src/components/projects/WebDevelopmentProjectList.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../utils/axios';
import { AxiosError } from 'axios';
import { ConfirmationModal } from '../../Common/ConfirmationModal/ConfirmationModal';
import { ProjectFormModal } from '../ProjectFormModal';
import { WebDevelopmentProjectCard } from './WebDevelopmentProjectCard'; // <--- NEW IMPORT
import {
  type Project,
  type ProjectFormData,
  type ProjectClient,
  type User,
} from '../../../types/projects';
import '../ProjectList.css'; // Common styles
import './WebDevelopmentProjectList.css'; // Specific Web Dev styles

interface Client extends ProjectClient {}
interface ApiError {
  message: string;
}

// ... (getStatusClass remains the same)

export const WebDevelopmentProjectList: React.FC = () => {
  const category = 'Web Development';
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  // ... (clients, users, isLoading, error, modals state remains the same)
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // ... (fetchAllData, handleOpenAddModal, handleOpenEditModal, handleOpenDeleteModal, 
  //     handleFormSubmit, handleConfirmDelete functions remain the same)
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [projectsResponse, clientsResponse, usersResponse] =
        await Promise.all([
          API.get<Project[]>(`/projects?category=${encodeURIComponent(category)}`),
          API.get<Client[]>('/clients'),
          API.get<User[]>('/users'),
        ]);

      setProjects(projectsResponse.data);
      setClients(clientsResponse.data);
      setUsers(usersResponse.data);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message ||
        'Failed to load project data. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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

    try {
      let savedProject: Project;
      if (isEditing) {
        const response = await API.put<Project>(
          `/projects/${projectData._id}`,
          projectData
        );
        savedProject = response.data;
      } else {
        const response = await API.post<Project>('/projects', projectData);
        savedProject = response.data;
      }

      if (isEditing) {
        setProjects(
          projects.map((p) => (p._id === savedProject._id ? savedProject : p))
        );
      } else {
        await fetchAllData();
      }
      setIsFormModalOpen(false);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message ||
        `Failed to ${isEditing ? 'update' : 'create'} the project.`;
      setError(message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setError(null);
    try {
      await API.delete(`/projects/${projectToDelete._id}`);
      setProjects(projects.filter((p) => p._id !== projectToDelete._id));
      setIsDeleteModalOpen(false);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || 'Failed to delete the project.';
      setError(message);
    }
  };
  
  return (
    <div className="page-container webdev-page-container">
      <div className="page-header">
        <h1>🛠️ {category} Projects</h1>
        <button className="add-project-button webdev-add-button" onClick={handleOpenAddModal}>
          + Add New Project
        </button>
      </div>
      
      {/* NEW: Dedicated Metrics Panel */}
      <div className="webdev-metrics-panel metrics-panel">
        <div>
            <p className="metric-label">Total Projects</p>
            <p className="metric-value">{projects.length}</p>
        </div>
        <div>
            <p className="metric-label">Avg. Lighthouse Score</p>
            <p className="metric-value metric-good">92</p> {/* Placeholder Value */}
        </div>
        <div>
            <p className="metric-label">Live Deployments</p>
            <p className="metric-value">{projects.filter(p => p.status === 'Completed' && p.website_link).length}</p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      {isLoading && <p>Loading projects...</p>}
      
      {/* NEW: Project Grid */}
      {!isLoading && !error && (
        <div className="project-grid">
          {projects.length > 0 ? (
            projects.map((project) => (
              <WebDevelopmentProjectCard 
                key={project._id}
                project={project}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onViewDetails={(id) => navigate(`/projects/${id}`)}
              />
            ))
          ) : (
            <p className="no-projects-message">
              There are currently no {category} projects.
            </p>
          )}
        </div>
      )}

      {/* ... (Modals remain the same) */}
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