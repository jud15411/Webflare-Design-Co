// src/utils/logger.js
import api from '../api/axios'; // Import your existing axios instance

export const logger = {
  error: async (message, errorObject = {}) => {
    const errorPayload = {
      level: 'error',
      message: message,
      stack: errorObject?.stack || 'No stack trace available',
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    // Send the frontend error to the backend to be officially logged/alerted
    try {
      await api.post('/logs/frontend', errorPayload);
    } catch (err) {
      // Fallback if the logging API itself is down
      console.error('Critical: Logging service unreachable', errorPayload);
    }
  },
};
