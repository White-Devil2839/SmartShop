import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { StoreNav } from './StorefrontHome';
import './storefront.css';

export default function WishlistPage() {
    const { items, remove } = useWishlist();
    const { addToCart } = useCart();

    const handleMoveToCart = (product) => {
        addToCart(product);
        remove(product.id);
    };

    return (
        <div className="storefront-layout">
            <StoreNav />

            <main className="store-main">
                <nav className="breadcrumb">
                    <Link to="/">Shop</Link>
                    <span className="breadcrumb-sep">›</span>
                    <span>Wishlist</span>
                </nav>

                <div className="wishlist-header">
                    <h1>Your Wishlist</h1>
                    <span className="wishlist-meta">{items.length} saved item{items.length !== 1 ? 's' : ''}</span>
                </div>

                {items.length === 0 ? (
                    <div className="wishlist-empty">
                        <div className="wishlist-empty-icon">♡</div>
                        <h2>Your wishlist is empty</h2>
                        <p>Browse products and save your favourites for later.</p>
                        <Link to="/" className="btn-shop-now">Browse Products</Link>
                    </div>
                ) : (
                    <div className="wishlist-grid">
                        {items.map(product => (
                            <div key={product.id} className="wishlist-card">
                                <div className="wishlist-card-image">
                                    {product.imageUrl
                                        ? <img src={product.imageUrl} alt={product.name}
                                            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                        : null}
                                    <div className="store-card-placeholder" style={{ display: product.imageUrl ? 'none' : 'flex' }}>🛍️</div>
                                    <button className="wishlist-remove-btn" onClick={() => remove(product.id)} aria-label="Remove from wishlist">✕</button>
                                </div>
                                <div className="wishlist-card-body">
                                    <span className="store-category">{product.category}</span>
                                    <Link to={`/product/${product.id}`} className="wishlist-card-name">{product.name}</Link>
                                    <span className="wishlist-card-price">${product.price.toFixed(2)}</span>
                                    {product.stock === 0
                                        ? <span className="store-stock out-of-stock">Out of stock</span>
                                        : product.stock < 5
                                            ? <span className="store-stock low-stock">Only {product.stock} left</span>
                                            : <span className="store-stock">In stock</span>
                                    }
                                    <div className="wishlist-card-actions">
                                        <button
                                            className="btn-add-cart"
                                            onClick={() => handleMoveToCart(product)}
                                            disabled={product.stock === 0}
                                        >
                                            {product.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                                        </button>
                                        <button className="btn-wishlist-remove" onClick={() => remove(product.id)}>
                                            Remove
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
