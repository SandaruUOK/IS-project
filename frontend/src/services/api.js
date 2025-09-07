import axios from 'axios';
import { API_CONFIG } from './config.js';
import authService from './auth.js';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      withCredentials: true
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = authService.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          authService.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // User endpoints
  getProfile() {
    return this.api.get('/users/profile');
  }

  getDashboard() {
    return this.api.get('/users/dashboard');
  }

  // Product endpoints
  getProducts(params = {}) {
    return this.api.get('/products', { params });
  }

  getProduct(id) {
    return this.api.get(`/products/${id}`);
  }

  // Order endpoints
  createOrder(data) {
    return this.api.post('/orders', data);
  }

  getMyOrders(params = {}) {
    return this.api.get('/orders/my-orders', { params });
  }

  getUpcomingOrders() {
    return this.api.get('/orders/upcoming');
  }

  getPastOrders() {
    return this.api.get('/orders/past');
  }

  getDeliveryLocations() {
    return this.api.get('/orders/delivery-locations');
  }

  getDeliveryTimes() {
    return this.api.get('/orders/delivery-times');
  }

  cancelOrder(orderId, reason) {
    return this.api.patch(`/orders/${orderId}/cancel`, { reason });
  }
}

export default new ApiService();