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
    startDate: string; // ISO Date String
    endDate: string;   // ISO Date String
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
type TaskStatus = 'To Do' | 'In Progress' | 'Done'; 
interface ApiError { message: string; }

/**
 * Accepts an ISO date string and returns a formatted date string.
 * This function signature was updated to fix the 'string' not assignable to 'Date' error.
 */
const getFormattedDate = (date: string): string => {
    const month = (new Date(date).getMonth() + 1).toString().padStart(2, '0');
    const day = new Date(date).getDate().toString().padStart(2, '0');
    return `${month}/${day}`; // Simplified for display
};

// --- Component ---
export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]); 
  
  // 'planning' or a sprint _id for the Active Board
  const [activeViewId, setActiveViewId] = useState<'planning' | string>('planning'); 
  
  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  
  // Sprint Modal States
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


  // --- Derived State (Grouping for Planning View) ---
  const { backlogTasks, sprintGroups } = useMemo(() => {
    const backlogTasks: Task[] = [];
    const sprintMap = new Map<string, { sprint: Sprint; tasks: Task[] }>();

    // 1. Initialize groups for Planning and Active sprints
    sprints.forEach(sprint => {
        if (sprint.status !== 'Completed') {
            sprintMap.set(sprint._id, { sprint, tasks: [] });
        }
    });

    // 2. Assign tasks to their groups
    tasks.forEach(task => {
        const sprintId = task.sprint?._id;
        if (sprintId && sprintMap.has(sprintId)) {
            sprintMap.get(sprintId)!.tasks.push(task);
        } else {
            // Tasks not assigned to a non-completed sprint go to the product backlog
            backlogTasks.push(task);
        }
    });

    // Sort sprint groups: Active first, then Planning by start date
    const sortedSprintGroups = Array.from(sprintMap.values()).sort((a, b) => {
        if (a.sprint.status === 'Active' && b.sprint.status !== 'Active') return -1;
        if (a.sprint.status !== 'Active' && b.sprint.status === 'Active') return 1;
        return new Date(a.sprint.startDate).getTime() - new Date(b.sprint.startDate).getTime();
    });

    return { backlogTasks, sprintGroups: sortedSprintGroups };
  }, [sprints, tasks]);


  // --- Derived State (Tasks for the Kanban Board View) ---
  const viewTasks = useMemo(() => {
    // Only used when activeViewId is a Sprint ID (i.e., the Kanban Board)
    return tasks.filter(task => task.sprint?._id === activeViewId); 
  }, [tasks, activeViewId]); 

  const activeSprint = sprints.find(s => s._id === activeViewId);
  const isPlanningView = activeViewId === 'planning';
  // Removed unused variable: const isBoardView = !isPlanningView;


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
      if (isNew) {
        await API.post('/sprints', sprintData);
      } else if (editingSprint) {
        await API.patch(`/sprints/${editingSprint._id}`, sprintData);
      }
      
      await fetchSprints(); 
      setIsSprintModalOpen(false);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || `Failed to ${isNew ? 'create' : 'update'} sprint.`);
    }
  };

  const handleDeleteSprint = async () => {
    if (!sprintToDelete) return;
    try {
      await API.delete(`/sprints/${sprintToDelete._id}`);
      await Promise.all([fetchSprints(), fetchTasks()]); 
      setActiveViewId('planning');
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || 'Failed to delete the sprint.');
    } finally {
      setIsDeleteSprintModalOpen(false);
      setSprintToDelete(null);
    }
  };


  // --- Sub-Components for Rendering ---

  // Component for a single Task Card (Agile Board - Kanban)
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

  // NEW: Component for a Sprint Box in the Planning View
  const SprintPlanningBox: React.FC<{ sprintGroup: { sprint: Sprint; tasks: Task[] } }> = ({ sprintGroup }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const sprint = sprintGroup.sprint;
    const totalPoints = sprintGroup.tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);

    return (
        <div className={`sprint-planning-box status-${sprint.status.toLowerCase()}`}>
            <div className="sprint-header" onClick={() => setIsCollapsed(!isCollapsed)}>
                <span className="sprint-collapse-icon">{isCollapsed ? '►' : '▼'}</span>
                <span className="sprint-name">{sprint.name}</span>
                <span className={`sprint-status status-${sprint.status.toLowerCase()}`}>{sprint.status}</span>
                <span className="sprint-dates">({getFormattedDate(sprint.startDate)} - {getFormattedDate(sprint.endDate)})</span>
                <span className="sprint-points-total">{totalPoints} SP</span>
                <button 
                    className="edit-sprint-button"
                    onClick={(e) => { e.stopPropagation(); handleOpenEditSprintModal(sprint); }}
                >
                    Edit Sprint
                </button>
            </div>
            {!isCollapsed && (
                <div className="sprint-tasks-list">
                    <table className="tasks-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Assigned To</th>
                                <th>Status</th>
                                <th>Story Points</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sprintGroup.tasks.map((task) => (
                                <tr key={task._id}>
                                    <td><div className="task-title">{task.title}</div></td>
                                    <td>{task.assignedTo?.name || 'Unassigned'}</td>
                                    <td><span className={`status-badge status-${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</span></td>
                                    <td><span className="task-points-backlog">{task.storyPoints || 0} SP</span></td>
                                    <td>
                                        <button className="edit-button" onClick={() => handleOpenEditTaskModal(task)}>Edit</button>
                                        <button className="remove-button" onClick={() => { setTaskToDelete(task); setIsDeleteModalOpen(true); }}>Del</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="jira-page-container">
      <div className="jira-sidebar">
        <h2 className="sidebar-title">VIEWS</h2>
        <div 
          className={`sidebar-item ${isPlanningView ? 'active' : ''}`} 
          onClick={() => setActiveViewId('planning')}
        >
          Product Backlog
        </div>
        
        <h2 className="sidebar-title sidebar-sprints-header">
            Active Boards 
            <button 
                className="add-sprint-button"
                onClick={() => { setEditingSprint(null); setIsSprintModalOpen(true); }}
            >
                +
            </button>
        </h2>
        <div className="sprints-list">
            {sprints.filter(s => s.status === 'Active').map(sprint => (
                <div 
                    key={sprint._id} 
                    className={`sidebar-item ${activeViewId === sprint._id ? 'active' : ''}`}
                    onClick={() => setActiveViewId(sprint._id)}
                >
                    {sprint.name} 
                    <div className="sprint-actions">
                        <span 
                          className="edit-sprint-icon" 
                          onClick={(e) => { e.stopPropagation(); handleOpenEditSprintModal(sprint); }}
                        >
                          ⚙️
                        </span>
                    </div>
                </div>
            ))}
            {!sprints.filter(s => s.status === 'Active').length && <p className="no-sprints-message">No active sprints.</p>}
        </div>
      </div>

      <div className="jira-main-content">
        <div className="content-header">
            <h1>
                {isPlanningView 
                    ? 'Product Backlog & Planning' 
                    : `Active Board: ${activeSprint?.name || 'Loading...'}`
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
        ) : isPlanningView ? (
          // Planning View (Jira Backlog Style)
          <div className="planning-view-container">
            {/* Sprints ready for planning/in progress */}
            {sprintGroups.map(group => (
                <SprintPlanningBox key={group.sprint._id} sprintGroup={group} />
            ))}

            <div className="product-backlog-section">
                <h2 className="backlog-section-title">Product Backlog ({backlogTasks.length})</h2>
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
                        {backlogTasks.length > 0 ? (
                            backlogTasks.map((task) => (
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
                                <button className="remove-button" onClick={() => { setTaskToDelete(task); setIsDeleteModalOpen(true); }}>Del</button>
                                </td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                            <td colSpan={6}>No unassigned tasks in the Product Backlog.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        ) : (
          // Kanban Board View for Active Sprint
          <div className="kanban-board">
            <BoardColumn status="To Do" tasks={viewTasks.filter(t => t.status === 'To Do')} />
            <BoardColumn status="In Progress" tasks={viewTasks.filter(t => t.status === 'In Progress')} />
            <BoardColumn status="Done" tasks={viewTasks.filter(t => t.status === 'Done')} />
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