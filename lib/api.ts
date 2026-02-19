import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://tulavi-backend.kindtree-01686ea2.southindia.azurecontainerapps.io/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we have a token (means token is invalid/expired)
      // Don't redirect on login failures (no token yet)
      // Don't redirect if we're already on the login page
      if (typeof window === 'undefined') {
        return Promise.reject(error);
      }
      
      const token = localStorage.getItem('auth_token');
      const currentPath = window.location.pathname;
      const requestUrl = error.config?.url || '';
      
      // Don't redirect for login endpoint failures
      if (requestUrl.includes('/auth/login')) {
        return Promise.reject(error);
      }
      
      // Only redirect if we have a token and we're not already on login page
      if (token && currentPath !== '/login') {
        console.error('401 Unauthorized - Token may be invalid or expired');
        localStorage.removeItem('auth_token');
        // Use a small delay to allow error handling in the calling code
        // and prevent redirect loops
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }, 200);
      }
    }
    return Promise.reject(error);
  }
);
