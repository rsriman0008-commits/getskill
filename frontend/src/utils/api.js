import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Store token for requests
let authToken = null;

// Set auth token
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (name, email, password, confirmPassword) =>
    api.post('/auth/register', { name, email, password, confirmPassword }),
  login: (email, password) =>
    api.post('/auth/login', { email, password })
};

// User endpoints
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getUser: (id) => api.get(`/users/${id}`),
  completeOnboarding: (data) => api.post('/users/onboarding', data),
  getMatches: () => api.get('/users/matches')
};

// Course endpoints
export const courseAPI = {
  createCourse: (data) => api.post('/courses', data),
  getAllCourses: (filters = {}) =>
    api.get('/courses', { params: filters }),
  getMyCourses: () => api.get('/courses/my'),
  getCourse: (id) => api.get(`/courses/${id}`),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`)
};

// Session endpoints
export const sessionAPI = {
  createSession: (data) => api.post('/sessions', data),
  getMySessions: (status = null) =>
    api.get('/sessions/my', { params: { status } }),
  acceptSession: (id) => api.put(`/sessions/${id}/accept`),
  declineSession: (id) => api.put(`/sessions/${id}/decline`),
  completeSession: (id, data) => api.put(`/sessions/${id}/complete`, data)
};

// Search endpoints
export const searchAPI = {
  search: (params) => api.get('/search', { params }),
  getSuggestions: (q) => api.get('/search/suggestions', { params: { q } }),
  getTrending: () => api.get('/search/trending')
};

// Health check
export const healthCheck = () => api.get('/health');

export default {
  setAuthToken,
  api,
  authAPI,
  userAPI,
  courseAPI,
  sessionAPI,
  searchAPI,
  healthCheck
};
