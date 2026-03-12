import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../services/orderService';
import { StoreNav } from './StorefrontHome';
import './storefront.css';
import './cart.css';

function QtyControl({ item }) {
  const { setQty, removeFromCart } = useCart();
  return (
    <div className="qty-control">
      <button className="qty-btn" onClick={() => setQty(item.id, item.qty - 1)} aria-label="Decrease">−</button>
      <span className="qty-value">{item.qty}</span>
      <button className="qty-btn" onClick={() => setQty(item.id, item.qty + 1)}
        disabled={item.qty >= item.stock} aria-label="Increase">+</button>
      <button className="qty-remove" onClick={() => removeFromCart(item.id)} aria-label="Remove">🗑</button>
    </div>
  );
}

QtyControl.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    qty: PropTypes.number.isRequired,
    stock: PropTypes.number.isRequired,
  }).isRequired,
};

function CartPage() {
  const { items, subtotal, totalItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError]     = useState(null);

  const isEmpty = items.length === 0;

  const handleCheckout = async () => {
    setCheckoutError(null);
    setCheckoutLoading(true);
    try {
      const orderItems = items.map(i => ({ productId: i.id, quantity: i.qty }));
      const order = await placeOrder(orderItems);
      clearCart();
      navigate(`/order/${order.id}`);
    } catch (err) {
      const msg = err.details?.length
        ? err.details.join('\n')
        : err.message;
      setCheckoutError(msg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="storefront-layout">
      <StoreNav />

      <main className="store-main cart-main">
        <nav className="breadcrumb">
          <Link to="/">Shop</Link>
          <span className="breadcrumb-sep">›</span>
          <span>Cart</span>
        </nav>

        <div className="cart-header">
          <h1 className="cart-title">
            Your Cart
            {totalItems > 0 && <span className="cart-count-badge">{totalItems}</span>}
          </h1>
          {!isEmpty && (
            <button className="btn-clear-cart" onClick={clearCart}>Clear cart</button>
          )}
        </div>

        {checkoutError && (
          <div className="checkout-error">
            <strong>⚠️ Could not place order:</strong>
            <pre>{checkoutError}</pre>
          </div>
        )}

        {isEmpty ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Discover our products and add something you love.</p>
            <Link to="/" className="btn-shop-now">Browse Products</Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items list */}
            <div className="cart-items">
              {items.map(item => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-image">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name}
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                      : null}
                    <div className="cart-thumb-placeholder"
                      style={{ display: item.imageUrl ? 'none' : 'flex' }}>🛍️</div>
                  </div>

                  <div className="cart-item-info">
                    <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                    <span className="cart-item-category">{item.category}</span>
                    <span className="cart-item-unit-price">${item.price.toFixed(2)} each</span>
                    {item.qty >= item.stock && (
                      <span className="cart-stock-warning">⚠️ Max stock reached</span>
                    )}
                  </div>

                  <div className="cart-item-right">
                    <QtyControl item={item} />
                    <span className="cart-item-total">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <aside className="cart-summary">
              <h2 className="summary-title">Order Summary</h2>
              <div className="summary-rows">
                {items.map(item => (
                  <div className="summary-row" key={item.id}>
                    <span>{item.name} × {item.qty}</span>
                    <span>${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-divider" />
              <div className="summary-row summary-total">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <p className="summary-note">Taxes and shipping calculated at checkout.</p>

              <button
                className="btn-checkout"
                onClick={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? 'Placing order...' : 'Proceed to Checkout'}
              </button>

              <Link to="/" className="btn-continue">← Continue Shopping</Link>
            </aside>
          </div>
        )}
      </main>

      <footer className="store-footer">
        <p>SmartShop &copy; 2026 &mdash; Quality products, delivered.</p>
      </footer>
    </div>
  );
}

export default CartPage;
