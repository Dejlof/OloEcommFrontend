// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cart as cartApi, products as productsApi } from '../api/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems]   = useState([]);   // CartItem[]
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  // ── Load cart from server when user logs in ───────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setItems([]); return; }
    setLoading(true);
    try {
      const data = await cartApi.getMine({ pageNumber: 1, pageSize: 100 });
      const cartItems = data?.items ?? data ?? [];
      const withPrices = await Promise.all(
        cartItems.map(async item => {
          if (item.price != null) return item;
          try {
            const product = await productsApi.getById(item.productId);
            return { ...item, price: product?.price ?? 0 };
          } catch {
            return { ...item, price: 0 };
          }
        })
      );
      setItems(withPrices);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  // ── Add to cart ───────────────────────────────────────────────────────────────
  const addToCart = useCallback(async (productId, quantity = 1) => {
    setError(null);
    try {
      await cartApi.add(productId, quantity);
      await fetchCart(); // re-sync from server
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchCart]);

  // ── Update quantity ───────────────────────────────────────────────────────────
  const updateQuantity = useCallback(async (productId, quantity) => {
    setError(null);
    try {
      await cartApi.update(productId, quantity);
      await fetchCart();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchCart]);

  // ── Remove item ───────────────────────────────────────────────────────────────
  const removeFromCart = useCallback(async (productId) => {
    setError(null);
    try {
      await cartApi.remove(productId);
      setItems(prev => prev.filter(i => i.productId !== productId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // ── Clear cart ────────────────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    try {
      await cartApi.clear();
      setItems([]);
    } catch {}
  }, []);

  const totalItems   = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount  = items.reduce((sum, i) => sum + i.quantity * (i.price ?? 0), 0);

  return (
    <CartContext.Provider value={{
      items, loading, error,
      totalItems, totalAmount,
      addToCart, updateQuantity, removeFromCart, clearCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
  