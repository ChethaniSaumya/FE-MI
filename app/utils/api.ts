import axios from 'axios';

//const API_BASE_URL = 'https://ai-music-backend-73mf.onrender.com/api';
const API_BASE_URL = 'http://localhost:3001/api';
const API_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/user/pages/SignIn';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post('/signup', userData);
    return response.data;
  },
  
  signin: async (credentials: {
    email: string;
    password: string;
  }) => {
    const response = await api.post('/signin', credentials);
    return response.data;
  },

  forgotPassword: async (data: {
    email: string;
  }) => {
    const response = await api.post('/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: {
    token: string;
    password: string;
  }) => {
    const response = await api.post('/reset-password', data);
    return response.data;
  },

  // New admin-specific auth methods
  adminLogin: async (credentials: {
    username: string;
    password: string;
  }) => {
    // Admin login uses the same endpoint but with username
    const response = await api.post('/signin', {
      email: credentials.username,
      password: credentials.password
    });
    return response.data;
  },

  logout: () => {
    // Clear all auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.clear();
    // Clear cookie
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};

export const profileAPI = {
  updateProfile: async (userId: string, profileData: {
    firstName: string;
    lastName: string;
    displayName: string;
    location: string;
    country: string;
    biography: string;
    profilePicture?: string;
    socialLinks: {
      facebook: string;
      twitter: string;
      instagram: string;
      youtube: string;
      linkedin: string;
      website: string;
    };
  }) => {
    const response = await api.put(`/profile/${userId}`, profileData);
    return response.data;
  },
};

export const userAPI = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  createUser: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    username?: string;
    password: string;
    phone?: string;
    profilePicture?: string;
    role?: string; // New field for role
    isAdmin?: boolean; // New field for admin status
    isCreator?: boolean; // New field for creator status
    isBuyer?: boolean; // New field for buyer status
  }) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id: string, userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    displayName?: string;
    location?: string;
    country?: string;
    biography?: string;
    role?: string;
    isAdmin?: boolean;
    isCreator?: boolean;
    isBuyer?: boolean;
  }) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // New admin management methods
  getAdmins: async () => {
    const response = await api.get('/admin/admins');
    return response.data;
  },

  createAdmin: async (adminData: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    role?: string;
  }) => {
    const response = await api.post('/admin/admins', adminData);
    return response.data;
  },

  updateUserRole: async (id: string, roleData: {
    role?: string;
    isAdmin?: boolean;
    isCreator?: boolean;
    isBuyer?: boolean;
  }) => {
    const response = await api.put(`/admin/users/${id}/role`, roleData);
    return response.data;
  }
};

