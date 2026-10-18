import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.port === '8000') return '/api';
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return (import.meta.env.VITE_API_BASE_URL || '/api');
    }
  }
  return import.meta.env.VITE_API_BASE_URL || '/api';
};

const BASE_URL = getBaseUrl();

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

// Global response interceptor for 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aitag_token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string; photoURL?: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
};

// OAuth (Google / Social Auth)
export const oauthApi = {
  getConfig: () => api.get('/oauth/config'),
  google: (data: { credential: string; role?: string }) =>
    api.post('/oauth/google', data),
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
  getProfile: () => api.get('/profile/me'),
  updateProfile: (data: object) => api.put('/profile/me', data),
  getById: (userId: string) => api.get(`/profile/${userId}`),
  uploadVideoDirect: (formData: FormData) => api.post('/profile/workflows/video-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getVideoSignedUrl: (data: { workflowId: string; filename: string; durationSeconds: number; contentType?: string }) =>
    api.post('/profile/workflows/video-signed-url', data),
  attachVideo: (data: { workflowId: string; videoUrl: string; durationSeconds?: number }) =>
    api.post('/profile/workflows/attach-video', data),
};

// Pilot AI Service Packages (Fixed Scope & Outcomes)
export const servicePackagesApi = {
  getAll: () => api.get('/service-packages'),
  getBySlug: (slug: string) => api.get(`/service-packages/${slug}`),
};

// 8-Stage Service Orders Workflow
export const serviceOrdersApi = {
  create: (data: any) => api.post('/service-orders', data),
  getAll: (params?: { role?: string; email?: string; status?: string }) => api.get('/service-orders', { params }),
  getById: (id: string) => api.get(`/service-orders/${id}`),
  assign: (id: string, data: { expertEmail: string; expertName?: string }) => api.post(`/service-orders/${id}/assign`, data),
  reset: (id: string) => api.post(`/service-orders/${id}/reset`),
  activate: (id: string) => api.post(`/service-orders/${id}/activate`),
  submitDraft: (id: string, data: { draftFiles: any[] }) => api.post(`/service-orders/${id}/draft`, data),
  requestRevision: (id: string, data: { revisionNotes: string }) => api.post(`/service-orders/${id}/revision`, data),
  approve: (id: string, data: { rating?: number; testimonial?: string; finalFiles?: any[] }) => api.post(`/service-orders/${id}/approve`, data),
};

// Role-Aware Analytics & User Dossier Hub
export const analyticsApi = {
  getMyAnalytics: () => api.get('/analytics/me'),
  getSummary: () => api.get('/analytics/summary'),
};

// Account Lifecycle & Deletion
export const accountApi = {
  deleteAccount: (confirmation: string) =>
    api.delete('/account', { data: { confirmation } }),
};

export default api;

