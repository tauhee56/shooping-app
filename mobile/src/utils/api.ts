import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Update this to your actual backend IP
const hostUri =
  (Constants.expoConfig as any)?.hostUri || (Constants as any)?.hostUri || '';
const host = typeof hostUri === 'string' ? hostUri.split(':')[0] : '';
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (host ? `http://${host}:5000/api` : 'http://localhost:5000/api');

export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
});

const UPLOAD_TIMEOUT = 30000;

// Add token to requests
axiosInstance.interceptors.request.use(
  async (config) => {
    let token: string | null = null;
    try {
      token = await AsyncStorage.getItem('authToken');
    } catch {
      // ignore: token read failure shouldn't crash requests
    }

    if (token) {
      if (!config.headers) {
        config.headers = {} as any;
      }
      (config.headers as any).Authorization = `Bearer ${token}`;
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
  firebase: (data) => axiosInstance.post('/auth/firebase', data),
  getProfile: () => axiosInstance.get('/auth/profile'),
  updateProfile: (data) => axiosInstance.put('/auth/profile', data),
  uploadProfileImage: (formData: any) =>
    axiosInstance.post('/auth/profile-image', formData, {
      timeout: UPLOAD_TIMEOUT,
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  followUser: (userId) => axiosInstance.post(`/auth/follow/${userId}`),
};

// Product APIs
export const productAPI = {
  getAllProducts: (params) => axiosInstance.get('/products', { params }),
  getProductById: (id) => axiosInstance.get(`/products/${id}`),
  likeProduct: (id) => axiosInstance.post(`/products/${id}/like`),
  getLikedProducts: () => axiosInstance.get('/products/liked'),
  getFeaturedProducts: () => axiosInstance.get('/products/featured'),
  getProductsByStore: (storeId) => axiosInstance.get(`/products/store/${storeId}`),
};

// Store APIs
export const storeAPI = {
  listStores: () => axiosInstance.get('/stores'),
  createStore: (data) => axiosInstance.post('/stores', data),
  getStoreById: (id) => axiosInstance.get(`/stores/${id}`),
  getFollowedStores: () => axiosInstance.get('/stores/followed'),
  getMyStore: () => axiosInstance.get('/stores/my'),
  getMyStores: () => axiosInstance.get('/stores/mine'),
  updateStore: (id, data) => axiosInstance.put(`/stores/${id}`, data),
  uploadStoreLogo: (formData: any, storeId?: string) =>
    axiosInstance.post(`/stores/upload-logo${storeId ? `?storeId=${encodeURIComponent(storeId)}` : ''}`, formData, {
      timeout: UPLOAD_TIMEOUT,
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadStoreBanner: (formData: any, storeId?: string) =>
    axiosInstance.post(`/stores/upload-banner${storeId ? `?storeId=${encodeURIComponent(storeId)}` : ''}`, formData, {
      timeout: UPLOAD_TIMEOUT,
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadProductImages: (formData: any, storeId?: string) =>
    axiosInstance.post(
      `/stores/upload-product-images${storeId ? `?storeId=${encodeURIComponent(storeId)}` : ''}`,
      formData,
      {
      timeout: UPLOAD_TIMEOUT,
      headers: { 'Content-Type': 'multipart/form-data' },
      }
    ),
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

export const cartAPI = {
  getCart: () => axiosInstance.get('/cart'),
  addItem: (productId, quantity) => axiosInstance.post('/cart/items', { productId, quantity }),
  updateItem: (productId, quantity) => axiosInstance.put(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId) => axiosInstance.delete(`/cart/items/${productId}`),
  checkout: (deliveryAddress, paymentMethod) => axiosInstance.post('/cart/checkout', { deliveryAddress, paymentMethod }),
};

export const paymentsAPI = {
  createIntent: () => axiosInstance.post('/payments/create-intent'),
};

export const addressAPI = {
  getMyAddresses: () => axiosInstance.get('/addresses'),
  createAddress: (data) => axiosInstance.post('/addresses', data),
  updateAddress: (id, data) => axiosInstance.put(`/addresses/${id}`, data),
  deleteAddress: (id) => axiosInstance.delete(`/addresses/${id}`),
  setDefault: (id) => axiosInstance.post(`/addresses/${id}/default`),
};
