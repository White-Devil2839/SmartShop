import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getProductById } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { StoreNav } from './StorefrontHome';
import './storefront.css';

// ── Helpers (same as StorefrontHome) ─────────────────────────────────────────
const getMockRating  = (id) => [3.5,3.7,3.8,4.0,4.1,4.2,4.3,4.5,4.6,4.8][id % 10];
const getMockReviews = (id) => ((id * 47 + 13) % 450) + 12;

function Stars({ rating, count }) {
    const full = Math.floor(rating);
    const half = (rating - full) >= 0.5;
    return (
        <div className="star-row detail-stars">
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className={`star ${i <= full ? 'star-on' : i === full + 1 && half ? 'star-half' : 'star-off'}`}>★</span>
            ))}
            <span className="star-count">{rating.toFixed(1)} · {count.toLocaleString()} reviews</span>
        </div>
    );
}

Stars.propTypes = { rating: PropTypes.number.isRequired, count: PropTypes.number.isRequired };

function StockBadge({ stock }) {
    if (stock === 0) return <span className="detail-stock out-of-stock">Out of stock</span>;
    if (stock < 5)  return <span className="detail-stock low-stock">⚠️ Only {stock} left — order soon!</span>;
    return <span className="detail-stock in-stock">✓ In stock ({stock} available)</span>;
}

StockBadge.propTypes = { stock: PropTypes.number.isRequired };

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, getQtyInCart } = useCart();
    const { toggle, isWishlisted } = useWishlist();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [added, setAdded]     = useState(false);

    useEffect(() => {
        getProductById(id)
            .then(data => {
                if (!data.isActive) { navigate('/', { replace: true }); return; }
                setProduct(data);
            })
            .catch(() => setError('Product not found.'))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const qtyInCart  = product ? getQtyInCart(product.id) : 0;
    const maxReached = product ? qtyInCart >= product.stock : false;
    const wishlisted = product ? isWishlisted(product.id) : false;

    const handleAddToCart = () => {
        if (!product || maxReached) return;
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    // Buy Now: add to cart then go straight to cart
    const handleBuyNow = () => {
        if (!product || product.stock === 0) return;
        if (!maxReached) addToCart(product);
        navigate('/cart');
    };

    const handleWishlist = () => product && toggle(product);

    return (
        <div className="storefront-layout">
            <StoreNav />

            <main className="store-main detail-main">
                <nav className="breadcrumb">
                    <Link to="/">Shop</Link>
                    <span className="breadcrumb-sep">›</span>
                    {product && <Link to={`/?category=${product.category}`}>{product.category}</Link>}
                    {product && <span className="breadcrumb-sep">›</span>}
                    <span>{product ? product.name : 'Product'}</span>
                </nav>

                {loading && <div className="store-loading"><div className="spinner" /><p>Loading product…</p></div>}

                {error && (
                    <div className="store-error">
                        <p>⚠️ {error}</p>
                        <Link to="/" className="btn-back">← Back to shop</Link>
                    </div>
                )}

                {!loading && product && (
                    <div className="detail-card">
                        {/* Image */}
                        <div className="detail-image-wrap">
                            {product.imageUrl
                                ? <img src={product.imageUrl} alt={product.name}
                                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                : null}
                            <div className="store-card-placeholder detail-placeholder"
                                style={{ display: product.imageUrl ? 'none' : 'flex' }}>🛍️</div>

                            {/* Wishlist button on image */}
                            <button
                                className={`detail-wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
                                onClick={handleWishlist}
                                aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                            >
                                {wishlisted ? '♥' : '♡'}
                                <span>{wishlisted ? 'Saved' : 'Save'}</span>
                            </button>
                        </div>

                        {/* Info */}
                        <div className="detail-info">
                            <span className="store-category">{product.category}</span>
                            <h1 className="detail-title">{product.name}</h1>

                            <Stars
                                rating={getMockRating(product.id)}
                                count={getMockReviews(product.id)}
                            />

                            <p className="detail-price">${product.price.toFixed(2)}</p>
                            <StockBadge stock={product.stock} />
                            <p className="detail-description">{product.description}</p>

                            <div className="detail-meta">
                                <span>Category: <strong>{product.category}</strong></span>
                                <span>Last updated: <strong>{new Date(product.updatedAt).toLocaleDateString()}</strong></span>
                            </div>

                            {/* Action buttons */}
                            <div className="detail-actions">
                                <button
                                    className="btn-buy-now"
                                    onClick={handleBuyNow}
                                    disabled={product.stock === 0}
                                >
                                    {product.stock === 0 ? 'Out of Stock' : '⚡ Buy Now'}
                                </button>
                                <button
                                    className={`btn-add-cart btn-add-cart-lg ${added ? 'cart-success' : qtyInCart > 0 ? 'in-cart' : ''}`}
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0 || maxReached}
                                >
                                    {product.stock === 0 ? 'Out of Stock'
                                        : added ? '✓ Added!'
                                        : maxReached ? `Max in cart (${qtyInCart})`
                                        : qtyInCart > 0 ? `Add More (${qtyInCart} in cart)`
                                        : 'Add to Cart'}
                                </button>
                            </div>

                            {qtyInCart > 0 && (
                                <Link to="/cart" className="btn-view-cart">View Cart ({qtyInCart}) →</Link>
                            )}
                            <Link to="/" className="btn-back">← Back to shop</Link>
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
