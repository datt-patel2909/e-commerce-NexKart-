import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');
  const [page, setPage] = useState(1);
  const pageSize = 6;
  
  const { addToast } = useToast();

  useEffect(() => {
    setPage(1);
  }, [filterStatus, searchQuery, sortOrder]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await apiFetch('/order');
      setOrders(res.order || []);
    } catch (err) {
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await apiFetch(`/order/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setOrders(orders.map(order => order._id === orderId ? { ...order, status } : order));
      addToast(`Order marked as ${status}`);
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  let filteredOrders = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchSearch = String(o._id).toLowerCase().includes(searchQuery.toLowerCase()) || 
      String(o.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (sortOrder === 'latest') {
    filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    filteredOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <style>{`
        .admin-order-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem; }
        .admin-filters { display: flex; gap: 1rem; flex-wrap: wrap; }
        .admin-full-id { }
        @media (max-width: 768px) {
          .admin-order-header { flex-direction: column; align-items: stretch; gap: 0.75rem; }
          .admin-filters { flex-direction: column; }
          .admin-filters input, .admin-filters select { width: 100% !important; }
          .admin-full-id { display: none !important; }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Manage Orders</h2>
        
        <div className="admin-filters">
          <input 
            type="text" 
            placeholder="Search ID or Email..." 
            className="input-field" 
            style={{ width: '200px' }} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select 
            className="input-field" 
            style={{ width: '150px', cursor: 'pointer' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select 
            className="input-field" 
            style={{ width: '150px', cursor: 'pointer' }}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {loading ? <Loader /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AnimatePresence>
            {paginatedOrders.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No orders found matching the criteria.</p>
            ) : (
              paginatedOrders.map((order) => (
                <motion.div
                  key={order._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card"
                  style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                  <div className="admin-order-header">
                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Order ID: <span className="admin-full-id" style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{order._id}</span>
                        <span style={{ marginLeft: '0.75rem', background: 'var(--primary)', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>ORD-{order._id.slice(-8).toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Customer: {order.user?.email || 'Unknown User'} ({order.user?.name || 'Unknown User'})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Date: {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select
                      value={order.status}
                      disabled={order.status === 'cancelled' || order.status === 'delivered'}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      style={{
                        background: order.status === 'delivered' ? 'var(--primary)' : 
                                    order.status === 'cancelled' ? '#ef4444' : 'rgba(0,0,0,0.1)',
                        color: (order.status === 'delivered' || order.status === 'cancelled') ? 'white' : 'var(--text-primary)',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        border: '1px solid var(--glass-border)',
                        cursor: (order.status === 'delivered' || order.status === 'cancelled') ? 'not-allowed' : 'pointer',
                        textTransform: 'capitalize',
                        outline: 'none',
                        opacity: (order.status === 'delivered' || order.status === 'cancelled') ? 0.8 : 1
                      }}
                    >
                      <option value="pending" style={{ color: '#000', textTransform: 'capitalize' }}>Pending</option>
                      <option value="shipped" style={{ color: '#000', textTransform: 'capitalize' }}>Shipped</option>
                      <option value="delivered" style={{ color: '#000', textTransform: 'capitalize' }}>Delivered</option>
                      <option value="cancelled" style={{ color: '#000', textTransform: 'capitalize' }} disabled={order.status === 'delivered'}>Cancelled</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {order.items?.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
                      <div style={{ fontWeight: 600 }}>{item.quantity}x</div>
                      <div style={{ flex: 1 }}>{item.product?.name || 'Unknown Product'}</div>
                      <div>₹{(item.product?.price || 0) * item.quantity}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Total: <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>₹{order.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
              ))
            )}
          </AnimatePresence>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
              <button 
                className="btn-secondary" 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>
              <span style={{ display: 'flex', alignItems: 'center', fontWeight: '600' }}>
                Page {page} of {totalPages}
              </span>
              <button 
                className="btn-secondary" 
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
