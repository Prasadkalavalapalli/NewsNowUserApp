import axios from 'axios';

// Configure base URL
const API_BASE_URL = 'YOUR_API_BASE_URL';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    // You can add token from AsyncStorage here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

// News API
export const newsAPI = {
  getNews: async () => {
    const response = await api.get('/news');
    return response.data;
  },
  
  uploadNews: async (newsData: FormData) => {
    const response = await api.post('/news/upload', newsData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getNewsStatus: async () => {
    const response = await api.get('/news/status');
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  
  updateProfile: async (userData: any) => {
    const response = await api.put('/user/profile', userData);
    return response.data;
  },
  fetchDashboardStats : async ()=> {
  // // Simulate API delay (1 second)
  // await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Static data - REPLACE THIS WITH REAL API CALL
  return {
    totalNews: 2300,
    pendingNews: 1300,
    verifiedNews: 600,
    rejectedNews: 300,
    totalReporters: 2300,
    totalNotifications: 2300,
    todayNewArticles: 45,
    todayVerified: 32,
    todayRejected: 8,
    recentActivities: [
      { 
        id: 1, 
        title: 'New article submitted by John Doe', 
        time: '10 minutes ago', 
        icon: 'file-alt' 
      },
      { 
        id: 2, 
        title: 'Breaking news article verified', 
        time: '25 minutes ago', 
        icon: 'check-circle' 
      },
      { 
        id: 3, 
        title: 'New reporter Sarah Smith registered', 
        time: '1 hour ago', 
        icon: 'user-plus' 
      },
      { 
        id: 4, 
        title: 'Weather update article rejected', 
        time: '2 hours ago', 
        icon: 'times-circle' 
      },
      { 
        id: 5, 
        title: 'New notification banner created', 
        time: '3 hours ago', 
        icon: 'bullhorn' 
      },
    ],
  };
},

  getAllNews : async (params = {}) => {
  console.log('Fetching all news with params:', params);
  
  // Static data
  const allNews = [
    {
      _id: '1',
      title: 'Breaking News: Market Crash',
      description: 'Global stock markets experienced significant downturn today due to inflation concerns.',
      status: 'verified',
      createdAt: '2024-12-20T10:30:00Z',
      updatedAt: '2024-12-20T10:30:00Z',
      category: 'Finance',
      categories: ['Politics', 'Local News', 'Breaking News'],
      reporter: {
        name: 'John Smith',
        email: 'john@example.com',
        profileImage: null
      },
      views: 4567,
      replies: 45,
      reads: 34,
      shares: 15
    },
    {
      _id: '2',
      title: 'City Council Meeting Recap',
      description: 'The city council approved the new budget with amendments for infrastructure development.',
      status: 'pending',
      createdAt: '2024-12-19T15:45:00Z',
      updatedAt: '2024-12-19T15:45:00Z',
      category: 'Politics',
      categories: ['Politics', 'Local News'],
      reporter: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        profileImage: null
      },
      views: 2345
    },
    {
      _id: '3',
      title: 'Local Sports Highlights',
      description: 'Our local team secured victory in the championship match last night.',
      status: 'pending',
      createdAt: '2024-12-18T20:15:00Z',
      updatedAt: '2024-12-18T20:15:00Z',
      category: 'Sports',
      categories: ['Politics', 'Local News', 'Breaking News'],
      reporter: {
        name: 'Mike Wilson',
        email: 'mike@example.com',
        profileImage: null
      },
      views: 1890
    },
    {
      _id: '4',
      title: 'Tech Innovation Summit',
      description: 'Annual tech summit showcases latest innovations in artificial intelligence.',
      status: 'verified',
      createdAt: '2024-12-17T09:00:00Z',
      updatedAt: '2024-12-17T09:00:00Z',
      category: 'Technology',
      categories: ['Technology', 'Innovation'],
      reporter: {
        name: 'Emma Davis',
        email: 'emma@example.com',
        profileImage: null
      },
      views: 3210,
      replies: 32,
      reads: 28,
      shares: 12
    },
    {
      _id: '5',
      title: 'Health Advisory Update',
      description: 'Health department issues new guidelines for seasonal illnesses.',
      status: 'rejected',
      createdAt: '2024-12-16T14:20:00Z',
      updatedAt: '2024-12-16T14:20:00Z',
      category: 'Health',
      categories: ['Health', 'Local News'],
      reporter: {
        name: 'Dr. Robert Chen',
        email: 'robert@example.com',
        profileImage: null
      },
      views: 890,
      rejectionReason: 'News doesn\'t contain detailed information, clarity is insufficient'
    },
    {
      _id: '6',
      title: 'Environmental Initiative',
      description: 'New recycling program launched across the city to promote sustainability.',
      status: 'verified',
      createdAt: '2024-12-15T11:10:00Z',
      updatedAt: '2024-12-15T11:10:00Z',
      category: 'Environment',
      categories: ['Environment', 'Local News'],
      reporter: {
        name: 'Lisa Green',
        email: 'lisa@example.com',
        profileImage: null
      },
      views: 2789,
      replies: 38,
      reads: 31,
      shares: 9
    },
    {
      _id: '7',
      title: 'Education Reform',
      description: 'Government announces new policies for education system improvement.',
      status: 'pending',
      createdAt: '2024-12-14T13:25:00Z',
      updatedAt: '2024-12-14T13:25:00Z',
      category: 'Education',
      categories: ['Education', 'Politics'],
      reporter: {
        name: 'Thomas Brown',
        email: 'thomas@example.com',
        profileImage: null
      },
      views: 1567
    },
    {
      _id: '8',
      title: 'Cultural Festival Success',
      description: 'Annual cultural festival attracts record number of visitors this year.',
      status: 'rejected',
      createdAt: '2024-12-13T18:40:00Z',
      updatedAt: '2024-12-13T18:40:00Z',
      category: 'Culture',
      categories: ['Culture', 'Local News'],
      reporter: {
        name: 'Maria Garcia',
        email: 'maria@example.com',
        profileImage: null
      },
      views: 732,
      rejectionReason: 'Incomplete information about event organizers and sponsors'
    }
  ];

  return {
    success: true,
    data: allNews
  };
},
getVerifiedNews :async (params = {}) => {
  console.log('Fetching verified news with params:', params);
  
  const verifiedNews = [
    {
      _id: '1',
      title: 'Breaking News: Market Crash',
      description: 'Global stock markets experienced significant downturn today due to inflation concerns.',
      status: 'verified',
      createdAt: '2024-12-20T10:30:00Z',
      updatedAt: '2024-12-20T10:30:00Z',
      category: 'Finance',
      categories: ['Politics', 'Local News', 'Breaking News'],
      reporter: {
        name: 'John Smith',
        email: 'john@example.com',
        profileImage: null
      },
      views: 4567,
      replies: 45,
      reads: 34,
      shares: 15
    },
    {
      _id: '4',
      title: 'Tech Innovation Summit',
      description: 'Annual tech summit showcases latest innovations in artificial intelligence.',
      status: 'verified',
      createdAt: '2024-12-17T09:00:00Z',
      updatedAt: '2024-12-17T09:00:00Z',
      category: 'Technology',
      categories: ['Technology', 'Innovation'],
      reporter: {
        name: 'Emma Davis',
        email: 'emma@example.com',
        profileImage: null
      },
      views: 3210,
      replies: 32,
      reads: 28,
      shares: 12
    },
    {
      _id: '6',
      title: 'Environmental Initiative',
      description: 'New recycling program launched across the city to promote sustainability.',
      status: 'verified',
      createdAt: '2024-12-15T11:10:00Z',
      updatedAt: '2024-12-15T11:10:00Z',
      category: 'Environment',
      categories: ['Environment', 'Local News'],
      reporter: {
        name: 'Lisa Green',
        email: 'lisa@example.com',
        profileImage: null
      },
      views: 2789,
      replies: 38,
      reads: 31,
      shares: 9
    }
  ];

  return {
    success: true,
    data: verifiedNews
  };
},

getPendingNews : async (params = {}) => {
  console.log('Fetching pending news with params:', params);
  
  const pendingNews = [
    {
      _id: '2',
      title: 'City Council Meeting Recap',
      description: 'The city council approved the new budget with amendments for infrastructure development.',
      status: 'pending',
      createdAt: '2024-12-19T15:45:00Z',
      updatedAt: '2024-12-19T15:45:00Z',
      category: 'Politics',
      categories: ['Politics', 'Local News'],
      reporter: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        profileImage: null
      },
      views: 2345
    },
    {
      _id: '3',
      title: 'Local Sports Highlights',
      description: 'Our local team secured victory in the championship match last night.',
      status: 'pending',
      createdAt: '2024-12-18T20:15:00Z',
      updatedAt: '2024-12-18T20:15:00Z',
      category: 'Sports',
      categories: ['Politics', 'Local News', 'Breaking News'],
      reporter: {
        name: 'Mike Wilson',
        email: 'mike@example.com',
        profileImage: null
      },
      views: 1890
    },
    {
      _id: '7',
      title: 'Education Reform',
      description: 'Government announces new policies for education system improvement.',
      status: 'pending',
      createdAt: '2024-12-14T13:25:00Z',
      updatedAt: '2024-12-14T13:25:00Z',
      category: 'Education',
      categories: ['Education', 'Politics'],
      reporter: {
        name: 'Thomas Brown',
        email: 'thomas@example.com',
        profileImage: null
      },
      views: 1567
    }
  ];

 
  return {
    success: true,
    data:pendingNews 
  };
},

// Rejected News API
 getRejectedNews : async (params = {}) => {
  console.log('Fetching rejected news with params:', params);
  
  const rejectedNews = [
    {
      _id: '5',
      title: 'Health Advisory Update',
      description: 'Health department issues new guidelines for seasonal illnesses.',
      status: 'rejected',
      createdAt: '2024-12-16T14:20:00Z',
      updatedAt: '2024-12-16T14:20:00Z',
      category: 'Health',
      categories: ['Health', 'Local News'],
      reporter: {
        name: 'Dr. Robert Chen',
        email: 'robert@example.com',
        profileImage: null
      },
      views: 890,
      rejectionReason: 'News doesn\'t contain detailed information, clarity is insufficient'
    },
    {
      _id: '8',
      title: 'Cultural Festival Success',
      description: 'Annual cultural festival attracts record number of visitors this year.',
      status: 'rejected',
      createdAt: '2024-12-13T18:40:00Z',
      updatedAt: '2024-12-13T18:40:00Z',
      category: 'Culture',
      categories: ['Culture', 'Local News'],
      reporter: {
        name: 'Maria Garcia',
        email: 'maria@example.com',
        profileImage: null
      },
      views: 732,
      rejectionReason: 'Incomplete information about event organizers and sponsors'
    }
  ];


  return {
    success: true,
    data: rejectedNews 
  };
},
getReporters : async () => {
  console.log('Fetching reporters...');
  
  // // Simulate API delay
  // await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Static data - Replace with actual API call
  const staticReporters = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+919876543210',
      city: 'Mumbai',
      state: 'Maharashtra',
      status: 'active',
      createdAt: '2024-11-15T10:30:00Z',
      articlesCount: 45,
      verifiedArticles: 32,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '+919876543211',
      city: 'Delhi',
      state: 'Delhi',
      status: 'pending',
      createdAt: '2024-12-10T14:20:00Z',
      articlesCount: 0,
      verifiedArticles: 0,
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike.wilson@example.com',
      phone: '+919876543212',
      city: 'Bangalore',
      state: 'Karnataka',
      status: 'active',
      createdAt: '2024-10-05T09:15:00Z',
      articlesCount: 28,
      verifiedArticles: 25,
    },
    {
      id: '4',
      name: 'Emma Davis',
      email: 'emma.davis@example.com',
      phone: '+919876543213',
      city: 'Chennai',
      state: 'Tamil Nadu',
      status: 'suspended',
      createdAt: '2024-09-20T16:45:00Z',
      articlesCount: 12,
      verifiedArticles: 8,
    },
    {
      id: '5',
      name: 'Robert Chen',
      email: 'robert.chen@example.com',
      phone: '+919876543214',
      city: 'Kolkata',
      state: 'West Bengal',
      status: 'pending',
      createdAt: '2024-12-18T11:10:00Z',
      articlesCount: 0,
      verifiedArticles: 0,
    },
  ];

  return {
    success: true,
    data: staticReporters,
     
  };
},
// Get reporter details
getReporterDetails : async (reporterId) => {
  console.log('Fetching reporter details:', reporterId);
  
  
  // Static data - Replace with actual API call
  return {
    success: true,
    data: {
      id: reporterId,
      name: 'Kalavalapalli Prasad',
      reporterId: 'Rep 08',
      email: 'gogreen_ev_charging@evya.com',
      phone: '+91 9876 5432 10',
      address: 'Road Number 12, Indian Oil Petrol Pump India Nagar, Gachibowli',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
      status: 'active',
      idProofType: 'PAN',
      idProofNumber: 'KEPPN9080',
      createdAt: '2024-01-15T10:30:00Z',
      experience: 3,
    }
  };
},

// Get reporter news statistics
getReporterStats : async (reporterId) => {
  console.log('Fetching reporter stats:', reporterId);
  
  
  // Static data - Replace with actual API call
  return {
    success: true,
    data: {
      totalNews: 2300,
      pendingNews: 1300,
      verifiedNews: 300,
      rejectedNews: 300,
    }
  };
},
}
export default api;