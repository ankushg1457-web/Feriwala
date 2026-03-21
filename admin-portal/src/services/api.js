import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://13.233.227.15:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('feriwala_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('feriwala_admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
