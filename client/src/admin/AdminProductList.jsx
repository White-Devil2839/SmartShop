import { useState, useEffect } from 'react';
import { getAllProducts, deleteProduct } from '../services/productService';

function AdminProductList({ onEdit }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Admin sees ALL products regardless of isActive
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
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      setDeletingId(id);
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="admin-loading">Loading products...</div>;
  if (error) return (
    <div className="admin-error">
      <p>⚠️ {error}</p>
      <button className="btn btn-outline" onClick={fetchProducts}>Retry</button>
    </div>
  );

  return (
    <div className="admin-table-wrapper">
      {products.length === 0 ? (
        <div className="admin-empty">
          <p>No products yet. Click <strong>+ Add Product</strong> to get started.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className={!product.isActive ? 'row-inactive' : ''}>
                <td>{product.id}</td>
                <td>
                  <div className="product-name-cell">
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.name} className="admin-thumb" />
                    )}
                    <span>{product.name}</span>
                  </div>
                </td>
                <td><span className="category-badge">{product.category}</span></td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.stock}</td>
                <td>
                  <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                    {product.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => onEdit(product)}
                      disabled={deletingId === product.id}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={deletingId === product.id}
                    >
                      {deletingId === product.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminProductList;
