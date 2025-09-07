

const OrderTable = ({ orders, onCancelOrder, cancellingOrder }) => {
  const getStatusBadge = (status) => {
    const className = `status-badge status-${status}`;
    return <span className={className}>{status}</span>;
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Purchase Date</th>
            <th>Delivery Time</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>
                <small style={{ fontFamily: 'monospace' }}>
                  {order.trackingNumber || order._id.slice(-8)}
                </small>
              </td>
              <td>
                <strong>{order.productName}</strong>
              </td>
              <td>{order.quantity}</td>
              <td>${order.totalPrice.toFixed(2)}</td>
              <td>
                {new Date(order.purchaseDate).toLocaleDateString()}
              </td>
              <td>{order.preferredDeliveryTime}</td>
              <td>{order.preferredDeliveryLocation}</td>
              <td>{getStatusBadge(order.status)}</td>
              <td>
                {order.status === 'pending' && (
                  <button
                    className="btn btn-danger"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    onClick={() => onCancelOrder(order._id)}
                    disabled={cancellingOrder === order._id}
                  >
                    {cancellingOrder === order._id ? 'Cancelling...' : 'Cancel'}
                  </button>
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