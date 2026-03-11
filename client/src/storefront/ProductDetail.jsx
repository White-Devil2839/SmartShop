import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getProductById } from '../services/productService';
import { StoreNav } from './StorefrontHome';
import './storefront.css';

function StockBadge({ stock }) {
  if (stock === 0) return <span className="detail-stock out-of-stock">Out of stock</span>;
  if (stock < 5)  return <span className="detail-stock low-stock">Only {stock} left — order soon!</span>;
  return <span className="detail-stock in-stock">✓ In stock ({stock} available)</span>;
}

StockBadge.propTypes = { stock: PropTypes.number.isRequired };

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        // Hide inactive products from storefront
        if (!data.isActive) { navigate('/', { replace: true }); return; }
        setProduct(data);
      } catch {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  return (
    <div className="storefront-layout">
      <StoreNav />

      <main className="store-main detail-main">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Shop</Link>
          <span className="breadcrumb-sep">›</span>
          <span>{product ? product.name : 'Product'}</span>
        </nav>

        {/* Loading */}
        {loading && (
          <div className="store-loading">
            <div className="spinner" />
            <p>Loading product...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="store-error">
            <p>⚠️ {error}</p>
            <Link to="/" className="btn-back">← Back to shop</Link>
          </div>
        )}

        {/* Product */}
        {!loading && product && (
          <div className="detail-card">
            {/* Image */}
            <div className="detail-image-wrap">
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name}
                    onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                : null}
              <div className="store-card-placeholder detail-placeholder"
                style={{ display: product.imageUrl ? 'none' : 'flex' }}>
                🛍️
              </div>
            </div>

            {/* Info */}
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
                  className="btn-add-cart btn-add-cart-lg"
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
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
