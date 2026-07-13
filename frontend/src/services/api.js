import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updatePassword: (data) => API.put('/auth/password', data),
};

// Users
export const userAPI = {
  getProfile: (id) => API.get(id ? `/users/profile/${id}` : '/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),
  updateResume: (data) => API.put('/users/resume', data),
  getSavedJobs: () => API.get('/users/saved-jobs'),
  searchCandidates: (params) => API.get('/users/candidates', { params }),
};

// Jobs
export const jobAPI = {
  getJobs: (params) => API.get('/jobs', { params }),
  getJob: (id) => API.get(`/jobs/${id}`),
  createJob: (data) => API.post('/jobs', data),
  updateJob: (id, data) => API.put(`/jobs/${id}`, data),
  deleteJob: (id) => API.delete(`/jobs/${id}`),
  getRecommended: () => API.get('/jobs/recommended'),
  getRecruiterJobs: () => API.get('/jobs/recruiter'),
  saveJob: (id) => API.post(`/jobs/${id}/save`),
};

// Applications
export const applicationAPI = {
  apply: (jobId, data) => API.post(`/applications/job/${jobId}`, data),
  getCandidateApplications: () => API.get('/applications/candidate'),
  getRecruiterApplications: (params) => API.get('/applications/recruiter', { params }),
  getApplication: (id) => API.get(`/applications/${id}`),
  updateStatus: (id, data) => API.put(`/applications/${id}/status`, data),
  withdraw: (id) => API.delete(`/applications/${id}`),
};

// Notifications
export const notificationAPI = {
  getAll: (params) => API.get('/notifications', { params }),
  markRead: (ids) => API.put('/notifications/read', { ids }),
  delete: (id) => API.delete(`/notifications/${id}`),
};

// Messages
export const messageAPI = {
  getConversations: () => API.get('/messages/conversations'),
  getMessages: (userId) => API.get(`/messages/${userId}`),
  sendMessage: (userId, content) => API.post(`/messages/${userId}`, { content }),
};

// Admin
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  toggleUser: (id) => API.put(`/admin/users/${id}/toggle`),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getJobs: (params) => API.get('/admin/jobs', { params }),
  toggleJobStatus: (id, status) => API.put(`/admin/jobs/${id}/status`, { status }),
  toggleFeatured: (id) => API.put(`/admin/jobs/${id}/featured`),
};

export default API;
