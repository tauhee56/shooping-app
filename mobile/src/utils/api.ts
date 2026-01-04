import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this to your actual backend IP
const API_URL = 'http://localhost:5000/api';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  getProfile: () => axiosInstance.get('/auth/profile'),
  updateProfile: (data) => axiosInstance.put('/auth/profile', data),
  followUser: (userId) => axiosInstance.post(`/auth/follow/${userId}`),
};

// Product APIs
export const productAPI = {
  getAllProducts: (params) => axiosInstance.get('/products', { params }),
  getProductById: (id) => axiosInstance.get(`/products/${id}`),
  likeProduct: (id) => axiosInstance.post(`/products/${id}/like`),
  getFeaturedProducts: () => axiosInstance.get('/products/featured'),
  getProductsByStore: (storeId) => axiosInstance.get(`/products/store/${storeId}`),
};

// Store APIs
export const storeAPI = {
  createStore: (data) => axiosInstance.post('/stores', data),
  getStoreById: (id) => axiosInstance.get(`/stores/${id}`),
  getMyStore: () => axiosInstance.get('/stores/my'),
  updateStore: (id, data) => axiosInstance.put(`/stores/${id}`, data),
  addProductToStore: (id, data) => axiosInstance.post(`/stores/${id}/products`, data),
  followStore: (id) => axiosInstance.post(`/stores/${id}/follow`),
  updateProduct: (storeId, productId, data) => axiosInstance.put(`/stores/${storeId}/products/${productId}`, data),
  deleteProduct: (storeId, productId) => axiosInstance.delete(`/stores/${storeId}/products/${productId}`),
};

// Order APIs
export const orderAPI = {
  createOrder: (data) => axiosInstance.post('/orders', data),
  getMyOrders: () => axiosInstance.get('/orders'),
  getOrderById: (id) => axiosInstance.get(`/orders/${id}`),
  updateOrderStatus: (id, data) => axiosInstance.put(`/orders/${id}/status`, data),
};

// Message/Chat APIs
export const messageAPI = {
  sendMessage: (data) => axiosInstance.post('/messages', data),
  getConversations: () => axiosInstance.get('/messages/conversations'),
  getMessagesWithUser: (userId) => axiosInstance.get(`/messages/${userId}`),
  markAsRead: (messageId) => axiosInstance.put(`/messages/${messageId}/read`),
  getUnreadCount: () => axiosInstance.get('/messages/unread-count'),
};
