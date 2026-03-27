import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageOpen } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';

const OrderTracking = ({ status }) => {
  if (status === 'cancelled') {
    return (
      <div style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '1rem', color: '#ef4444' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
          ✕
        </div>
        <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Order Cancelled</span>
      </div>
    );
  }

  const steps = [
    { id: 'pending', label: 'Order Placed', icon: '📦' },
    { id: 'shipped', label: 'Shipped', icon: '🚚' },
    { id: 'delivered', label: 'Delivered', icon: '✅' },
  ];

  const currentIndex = steps.findIndex(s => s.id === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div style={{ padding: '1.5rem 0 2.5rem', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '2.5rem', left: '16%', right: '16%', height: '4px', background: 'var(--glass-border)', zIndex: 0 }} />
      
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(activeIndex / (steps.length - 1)) * 68}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ position: 'absolute', top: '2.5rem', left: '16%', height: '4px', background: 'var(--primary)', zIndex: 1 }} 
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        {steps.map((step, index) => {
          const isActive = index <= activeIndex;
          return (
            <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32%' }}>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: isActive ? 'var(--primary)' : 'var(--glass-bg)',
                  border: `2px solid ${isActive ? 'var(--primary)' : 'var(--glass-border)'}`,
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  marginBottom: '0.75rem',
                  transition: 'all 0.3s ease'
                }}
              >
                {step.icon}
              </motion.div>
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                textAlign: 'center'
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await apiFetch('/order/my');
      setOrders(res.order || []);
    } catch (err) {
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    try {
      await apiFetch(`/order/cancel/${orderId}`, { method: 'PATCH' });
      addToast('Order cancelled successfully', 'success');
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
      addToast(err.message || 'Failed to cancel order', 'error');
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>Your Orders</h1>
      <style>{`
        .order-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem; }
        .order-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--glass-border); padding-top: 1rem; margin-top: 0.5rem; }
        @media (max-width: 768px) {
          .order-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
          .order-footer { flex-direction: column; gap: 0.5rem; align-items: flex-start; }
        }
      `}</style>

      {orders.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <PackageOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          You haven't placed any orders yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div
                key={order._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div className="order-header">
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Order ID: <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>ORD-{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div>
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => handleCancel(order._id)}
                        style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '1rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Visual Order Tracking */}
                <OrderTracking status={order.status} />

                <div style={{ display: 'grid', gap: '1rem', background: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderRadius: '0.75rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Order Items</h3>
                  {order.items?.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                        {item.quantity}x
                      </div>
                      <div style={{ flex: 1, fontWeight: 500 }}>{item.product?.name || 'Unknown Product'}</div>
                      <div style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{(item.product?.price || 0) * item.quantity}</div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    🕒 Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Total: <span style={{ color: 'var(--primary)' }}>₹{order.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
