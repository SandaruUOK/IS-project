import { API_CONFIG } from './config.js';

class AuthService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  // Redirect to Auth0 login
  login() {
    window.location.href = `${this.baseURL}/auth/login`;
  }

  // Logout user
  async logout() {
    try {
      const response = await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.status === 'success' && data.logoutURL) {
        // Redirect to Auth0 logout URL which will redirect back to our login page
        window.location.href = data.logoutURL;
      } else {
        // Fallback: redirect to login page
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: redirect to login page
      window.location.href = '/login';
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const response = await fetch(`${this.baseURL}/auth/check`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data.data?.isAuthenticated || false;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Check authentication status and get user data
  async checkAuth() {
    try {
      const response = await fetch(`${this.baseURL}/auth/check`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data.data || { isAuthenticated: false, user: null };
    } catch (error) {
      console.error('Check auth error:', error);
      return { isAuthenticated: false, user: null };
    }
  }
}

export default new AuthService();