import axios from 'axios';

const TOKEN_KEY = 'feriwala_portal_token';
const LEGACY_TOKEN_KEY = 'feriwala_admin_token';

const resolveApiBase = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;

  if (typeof window === 'undefined') {
    return 'http://localhost:3000/api';
  }

  const { hostname, origin, protocol } = window.location;

  if (hostname === '65.2.9.216') {
    return `${origin}/api`;
  }

  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.app.github.dev') ||
    hostname.endsWith('.github.dev')
  ) {
    return 'http://65.2.9.216/api';
  }

  return protocol === 'http:' ? `${origin}/api` : 'http://65.2.9.216/api';
};

const API_BASE = resolveApiBase();

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
      if (typeof window !== 'undefined') {
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

