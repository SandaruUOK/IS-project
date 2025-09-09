import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';

const Login = () => {
  const { login, error } = useAuth();

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 style={{ marginBottom: '2rem', color: '#333' }}>
          Welcome to SMW Super
        </h1>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          A secure e-commerce platform with Auth0 authentication using Passport.js
        </p>
        
        {error && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '1rem', 
            backgroundColor: '#fee', 
            color: '#c33', 
            borderRadius: '4px',
            border: '1px solid #fcc'
          }}>
            ❌ {error}
          </div>
        )}
        
        <button className="btn" onClick={login}>
          🔐 Login with Auth0
        </button>
        
        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#999' }}>
          <p>✅ Secure session-based authentication</p>
        </div>
      </div>
    </div>
  );
};

export default Login;