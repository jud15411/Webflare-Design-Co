// src/components/ProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // This is the key change. We explicitly wait until loading is completely finished
  // before we make any decision about where to send the user.
  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // Once loading is false, we can be confident that the isAuthenticated
  // value is final.
  if (!isAuthenticated) {
    // If not authenticated, redirect to login, preserving the location they were trying to reach.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If loading is finished and they are authenticated, render the child routes.
  return <Outlet />;
};