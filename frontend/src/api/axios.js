import axios from 'axios';
const API_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_URL, // Replace with your actual server URL
  withCredentials: true, // Crucial for receiving and sending the JWT cookie
  xsrfCookieName: 'XSRF-TOKEN', // The name of the cookie we set in Express
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local user data and redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
