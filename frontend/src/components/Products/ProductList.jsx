import React, { useState, useEffect } from 'react';
import apiService from '../../services/api.js';
import ProductCard from './ProductCard.jsx';
import OrderModal from './OrderModal.jsx';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiService.getProducts();
        setProducts(response.data.data.products);
      } catch (error) {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleOrderProduct = (product) => {
    setSelectedProduct(product);
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '1rem', color: '#333' }}>🛍️ Products</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Browse our secure product catalog and place orders
        </p>
        
        <div className="products-grid">
          {products.map(product => (
            <ProductCard 
              key={product._id} 
              product={product} 
              onOrder={() => handleOrderProduct(product)}
            />
          ))}
        </div>
      </div>

      {selectedProduct && (
        <OrderModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default ProductList;