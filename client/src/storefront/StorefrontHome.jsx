import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts } from '../services/productService';
import './storefront.css';

function StorefrontHome() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Storefront ONLY shows active products
        const data = await getAllProducts({ isActive: true });
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="storefront-layout">
      {/* Navigation */}
      <header className="store-header">
        <div className="store-header-inner">
          <Link to="/" className="store-brand">
            🛒 <span>SmartShop</span>
          </Link>
          <nav className="store-nav">
            <Link to="/" className="nav-link active">Shop</Link>
            <Link to="/admin" className="nav-link admin-link">⚙️ Admin</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="store-hero">
        <h2>Discover Our Products</h2>
        <p>Explore our curated collection of quality items</p>
      </section>

      {/* Products Grid */}
      <main className="store-main">
        {loading && (
          <div className="store-loading">
            <div className="spinner" />
            <p>Loading products...</p>
          </div>
        )}

        {error && (
          <div className="store-error">
            <p>⚠️ Could not load products. Please try again later.</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="store-empty">
            <p>🎁 No products available right now. Check back soon!</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="store-grid">
            {products.map((product) => (
              <div className="store-card" key={product.id}>
                <div className="store-card-image">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div className="store-card-placeholder" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
                    🛍️
                  </div>
                </div>

                <div className="store-card-body">
                  <span className="store-category">{product.category}</span>
                  <h3 className="store-card-title">{product.name}</h3>
                  <p className="store-card-desc">{product.description}</p>

                  <div className="store-card-footer">
                    <div>
                      <span className="store-price">${product.price.toFixed(2)}</span>
                      <span className={`store-stock ${product.stock === 0 ? 'out-of-stock' : product.stock < 5 ? 'low-stock' : ''}`}>
                        {product.stock === 0 ? 'Out of stock' : product.stock < 5 ? `Only ${product.stock} left` : 'In stock'}
                      </span>
                    </div>
                    <button
                      className="btn-add-cart"
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Unavailable' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="store-footer">
        <p>SmartShop &copy; 2026 &mdash; Quality products, delivered.</p>
      </footer>
    </div>
  );
}

export default StorefrontHome;
