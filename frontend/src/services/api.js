import { API_CONFIG } from './config.js';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    console.log('🔧 API Service initialized with baseURL:', this.baseURL);
  }

  // Generic fetch method with session authentication
  async fetchWithAuth(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      credentials: 'include', // Include session cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log('🌐 Making request to:', url);
    console.log('⚙️ Request config:', config);

    try {
      const response = await fetch(url, config);
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.status === 401) {
        console.log('🚫 Unauthorized - redirecting to login');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Response not OK:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Response data:', data);
      return data;
    } catch (error) {
      console.error('💥 Fetch error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async getProfile() {
    return this.fetchWithAuth('/auth/profile');
  }

  async checkAuth() {
    return this.fetchWithAuth('/auth/check');
  }

  // User endpoints
  async getDashboard() {
    return this.fetchWithAuth('/users/dashboard');
  }

  async getUserProfile() {
    return this.fetchWithAuth('/users/profile');
  }

  async getOrdersSummary() {
    return this.fetchWithAuth('/users/orders-summary');
  }

  // Product endpoints
  async getProducts(params = {}) {
    // Build query string if params provided
    const queryString = Object.keys(params).length > 0 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    
    return this.fetchWithAuth(`/products${queryString}`);
  }

  async getProduct(productId) {
    return this.fetchWithAuth(`/products/${productId}`);
  }

  // Order endpoints
  async getOrders() {
    return this.fetchWithAuth('/orders/my-orders');
  }

  async getOrder(orderId) {
    return this.fetchWithAuth(`/orders/${orderId}`);
  }

  async createOrder(orderData) {
    return this.fetchWithAuth('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(orderId, orderData) {
    return this.fetchWithAuth(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async cancelOrder(orderId, reason) {
    return this.fetchWithAuth(`/orders/${orderId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  async getUpcomingOrders() {
    return this.fetchWithAuth('/orders/upcoming');
  }

  async getPastOrders() {
    return this.fetchWithAuth('/orders/past');
  }

  async getDeliveryLocations() {
    return this.fetchWithAuth('/orders/delivery-locations');
  }

  async getDeliveryTimes() {
    return this.fetchWithAuth('/orders/delivery-times');
  }

  // Alias methods for backward compatibility
  async getMyOrders(params = {}) {
    return this.getOrders(params);
  }
}

export default new ApiService();