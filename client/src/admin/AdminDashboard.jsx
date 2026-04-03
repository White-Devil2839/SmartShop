import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminProductList from './AdminProductList';
import AdminProductForm from './AdminProductForm';
import AdminOrders     from './AdminOrders';
import './admin.css';

const TABS = [
  { id: 'products', label: '📦 Products' },
  { id: 'orders',   label: '🧾 Orders'   },
];

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab]           = useState('products');
  const [isFormOpen, setIsFormOpen]         = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [refreshKey, setRefreshKey]         = useState(0);

  const handleAddClick  = () => { setEditingProduct(null); setIsFormOpen(true); };
  const handleEditClick = (product) => { setEditingProduct(product); setIsFormOpen(true); };
  const handleCloseForm = () => { setIsFormOpen(false); setEditingProduct(null); };
  const handleFormSuccess = () => { setRefreshKey(prev => prev + 1); handleCloseForm(); };

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <div className="admin-layout">
      {/* ── Header ── */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-brand">
            <span className="admin-icon">⚙️</span>
            <div>
              <h1>SmartShop Admin</h1>
              <p>Management Panel</p>
            </div>
          </div>

          <div className="admin-header-actions">
            <span className="admin-user-badge">👤 {user?.username}</span>
            <Link to="/" className="btn btn-outline">🛍️ Storefront</Link>
            <button className="btn btn-logout" onClick={handleLogout}>Sign Out</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {/* ── Tab navigation ── */}
        <div className="admin-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Products tab ── */}
        {activeTab === 'products' && (
          <>
            <div className="admin-toolbar">
              <div>
                <h2>All Products</h2>
                <p className="admin-subtitle">Manage your product catalog</p>
              </div>
              <button className="btn btn-primary" onClick={handleAddClick}>+ Add Product</button>
            </div>
            <AdminProductList key={refreshKey} onEdit={handleEditClick} />
          </>
        )}

        {/* ── Orders tab ── */}
        {activeTab === 'orders' && (
          <>
            <div className="admin-toolbar">
              <div>
                <h2>All Orders</h2>
                <p className="admin-subtitle">View and manage customer orders</p>
              </div>
            </div>
            <AdminOrders />
          </>
        )}
      </main>

      {/* ── Product form modal ── */}
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
