// api.js - Complete API Service for React Native
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== AXIOS CONFIGURATION ====================
const apiClient = axios.create({
  baseURL:  'https://50db0717c25c.ngrok-free.app/api/',
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

  login: async (email) => {
    try {
      const response = await apiClient.post('auth/userlogin', { mobileNumber:email});
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
    
  // ===== USER PROFILE =====
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      console.log(response)
      return response;
    } catch (error) {
      return error;
    }
  },

  RegisterUser: async (profileData) => {
    console.log(profileData)
    try {
      const response = await apiClient.post(`auth/userregister`, profileData);
      console.log(response);
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


  // ===== NEWS INTERACTION APIS =====

// Toggle like for a news
toggleLike: async (newsId, userId) => {
  try {
    const response = await apiClient.post(`news/${newsId}/like/${userId}`);
    return response;
  } catch (error) {
    console.error("Toggle like error:", error);
    return error;
  }
},

// Check if user liked a news
checkLikeStatus: async (newsId, userId) => {
  try {
    const response = await apiClient.get(`news/likecheck?userId=${userId}&newsId=${newsId}`);
    return response;
  } catch (error) {
    console.error("Check like status error:", error);
    return error;
  }
},

// Add a comment to news
addComment: async (newsId, userId, comment) => {
  try {
    const response = await apiClient.post(`news/${newsId}/comment/${userId}`,comment);
    return response;
  } catch (error) {
    console.error("Add comment error:", error);
    return error;
  }
},

// Get comments for a news
getComments: async (newsId) => {
  try {
    const response = await apiClient.get(`news/${newsId}/comments`);
    return response;
  } catch (error) {
    console.error("Get comments error:", error);
    return error;
  }
},

// Share a news
shareNews: async (newsId, userId) => {
  try {
    const response = await apiClient.post(`news/${newsId}/share/${userId}`);
    return response;
  } catch (error) {
    console.error("Share news error:", error);
    return error;
  }
},

// Get counts (likes, comments, shares) for news
getCounts: async (newsId) => {
  try {
    const response = await apiClient.get(`news/${newsId}/counts`);
    return response;
  } catch (error) {
    console.error("Get counts error:", error);
    return error;
  }
},

// Get published news with optional filters
getPublishedNews: async (filters = {}) => {
  try {
    // Build query parameters
    let queryString = '';
    const params = [];
    
    if (filters.category) params.push(`category=${encodeURIComponent(filters.category)}`);
    if (filters.newsType) params.push(`newsType=${encodeURIComponent(filters.newsType)}`);
    if (filters.priority) params.push(`priority=${encodeURIComponent(filters.priority)}`);
    if (filters.district) params.push(`district=${encodeURIComponent(filters.district)}`);
    
    // Add pagination if needed (optional enhancement)
    if (filters.page) params.push(`page=${filters.page}`);
    if (filters.limit) params.push(`limit=${filters.limit}`);
    
    if (params.length > 0) {
      queryString = `?${params.join('&')}`;
    }
    
    const response = await apiClient.get(`/admin/news/published${queryString}`);
    return response;
  } catch (error) {
    console.error("Get published news error:", error);
    return error;
  }
},

  // ===== NOTIFICATIONS =====
  // getNotifications: async (userId) => {
  //   try {
  //     const response = await apiClient.get(`/notifications/${userId}`);
  //     return response;
  //   } catch (error) {
  //     return error;
  //   }
  // },

  // markNotificationAsRead: async (notificationId) => {
  //   try {
  //     const response = await apiClient.put(`/notifications/${notificationId}/read`);
  //     return response;
  //   } catch (error) {
  //     return error;
  //   }
  // },

  // markAllNotificationsAsRead: async (userId) => {
  //   try {
  //     const response = await apiClient.put(`/notifications/${userId}/read-all`);
  //     return response;
  //   } catch (error) {
  //     return error;
  //   }
  // },

  // deleteNotification: async (notificationId) => {
  //   try {
  //     const response = await apiClient.delete(`/notifications/${notificationId}`);
  //     return response;
  //   } catch (error) {
  //     return error;
  //   }
  // },

  // ===== ENGAGEMENT =====
  // addComment: async (newsId, comment) => {
  //   try {
  //     const response = await apiClient.post(`/news/${newsId}/comments`, { comment });
  //     return response;
  //   } catch (error) {
  //     return error;
  //   }
  // },

  // getComments: async (newsId) => {
  //   try {
  //     const response = await apiClient.get(`/news/${newsId}/comments`);
  //     return response;
  //   } catch (error) {
  //     return error;
  //   }
  // },

  // toggleLike: async (newsId) => {
  //   try {
  //     const response = await apiClient.post(`/news/${newsId}/like`);
  //     return response;
  //   } catch (error) {
  //     return error;
  //   }
  // },

  // shareNews: async (newsId) => {
  //   try {
  //     const response = await apiClient.post(`/news/${newsId}/share`);
  //     return response;
  //   } catch (error) {
  //     return error;
  //   }
  // },

  // toggleSave: async (newsId) => {
  //   try {
  //     const response = await apiClient.post(`/news/${newsId}/save`);
  //     return response;
  //   } catch (error) {
  //     return error;
  //   }
  // },

  
  
  // ===== PUBLIC APIs =====
  // getPublishedNews: async (page = 1, limit = 10, filters = {}) => {
  //   try {
  //     const response = await apiClient.get('/public/news', {
  //       params: { page, limit, ...filters }
  //     });
  //     return response;
  //   } catch (error) {
  //     return error;
  //   }
  // },

  // getNewsByCategory: async (category, page = 1, limit = 10) => {
  //   try {
  //     const response = await apiClient.get(`/public/news/category/${category}`, {
  //       params: { page, limit }
  //     });
  //     return response;
  //   } catch (error) {
  //     return error;
  //   }
  // },

  // searchNews: async (query, page = 1, limit = 10) => {
  //   try {
  //     const response = await apiClient.get('/public/news/search', {
  //       params: { q: query, page, limit }
  //     });
  //     return response;
  //   } catch (error) {
  //     return error;
  //   }
  // },

  // getTrendingNews: async (limit = 10) => {
  //   try {
  //     const response = await apiClient.get('/public/news/trending', {
  //       params: { limit }
  //     });
  //     return response;
  //   } catch (error) {
  //     return error;
  //   }
  // },

  // getPublicNewsById: async (newsId) => {
  //   try {
  //     const response = await apiClient.get(`/public/news/${newsId}`);
  //     return response;
  //   } catch (error) {
  //     return error;
  //   }
  // },
}

export default apiService;