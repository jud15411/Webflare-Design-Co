import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useClientAuth } from '../contexts/ClientAuthContext';

/**
 * Ensures only authenticated clients can access a route.
 * Handles loading state and redirects unauthenticated users to the login page.
 */
export const ProtectedRoute: React.FC = () => {
  // Properties are now correctly extracted from the updated context
  const { isAuthenticated, loading } = useClientAuth();

  if (loading) {
    // A simple loading state while checking token validity
    return <div className="p-8 text-center">Loading client session...</div>;
  }

  // If authenticated, render the child component (Outlet)
  if (isAuthenticated) {
    return <Outlet />;
  }

  // If not authenticated, redirect to the login page
  return <Navigate to="/login" replace />;
};