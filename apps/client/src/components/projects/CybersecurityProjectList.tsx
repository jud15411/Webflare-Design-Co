// src/components/projects/CybersecurityProjectList.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/axios';
import { AxiosError } from 'axios';
import { ConfirmationModal } from '../Common/ConfirmationModal/ConfirmationModal';
import { ProjectFormModal } from './ProjectFormModal';
import {
  type Project,
  type ProjectFormData,
  type ProjectClient,
  type User,
} from '../../types/projects';
import './ProjectList.css'; // Common styles
import './CybersecurityProjectList.css'; // Specific Cybersecurity styles (new file)

interface Client extends ProjectClient {}
interface ApiError {
  message: string;
}

const getStatusClass = (status: string): string => {
  return `status-${status.toLowerCase().replace(/ /g, '-')}`;
};

export const CybersecurityProjectList: React.FC = () => {
  const category = 'Cybersecurity'; // Fixed category
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

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
    <div className="page-container security-page-container">
      <div className="page-header">
        <h1>🔒 {category} Projects</h1>
        <button className="add-project-button security-add-button" onClick={handleOpenAddModal}>
          Add New Project
        </button>
      </div>

      {/* This is a placeholder for a unique Cybersecurity-specific feature, 
        like a summary of high-risk vulnerabilities or a timeline of penetration tests. 
      */}
      <div className="security-specific-snapshot">
        <p>🚨 **Vulnerability/Risk Snapshot** (e.g., Critical Findings, Next Audit Date)</p>
      </div>
      
      {error && <p className="error-message">{error}</p>}
      {isLoading && <p>Loading projects...</p>}
      {!isLoading && !error && (
        <div className="table-container">
          <table className="pro-table security-table">
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
                      {project.team.map((member) => member.name).join(', ') || 'N/A'}
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
                        className="action-button security-action-btn"
                        onClick={() => navigate(`/projects/${project._id}`)}>
                        Chat & Details
                      </button>
                      <button
                        className="action-button security-action-btn"
                        onClick={() => handleOpenEditModal(project)}>
                        Edit
                      </button>
                      <button
                        className="action-button security-action-btn"
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