// eslint-disable-next-line no-unused-vars
import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';

const Login = () => {
  const { login } = useAuth();

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 style={{ marginBottom: '2rem', color: '#333' }}>
          Welcome to SecureShop
        </h1>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          A secure e-commerce platform with Auth0 authentication
        </p>
        <button className="btn" onClick={login}>
          🔐 Login with Auth0
        </button>
      </div>
    </div>
  );
};

export default Login;