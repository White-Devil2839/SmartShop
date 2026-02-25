import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StorefrontHome from './storefront/StorefrontHome';
import AdminDashboard from './admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Storefront - customer-facing */}
        <Route path="/" element={<StorefrontHome />} />

        {/* Admin Panel - product management */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Catch-all: redirect unknown routes to storefront */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
