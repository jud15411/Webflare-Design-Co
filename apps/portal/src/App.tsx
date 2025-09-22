import React from 'react';
// Import Navigate from react-router-dom
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import LoginPage from './pages/Login';
import { NotificationProvider } from './contexts/NotificationContext'; // Import the provider
import { Notification } from './components/Common/Notification/Notification';
import SetPasswordPage from './pages/SetPassword';
import DashboardPage from './pages/Dashboard';
import ProjectDetailsPage from './pages/ProjectDetails';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Notification />
        <Router basename="/portal">
          <Routes>
            {/* Change this route to explicitly redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/set-password" element={<SetPasswordPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
