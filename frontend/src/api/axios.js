import axios from 'axios';
const API_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// DEBUG INTERCEPTOR
api.interceptors.request.use((config) => {
  // Check if the X-XSRF-TOKEN header was successfully attached
  const hasCsrfHeader = config.headers['X-XSRF-TOKEN'];
  console.log(
    `[Axios Debug] Request to ${
      config.url
    } - Has CSRF Header: ${!!hasCsrfHeader}`
  );
  return config;
});

export default api;
