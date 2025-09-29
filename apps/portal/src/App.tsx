import React from 'react';
// Import Navigate from react-router-dom
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import LoginPage from './pages/Login'; // Import the provider
import { Notification } from './components/Common/Notification/Notification';
import SetPasswordPage from './pages/SetPassword';
import DashboardPage from './pages/Dashboard';
import ProjectDetailsPage from './pages/ProjectDetails';
import './App.css';

const App: React.FC = () => {
  // The AuthProvider and NotificationProvider should wrap the Router in main.tsx
  return (
    <>
      <Notification />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects/:id" element={<ProjectDetailsPage />} />
      </Routes>
    </>
  );
};

export default App;
