import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add a request interceptor to include the token in every request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(new Error(error));
  },
);

// Optional: Add a response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If we get a 401, the token is invalid, so log the user out
      const errorMessage = 'Your session has expired. Please log in again.';
      useAuthStore.getState().logout();
      return Promise.reject(new Error(errorMessage));
    }
    const errorMessage = error?.message || 'Please try again.';
    return Promise.reject(new Error(errorMessage));
  },
);

export default api;
