import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Or wherever your AuthContext is

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Show a loading state if the auth context is still initializing
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 2. Once loading is complete, check if the user is authenticated.
  //    If so, render the protected content. Otherwise, redirect to the login page.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};
