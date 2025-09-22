import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmationModal } from '../../components/Common/ConfirmationModal/ConfirmationModal';
import { TaskModal } from '../../components/TaskModal';
import './TasksPage.css';

// --- Type Definitions ---
interface User {
  _id: string;
  name: string;
}

// Add Project and Client interfaces
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
  project: Project; // Update task to include project
}

type TaskCategory = 'Cybersecurity' | 'Web Development';

// --- Component ---
export const TasksPage: React.FC = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]); // State for projects
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

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/v1/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch tasks.');
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    const fetchAuxData = async () => {
      if (!token) return;
      try {
        const [usersRes, projectsRes] = await Promise.all([
          fetch('/api/v1/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/v1/projects', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!usersRes.ok) throw new Error('Failed to fetch users.');
        if (!projectsRes.ok) throw new Error('Failed to fetch projects.');

        setUsers(await usersRes.json());
        setProjects(await projectsRes.json());
      } catch (err: any) {
        console.error(err.message);
      }
    };

    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      await Promise.all([fetchTasks(), fetchAuxData()]);
      setIsLoading(false);
    };

    if (token) {
      fetchAllData();
    }
  }, [token, fetchTasks]);

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

  const handleSaveTask = async (
    taskData: Omit<Task, '_id' | 'assignedTo' | 'project'> & {
      assignedTo: string;
      project: string;
    }
  ) => {
    const endpoint = editingTask
      ? `/api/v1/tasks/${editingTask._id}`
      : '/api/v1/tasks';
    const method = editingTask ? 'PATCH' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to save task.');
      }
      setIsTaskModalOpen(false);
      await fetchTasks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openDeleteModal = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      const response = await fetch(`/api/v1/tasks/${taskToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete task.');
      setTasks(tasks.filter((task) => task._id !== taskToDelete._id));
    } catch (err: any) {
      setError(err.message);
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
                <th>Project (Client)</th> {/* Updated Header */}
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
                    {/* Display Project and Client Name */}
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
        projects={projects} // Pass projects to modal
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
