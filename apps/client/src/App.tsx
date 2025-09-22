import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/Layout';
import React from 'react';
import KnowledgeBasePage from './pages/KnowledgeBase';
import SoftwarePage from './pages/Software';
import ReportsPage from './pages/Reports';
import SettingsPage from './pages/Settings';
import { RolesPage } from './pages/Settings/RolesPage';
import ProfilePage from './pages/Profile';
import { TeamPage } from './pages/Team';
import { TasksPage } from './pages/Tasks';
import { CybersecurityProjectsPage } from './pages/Projects/CybersecurityProjectsPage';
import { WebDevelopmentProjectsPage } from './pages/Projects/WebDevelopmentProjectsPage';
import { useAuth } from './contexts/AuthContext'; // Import useAuth
import { SchedulesPage } from './pages/Team/SchedulesPage';
import TimeLogsPage from './pages/TimeLogs';
import { TimeLogsReportPage } from './pages/Reports/TimeLogsReportPage';
import { ClientsPage } from './pages/Clients';
import { ClientDetailsPage } from './pages/Clients/ClientDetailsPage';
import { ContractsPage } from './pages/Contracts';
import { CreateContractPage } from './pages/Contracts/CreateContractPage';
import { ContractDetailsPage } from './pages/Contracts/ContractDetailsPage';
import ProposalsPage from './pages/Proposals';
import InvoicesPage from './pages/Invoices';
import ExpensesPage from './pages/Expenses';
import SubscriptionsPage from './pages/Subscriptions';
import { ProjectDetailsPage } from './pages/Projects/ProjectDetailsPage';
import { FeedbackPage } from './pages/Feedback';

interface NavDropdownProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  closeMobileMenu?: () => void;
  isOpen: boolean;
  toggleDropdown: () => void;
}

export const NavDropdown: React.FC<NavDropdownProps> = ({
  title,
  icon,
  children,
  closeMobileMenu,
  isOpen,
  toggleDropdown,
}) => {
  const handleToggle = (e: React.MouseEvent) => {
    if (closeMobileMenu) {
      e.stopPropagation();
    }
    toggleDropdown();
  };

  const handleLinkClick = () => {
    if (closeMobileMenu) {
      closeMobileMenu();
    }
  };

  return (
    <div className="nav-dropdown">
      <div className="nav-dropdown-toggle" onClick={handleToggle}>
        <span>
          {icon} {title}
        </span>
        <span className={`arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      {isOpen && (
        <div className="nav-dropdown-menu">
          {React.Children.map(children, (child) =>
            React.cloneElement(child as React.ReactElement<any>, {
              onClick: handleLinkClick,
            })
          )}
        </div>
      )}
    </div>
  );
};

function App() {
  const { isLoading } = useAuth(); // Get isLoading state

  if (isLoading) {
    return <div>Loading...</div>; // Show a loading state
  }

  return (
    <Router>
      <Routes>
        {/* Public route for login, rendered without the main layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LoginPage />} />

        {/* Protected routes, all rendered inside the MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
            <Route path="/software" element={<SoftwarePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route
              path="/projects/cybersecurity"
              element={<CybersecurityProjectsPage />}
            />
            <Route
              path="/projects/web-development"
              element={<WebDevelopmentProjectsPage />}
            />
            <Route path="/role-management" element={<RolesPage />} />
            <Route path="/team-schedules" element={<SchedulesPage />} />
            <Route path="/time-tracking" element={<TimeLogsPage />} />
            <Route path="/reports/time-logs" element={<TimeLogsReportPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:id" element={<ClientDetailsPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/contracts/create" element={<CreateContractPage />} />
            <Route path="/contracts/:id" element={<ContractDetailsPage />} />
            <Route path="/proposals" element={<ProposalsPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
