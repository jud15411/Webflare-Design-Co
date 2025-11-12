import './App.css';
// 1. REMOVE BrowserRouter and add Navigate
import { Routes, Route, Navigate } from 'react-router-dom';
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
import { useAuth } from './contexts/AuthContext';
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
import ServicesPage from './pages/Website/ServicesPage';
import PortfolioPage from './pages/Website/PortfolioPage';
import PricingPage from './pages/Website/PricingPage';
import TestimonialsPage from './pages/Website/TestimonialsPage';
import SupportTicketsPage from './pages/SupportTickets';

// Note: The NavDropdown component can be moved to its own file if desired.
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
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 2. The <Router> is removed from here. The one in main.tsx is now in control.
  return (
    <Routes>
      {/* Public route for login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes are wrapped in the ProtectedRoute component */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Default route for logged-in users */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
          <Route path="/support-tickets" element={<SupportTicketsPage />} />
          <Route path="/website/services" element={<ServicesPage />} />
          <Route path="/website/portfolio" element={<PortfolioPage />} />
          <Route path="/website/pricing" element={<PricingPage />} />
          <Route path="/website/testimonials" element={<TestimonialsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;