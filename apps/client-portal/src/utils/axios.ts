// src/utils/axios.ts

import axios from 'axios';

// Base URL for API calls. Server mounts routes under '/api/v1'.
// You can override with VITE_API_BASE_URL if needed.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Use an interceptor to automatically add the auth token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Fallback to clientToken if authToken is not found (for backward compatibility)
      const clientToken = localStorage.getItem('clientToken');
      if (clientToken) {
        config.headers.Authorization = `Bearer ${clientToken}`;
        // Optionally migrate the token to the new key
        localStorage.setItem('authToken', clientToken);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;