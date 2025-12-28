// api.js - Complete API Service for React Native
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== AXIOS CONFIGURATION ====================
const apiClient = axios.create({
  baseURL: 'https://86698f19265d.ngrok-free.app/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for standardized response format
apiClient.interceptors.response.use(
  (response) => {
    // Standardize success response
    const standardizedResponse = {
      message: response.data?.message || 'Success',
      error: response.data?.error || false,
      data: response.data?.data || response.data
    };
    
    // If backend already returns {message, error, data}, use it
    if (response.data && typeof response.data === 'object') {
      if ('error' in response.data) {
        return response.data;
      }
    }
    
    return standardizedResponse;
  },
  async (error) => {
    console.error('API Error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('token');
        // You might want to navigate to login screen here
        // navigation.navigate('Login'); // If you have navigation context
      } catch (storageError) {
        console.error('Error removing token:', storageError);
      }
    }
    
    // Format error response consistently
    const errorResponse = {
      message: error.response?.data?.message || 
               error.message || 
               'Network error occurred',
      error: true,
      data: null,
      status: error.response?.status,
      code: error.code
    };
    
    // For network errors
    if (!error.response) {
      errorResponse.message = 'Network error. Please check your connection.';
      errorResponse.code = 'NETWORK_ERROR';
    }
    
    return Promise.reject(errorResponse);
  }
);

// ==================== UNIFIED API FUNCTION ====================
export const apiService = {
  // ===== AUTHENTICATION =====
  register: async (userData) => {
    try {
      const response = await apiClient.post('auth/register', userData);
      console.log('Register response:', response);
      return response;
    } catch (error) {
      console.error('Register error:', error);
      return {
        message: error.message || 'Registration failed',
        error: true,
        data: null
      };
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiClient.post('auth/login', { email, password });
      console.log('Login response:', response);
      
      // Store token if received
      if (response.data?.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return {
        message: error.message || 'Login failed',
        error: true,
        data: null
      };
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
      delete apiClient.defaults.headers.common['Authorization'];
      return {
        message: 'Logged out successfully',
        error: false,
        data: null
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        message: 'Logout failed',
        error: true,
        data: null
      };
    }
  },

  // ===== ADMIN DASHBOARD =====
  getDashboardStats: async (data) => {
    try {
      const response = await apiClient.get(`/admin/news/stats?userId=${data.userId}&roleId=${data.roleId}`);
      console.log(response)
       return response;
    } catch (error) {
      return error;
    }
  },

  // ===== NEWS MANAGEMENT =====
  uploadNews: async (userId, newsData) => {
    try {
      const response = await apiClient.post(`/admin/news/upload/${userId}`, newsData);
      return response;
    } catch (error) {
      return error;
    }
  },

  getAllNews: async (userId, filters = {}) => {
    try {
      const params = { userId, ...filters };
      const response = await apiClient.get('/admin/news', { params });
      return response;
    } catch (error) {
      return error;
    }
  },

  getNewsById: async (newsId) => {
    try {
      const response = await apiClient.get(`/admin/news/${newsId}`);
      return response;
    } catch (error) {
      return error;
    }
  },

  updateNewsStatus: async (newsId, status, rejectionReason = null) => {
    try {
      const response = await apiClient.put(`/admin/news/${newsId}/status`, {
        status,
        rejectionReason
      });
      return response;
    } catch (error) {
      return error;
    }
  },

  deleteNews: async (newsId) => {
    try {
      const response = await apiClient.delete(`/admin/news/${newsId}`);
      return response;
    } catch (error) {
      return error;
    }
  },

  // ===== REPORTER MANAGEMENT =====
  getReporterById: async (userId, roleId) => {
    try {
      const response = await apiClient.get(`admin/news/reporterById?userId=${userId}&roleId=${roleId}`);
      return response;
    } catch (error) {
      return error;
    }
  },

  getAllReporters: async (roleId) => {
    try {
      const response = await apiClient.get(`admin/news/allReporter?roleId=${roleId}`);
      return response;
    } catch (error) {
      return error;
    }
  },

  updateReporterStatus: async (reporterId, enabled) => {
    try {
      const response = await apiClient.put(`/admin/reporters/${reporterId}/status`, { enabled });
      return response;
    } catch (error) {
      return error;
    }
  },

  getReporterNews: async (reporterId, filters = {}) => {
    try {
      const response = await apiClient.get(`/admin/reporters/${reporterId}/news`, {
        params: filters
      });
      return response;
    } catch (error) {
      return error;
    }
  },

  // ===== USER PROFILE =====
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response;
    } catch (error) {
      return error;
    }
  },

  updateProfile: async (userId, profileData) => {
    try {
      const response = await apiClient.put(`/users/${userId}/profile`, profileData);
      return response;
    } catch (error) {
      return error;
    }
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    try {
      const response = await apiClient.put(`/users/${userId}/password`, {
        currentPassword,
        newPassword
      });
      return response;
    } catch (error) {
      return error;
    }
  },

  uploadProfilePicture: async (userId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      
      const response = await apiClient.post(
        `/users/${userId}/profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error) {
      return error;
    }
  },

  // ===== TICKET MANAGEMENT =====
createTicket: async (data) => {
  try {
    const response = await apiClient.post(
      `/tickets/create/${data.userId}?title=${encodeURIComponent(data.title)}&description=${encodeURIComponent(data.description)}&email=${encodeURIComponent(data.email)}`
    );
    return response;
  } catch (error) {
    console.error("Create ticket error:", error);
   return error;
  }
},

  getAllTickets: async (userId) => {
    try {
      const response = await apiClient.get(`/tickets/all/${userId}`);
      console.log(response);
      return response;
    } catch (error) {
      return error;
    }
  },

  getTicketById: async (ticketId) => {
    try {
      const response = await apiClient.get(`/tickets/${ticketId}`);
      return response;
    } catch (error) {
      return error;
    }
  },


updateTicketStatus: async (data) => {
  try {
    const response = await apiClient.put(
      `/tickets/update/${data.userId}/${data.ticketId}?status=${data.status}`
    );
    console.log(response);
    return response;
  } catch (error) {
    return error;
  }
},

  addTicketComment: async (ticketId, comment) => {
    try {
      const response = await apiClient.post(`/tickets/${ticketId}/comments`, { comment });
      return response;
    } catch (error) {
      return error;
    }
  },

  getTicketComments: async (ticketId) => {
    try {
      const response = await apiClient.get(`/tickets/${ticketId}/comments`);
      return response;
    } catch (error) {
      return error;
    }
  },

  // ===== ANALYTICS & REPORTS =====
  getNewsAnalytics: async (userId, startDate, endDate) => {
    try {
      const response = await apiClient.get(`/analytics/news`, {
        params: { userId, startDate, endDate }
      });
      return response;
    } catch (error) {
      return error;
    }
  },

  getReporterPerformance: async (reporterId, period = 'monthly') => {
    try {
      const response = await apiClient.get(`/analytics/reporters/${reporterId}/performance`, {
        params: { period }
      });
      return response;
    } catch (error) {
      return error;
    }
  },

  getCategoryDistribution: async () => {
    try {
      const response = await apiClient.get('/analytics/categories');
      return response;
    } catch (error) {
      return error;
    }
  },

  getStatusDistribution: async () => {
    try {
      const response = await apiClient.get('/analytics/status');
      return response;
    } catch (error) {
      return error;
    }
  },

  // ===== NOTIFICATIONS =====
  getNotifications: async (userId) => {
    try {
      const response = await apiClient.get(`/notifications/${userId}`);
      return response;
    } catch (error) {
      return error;
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      return error;
    }
  },

  markAllNotificationsAsRead: async (userId) => {
    try {
      const response = await apiClient.put(`/notifications/${userId}/read-all`);
      return response;
    } catch (error) {
      return error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response;
    } catch (error) {
      return error;
    }
  },

  // ===== ENGAGEMENT =====
  addComment: async (newsId, comment) => {
    try {
      const response = await apiClient.post(`/news/${newsId}/comments`, { comment });
      return response;
    } catch (error) {
      return error;
    }
  },

  getComments: async (newsId) => {
    try {
      const response = await apiClient.get(`/news/${newsId}/comments`);
      return response;
    } catch (error) {
      return error;
    }
  },

  toggleLike: async (newsId) => {
    try {
      const response = await apiClient.post(`/news/${newsId}/like`);
      return response;
    } catch (error) {
      return error;
    }
  },

  shareNews: async (newsId) => {
    try {
      const response = await apiClient.post(`/news/${newsId}/share`);
      return response;
    } catch (error) {
      return error;
    }
  },

  toggleSave: async (newsId) => {
    try {
      const response = await apiClient.post(`/news/${newsId}/save`);
      return response;
    } catch (error) {
      return error;
    }
  },

  getEngagementStats: async (newsId) => {
    try {
      const response = await apiClient.get(`/news/${newsId}/engagement`);
      return response;
    } catch (error) {
      return error;
    }
  },

  // ===== FILE UPLOAD =====
  uploadMedia: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/upload/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      return error;
    }
  },

  uploadDocument: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      return error;
    }
  },

  deleteFile: async (fileUrl) => {
    try {
      const response = await apiClient.delete('/upload/file', {
        params: { fileUrl }
      });
      return response;
    } catch (error) {
      return error;
    }
  },

  // ===== SETTINGS =====
  getSettings: async () => {
    try {
      const response = await apiClient.get('/settings');
      return response;
    } catch (error) {
      return error;
    }
  },

  updateSettings: async (settings) => {
    try {
      const response = await apiClient.put('/settings', settings);
      return response;
    } catch (error) {
      return error;
    }
  },

  getPreferences: async (userId) => {
    try {
      const response = await apiClient.get(`/settings/${userId}/preferences`);
      return response;
    } catch (error) {
      return error;
    }
  },

  updatePreferences: async (userId, preferences) => {
    try {
      const response = await apiClient.put(`/settings/${userId}/preferences`, preferences);
      return response;
    } catch (error) {
      return error;
    }
  },

  // ===== PUBLIC APIs =====
  getPublishedNews: async (page = 1, limit = 10, filters = {}) => {
    try {
      const response = await apiClient.get('/public/news', {
        params: { page, limit, ...filters }
      });
      return response;
    } catch (error) {
      return error;
    }
  },

  getNewsByCategory: async (category, page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(`/public/news/category/${category}`, {
        params: { page, limit }
      });
      return response;
    } catch (error) {
      return error;
    }
  },

  searchNews: async (query, page = 1, limit = 10) => {
    try {
      const response = await apiClient.get('/public/news/search', {
        params: { q: query, page, limit }
      });
      return response;
    } catch (error) {
      return error;
    }
  },

  getTrendingNews: async (limit = 10) => {
    try {
      const response = await apiClient.get('/public/news/trending', {
        params: { limit }
      });
      return response;
    } catch (error) {
      return error;
    }
  },

  getPublicNewsById: async (newsId) => {
    try {
      const response = await apiClient.get(`/public/news/${newsId}`);
      return response;
    } catch (error) {
      return error;
    }
  },

  // ===== HELPER METHODS =====
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return {
        message: 'Token set successfully',
        error: false,
        data: null
      };
    }
    return {
      message: 'No token provided',
      error: true,
      data: null
    };
  },

  clearAuthToken: () => {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    return {
      message: 'Token cleared',
      error: false,
      data: null
    };
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return {
      message: token ? 'Authenticated' : 'Not authenticated',
      error: !token,
      data: { isAuthenticated: !!token }
    };
  },

  getCurrentUserId: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return {
        message: 'No token found',
        error: true,
        data: null
      };
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId || payload.sub || null;
      return {
        message: 'User ID retrieved',
        error: false,
        data: { userId }
      };
    } catch {
      return {
        message: 'Invalid token',
        error: true,
        data: null
      };
    }
  },

  getCurrentUserRole: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return {
        message: 'No token found',
        error: true,
        data: null
      };
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role || null;
      return {
        message: 'User role retrieved',
        error: false,
        data: { role }
      };
    } catch {
      return {
        message: 'Invalid token',
        error: true,
        data: null
      };
    }
  },

  downloadFile: async (url, filename) => {
    try {
      const response = await apiClient.get(url, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      return {
        message: 'File downloaded successfully',
        error: false,
        data: null
      };
    } catch (error) {
      return {
        message: 'Failed to download file',
        error: true,
        data: null
      };
    }
  }
};

export default apiService;