import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getAllProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import './storefront.css';
import './cart.css';

// ── Shared Nav ──────────────────────────────────────────────────────────────
export function StoreNav() {
  const { totalItems } = useCart();
  return (
    <header className="store-header">
      <div className="store-header-inner">
        <Link to="/" className="store-brand">
          🛒 <span>SmartShop</span>
        </Link>
        <nav className="store-nav">
          <Link to="/" className="nav-link">Shop</Link>
          <Link to="/cart" className="nav-cart" aria-label="Cart">
            🛍️
            {totalItems > 0 && (
              <span className="nav-cart-badge">{totalItems}</span>
            )}
          </Link>
          <Link to="/admin" className="nav-link admin-link">⚙️ Admin</Link>
        </nav>
      </div>
    </header>
  );
}

// ── Product Card ────────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const { addToCart, getQtyInCart } = useCart();
  const qtyInCart = getQtyInCart(product.id);
  const maxReached = qtyInCart >= product.stock;

  const stockLabel =
    product.stock === 0 ? 'Out of stock'
    : product.stock < 5 ? `Only ${product.stock} left`
    : 'In stock';

  const stockClass =
    product.stock === 0 ? 'out-of-stock'
    : product.stock < 5 ? 'low-stock' : '';

  const handleAdd = (e) => {
    e.preventDefault(); // don't navigate to detail page
    addToCart(product);
  };

  return (
    <Link to={`/product/${product.id}`} className="store-card">
      <div className="store-card-image">
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          : null}
        <div className="store-card-placeholder"
          style={{ display: product.imageUrl ? 'none' : 'flex' }}>🛍️</div>
      </div>

      <div className="store-card-body">
        <span className="store-category">{product.category}</span>
        <h3 className="store-card-title">{product.name}</h3>
        <p className="store-card-desc">{product.description}</p>

        <div className="store-card-footer">
          <div>
            <span className="store-price">${product.price.toFixed(2)}</span>
            <span className={`store-stock ${stockClass}`}>{stockLabel}</span>
          </div>
          <button
            className={`btn-add-cart ${qtyInCart > 0 ? 'in-cart' : ''}`}
            onClick={handleAdd}
            disabled={product.stock === 0 || maxReached}
          >
            {product.stock === 0 ? 'Unavailable'
              : maxReached ? `In cart (${qtyInCart})`
              : qtyInCart > 0 ? `Add more (${qtyInCart})`
              : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    stock: PropTypes.number.isRequired,
    imageUrl: PropTypes.string,
    category: PropTypes.string,
  }).isRequired,
};

// ── Main Storefront Home ────────────────────────────────────────────────────
function StorefrontHome() {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('All');
  const [sort, setSort]             = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
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

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))].filter(Boolean).sort();
    return ['All', ...cats];
  }, [products]);

  const displayed = useMemo(() => {
    let result = [...products];
    const q = search.trim().toLowerCase();
    if (q) result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
    if (category !== 'All') result = result.filter(p => p.category === category);
    switch (sort) {
      case 'price-asc':  result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name-asc':   result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default:           result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return result;
  }, [products, search, category, sort]);

  const handleReset = () => { setSearch(''); setCategory('All'); setSort('newest'); };
  const isFiltered = search || category !== 'All' || sort !== 'newest';

  return (
    <div className="storefront-layout">
      <StoreNav />

      <section className="store-hero">
        <h2>Discover Our Products</h2>
        <p>Explore our curated collection of quality items</p>
      </section>

      <main className="store-main">
        {/* Controls */}
        <div className="store-controls">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="store-search"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">×</button>
            )}
          </div>
          <select className="store-filter" value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="store-filter" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name-asc">Name: A → Z</option>
          </select>
          {isFiltered && <button className="store-reset" onClick={handleReset}>✕ Reset</button>}
        </div>

        {!loading && !error && (
          <p className="result-count">
            {displayed.length === 0
              ? 'No products match your filters'
              : `Showing ${displayed.length} product${displayed.length !== 1 ? 's' : ''}${isFiltered ? ' (filtered)' : ''}`}
          </p>
        )}

        {loading && <div className="store-loading"><div className="spinner" /><p>Loading products...</p></div>}
        {error && <div className="store-error"><p>⚠️ Could not load products. Please try again later.</p></div>}

        {!loading && !error && displayed.length > 0 && (
          <div className="store-grid">
            {displayed.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}

        {!loading && !error && displayed.length === 0 && (
          <div className="store-empty">
            <p>🎁 {isFiltered ? 'No products match your search.' : 'No products available yet.'}</p>
            {isFiltered && <button className="store-reset" onClick={handleReset}>Clear filters</button>}
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
