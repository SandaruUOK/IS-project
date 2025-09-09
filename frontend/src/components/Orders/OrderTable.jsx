// File: frontend/src/components/Orders/OrderTable.jsx
import React from 'react';

const OrderTable = ({ orders, onCancelOrder, cancellingOrder }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      processing: '#007bff',
      shipped: '#6f42c1',
      delivered: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canCancelOrder = (order) => {
    return ['pending', 'confirmed'].includes(order.status);
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
              Order ID
            </th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
              Product
            </th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
              Quantity
            </th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
              Total Price
            </th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
              Status
            </th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
              Purchase Date
            </th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
              Delivery
            </th>
            <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  {order._id.slice(-8)}
                </div>
                {order.trackingNumber && (
                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                    {order.trackingNumber}
                  </div>
                )}
              </td>
              
              <td style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 'bold' }}>
                  {order.productName || order.product?.name || 'Unknown Product'}
                </div>
                {order.product?.category && (
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {order.product.category}
                  </div>
                )}
              </td>
              
              <td style={{ padding: '1rem' }}>
                <span style={{ 
                  backgroundColor: '#e9ecef', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}>
                  {order.quantity}
                </span>
              </td>
              
              <td style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 'bold', color: '#28a745' }}>
                  ${order.totalPrice?.toFixed(2) || '0.00'}
                </div>
                {order.unitPrice && (
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    ${order.unitPrice.toFixed(2)} each
                  </div>
                )}
              </td>
              
              <td style={{ padding: '1rem' }}>
                <span style={{
                  backgroundColor: getStatusColor(order.status),
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  textTransform: 'capitalize'
                }}>
                  {order.status}
                </span>
              </td>
              
              <td style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.9rem' }}>
                  {formatDate(order.purchaseDate || order.createdAt)}
                </div>
                {order.preferredDeliveryTime && (
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {order.preferredDeliveryTime}
                  </div>
                )}
              </td>
              
              <td style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.9rem' }}>
                  {order.preferredDeliveryLocation || 'Not specified'}
                </div>
                {order.deliveryDate && (
                  <div style={{ fontSize: '0.8rem', color: '#28a745' }}>
                    Delivered: {formatDate(order.deliveryDate)}
                  </div>
                )}
              </td>
              
              <td style={{ padding: '1rem', textAlign: 'center' }}>
                {canCancelOrder(order) ? (
                  <button
                    onClick={() => onCancelOrder(order._id)}
                    disabled={cancellingOrder === order._id}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: cancellingOrder === order._id ? '#6c757d' : '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: cancellingOrder === order._id ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    {cancellingOrder === order._id ? 'Cancelling...' : 'Cancel'}
                  </button>
                ) : (
                  <span style={{ 
                    color: '#6c757d', 
                    fontSize: '0.8rem',
                    fontStyle: 'italic'
                  }}>
                    {order.status === 'cancelled' ? 'Cancelled' : 'Cannot cancel'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;