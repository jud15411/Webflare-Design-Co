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
  // Manually extract the cookie because Axios won't do it for cross-subdomain
  const cookies = document.cookie.split('; ');
  const csrfCookie = cookies.find((row) => row.startsWith('XSRF-TOKEN='));
  const token = csrfCookie
    ? decodeURIComponent(csrfCookie.split('=')[1])
    : null;

  if (token) {
    config.headers['X-XSRF-TOKEN'] = token;
  }

  const hasCsrfHeader = !!config.headers['X-XSRF-TOKEN'];
  console.log(
    `[Axios Debug] Request to ${config.url} - Has CSRF Header: ${hasCsrfHeader}`
  );

  return config;
});

export default api;
