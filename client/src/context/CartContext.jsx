import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const CART_KEY = 'smartshop_cart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  // Add or increment. Respects stock cap.
  const addToCart = useCallback((product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.qty + qty, product.stock);
        return prev.map(i => i.id === product.id ? { ...i, qty: newQty } : i);
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl || null,
        category: product.category,
        stock: product.stock,
        qty: Math.min(qty, product.stock),
      }];
    });
  }, []);

  // Set an exact quantity (0 = remove)
  const setQty = useCallback((id, qty) => {
    setItems(prev => {
      if (qty <= 0) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, qty: Math.min(qty, i.stock) } : i);
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal   = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Check if a product is already in cart
  const getQtyInCart = useCallback((id) => {
    const found = items.find(i => i.id === id);
    return found ? found.qty : 0;
  }, [items]);

  return (
    <CartContext.Provider value={{
      items, addToCart, setQty, removeFromCart, clearCart,
      totalItems, subtotal, getQtyInCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
