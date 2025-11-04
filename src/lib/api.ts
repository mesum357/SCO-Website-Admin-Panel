import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to ensure credentials are always included
api.interceptors.request.use((config) => {
  config.withCredentials = true;
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message.includes('ERR_CONNECTION_REFUSED')) {
      console.error('Backend connection failed. Please ensure the backend is running.');
      // You can show a user-friendly message here
    } else if (error.response?.status === 401) {
      console.error('Unauthorized access - please login');
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  
  // Admin Auth endpoints
  ADMIN_AUTH: {
    LOGIN: '/api/admin-auth/login',
    LOGOUT: '/api/admin-auth/logout',
    REGISTER: '/api/admin-auth/register',
    ME: '/api/admin-auth/me',
  },
  
  // User endpoints
  USERS: {
    LIST: '/api/admin/users',
    CREATE: '/api/users',
    GET: (id: string) => `/api/users/${id}`,
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
    STATS: '/api/admin/users/stats',
  },
  
  // Profile endpoints (for freelancers)
  PROFILES: {
    LIST: '/api/admin/freelancers',
    CREATE: '/api/profiles',
    GET: (id: string) => `/api/profiles/${id}`,
    UPDATE: (id: string) => `/api/profiles/${id}`,
    DELETE: (id: string) => `/api/profiles/${id}`,
    STATS: '/api/admin/freelancers/stats',
  },
  
  // Job endpoints
  JOBS: {
    LIST: '/api/jobs',
    CREATE: '/api/jobs',
    GET: (id: string) => `/api/jobs/${id}`,
    UPDATE: (id: string) => `/api/jobs/${id}`,
    DELETE: (id: string) => `/api/jobs/${id}`,
    STATS: '/api/jobs/stats',
  },
  
          // Dashboard endpoints
          DASHBOARD: {
            STATS: '/api/admin/dashboard/stats',
            USER_GROWTH: '/api/admin/dashboard/user-growth',
            FREELANCER_GROWTH: '/api/admin/freelancers/growth',
            RECENT_USERS: '/api/admin/dashboard/recent-users',
            RECENT_JOBS: '/api/admin/dashboard/recent-jobs',
            JOB_TRENDS: '/api/admin/dashboard/job-trends',
          },
};

// Helper functions for API calls
export const apiHelpers = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.STATS);
    return response.data;
  },
  
  // Get user growth data
  getUserGrowthData: async () => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.USER_GROWTH);
    return response.data;
  },
  
  // Get freelancer growth data
  getFreelancerGrowthData: async () => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.FREELANCER_GROWTH);
    return response.data;
  },
  
  // Get all users
  getUsers: async (params?: any) => {
    const response = await api.get(API_ENDPOINTS.USERS.LIST, { params });
    return response.data;
  },
  
  // Get all freelancers (profiles)
  getFreelancers: async (params?: any) => {
    const response = await api.get(API_ENDPOINTS.PROFILES.LIST, { params });
    return response.data;
  },
  
  // Get user statistics
  getUserStats: async () => {
    const response = await api.get(API_ENDPOINTS.USERS.STATS);
    return response.data;
  },
  
  // Get freelancer statistics
  getFreelancerStats: async () => {
    const response = await api.get(API_ENDPOINTS.PROFILES.STATS);
    return response.data;
  },

  // Get recent users for dashboard
  getRecentUsers: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.DASHBOARD.RECENT_USERS);
      return { success: true, users: response.data.users };
    } catch (error) {
      console.error('Error in getRecentUsers:', error);
      return { success: false, error };
    }
  },

  // Get recent jobs for dashboard
  getRecentJobs: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.DASHBOARD.RECENT_JOBS);
      return { success: true, jobs: response.data.jobs };
    } catch (error) {
      console.error('Error in getRecentJobs:', error);
      return { success: false, error };
    }
  },

  // Get job trends data for dashboard
  getJobTrends: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.DASHBOARD.JOB_TRENDS);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error in getJobTrends:', error);
      return { success: false, error };
    }
  },

  // Get freelancer growth data for dashboard
  getFreelancerGrowth: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.DASHBOARD.FREELANCER_GROWTH);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error in getFreelancerGrowth:', error);
      return { success: false, error };
    }
  },

  // Delete user (Admin only)
  deleteUser: async (userId: string) => {
    try {
      const response = await api.delete(`${API_ENDPOINTS.USERS.LIST}/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete user'
      };
    }
  },

  // Block or unblock user (Admin only)
  blockUser: async (userId: string, isBlocked: boolean, reason?: string) => {
    try {
      const response = await api.patch(`${API_ENDPOINTS.USERS.LIST}/${userId}/block`, {
        isBlocked,
        reason
      });
      return response.data;
    } catch (error: any) {
      console.error('Error blocking/unblocking user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user block status'
      };
    }
  },
};

export default api;
