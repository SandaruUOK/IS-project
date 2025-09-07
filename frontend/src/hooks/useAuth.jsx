import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.js';

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

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state and redirect
      setUser(null);
      window.location.href = '/login';
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      const authData = await authService.checkAuth();
      
      if (authData.isAuthenticated && authData.user) {
        setUser(authData.user);
      } else {
        setUser(null);
      }
      
      setError(null);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setError('Authentication check failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle URL parameters (for error handling from Auth0 redirects)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
      if (error === 'auth_failed') {
        setError('Authentication failed. Please try again.');
      } else if (error === 'login_failed') {
        setError('Login failed. Please try again.');
      }
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
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