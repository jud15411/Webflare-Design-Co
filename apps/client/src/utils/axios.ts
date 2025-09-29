// src/utils/axios.ts

import axios from 'axios';

const API = axios.create({
  // Use import.meta.env for Vite environment variables
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
});

// Use an interceptor to automatically add the auth token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Assuming you store the token with this key
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;