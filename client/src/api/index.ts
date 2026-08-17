import axios from 'axios';

const BASE_URL = 'https://aitag.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aitag_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string; photoURL?: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
};

// Tasks
export const tasksApi = {
  getAll: (params?: { category?: string; search?: string; limit?: number }) =>
    api.get('/tasks', { params }),
  getFeatured: () => api.get('/tasks/featured'),
  getMy: () => api.get('/tasks/my'),
  getById: (id: string) => api.get(`/tasks/${id}`),
  create: (data: object) => api.post('/tasks', data),
  update: (id: string, data: object) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// Bids
export const bidsApi = {
  getMy: () => api.get('/bids/my'),
  checkBid: (taskId: string) => api.get(`/bids/check/${taskId}`),
  getForTask: (taskId: string) => api.get(`/bids/task/${taskId}`),
  place: (taskId: string) => api.post('/bids', { taskId }),
  accept: (bidId: string) => api.patch(`/bids/${bidId}/accept`),
};

// Blog
export const blogApi = {
  getAll: () => api.get('/blog'),
  getBySlug: (slug: string) => api.get(`/blog/${slug}`),
};

// Invitations
export const invitationsApi = {
  send: (data: { taskId: string; freelancerEmail: string; message?: string }) =>
    api.post('/invitations', data),
  getMy: () => api.get('/invitations/my'),
  accept: (id: string) => api.patch(`/invitations/${id}/accept`),
  decline: (id: string) => api.patch(`/invitations/${id}/decline`),
};

// Profile & Delivered Workflows
export const profileApi = {
  getMe: () => api.get('/profile/me'),
  updateMe: (data: object) => api.put('/profile/me', data),
  getById: (userId: string) => api.get(`/profile/${userId}`),
};

export default api;