export const trackAPI = {
  createTrack: async (trackData: {
    trackName: string;
    trackId: string;
    bpm?: number;
    trackKey?: string;
    trackPrice?: number;
    musician?: string;
    trackType: string;
    moodType?: string;
    energyType?: string;
    instrument?: string;
    generatedTrackPlatform?: string;
    trackImage?: string;
    trackFile?: string;
    about?: string;
    publish?: string;
    genreCategory?: string | string[];
    beatCategory?: string | string[];
    trackTags?: string | string[];
    seoTitle?: string;
    metaKeyword?: string;
    metaDescription?: string;
  }) => {
    const response = await api.post('/tracks', trackData);
    return response.data;
  },

  createTrackWithFiles: async (trackData: FormData) => {
    const response = await api.post('/tracks/upload', trackData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateTrackWithFiles: async (id: string, trackData: FormData) => {
    const response = await api.put(`/tracks/${id}/upload`, trackData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getTracks: async () => {
    const response = await api.get('/tracks');
    return response.data;
  },

  updateTrack: async (id: string, trackData: {
    trackName?: string;
    trackId?: string;
    bpm?: number;
    trackKey?: string;
    trackPrice?: number;
    musician?: string;
    trackType?: string;
    moodType?: string;
    energyType?: string;
    instrument?: string;
    generatedTrackPlatform?: string;
    trackImage?: string;
    trackFile?: string;
    about?: string;
    publish?: string;
    genreCategory?: string | string[];
    beatCategory?: string | string[];
    trackTags?: string | string[];
    seoTitle?: string;
    metaKeyword?: string;
    metaDescription?: string;
  }) => {
    const response = await api.put(`/tracks/${id}`, trackData);
    return response.data;
  },

  deleteTrack: async (id: string) => {
    const response = await api.delete(`/tracks/${id}`);
    return response.data;
  },

  getUniqueMusicians: async () => {
    const response = await api.get('/tracks');
    if (response.data?.success && response.data.tracks) {
      const musicians = response.data.tracks
        .map((track: any) => track.musician)
        .filter((musician: string) => musician && musician.trim() !== '')
        .filter((musician: string, index: number, arr: string[]) => arr.indexOf(musician) === index)
        .sort();
      return { success: true, musicians };
    }
    return { success: false, musicians: [] };
  },

  getMusiciansWithProfiles: async () => {
    const response = await api.get('/musicians');
    if (response.data?.success) {
      return { success: true, musicians: response.data.musicians };
    }
    return { success: false, musicians: [] };
  },
};

export const genreAPI = {
  createGenre: async (genreData: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    const response = await api.post('/genres', genreData);
    return response.data;
  },

  getGenres: async () => {
    const response = await api.get('/genres');
    return response.data;
  },

  updateGenre: async (id: string, genreData: {
    name?: string;
    description?: string;
    color?: string;
    isActive?: boolean;
  }) => {
    const response = await api.put(`/genres/${id}`, genreData);
    return response.data;
  },

  deleteGenre: async (id: string) => {
    const response = await api.delete(`/genres/${id}`);
    return response.data;
  },
};

export const beatAPI = {
  createBeat: async (beatData: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    const response = await api.post('/beats', beatData);
    return response.data;
  },

  getBeats: async () => {
    const response = await api.get('/beats');
    return response.data;
  },

  updateBeat: async (id: string, beatData: {
    name?: string;
    description?: string;
    color?: string;
    isActive?: boolean;
  }) => {
    const response = await api.put(`/beats/${id}`, beatData);
    return response.data;
  },

  deleteBeat: async (id: string) => {
    const response = await api.delete(`/beats/${id}`);
    return response.data;
  },
};

export const tagAPI = {
  createTag: async (tagData: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    const response = await api.post('/tags', tagData);
    return response.data;
  },

  getTags: async () => {
    const response = await api.get('/tags');
    return response.data;
  },

  updateTag: async (id: string, tagData: {
    name?: string;
    description?: string;
    color?: string;
    isActive?: boolean;
  }) => {
    const response = await api.put(`/tags/${id}`, tagData);
    return response.data;
  },

  deleteTag: async (id: string) => {
    const response = await api.delete(`/tags/${id}`);
    return response.data;
  },
};

export const soundKitAPI = {
  createSoundKit: async (soundKitData: {
    kitName: string;
    kitId: string;
    description?: string;
    category?: string;
    price?: number;
    producer?: string;
    kitType?: string;
    bpm?: number;
    key?: string;
    kitImage?: string;
    kitFile?: string;
    tags?: string[];
    publish?: string;
    seoTitle?: string;
    metaKeyword?: string;
    metaDescription?: string;
  }) => {
    const response = await api.post('/sound-kits', soundKitData);
    return response.data;
  },

  createSoundKitWithFiles: async (soundKitData: FormData) => {
    const response = await api.post('/sound-kits/upload', soundKitData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getSoundKits: async () => {
    const response = await api.get('/sound-kits');
    return response.data;
  },

  updateSoundKit: async (id: string, soundKitData: {
    kitName?: string;
    kitId?: string;
    description?: string;
    category?: string | string[];
    price?: number;
    producer?: string;
    kitType?: string;
    bpm?: number;
    key?: string;
    kitImage?: string;
    kitFile?: string;
    tags?: string | string[];
    publish?: string;
    seoTitle?: string;
    metaKeyword?: string;
    metaDescription?: string;
  }) => {
    const response = await api.put(`/sound-kits/${id}`, soundKitData);
    return response.data;
  },

  deleteSoundKit: async (id: string) => {
    const response = await api.delete(`/sound-kits/${id}`);
    return response.data;
  },
};

export const soundKitCategoryAPI = {
  createCategory: async (categoryData: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    const response = await api.post('/sound-kit-categories', categoryData);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/sound-kit-categories');
    return response.data;
  },

  updateCategory: async (id: string, categoryData: {
    name?: string;
    description?: string;
    color?: string;
    isActive?: boolean;
  }) => {
    const response = await api.put(`/sound-kit-categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/sound-kit-categories/${id}`);
    return response.data;
  },
};

export const soundKitTagAPI = {
  createTag: async (tagData: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    const response = await api.post('/sound-kit-tags', tagData);
    return response.data;
  },

  getTags: async () => {
    const response = await api.get('/sound-kit-tags');
    return response.data;
  },

  updateTag: async (id: string, tagData: {
    name?: string;
    description?: string;
    color?: string;
    isActive?: boolean;
  }) => {
    const response = await api.put(`/sound-kit-tags/${id}`, tagData);
    return response.data;
  },

  deleteTag: async (id: string) => {
    console.log('API: Deleting sound kit tag with ID:', id);
    console.log('API: Making DELETE request to:', `/sound-kit-tags/${id}`);
    const response = await api.delete(`/sound-kit-tags/${id}`);
    console.log('API: Delete response:', response.data);
    return response.data;
  },
};

export const imageAPI = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post('/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getImage: (fileId: string) => {
    return `${API_BASE_URL}/file/${fileId}`;
  },

  deleteImage: async (fileId: string) => {
    const response = await api.delete(`/file/${fileId}`);
    return response.data;
  },

  listImages: async () => {
    const response = await api.get('/files');
    return response.data;
  },
};

export const audioAPI = {
  uploadAudio: async (file: File) => {
    const formData = new FormData();
    formData.append('audio', file);
    
    const response = await api.post('/upload-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAudio: (fileId: string) => {
    return `${API_BASE_URL}/file/${fileId}`;
  },

  deleteAudio: async (fileId: string) => {
    const response = await api.delete(`/file/${fileId}`);
    return response.data;
  },

  listAudio: async () => {
    const response = await api.get('/files');
    return response.data;
  },
};

export const musicianAPI = {
  getMusicians: async () => {
    const response = await api.get('/musicians');
    return response.data;
  },

  getMusician: async (id: string) => {
    const response = await api.get(`/musicians/${id}`);
    return response.data;
  },

  createMusician: async (musicianData: {
    name: string;
    profilePicture?: string;
    bio?: string;
    country?: string;
    genre?: string;
    socialLinks?: Record<string, string>;
    isActive?: boolean;
  }) => {
    const response = await api.post('/musicians', musicianData);
    return response.data;
  },

  updateMusician: async (id: string, musicianData: {
    name?: string;
    profilePicture?: string;
    bio?: string;
    country?: string;
    genre?: string;
    socialLinks?: Record<string, string>;
    isActive?: boolean;
  }) => {
    const response = await api.put(`/musicians/${id}`, musicianData);
    return response.data;
  },

  deleteMusician: async (id: string) => {
    const response = await api.delete(`/musicians/${id}`);
    return response.data;
  },

  searchMusicians: async (query: string) => {
    const response = await api.get(`/musicians/search/${query}`);
    return response.data;
  },

  syncMusicians: async () => {
    const response = await api.post('/musicians/sync');
    return response.data;
  },
};

export const downloadAPI = {
  downloadFile: async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Download error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};

// PayPal Payout APIs (replaces Stripe Connect)
export const paypalAPI = {
    connect: async (userId: string, paypalEmail: string) => {
        const response = await axios.post(`${API_URL}/api/paypal/connect`, { userId, paypalEmail });
        return response.data;
    },

    getStatus: async (userId: string) => {
        const response = await axios.get(`${API_URL}/api/paypal/status/${userId}`);
        return response.data;
    },

    update: async (userId: string, paypalEmail: string) => {
        const response = await axios.put(`${API_URL}/api/paypal/connect`, { userId, paypalEmail });
        return response.data;
    },

    disconnect: async (userId: string) => {
        const response = await axios.delete(`${API_URL}/api/paypal/connect/${userId}`);
        return response.data;
    }
};

// Dashboard API
export const dashboardAPI = {
  getDashboardData: async () => {
    const response = await api.get('/dashboard-data');
    return response.data;
  }
};

// Helper function to get user role
export const getUserRole = () => {
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData);
    return {
      role: user.role || 'user',
      isAdmin: user.isAdmin || false,
      isCreator: user.isCreator || false,
      isBuyer: user.isBuyer || true
    };
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Helper function to check if user is admin
export const isAdmin = () => {
  const role = getUserRole();
  return role?.isAdmin && role?.role === 'admin';
};

// Helper function to check if user is creator
export const isCreator = () => {
  const role = getUserRole();
  return role?.isCreator || false;
};

// Helper function to check if user is buyer
export const isBuyer = () => {
  const role = getUserRole();
  return role?.isBuyer || true;
};

// Helper function to get user ID
export const getUserId = () => {
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData);
    return user.id || null;
  } catch (error) {
    console.error('Error parsing user ID:', error);
    return null;
  }
};

export default api;