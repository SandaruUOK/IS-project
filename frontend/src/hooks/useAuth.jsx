// ===== SRC/HOOKS/USEAUTH.JSX (FIXED) =====
// File: src/hooks/useAuth.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.js';
import apiService from '../services/api.js';

// Create the context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = () => {
    authService.login();
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const response = await apiService.getProfile();
        setUser(response.data.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const handleAuthentication = async () => {
    try {
      await authService.handleAuthentication();
      window.location.hash = '';
      await checkAuth();
    } catch (error) {
      console.error('Authentication failed:', error);
      setError('Authentication failed');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.location.hash.includes('access_token')) {
      handleAuthentication();
    } else {
      checkAuth();
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export context for direct access if needed
export { AuthContext };