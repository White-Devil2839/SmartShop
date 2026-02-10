import { useState } from 'react';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';

function App() {
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
    // Trigger ProductList refresh by changing key
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🛒 SmartShop</h1>
        <p className="subtitle">Product Management System</p>
      </header>

      <main className="app-main">
        <div className="toolbar">
          <button
            className="btn btn-primary"
            onClick={handleAddClick}
          >
            + Add Product
          </button>
        </div>

        <ProductList
          key={refreshKey}
          onEdit={handleEditClick}
        />

        {isFormOpen && (
          <ProductForm
            product={editingProduct}
            onClose={handleCloseForm}
            onSuccess={handleFormSuccess}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>SmartShop &copy; 2026 | E-Commerce Management</p>
      </footer>
    </div>
  );
}

export default App;
