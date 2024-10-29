import axios from 'axios';
import type { Subscription } from '../types/subscription';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (credentials: { email: string; password: string; name: string }) => {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },
  
  googleLogin: async (token: string) => {
    const response = await api.post('/auth/google', { token });
    return response.data;
  },
};

export const subscriptionApi = {
  getAll: () => api.get<Subscription[]>('/subscriptions').then(res => res.data),
  
  create: (subscription: Omit<Subscription, 'id'>) => 
    api.post<Subscription>('/subscriptions', subscription).then(res => res.data),
  
  update: (id: string, subscription: Omit<Subscription, 'id'>) =>
    api.put<Subscription>(`/subscriptions/${id}`, subscription).then(res => res.data),
  
  delete: (id: string) => 
    api.delete(`/subscriptions/${id}`),
  
  getStats: () => 
    api.get('/subscriptions/stats').then(res => res.data),
};

export default api;