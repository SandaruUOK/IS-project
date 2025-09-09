
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
  const [deliveryTimes, setDeliveryTimes] = useState(['10 AM', '11 AM', '12 PM']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(true);

  useEffect(() => {
    const fetchDeliveryOptions = async () => {
      try {
        console.log('🔍 Fetching delivery options...');
        
        const [locationsResponse, timesResponse] = await Promise.all([
          apiService.getDeliveryLocations(),
          apiService.getDeliveryTimes()
        ]);

        console.log('📍 Locations Response:', locationsResponse);
        console.log('⏰ Times Response:', timesResponse);

        // Handle locations - backend returns {status: 'success', data: {districts: [...]}}
        if (locationsResponse.status === 'success' && locationsResponse.data.districts) {
          setDeliveryLocations(locationsResponse.data.districts);
          // Set first location as default
          if (locationsResponse.data.districts.length > 0) {
            setFormData(prev => ({ 
              ...prev, 
              preferredDeliveryLocation: locationsResponse.data.districts[0] 
            }));
          }
        }

        // Handle times - backend returns {status: 'success', data: {times: [...]}}
        if (timesResponse.status === 'success' && timesResponse.data.times) {
          setDeliveryTimes(timesResponse.data.times);
        }

      } catch (error) {
        console.error('❌ Failed to fetch delivery options:', error);
        setError('Failed to load delivery options');
        
        // Set fallback data
        setDeliveryLocations([
          'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
          'Galle', 'Matara', 'Hambantota', 'Kurunegala', 'Anuradhapura'
        ]);
        
        if (deliveryLocations.length > 0) {
          setFormData(prev => ({ 
            ...prev, 
            preferredDeliveryLocation: deliveryLocations[0] 
          }));
        }
      } finally {
        setFetchingOptions(false);
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

    if (!formData.preferredDeliveryLocation) {
      setError('Please select a delivery location');
      setLoading(false);
      return;
    }

    try {
      console.log('📦 Submitting order:', formData);
      
      await apiService.createOrder({
        productId: product._id,
        productName: product.name,
        quantity: parseInt(formData.quantity),
        purchaseDate: formData.purchaseDate,
        preferredDeliveryTime: formData.preferredDeliveryTime,
        preferredDeliveryLocation: formData.preferredDeliveryLocation,
        message: formData.message
      });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('❌ Order creation failed:', error);
      setError(error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="success" style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#28a745'
          }}>
            ✅ Order placed successfully! 
            <br />You will be redirected shortly.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, color: '#333' }}>
            Order: {product.name}
          </h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '1.5rem', 
              cursor: 'pointer',
              color: '#999'
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            padding: '0.75rem', 
            borderRadius: '4px', 
            marginBottom: '1rem' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              max={product.stock}
              required
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #ccc', 
                borderRadius: '4px' 
              }}
            />
            <small style={{ color: '#666' }}>
              Available: {product.stock} | Price: ${product.price} each | Total: ${(product.price * formData.quantity).toFixed(2)}
            </small>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #ccc', 
                borderRadius: '4px' 
              }}
            />
            <small style={{ color: '#666' }}>
              Note: Sundays are not available for delivery
            </small>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Preferred Delivery Time
            </label>
            {fetchingOptions ? (
              <div>Loading times...</div>
            ) : (
              <select
                name="preferredDeliveryTime"
                value={formData.preferredDeliveryTime}
                onChange={handleInputChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px' 
                }}
              >
                {deliveryTimes.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Delivery Location
            </label>
            {fetchingOptions ? (
              <div>Loading locations...</div>
            ) : (
              <select
                name="preferredDeliveryLocation"
                value={formData.preferredDeliveryLocation}
                onChange={handleInputChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px' 
                }}
              >
                <option value="">Select a district</option>
                {deliveryLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Message (Optional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Any special instructions..."
              rows="3"
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fetchingOptions}
              style={{
                flex: 2,
                padding: '0.75rem',
                backgroundColor: loading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Placing Order...' : `Place Order - $${(product.price * formData.quantity).toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
