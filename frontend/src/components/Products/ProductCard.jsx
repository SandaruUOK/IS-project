import React from 'react';

const ProductCard = ({ product, onOrder }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        🛍️
      </div>
      <div className="product-name">{product.name}</div>
      <div className="product-price">${product.price}</div>
      <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
        {product.description}
      </p>
      <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
        <strong>Stock:</strong> {product.stock} available
      </div>
      <button 
        className="btn" 
        style={{ width: '100%' }}
        onClick={onOrder}
        disabled={product.stock === 0}
      >
        {product.stock > 0 ? 'Order Now' : 'Out of Stock'}
      </button>
    </div>
  );
};

export default ProductCard;
