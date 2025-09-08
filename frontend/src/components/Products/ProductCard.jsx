
import React, { useState } from 'react';

const ProductCard = ({ product, onOrder }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  return (
    <div className="product-card">
      <div className="product-image" style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        {imageLoading && !imageError && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            backgroundColor: '#f5f5f5',
            color: '#999'
          }}>
            Loading...
          </div>
        )}
        
        {imageError ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            backgroundColor: '#f8f9fa',
            flexDirection: 'column',
            color: '#6c757d'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📱</div>
            <div style={{ fontSize: '0.8rem' }}>Image not available</div>
          </div>
        ) : (
          <img 
            src={product.image} 
            alt={product.name}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              display: imageLoading ? 'none' : 'block'
            }}
          />
        )}
      </div>
      
      <div className="product-details" style={{ padding: '1rem' }}>
        <div className="product-name" style={{ 
          fontWeight: 'bold', 
          marginBottom: '0.5rem',
          fontSize: '1.1rem'
        }}>
          {product.name}
        </div>
        
        <div className="product-price" style={{ 
          fontSize: '1.2rem', 
          fontWeight: 'bold', 
          color: '#28a745', 
          marginBottom: '0.5rem' 
        }}>
          ${product.price}
        </div>
        
        <p style={{ 
          color: '#666', 
          marginBottom: '1rem', 
          fontSize: '0.9rem',
          lineHeight: '1.4',
          height: '2.8rem',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {product.description}
        </p>
        
        <div style={{ 
          marginBottom: '1rem', 
          fontSize: '0.9rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            <strong>Stock:</strong> {product.stock} available
          </span>
          <span style={{ 
            backgroundColor: product.stock > 0 ? '#d4edda' : '#f8d7da',
            color: product.stock > 0 ? '#155724' : '#721c24',
            padding: '0.2rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.8rem'
          }}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        
        <button 
          className="btn" 
          style={{ 
            width: '100%',
            backgroundColor: product.stock > 0 ? '#007bff' : '#6c757d',
            cursor: product.stock > 0 ? 'pointer' : 'not-allowed'
          }}
          onClick={onOrder}
          disabled={product.stock === 0}
        >
          {product.stock > 0 ? '🛒 Order Now' : '❌ Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;