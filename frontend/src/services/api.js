import axios from 'axios';

// Create Axios instance with API baseURL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach JWT Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('woffy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and on a protected path, handle session expiration
      const publicPaths = ['/login', '/signup', '/forget-pass', '/verify-reset-otp', '/reset-password'];
      const currentPath = window.location.pathname;
      if (!publicPaths.some((p) => currentPath.startsWith(p)) && !currentPath.startsWith('/pet/tag')) {
        localStorage.removeItem('woffy_token');
        localStorage.removeItem('woffy_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
