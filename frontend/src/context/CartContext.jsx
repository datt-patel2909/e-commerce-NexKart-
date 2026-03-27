import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated } = useAuth();

  const fetchCartCount = async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }
    try {
      const res = await apiFetch('/cart');
      const count = res.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
      setCartCount(count);
    } catch (err) {
      console.error('Error fetching cart count:', err);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [isAuthenticated]);

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
