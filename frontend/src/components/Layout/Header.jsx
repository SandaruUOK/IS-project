import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'dashboard';
    if (path.includes('products')) return 'products';
    if (path.includes('orders')) return 'orders';
    if (path.includes('profile')) return 'profile';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  return (
    <header className="header">
      <div className="logo">🛒 SMW Super</div>
      <nav className="nav-menu">
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => navigate('/products')}
        >
          Products
        </button>
        <button 
          className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => navigate('/orders')}
        >
          My Orders
        </button>
        <button 
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
        >
          Profile
        </button>
      </nav>
      <div className="user-info">
        <div className="avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <span>Hello, {user?.name || user?.username}</span>
        <button className="btn btn-danger" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;