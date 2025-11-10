// TasksPage/index.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import API from '../../utils/axios'; 
import { AxiosError } from 'axios'; 
import { ConfirmationModal } from '../../components/Common/ConfirmationModal/ConfirmationModal';
import { TaskModal } from '../../components/TaskModal'; 
import { SprintModal } from '../../components/SprintModal/SprintModal'; 
import './TasksPage.css'; 

// --- Type Definitions ---
interface User { _id: string; name: string; }
interface Client { _id: string; clientName: string; }
interface Project { _id: string; name: string; client: Client; }
interface Sprint { 
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'Planning' | 'Active' | 'Completed';
    project: string; 
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
  storyPoints?: number; 
  sprint?: Sprint | null; 
}

type TaskDataForSave = Omit<Task, '_id' | 'assignedTo' | 'project' | 'sprint'> & {
    assignedTo: string;
    project: string;
    storyPoints: number;
    sprint?: string | null;
};

type SprintDataForSave = Omit<Sprint, '_id' | 'endDate' | 'project'> & { project: string };

// Removed unused type aliases TaskCategory and TaskStatus
type TaskStatus = 'To Do' | 'In Progress' | 'Done'; // Re-declared TaskStatus since it is used in BoardColumn prop

interface ApiError { message: string; }

// --- Component ---
export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]); 
  
  // Jira-like selection: 'backlog' (for the Backlog) or a sprint _id (for the Board)
  const [activeViewId, setActiveViewId] = useState<'backlog' | string>('backlog'); 
  
  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  
  // NEW Sprint Modal States
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [isDeleteSprintModalOpen, setIsDeleteSprintModalOpen] = useState(false);
  const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // --- Fetching Logic ---
  const fetchTasks = useCallback(async () => {
    try {
      const response = await API.get<Task[]>('/tasks');
      setTasks(response.data);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || 'Failed to fetch tasks.');
    }
  }, []); 

  const fetchSprints = useCallback(async () => { 
    try {
      const response = await API.get<Sprint[]>('/sprints');
      setSprints(response.data);
      // Set the default view to the Active sprint or Backlog
      const activeSprint = response.data.find(s => s.status === 'Active');
      if (activeSprint && activeViewId === 'backlog') {
         setActiveViewId(activeSprint._id);
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || 'Failed to load sprints.');
    }
  }, [activeViewId]);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [usersRes, projectsRes] = await Promise.all([
          API.get<User[]>('/users'),
          API.get<Project[]>('/projects'),
        ]);
        setUsers(usersRes.data);
        setProjects(projectsRes.data);
        
        await Promise.all([fetchTasks(), fetchSprints()]);
      } catch (err) {
         const axiosError = err as AxiosError<ApiError>;
         setError(axiosError.response?.data?.message || 'Failed to load page data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [fetchTasks, fetchSprints]); 


  // --- Derived State (Tasks for the Active View) ---
  const viewTasks = useMemo(() => {
    if (activeViewId === 'backlog') {
      // Tasks not assigned to a sprint (sprint is null or undefined)
      return tasks.filter(task => !task.sprint?._id); 
    } else {
      // Tasks in the active sprint
      return tasks.filter(task => task.sprint?._id === activeViewId); 
    }
  }, [tasks, activeViewId]); 

  const activeSprint = sprints.find(s => s._id === activeViewId);
  const isBacklogView = activeViewId === 'backlog';


  // --- Task Handlers ---
  const handleOpenAddTaskModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: TaskDataForSave) => {
    try {
      // FIXED: Assign to const directly to resolve 'response declared but never read'
      const response = editingTask 
        ? await API.patch(`/tasks/${editingTask._id}`, taskData)
        : await API.post('/tasks', taskData);
      
      // Update local tasks with the new task data
      if (editingTask) {
        setTasks(tasks.map(t => t._id === response.data._id ? response.data : t));
      } else {
        setTasks([...tasks, response.data]);
      }

      setIsTaskModalOpen(false);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || 'Failed to save the task.');
    }
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await API.delete(`/tasks/${taskToDelete._id}`);
      setTasks(tasks.filter((task) => task._id !== taskToDelete._id));
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || 'Failed to delete the task.');
    } finally {
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  };


  // --- Sprint Handlers ---
  const handleOpenEditSprintModal = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setIsSprintModalOpen(true);
  };

  const handleSaveSprint = async (sprintData: SprintDataForSave, isNew: boolean) => {
    try {
      // FIXED: Use await directly as the response is not needed before fetchSprints()
      if (isNew) {
        await API.post('/sprints', sprintData);
      } else if (editingSprint) {
        await API.patch(`/sprints/${editingSprint._id}`, sprintData);
      }
      
      await fetchSprints(); // Re-fetch all sprints to update list and active sprint ID
      setIsSprintModalOpen(false);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || `Failed to ${isNew ? 'create' : 'update'} sprint.`);
    }
  };

  const handleDeleteSprint = async () => {
    if (!sprintToDelete) return;
    try {
      // API call also moves all associated tasks to backlog
      await API.delete(`/sprints/${sprintToDelete._id}`);
      await Promise.all([fetchSprints(), fetchTasks()]); // Refresh both
      setActiveViewId('backlog');
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || 'Failed to delete the sprint.');
    } finally {
      setIsDeleteSprintModalOpen(false);
      setSprintToDelete(null);
    }
  };


  // --- Sub-Components for Rendering ---

  // Component for a single Task Card (Agile Board)
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
        </div>
    </div>
  );

  // Component for the Kanban Board Column
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


  // --- Main Render ---
  return (
    <div className="jira-page-container">
      <div className="jira-sidebar">
        <h2 className="sidebar-title">Agile Boards</h2>
        <div 
          className={`sidebar-item ${isBacklogView ? 'active' : ''}`} 
          onClick={() => setActiveViewId('backlog')}
        >
          Product Backlog
        </div>
        
        <h2 className="sidebar-title sidebar-sprints-header">
            Sprints 
            <button 
                className="add-sprint-button"
                onClick={() => {
                    setEditingSprint(null);
                    setIsSprintModalOpen(true);
                }}
            >
                +
            </button>
        </h2>
        <div className="sprints-list">
            {sprints.map(sprint => (
                <div 
                    key={sprint._id} 
                    className={`sidebar-item ${activeViewId === sprint._id ? 'active' : ''}`}
                    onClick={() => setActiveViewId(sprint._id)}
                >
                    {sprint.name} 
                    <span className={`sprint-status status-${sprint.status.toLowerCase()}`}>{sprint.status}</span>
                    <div className="sprint-actions">
                        <span 
                          className="edit-sprint-icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditSprintModal(sprint);
                          }}
                        >
                          ⚙️
                        </span>
                        <span 
                          className="delete-sprint-icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSprintToDelete(sprint);
                            setIsDeleteSprintModalOpen(true);
                          }}
                        >
                          🗑️
                        </span>
                    </div>
                </div>
            ))}
            {!sprints.length && <p className="no-sprints-message">No sprints defined.</p>}
        </div>
      </div>

      <div className="jira-main-content">
        <div className="content-header">
            <h1>
                {isBacklogView 
                    ? 'Product Backlog' 
                    : `Active Sprint: ${activeSprint?.name || 'Loading...'}`
                }
            </h1>
            <button 
                onClick={handleOpenAddTaskModal} 
                className="add-task-button">
                Create Task
            </button>
        </div>

        {isLoading ? (
          <p>Loading data...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : isBacklogView ? (
          // Backlog View (Table for Planning/Prioritization)
          <div className="tasks-list-card">
            <table className="tasks-table">
                <thead>
                <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Project</th>
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
                        <td>{task.category}</td>
                        <td>{task.project?.name}</td>
                        <td>{task.assignedTo?.name || 'Unassigned'}</td>
                        <td><span className="task-points-backlog">{task.storyPoints || 0} SP</span></td>
                        <td>
                        <button className="edit-button" onClick={() => handleOpenEditTaskModal(task)}>Edit</button>
                        <button className="remove-button" onClick={() => {
                            setTaskToDelete(task);
                            setIsDeleteModalOpen(true);
                        }}>Delete</button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan={6}>No tasks in the Backlog. Start creating tasks!</td>
                    </tr>
                )}
                </tbody>
            </table>
          </div>
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

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        users={users}
        projects={projects}
        sprints={sprints}
      />
      
      <SprintModal 
        isOpen={isSprintModalOpen}
        onClose={() => setIsSprintModalOpen(false)}
        onSave={handleSaveSprint}
        sprint={editingSprint}
        projects={projects}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteTask}
        title="Confirm Task Deletion"
        message={
          <>Are you sure you want to delete <strong>{taskToDelete?.title}</strong>?</>
        }
        confirmText="Delete Task"
        variant="danger"
      />
      
      <ConfirmationModal
        isOpen={isDeleteSprintModalOpen}
        onClose={() => setIsDeleteSprintModalOpen(false)}
        onConfirm={handleDeleteSprint}
        title="Confirm Sprint Deletion"
        message={
          <>
            Are you sure you want to delete sprint <strong>{sprintToDelete?.name}</strong>? 
            <br/><br/>
            ⚠️ All tasks in this sprint will be moved back to the **Product Backlog**.
          </>
        }
        confirmText="Delete Sprint"
        variant="danger"
      />
    </div>
  );
};