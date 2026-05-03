import axios from 'axios';

const API_BASE_URL = 'https://workeasebackend.onrender.com/api/admin';
// const API_BASE_URL = 'http://localhost:5000/api/admin';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(async (config) => {
  const auth = localStorage.getItem('admin_token'); // We need to save this on login
  if (auth) {
    config.headers.Authorization = `Bearer ${auth}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
