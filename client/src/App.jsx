import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import StorefrontHome from './storefront/StorefrontHome';
import ProductDetail from './storefront/ProductDetail';
import CartPage from './storefront/CartPage';
import AdminDashboard from './admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Storefront */}
          <Route path="/" element={<StorefrontHome />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Admin Panel */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
