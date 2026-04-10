import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach standard auth token
instance.interceptors.request.use(
  (config) => {
    // You cannot pull from zustand like normal reacting hooks here, need getState()
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses for global error handling
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, auto logout
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default instance;
