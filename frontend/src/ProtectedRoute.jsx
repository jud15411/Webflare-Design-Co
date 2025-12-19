import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Look for the flag we set during the successful login
  const authStatus = localStorage.getItem('isAuthenticated');

  if (authStatus !== 'true') {
    // If the flag isn't there, send them back to login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
