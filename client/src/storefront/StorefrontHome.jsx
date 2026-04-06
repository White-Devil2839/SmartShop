import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getAllProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './storefront.css';

// ── Helpers ───────────────────────────────────────────────────────────────────
const RATINGS = [3.5, 3.7, 3.8, 4.0, 4.1, 4.2, 4.3, 4.5, 4.6, 4.8];
const getMockRating  = (id) => RATINGS[id % RATINGS.length];
const getMockReviews = (id) => ((id * 47 + 13) % 450) + 12;

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ rating, count }) {
    const full = Math.floor(rating);
    const half = (rating - full) >= 0.5;
    return (
        <div className="star-row">
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className={`star ${i <= full ? 'star-on' : (i === full + 1 && half ? 'star-half' : 'star-off')}`}>★</span>
            ))}
            <span className="star-count">({count.toLocaleString()})</span>
        </div>
    );
}
Stars.propTypes = { rating: PropTypes.number.isRequired, count: PropTypes.number.isRequired };

// ── Nav ───────────────────────────────────────────────────────────────────────
export function StoreNav() {
    const { totalItems } = useCart();
    const { count: wishlistCount } = useWishlist();
    return (
        <header className="store-header">
            <div className="store-header-inner">
                <Link to="/" className="store-brand">🛒 <span>SmartShop</span></Link>
                <nav className="store-nav">
                    <Link to="/" className="nav-link">Shop</Link>
                    <Link to="/wishlist" className="nav-icon-btn" aria-label="Wishlist">
                        <span className="nav-heart">♡</span>
                        {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
                        <span className="nav-label">Wishlist</span>
                    </Link>
                    <Link to="/cart" className="nav-icon-btn" aria-label="Cart">
                        <span>🛍️</span>
                        {totalItems > 0 && <span className="nav-badge">{totalItems}</span>}
                        <span className="nav-label">Cart</span>
                    </Link>
                    <Link to="/admin" className="nav-link admin-link">⚙️ Admin</Link>
                </nav>
            </div>
        </header>
    );
}

// ── Deals Banner ──────────────────────────────────────────────────────────────
function DealsBanner({ products }) {
    const deals = useMemo(() => (
        [...products].filter(p => p.stock > 0).sort((a, b) => b.stock - a.stock).slice(0, 4)
    ), [products]);

    if (!deals.length) return null;

    return (
        <section className="deals-banner">
            <div className="deals-inner">
                <div className="deals-header">
                    <h2 className="deals-title">🔥 Today&apos;s Deals</h2>
                    <span className="deals-subtitle">Limited time offers</span>
                </div>
                <div className="deals-grid">
                    {deals.map(product => {
                        const discountPct = 10 + ((product.id * 7) % 30);
                        const originalPrice = +(product.price * (1 + discountPct / 100)).toFixed(2);
                        return (
                            <Link key={product.id} to={`/product/${product.id}`} className="deal-card">
                                <div className="deal-badge">-{discountPct}%</div>
                                <div className="deal-image">
                                    {product.imageUrl
                                        ? <img src={product.imageUrl} alt={product.name}
                                            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                        : null}
                                    <div className="deal-placeholder" style={{ display: product.imageUrl ? 'none' : 'flex' }}>🛍️</div>
                                </div>
                                <div className="deal-info">
                                    <div className="deal-name">{product.name}</div>
                                    <Stars rating={getMockRating(product.id)} count={getMockReviews(product.id)} />
                                    <div className="deal-pricing">
                                        <span className="deal-price">${product.price.toFixed(2)}</span>
                                        <span className="deal-original">${originalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
DealsBanner.propTypes = { products: PropTypes.array.isRequired };

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, isNew, isBestValue }) {
    const { addToCart, getQtyInCart } = useCart();
    const { toggle, isWishlisted } = useWishlist();
    const qtyInCart  = getQtyInCart(product.id);
    const maxReached = qtyInCart >= product.stock;
    const wishlisted = isWishlisted(product.id);
    const rating     = getMockRating(product.id);
    const reviews    = getMockReviews(product.id);

    const handleAdd = (e) => { e.preventDefault(); addToCart(product); };
    const handleWishlist = (e) => { e.preventDefault(); toggle(product); };

    const stockClass = product.stock === 0 ? 'out-of-stock' : product.stock < 5 ? 'low-stock' : '';
    const stockLabel = product.stock === 0 ? 'Out of stock' : product.stock < 5 ? `Only ${product.stock} left` : 'In stock';

    return (
        <Link to={`/product/${product.id}`} className="store-card">
            <div className="store-card-image">
                {product.imageUrl
                    ? <img src={product.imageUrl} alt={product.name}
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    : null}
                <div className="store-card-placeholder" style={{ display: product.imageUrl ? 'none' : 'flex' }}>🛍️</div>

                <div className="card-badges">
                    {isNew && <span className="badge badge-new">New</span>}
                    {isBestValue && !isNew && <span className="badge badge-deal">Best Value</span>}
                    {product.stock > 0 && product.stock < 5 && <span className="badge badge-low">Low Stock</span>}
                    {product.stock === 0 && <span className="badge badge-oos">Out of Stock</span>}
                </div>

                <button
                    className={`card-wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
                    onClick={handleWishlist}
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                    {wishlisted ? '♥' : '♡'}
                </button>
            </div>

            <div className="store-card-body">
                <span className="store-category">{product.category}</span>
                <h3 className="store-card-title">{product.name}</h3>
                <Stars rating={rating} count={reviews} />
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
        createdAt: PropTypes.string,
    }).isRequired,
    isNew: PropTypes.bool,
    isBestValue: PropTypes.bool,
};

// ── Main ──────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

function StorefrontHome() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [search, setSearch]     = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort]         = useState('newest');
    const [page, setPage]         = useState(1);
    const [suggestions, setSuggestions] = useState([]);
    const [showSug, setShowSug]         = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        getAllProducts({ isActive: true })
            .then(setProducts)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    // Autocomplete — debounced 250 ms
    useEffect(() => {
        if (!search.trim()) { setSuggestions([]); setShowSug(false); return; }
        const t = setTimeout(() => {
            const q = search.trim().toLowerCase();
            const matches = products.filter(p =>
                p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
            ).slice(0, 7);
            setSuggestions(matches);
            setShowSug(matches.length > 0);
        }, 250);
        return () => clearTimeout(t);
    }, [search, products]);

    // Close autocomplete on outside click
    useEffect(() => {
        const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSug(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const categories = useMemo(() => {
        const cats = [...new Set(products.map(p => p.category))].filter(Boolean).sort();
        return ['All', ...cats];
    }, [products]);

    const categoryCounts = useMemo(() => {
        const m = {};
        for (const p of products) if (p.category) m[p.category] = (m[p.category] || 0) + 1;
        return m;
    }, [products]);

    // Best-value: lowest-price per category
    const bestValueIds = useMemo(() => {
        const m = {};
        for (const p of products) {
            if (!m[p.category] || p.price < m[p.category].price) m[p.category] = p;
        }
        return new Set(Object.values(m).map(p => p.id));
    }, [products]);

    const sevenDaysAgo = useMemo(() => Date.now() - 7 * 24 * 60 * 60 * 1000, []);

    const displayed = useMemo(() => {
        let r = [...products];
        const q = search.trim().toLowerCase();
        if (q) r = r.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
        if (category !== 'All') r = r.filter(p => p.category === category);
        switch (sort) {
            case 'price-asc':  r.sort((a, b) => a.price - b.price); break;
            case 'price-desc': r.sort((a, b) => b.price - a.price); break;
            case 'name-asc':   r.sort((a, b) => a.name.localeCompare(b.name)); break;
            default:           r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return r;
    }, [products, search, category, sort]);

    const totalPages = Math.ceil(displayed.length / PAGE_SIZE);
    const paginated  = displayed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const isFiltered = search || category !== 'All' || sort !== 'newest';

    const handleReset  = () => { setSearch(''); setCategory('All'); setSort('newest'); setPage(1); };
    const handleCatClick = (c) => { setCategory(c); setPage(1); };
    const handleSugClick = (p) => { setSearch(p.name); setShowSug(false); setPage(1); };

    return (
        <div className="storefront-layout">
            <StoreNav />
            <DealsBanner products={products} />

            <div className="store-body">
                {/* ── Sidebar ── */}
                <aside className="store-sidebar">
                    {/* Search + autocomplete */}
                    <div className="sidebar-section">
                        <h4 className="sidebar-heading">Search</h4>
                        <div className="search-wrapper" ref={searchRef}>
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                className="store-search"
                                placeholder="Search products…"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                onFocus={() => suggestions.length && setShowSug(true)}
                            />
                            {search && (
                                <button className="search-clear" onClick={() => { setSearch(''); setShowSug(false); }} aria-label="Clear">×</button>
                            )}
                            {showSug && (
                                <div className="autocomplete-dropdown">
                                    {suggestions.map(p => (
                                        <button key={p.id} className="autocomplete-item" onClick={() => handleSugClick(p)}>
                                            <span className="autocomplete-name">{p.name}</span>
                                            <span className="autocomplete-category">{p.category}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="sidebar-section">
                        <h4 className="sidebar-heading">Department</h4>
                        <ul className="sidebar-cat-list">
                            {categories.map(c => (
                                <li key={c}>
                                    <button
                                        className={`sidebar-cat-btn ${category === c ? 'active' : ''}`}
                                        onClick={() => handleCatClick(c)}
                                    >
                                        <span>{c}</span>
                                        <span className="cat-count">{c === 'All' ? products.length : (categoryCounts[c] || 0)}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Sort */}
                    <div className="sidebar-section">
                        <h4 className="sidebar-heading">Sort By</h4>
                        <div className="sidebar-sort">
                            {[
                                { value: 'newest',     label: 'Newest First' },
                                { value: 'price-asc',  label: 'Price: Low → High' },
                                { value: 'price-desc', label: 'Price: High → Low' },
                                { value: 'name-asc',   label: 'Name: A → Z' },
                            ].map(o => (
                                <label key={o.value} className="sort-radio">
                                    <input
                                        type="radio"
                                        name="sort"
                                        value={o.value}
                                        checked={sort === o.value}
                                        onChange={() => { setSort(o.value); setPage(1); }}
                                    />
                                    {o.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    {isFiltered && (
                        <button className="store-reset sidebar-reset" onClick={handleReset}>✕ Clear all filters</button>
                    )}
                </aside>

                {/* ── Content ── */}
                <section className="store-content">
                    {!loading && !error && (
                        <p className="result-count">
                            {displayed.length === 0
                                ? 'No products match your filters'
                                : `${displayed.length} result${displayed.length !== 1 ? 's' : ''}${isFiltered ? ' (filtered)' : ''}`}
                        </p>
                    )}

                    {loading && <div className="store-loading"><div className="spinner" /><p>Loading products…</p></div>}
                    {error   && <div className="store-error"><p>⚠️ Could not load products. Please try again later.</p></div>}

                    {!loading && !error && paginated.length > 0 && (
                        <div className="store-grid">
                            {paginated.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    isNew={product.createdAt && new Date(product.createdAt).getTime() > sevenDaysAgo}
                                    isBestValue={bestValueIds.has(product.id)}
                                />
                            ))}
                        </div>
                    )}

                    {!loading && !error && displayed.length === 0 && (
                        <div className="store-empty">
                            <p>🎁 {isFiltered ? 'No products match your filters.' : 'No products available yet.'}</p>
                            {isFiltered && <button className="store-reset" onClick={handleReset}>Clear filters</button>}
                        </div>
                    )}

                    {!loading && !error && totalPages > 1 && (
                        <div className="store-pagination">
                            <button className="store-page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
                            <button className="store-page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                                .reduce((acc, p, idx, arr) => {
                                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, i) => p === '…'
                                    ? <span key={`e-${i}`} className="pagination-info">…</span>
                                    : <button key={p} className={`store-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                                )}
                            <button className="store-page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
                            <button className="store-page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
                        </div>
                    )}
                </section>
            </div>

            <footer className="store-footer">
                <div className="footer-inner">
                    <p className="footer-brand">🛒 SmartShop</p>
                    <p>Quality products, delivered. &copy; 2026</p>
                </div>
            </footer>
        </div>
    );
}

export default StorefrontHome;
