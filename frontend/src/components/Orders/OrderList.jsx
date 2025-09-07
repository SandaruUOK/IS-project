import React, { useState, useEffect } from 'react';
import apiService from '../../services/api.js';
import OrderTable from './OrderTable.jsx';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [cancellingOrder, setCancellingOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let response;
      
      switch (activeTab) {
        case 'upcoming':
          response = await apiService.getUpcomingOrders();
          break;
        case 'past':
          response = await apiService.getPastOrders();
          break;
        default:
          response = await apiService.getMyOrders();
      }
      
      setOrders(response.data.data.orders || response.data.data);
    } catch (error) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancellingOrder(orderId);
      await apiService.cancelOrder(orderId, 'Cancelled by user');
      fetchOrders(); // Refresh orders
    } catch (error) {
      alert('Failed to cancel order: ' + (error.response?.data?.message || error.message));
    } finally {
      setCancellingOrder(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '2rem', color: '#333' }}>📦 My Orders</h2>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Orders
        </button>
        <button 
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past Orders
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <h3>No orders found</h3>
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <OrderTable 
          orders={orders}
          onCancelOrder={handleCancelOrder}
          cancellingOrder={cancellingOrder}
        />
      )}
    </div>
  );
};

export default OrderList;