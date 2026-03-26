import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider }  from './context/CartContext';
import { AuthProvider }  from './context/AuthContext';
import ProtectedRoute    from './components/ProtectedRoute';
import StorefrontHome    from './storefront/StorefrontHome';
import ProductDetail     from './storefront/ProductDetail';
import CartPage          from './storefront/CartPage';
import OrderConfirmation from './storefront/OrderConfirmation';
import AdminDashboard    from './admin/AdminDashboard';
import LoginPage         from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Storefront — public */}
            <Route path="/"            element={<StorefrontHome />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart"        element={<CartPage />} />
            <Route path="/order/:id"   element={<OrderConfirmation />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin — protected */}
            <Route path="/admin" element={
              <ProtectedRoute><AdminDashboard /></ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
