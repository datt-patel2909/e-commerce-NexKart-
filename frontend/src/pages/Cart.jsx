import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [undoItem, setUndoItem] = useState(null);
  
  const { addToast } = useToast();
  const { fetchCartCount } = useCart();

  useEffect(() => {
    let timeoutId;
    if (undoItem) {
      timeoutId = setTimeout(() => {
        setUndoItem(null);
      }, 4000);
    }
    return () => clearTimeout(timeoutId);
  }, [undoItem]);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await apiFetch('/cart');
      setCartItems(res.items || []);
    } catch (err) {
      addToast('Failed to load cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await apiFetch(`/cart/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: newQuantity }),
      });
      setCartItems(cartItems.map(item => 
        item.product?._id === productId ? { ...item, quantity: newQuantity } : item
      ));
      fetchCartCount();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const removeItem = async (productId, currentQuantity, productData) => {
    try {
      await apiFetch(`/cart/${productId}`, { method: 'DELETE' });
      setCartItems(cartItems.filter(item => item.product?._id !== productId));
      setUndoItem({ productId, quantity: currentQuantity, product: productData });
      fetchCartCount();
    } catch (err) {
      addToast('Failed to remove item', 'error');
    }
  };

  const handleUndo = async () => {
    if (!undoItem) return;
    try {
      await apiFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId: undoItem.productId, quantity: undoItem.quantity }),
      });
      fetchCart();
      fetchCartCount();
      setUndoItem(null);
    } catch (err) {
      addToast('Failed to undo', 'error');
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await apiFetch('/order', { method: 'POST' });
      setCartItems([]);
      fetchCartCount();
      addToast('Redirecting to secure checkout...', 'success');
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <Loader />;

  const total = cartItems.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);

  return (
    <div style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
      <style>{`
        .cart-item { display: flex; gap: 1.5rem; padding: 1.5rem; align-items: center; }
        .cart-checkout { display: flex; justify-content: space-between; align-items: center; }
        @media (max-width: 768px) {
          .cart-item { flex-direction: column; align-items: stretch; gap: 1rem; padding: 1rem; }
          .cart-item-info { display: flex; align-items: center; gap: 1rem; }
          .cart-item-img { width: 80px !important; height: 80px !important; min-width: 80px !important; }
          .cart-item-controls { display: flex; justify-content: space-between; align-items: center; }
          .cart-checkout { flex-direction: column; gap: 1rem; align-items: stretch; text-align: center; }
        }
      `}</style>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Your cart is empty.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.product?._id || item._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -100 }}
                className="glass-card cart-item"
              >
                <div className="cart-item-info">
                  <img 
                    src={item.product?.image || '/fallback.png'} 
                    alt={item.product?.name || 'Unknown Product'}
                    className="cart-item-img"
                    style={{ width: '100px', height: '100px', minWidth: '100px', flexShrink: 0, objectFit: 'cover', borderRadius: '0.5rem' }}
                    onError={(e) => { 
                      if (!e.target.src.endsWith('/fallback.png')) {
                        e.target.src = '/fallback.png'; 
                      }
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.product?.name || 'Unknown'}</h3>
                    <div style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{item.product?.price || 0}</div>
                  </div>
                </div>

                <div className="cart-item-controls">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.05)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                    <button 
                      onClick={() => updateQuantity(item.product?._id, item.quantity - 1)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--text-primary)' }}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ fontWeight: 600, minWidth: '1.5rem', textAlign: 'center' }}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product?._id, item.quantity + 1)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--text-primary)' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeItem(item.product?._id, item.quantity, item.product)}
                    style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', padding: '0.5rem' }}
                    title="Remove item"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="glass-card cart-checkout" style={{ marginTop: '2rem', padding: '1.5rem' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Amount</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>₹{total.toFixed(2)}</div>
            </div>
            <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        </div>
      )}

      {/* Undo Toast */}
      {undoItem && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#111',
          color: '#fff',
          padding: '12px 18px',
          borderRadius: '8px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          Item removed 
          <button 
            onClick={handleUndo} 
            style={{ 
              background: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              padding: '4px 12px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
