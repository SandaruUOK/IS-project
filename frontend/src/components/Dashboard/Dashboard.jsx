import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import apiService from '../../services/api.js';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiService.getDashboard();
        setDashboardData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '2rem', color: '#333' }}>📊 Dashboard</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Welcome back, <strong>{user.name}</strong>! Here's your account overview.
        </p>
        
        {dashboardData && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem' 
          }}>
            <div className="dashboard-stat">
              <h3 style={{ color: '#667eea', fontSize: '2rem', marginBottom: '0.5rem' }}>
                {dashboardData.totalOrders || 0}
              </h3>
              <p>Total Orders</p>
            </div>
            <div className="dashboard-stat">
              <h3 style={{ color: '#28a745', fontSize: '2rem', marginBottom: '0.5rem' }}>
                {dashboardData.upcomingOrders || 0}
              </h3>
              <p>Upcoming Orders</p>
            </div>
            <div className="dashboard-stat">
              <h3 style={{ color: '#17a2b8', fontSize: '2rem', marginBottom: '0.5rem' }}>
                ${dashboardData.totalSpent || '0.00'}
              </h3>
              <p>Total Spent</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;