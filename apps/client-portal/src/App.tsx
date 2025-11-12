// File: apps/portal/src/App.tsx (Main Client Portal Routing File)

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClientAuthProvider } from './contexts/ClientAuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProjectsListPage } from './pages/ProjectsListPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import SupportTicketsPage from './pages/SupportTicketsPage/SupportTicketsPage';
import NewTicketPage from './pages/NewTicketPage/NewTicketPage';

export const App: React.FC = () => {
  return (
    <ClientAuthProvider>
      <BrowserRouter basename="/client-portal">
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsListPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            
            {/* Support Tickets Routes */}
            <Route path="/support/tickets" element={<SupportTicketsPage />} />
            <Route path="/support/tickets/new" element={<NewTicketPage />} />
            
            {/* Default redirect to Dashboard after login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Redirect old support route to new one */}
            <Route path="/support" element={<Navigate to="/support/tickets" replace />} />
            
            {/* Fallback for unknown paths (e.g., 404) */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ClientAuthProvider>
  );
};