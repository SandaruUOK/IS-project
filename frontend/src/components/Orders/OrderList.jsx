
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
      setError(null);
      console.log(`🔍 Fetching ${activeTab} orders...`);
      
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
      
      console.log('📦 Orders response:', response);

      // Handle different response structures
      let ordersList = [];
      if (response.status === 'success') {
        if (response.data.orders) {
          ordersList = response.data.orders; // For getMyOrders
        } else if (response.data.data && response.data.data.orders) {
          ordersList = response.data.data.orders; // Alternative structure
        } else if (Array.isArray(response.data)) {
          ordersList = response.data; // For upcoming/past orders
        }
      }

      console.log('📋 Processed orders:', ordersList);
      setOrders(ordersList);
      
    } catch (error) {
      console.error('❌ Failed to fetch orders:', error);
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
      console.log('🚫 Cancelling order:', orderId);
      
      await apiService.cancelOrder(orderId, 'Cancelled by user');
      console.log('✅ Order cancelled successfully');
      
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('❌ Failed to cancel order:', error);
      alert('Failed to cancel order: ' + (error.message || 'Unknown error'));
    } finally {
      setCancellingOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading" style={{ textAlign: 'center', padding: '3rem' }}>
          Loading orders...
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '2rem', color: '#333' }}>📦 My Orders</h2>
      
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '2rem', 
        borderBottom: '1px solid #e0e0e0' 
      }}>
        <button 
          onClick={() => setActiveTab('all')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'all' ? '2px solid #007bff' : '2px solid transparent',
            color: activeTab === 'all' ? '#007bff' : '#666',
            fontWeight: activeTab === 'all' ? 'bold' : 'normal'
          }}
        >
          All Orders
        </button>
        <button 
          onClick={() => setActiveTab('upcoming')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'upcoming' ? '2px solid #007bff' : '2px solid transparent',
            color: activeTab === 'upcoming' ? '#007bff' : '#666',
            fontWeight: activeTab === 'upcoming' ? 'bold' : 'normal'
          }}
        >
          Upcoming
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'past' ? '2px solid #007bff' : '2px solid transparent',
            color: activeTab === 'past' ? '#007bff' : '#666',
            fontWeight: activeTab === 'past' ? 'bold' : 'normal'
          }}
        >
          Past Orders
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '1rem', 
          borderRadius: '4px', 
          marginBottom: '1rem' 
        }}>
          {error}
          <button 
            onClick={fetchOrders}
            style={{ 
              marginLeft: '1rem', 
              padding: '0.25rem 0.5rem',
              backgroundColor: 'transparent',
              border: '1px solid #721c24',
              color: '#721c24',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Orders Content */}
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <h3 style={{ marginBottom: '1rem' }}>No orders found</h3>
          <p>You haven't placed any orders yet.</p>
          <button 
            onClick={() => window.location.href = '/products'}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Browse Products
          </button>
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