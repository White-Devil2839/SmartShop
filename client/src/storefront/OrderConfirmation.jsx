import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { StoreNav } from './StorefrontHome';
import './storefront.css';
import './cart.css';

function OrderConfirmation() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { token, loading: authLoading } = useAuth();

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    // Wait until AuthContext has finished validating the stored token
    if (authLoading) return;

    if (!token) {
      // Not authenticated — redirect to login, return here after
      navigate('/login', { state: { from: `/order/${id}` }, replace: true });
      return;
    }

    getOrderById(id, token)
      .then(setOrder)
      .catch((err) => {
        if (err.status === 401) {
          navigate('/login', { state: { from: `/order/${id}` }, replace: true });
          return;
        }
        setError('Could not load order details. The order may not exist.');
      })
      .finally(() => setLoading(false));
  }, [id, token, authLoading, navigate]);

  // Show nothing while auth is still loading (prevents flash redirect)
  if (authLoading) return null;

  return (
    <div className="storefront-layout">
      <StoreNav />

      <main className="store-main detail-main">
        {loading && <div className="store-loading"><div className="spinner" /><p>Loading order…</p></div>}

        {error && (
          <div className="store-error">
            <p>⚠️ {error}</p>
            <Link to="/" className="btn-back">← Back to shop</Link>
          </div>
        )}

        {!loading && order && (
          <div className="order-confirm-card">
            <div className="order-confirm-icon">✅</div>
            <h1 className="order-confirm-title">Order Confirmed!</h1>
            <p className="order-confirm-sub">
              Thank you for your purchase. Your order <strong>#{order.id}</strong> has been placed successfully.
            </p>

            <div className="order-meta">
              <span>Status: <strong className="status-confirmed">{order.status}</strong></span>
              <span>Date: <strong>{new Date(order.createdAt).toLocaleString()}</strong></span>
              <span>Order Total: <strong>${order.total.toFixed(2)}</strong></span>
            </div>

            <div className="order-items-list">
              <h2>Items Ordered</h2>
              {order.items.map(item => (
                <div className="order-item-row" key={item.id}>
                  <div className="order-item-img">
                    {item.product.imageUrl
                      ? <img src={item.product.imageUrl} alt={item.product.name} />
                      : <span>🛍️</span>}
                  </div>
                  <div className="order-item-details">
                    <span className="order-item-name">{item.product.name}</span>
                    <span className="order-item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="order-item-price">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-confirm-actions">
              <Link to="/" className="btn-shop-now">Continue Shopping</Link>
            </div>
          </div>
        )}
      </main>

      <footer className="store-footer">
        <p>SmartShop &copy; 2026 &mdash; Quality products, delivered.</p>
      </footer>
    </div>
  );
}

export default OrderConfirmation;
