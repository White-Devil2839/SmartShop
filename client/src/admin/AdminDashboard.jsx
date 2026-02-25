import { useState } from 'react';
import AdminProductList from './AdminProductList';
import AdminProductForm from './AdminProductForm';
import { Link } from 'react-router-dom';
import './admin.css';

function AdminDashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddClick = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseForm();
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-brand">
            <span className="admin-icon">⚙️</span>
            <div>
              <h1>SmartShop Admin</h1>
              <p>Product Management Panel</p>
            </div>
          </div>
          <Link to="/" className="btn btn-outline">
            🛍️ View Storefront
          </Link>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-toolbar">
          <div>
            <h2>All Products</h2>
            <p className="admin-subtitle">Manage your product catalog</p>
          </div>
          <button className="btn btn-primary" onClick={handleAddClick}>
            + Add Product
          </button>
        </div>

        <AdminProductList key={refreshKey} onEdit={handleEditClick} />
      </main>

      {isFormOpen && (
        <AdminProductForm
          product={editingProduct}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
