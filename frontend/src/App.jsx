
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import Header from './components/Layout/Header.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import ProductList from './components/Products/ProductList.jsx';
import OrderList from './components/Orders/OrderList.jsx';
import UserProfile from './components/Profile/UserProfile.jsx';
import Login from './components/Auth/Login.jsx';
import ProtectedRoute from './components/Auth/ProtectedRoute.jsx';
import './styles/components.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<MainApp />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

function MainApp() {
  return (
    <ProtectedRoute>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </main>
    </ProtectedRoute>
  );
}

export default App;