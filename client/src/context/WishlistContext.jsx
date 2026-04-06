import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'smartshop_wishlist';

export function WishlistProvider({ children }) {
    const [items, setItems] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const persist = (next) => {
        setItems(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    };

    const toggle = useCallback((product) => {
        setItems(prev => {
            const exists = prev.some(p => p.id === product.id);
            const next = exists ? prev.filter(p => p.id !== product.id) : [...prev, product];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const remove = useCallback((id) => {
        setItems(prev => {
            const next = prev.filter(p => p.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const isWishlisted = useCallback((id) => items.some(p => p.id === id), [items]);

    return (
        <WishlistContext.Provider value={{ items, toggle, remove, isWishlisted, count: items.length }}>
            {children}
        </WishlistContext.Provider>
    );
}

WishlistProvider.propTypes = { children: PropTypes.node.isRequired };

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
    return ctx;
}
