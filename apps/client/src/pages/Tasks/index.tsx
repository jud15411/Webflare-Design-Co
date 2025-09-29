// TasksPage/index.tsx

import React, { useState, useEffect, useCallback } from 'react';
import API from '../../utils/axios'; // Import the new axios instance
import { AxiosError } from 'axios'; // Import AxiosError for better error typing
import { ConfirmationModal } from '../../components/Common/ConfirmationModal/ConfirmationModal';
import { TaskModal } from '../../components/TaskModal';
import './TasksPage.css';

// --- Type Definitions ---
interface User {
  _id: string;
  name: string;
}

interface Client {
  _id: string;
  clientName: string;
}

interface Project {
  _id: string;
  name: string;
  client: Client;
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
}

type TaskCategory = 'Cybersecurity' | 'Web Development';

// Define a type for API error responses
interface ApiError {
  message: string;
}

// --- Component ---
export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] =
    useState<TaskCategory>('Web Development');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Refactored to use Axios instance
  const fetchTasks = useCallback(async () => {
    try {
      const response = await API.get<Task[]>('/tasks');
      setTasks(response.data);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message ||
        'Failed to fetch tasks. Please try again.';
      setError(message);
    }
  }, []); // No dependencies needed

  useEffect(() => {
    // Refactored to use Axios instance
    const fetchAuxData = async () => {
      try {
        const [usersRes, projectsRes] = await Promise.all([
          API.get<User[]>('/users'),
          API.get<Project[]>('/projects'),
        ]);
        setUsers(usersRes.data);
        setProjects(projectsRes.data);
      } catch (err) {
        const axiosError = err as AxiosError<ApiError>;
        const message =
          axiosError.response?.data?.message ||
          'Failed to load required page data.';
        setError(message);
      }
    };

    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      await Promise.all([fetchTasks(), fetchAuxData()]);
      setIsLoading(false);
    };

    fetchAllData();
  }, [fetchTasks]); // Token dependency removed

  useEffect(() => {
    setFilteredTasks(tasks.filter((task) => task.category === activeFilter));
  }, [tasks, activeFilter]);

  const handleOpenAddTaskModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Refactored to use Axios instance
  const handleSaveTask = async (
    taskData: Omit<Task, '_id' | 'assignedTo' | 'project'> & {
      assignedTo: string;
      project: string;
    }
  ) => {
    try {
      if (editingTask) {
        await API.patch(`/tasks/${editingTask._id}`, taskData);
      } else {
        await API.post('/tasks', taskData);
      }
      setIsTaskModalOpen(false);
      await fetchTasks(); // Refresh the tasks list
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || 'Failed to save the task.';
      setError(message);
    }
  };

  const openDeleteModal = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  // Refactored to use Axios instance
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await API.delete(`/tasks/${taskToDelete._id}`);
      // Optimistically update UI
      setTasks(tasks.filter((task) => task._id !== taskToDelete._id));
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || 'Failed to delete the task.';
      setError(message);
    } finally {
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="tasks-page-container">
      <div className="tasks-header">
        <h1>Tasks</h1>
        <button onClick={handleOpenAddTaskModal} className="add-task-button">
          Add Task
        </button>
      </div>

      <div className="filter-controls">
        <button
          className={activeFilter === 'Web Development' ? 'active' : ''}
          onClick={() => setActiveFilter('Web Development')}>
          Web Development
        </button>
        <button
          className={activeFilter === 'Cybersecurity' ? 'active' : ''}
          onClick={() => setActiveFilter('Cybersecurity')}>
          Cybersecurity
        </button>
      </div>

      <div className="tasks-list-card">
        {isLoading ? (
          <p>Loading tasks...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project (Client)</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <div className="task-title">{task.title}</div>
                      <div className="task-description">{task.description}</div>
                    </td>
                    <td>
                      {task.project?.name} ({task.project?.client?.clientName})
                    </td>
                    <td>{task.assignedTo?.name || 'Unassigned'}</td>
                    <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`status-badge status-${task.status
                          .toLowerCase()
                          .replace(' ', '-')}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="edit-button"
                        onClick={() => handleOpenEditTaskModal(task)}>
                        Edit
                      </button>
                      <button
                        className="remove-button"
                        onClick={() => openDeleteModal(task)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>No tasks found for this category.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        users={users}
        projects={projects}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Task Deletion"
        message={
          <>
            Are you sure you want to delete{' '}
            <strong>{taskToDelete?.title}</strong>?
          </>
        }
        confirmText="Delete Task"
        variant="danger"
      />
    </div>
  );
};