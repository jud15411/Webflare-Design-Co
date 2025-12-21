// src/context/ErrorContext.jsx
import React, { createContext, useState, useContext } from 'react';
import GlobalErrorModal from '../components/modals/GlobalErrorModal';
import { logger } from '../utils/logger';

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  // This is the function you'll call throughout your app
  const triggerError = (title, message, code, originalError = null) => {
    // 1. Log to your utility (System side)
    if (originalError) {
      logger.error(`${title}: ${message}`, originalError);
    }

    // 2. Show the Modal (User side)
    setError({ title, message, code });
  };

  const clearError = () => setError(null);

  return (
    <ErrorContext.Provider value={{ triggerError }}>
      {children}
      <GlobalErrorModal isOpen={!!error} error={error} onClose={clearError} />
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);
