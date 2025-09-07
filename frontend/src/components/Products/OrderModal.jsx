import React, { useState, useEffect } from 'react';
import apiService from '../../services/api.js';

const OrderModal = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    purchaseDate: new Date().toISOString().split('T')[0],
    preferredDeliveryTime: '10 AM',
    preferredDeliveryLocation: '',
    message: ''
  });
  const [deliveryLocations, setDeliveryLocations] = useState([]);
  const [deliveryTimes, setDeliveryTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDeliveryOptions = async () => {
      try {
        const [locations, times] = await Promise.all([
          apiService.getDeliveryLocations(),
          apiService.getDeliveryTimes()
        ]);
        setDeliveryLocations(locations.data.data.locations);
        setDeliveryTimes(times.data.data.times);
        
        if (locations.data.data.locations.length > 0) {
          setFormData(prev => ({ 
            ...prev, 
            preferredDeliveryLocation: locations.data.data.locations[0] 
          }));
        }
      } catch (error) {
        setError('Failed to fetch delivery options');
      }
    };

    fetchDeliveryOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateDate = (date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return 'Purchase date cannot be in the past';
    }

    if (selectedDate.getDay() === 0) {
      return 'Delivery is not available on Sundays';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const dateError = validateDate(formData.purchaseDate);
    if (dateError) {
      setError(dateError);
      setLoading(false);
      return;
    }

    if (formData.quantity > product.stock) {
      setError(`Only ${product.stock} items available`);
      setLoading(false);
      return;
    }

    try {
      await apiService.createOrder({
        productId: product._id,
        ...formData,
        quantity: parseInt(formData.quantity)
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="success">
            ✅ Order placed successfully! 
            <br />You will be redirected shortly.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>
          Order: {product.name}
        </h3>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input
              type="number"
              name="quantity"
              className="form-input"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              max={product.stock}
              required
            />
            <small style={{ color: '#666' }}>
              Available: {product.stock} | Price: ${product.price} each
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Purchase Date</label>
            <input
              type="date"
              name="purchaseDate"
              className="form-input"
              value={formData.purchaseDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <small style={{ color: '#666' }}>
              Note: Sundays are not available for delivery
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Delivery Time</label>
            <select
              name="preferredDeliveryTime"
              className="form-select"
              value={formData.preferredDeliveryTime}
              onChange={handleInputChange}
              required
            >
              {deliveryTimes.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Location</label>
            <select
              name="preferredDeliveryLocation"
              className="form-select"
              value={formData.preferredDeliveryLocation}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a district</option>
              {deliveryLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Message (Optional)</label>
            <textarea
              name="message"
              className="form-input"
              value={formData.message}
              onChange={handleInputChange}
              rows="3"
              placeholder="Any special instructions..."
              maxLength="500"
            />
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'flex-end',
            marginTop: '2rem' 
          }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn"
              disabled={loading}
            >
              {loading ? 'Placing Order...' : `Place Order - ${(product.price * formData.quantity).toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;