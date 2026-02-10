import { useState, useEffect } from 'react';
import { getAllProducts, deleteProduct } from '../services/productService';

function ProductList({ onEdit }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteProduct(id);
      // Remove from local state
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert(`Failed to delete product: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Error loading products: {error}</p>
        <button onClick={fetchProducts}>Retry</button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p>No products found. Add your first product to get started!</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <h3>{product.name}</h3>
          <p className="description">{product.description}</p>
          <div className="product-details">
            <p className="price">${product.price.toFixed(2)}</p>
            <p className="stock">Stock: {product.stock}</p>
          </div>
          <div className="product-actions">
            <button
              className="btn btn-secondary"
              onClick={() => onEdit(product)}
              disabled={deletingId === product.id}
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={() => handleDelete(product.id, product.name)}
              disabled={deletingId === product.id}
            >
              {deletingId === product.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
