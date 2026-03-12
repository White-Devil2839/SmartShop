import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getProductById } from '../services/productService';
import { useCart } from '../context/CartContext';
import { StoreNav } from './StorefrontHome';
import './storefront.css';
import './cart.css';

function StockBadge({ stock }) {
  if (stock === 0) return <span className="detail-stock out-of-stock">Out of stock</span>;
  if (stock < 5)  return <span className="detail-stock low-stock">Only {stock} left — order soon!</span>;
  return <span className="detail-stock in-stock">✓ In stock ({stock} available)</span>;
}

StockBadge.propTypes = { stock: PropTypes.number.isRequired };

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getQtyInCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [added, setAdded]     = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        if (!data.isActive) { navigate('/', { replace: true }); return; }
        setProduct(data);
      } catch {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const qtyInCart = product ? getQtyInCart(product.id) : 0;
  const maxReached = product ? qtyInCart >= product.stock : false;

  const handleAddToCart = () => {
    if (!product || maxReached) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="storefront-layout">
      <StoreNav />

      <main className="store-main detail-main">
        <nav className="breadcrumb">
          <Link to="/">Shop</Link>
          <span className="breadcrumb-sep">›</span>
          <span>{product ? product.name : 'Product'}</span>
        </nav>

        {loading && <div className="store-loading"><div className="spinner" /><p>Loading product...</p></div>}

        {error && (
          <div className="store-error">
            <p>⚠️ {error}</p>
            <Link to="/" className="btn-back">← Back to shop</Link>
          </div>
        )}

        {!loading && product && (
          <div className="detail-card">
            <div className="detail-image-wrap">
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name}
                    onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                : null}
              <div className="store-card-placeholder detail-placeholder"
                style={{ display: product.imageUrl ? 'none' : 'flex' }}>🛍️</div>
            </div>

            <div className="detail-info">
              <span className="store-category">{product.category}</span>
              <h1 className="detail-title">{product.name}</h1>
              <p className="detail-price">${product.price.toFixed(2)}</p>
              <StockBadge stock={product.stock} />
              <p className="detail-description">{product.description}</p>

              <div className="detail-meta">
                <span>Category: <strong>{product.category}</strong></span>
                <span>Updated: <strong>{new Date(product.updatedAt).toLocaleDateString()}</strong></span>
              </div>

              <div className="detail-actions">
                <button
                  className={`btn-add-cart btn-add-cart-lg ${added ? 'cart-success' : ''}`}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || maxReached}
                >
                  {product.stock === 0 ? 'Out of Stock'
                    : added ? '✓ Added!'
                    : maxReached ? `Max in cart (${qtyInCart})`
                    : qtyInCart > 0 ? `Add More (${qtyInCart} in cart)`
                    : 'Add to Cart'}
                </button>
                {qtyInCart > 0 && (
                  <Link to="/cart" className="btn-view-cart">View Cart →</Link>
                )}
                <Link to="/" className="btn-back">← Back to shop</Link>
              </div>
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

export default ProductDetail;
