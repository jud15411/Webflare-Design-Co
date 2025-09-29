import React, { useState, useEffect } from 'react';
import API from '../../utils/axios'; // Import the new axios instance
import { AxiosError } from 'axios'; // Import AxiosError for better error typing
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useNavigate, Link } from 'react-router-dom';
import { FeedbackModal } from '../ProjectDetails/FeedbackModal';
import './Dashboard.css';

// --- Type Definitions ---
interface Project {
  _id: string;
  name: string;
  status: string;
  category: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  dueDate: string;
}

interface Task {
  _id: string;
  title: string;
  status: string;
  dueDate: string;
  project: {
    _id: string;
    name: string;
  };
}

interface DashboardData {
  projects?: Project[];
  invoices?: Invoice[];
  tasks?: Task[];
}

interface ApiError {
  message: string;
}

const DashboardPage: React.FC = () => {
  // token is still useful here for the dependency array to trigger fetch on login
  const { token, clientUser, logout } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackItem, setFeedbackItem] = useState<{
    type: 'task';
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        // Refactored to use the API instance
        const response = await API.get<DashboardData>('/portal/dashboard');
        setData(response.data);
      } catch (err) {
        const axiosError = err as AxiosError<ApiError>;
        const message =
          axiosError.response?.data?.message || 'Failed to load dashboard data.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };



  const handleFeedbackSubmitted = () => {
    showNotification('Thank you, your task feedback has been submitted!');
  };

  if (loading) {
    return <div className="portal-loading">Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="portal-error">{error}</div>;
  }

  return (
    <div className="portal-dashboard">
      <header className="portal-header">
        <h1>Welcome, {clientUser?.clientName}!</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <main className="portal-main">
        {data?.projects && data.projects.length > 0 && (
          <section className="dashboard-section">
            <h2>My Projects</h2>
            <div className="card-grid">
              {data.projects.map((project) => (
                <Link
                  to={`/portal/projects/${project._id}`}
                  key={project._id}
                  className="project-card-link">
                  <div className="data-card">
                    <h3>{project.name}</h3>
                    <p>
                      <strong>Category:</strong> {project.category}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span
                        className={`status-badge status-${project.status
                          .toLowerCase()
                          .replace(' ', '-')}`}>
                        {project.status}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {data?.tasks && data.tasks.length > 0 && (
          <section className="dashboard-section">
            <h2>My Tasks</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.tasks.map((task) => (
                  <tr key={task._id}>
                    <td>{task.title}</td>
                    <td>{task.project.name}</td>
                    <td>
                      <span
                        className={`status-badge status-${task.status
                          .toLowerCase()
                          .replace(' ', '-')}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="table-action-btn"
                        onClick={() =>
                          setFeedbackItem({
                            type: 'task',
                            id: task._id,
                            name: task.title,
                          })
                        }>
                        Feedback
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {data?.invoices && data.invoices.length > 0 && (
          <section className="dashboard-section">
            <h2>My Invoices</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {data.invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td>{invoice.invoiceNumber}</td>
                    <td>${invoice.totalAmount.toFixed(2)}</td>
                    <td>
                      <span
                        className={`status-badge status-${invoice.status.toLowerCase()}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {!data?.projects?.length &&
          !data?.invoices?.length &&
          !data?.tasks?.length && (
            <p>No information is currently available on your portal.</p>
          )}
      </main>

      {feedbackItem && (
        <FeedbackModal
          itemType={feedbackItem.type}
          itemId={feedbackItem.id}
          itemName={feedbackItem.name}
          onClose={() => setFeedbackItem(null)}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}
    </div>
  );
};

export default DashboardPage;