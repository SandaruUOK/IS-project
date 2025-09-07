export const API_CONFIG = {
  baseURL: import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'
};

// Remove Auth0 client-side config since we're using server-side authentication
export const AUTH_CONFIG = {
  loginURL: `${API_CONFIG.baseURL}/auth/login`,
  logoutURL: `${API_CONFIG.baseURL}/auth/logout`,
  callbackURL: `${API_CONFIG.baseURL}/auth/callback`
};