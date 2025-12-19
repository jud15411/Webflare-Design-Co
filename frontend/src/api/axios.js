import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Replace with your actual server URL
  withCredentials: true, // Crucial for receiving and sending the JWT cookie
  xsrfCookieName: 'XSRF-TOKEN', // The name of the cookie we set in Express
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

export default api;
