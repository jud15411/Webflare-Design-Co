// TasksPage/index.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import API from '../../utils/axios'; 
import { AxiosError } from 'axios'; 
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

interface Sprint { // NEW
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

// NEW TYPE FOR SAVE OPERATION: This is the data TaskModal must pass to onSave
type TaskDataForSave = Omit<Task, '_id' | 'assignedTo' | 'project' | 'sprint'> & {
    assignedTo: string; // The ID string
    project: string; // The ID string
    storyPoints: number; // Required field now
    sprint?: string | null; // Optional ID string
};


type TaskCategory = 'Cybersecurity' | 'Web Development';
type TaskStatus = 'To Do' | 'In Progress' | 'Done';

// Define a type for API error responses
interface ApiError {
  message: string;
}

// --- Component ---
export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]); // NEW
  const [activeSprintId, setActiveSprintId] = useState<'backlog' | string>('backlog'); // Default to Backlog
  const [activeCategory, setActiveCategory] =
    useState<TaskCategory>('Web Development'); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

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
  }, []); 

  const fetchSprints = useCallback(async () => { // NEW
    try {
      const response = await API.get<Sprint[]>('/sprints');
      setSprints(response.data);
      const activeSprint = response.data.find(s => s.status === 'Active');
      if (activeSprint) {
         setActiveSprintId(activeSprint._id);
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message ||
        'Failed to load sprints.';
      setError(message);
    }
  }, []);

  useEffect(() => {
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
      await Promise.all([fetchTasks(), fetchAuxData(), fetchSprints()]);
      setIsLoading(false);
    };

    fetchAllData();
  }, [fetchTasks, fetchSprints]); 

  // Derived state for the Agile Board/Backlog view
  const viewTasks = useMemo(() => {
    // 1. Filter by Category
    const categoryTasks = tasks.filter((task) => task.category === activeCategory);
    
    // 2. Filter by Sprint (or Backlog)
    if (activeSprintId === 'backlog') {
      // Tasks not assigned to a sprint (sprint is null or undefined)
      return categoryTasks.filter(task => !task.sprint?._id); 
    } else {
      // Tasks in the active sprint
      return categoryTasks.filter(task => task.sprint?._id === activeSprintId); 
    }
  }, [tasks, activeCategory, activeSprintId]); 

  const handleOpenAddTaskModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (
    taskData: TaskDataForSave // FIXED: Use the new, correct type
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

  // NEW: Component for a single Task Card (Agile Board)
  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <div className="task-card">
        <div className="card-header">
            <span className="task-points">{task.storyPoints || 0} SP</span>
            <span 
              className={`status-badge status-${task.status.toLowerCase().replace(' ', '-')}`}>
              {task.status}
            </span>
        </div>
        <div className="task-title-card">{task.title}</div>
        <div className="task-meta">
            <span className="task-assigned">Assignee: {task.assignedTo?.name || 'Unassigned'}</span>
            <span className="task-project">Project: {task.project?.name}</span>
        </div>
        <div className="card-actions">
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
        </div>
    </div>
  );

  // NEW: Component for the Kanban Board Column
  const BoardColumn: React.FC<{ status: TaskStatus, tasks: Task[] }> = ({ status, tasks }) => (
    <div className="board-column">
        <h3 className="column-header">{status} ({tasks.length})</h3>
        <div className="column-list">
            {tasks.map(task => (
                <TaskCard key={task._id} task={task} />
            ))}
            {!tasks.length && <p className="no-tasks-message">No tasks here.</p>}
        </div>
    </div>
  );

  const activeSprint = sprints.find(s => s._id === activeSprintId);
  const isBacklogView = activeSprintId === 'backlog';

  return (
    <div className="tasks-page-container">
      <div className="tasks-header">
        <h1>
          {isBacklogView 
            ? 'Product Backlog' 
            : `Sprint: ${activeSprint?.name || 'Loading...'}`
          }
        </h1>
        <button onClick={handleOpenAddTaskModal} className="add-task-button">
          Add Task
        </button>
      </div>

      {/* Filter Controls for Category and Sprint/Backlog */}
      <div className="filter-controls-group">
        <div className="filter-controls">
          <span className="filter-label">Category:</span>
          <button
            className={activeCategory === 'Web Development' ? 'active' : ''}
            onClick={() => setActiveCategory('Web Development')}>
            Web Development
          </button>
          <button
            className={activeCategory === 'Cybersecurity' ? 'active' : ''}
            onClick={() => setActiveCategory('Cybersecurity')}>
            Cybersecurity
          </button>
        </div>

        <div className="sprint-controls">
          <span className="filter-label">View:</span>
           <button
            className={isBacklogView ? 'active' : ''}
            onClick={() => setActiveSprintId('backlog')}>
            Backlog
          </button>
          {sprints.map(sprint => (
            <button
              key={sprint._id}
              className={activeSprintId === sprint._id ? 'active' : ''}
              onClick={() => setActiveSprintId(sprint._id as 'backlog' | string)}>
              {sprint.name} ({sprint.status})
            </button>
          ))}
        </div>
      </div>


      {/* Main Task List/Board */}
      <div className="tasks-list-card">
        {isLoading ? (
          <p>Loading tasks...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : isBacklogView ? (
          // Simple list/table view for the Backlog 
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project (Client)</th>
                <th>Assigned To</th>
                <th>Story Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {viewTasks.length > 0 ? (
                viewTasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <div className="task-title">{task.title}</div>
                      <div className="task-description">{task.description}</div>
                    </td>
                    <td>{task.project?.name} ({task.project?.client?.clientName})</td>
                    <td>{task.assignedTo?.name || 'Unassigned'}</td>
                    <td><span className="task-points-backlog">{task.storyPoints || '-'} SP</span></td>
                    <td>
                      <button className="edit-button" onClick={() => handleOpenEditTaskModal(task)}>Edit</button>
                      <button className="remove-button" onClick={() => openDeleteModal(task)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>No tasks in the Backlog for this category.</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          // Kanban Board View for Active Sprint
          <div className="kanban-board">
            <BoardColumn 
              status="To Do" 
              tasks={viewTasks.filter(t => t.status === 'To Do')} 
            />
            <BoardColumn 
              status="In Progress" 
              tasks={viewTasks.filter(t => t.status === 'In Progress')} 
            />
            <BoardColumn 
              status="Done" 
              tasks={viewTasks.filter(t => t.status === 'Done')} 
            />
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        users={users}
        projects={projects}
        sprints={sprints} // Pass sprints to the modal for selection
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