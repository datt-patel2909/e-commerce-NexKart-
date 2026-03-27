import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '' });
  const [imageFile, setImageFile] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiFetch('/product?limit=1000');
      setProducts(res.products);
    } catch (err) {
      addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use FormData for multipart/form-data upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (editingId) {
        await apiFetch(`/product/${editingId}`, {
          method: 'PUT',
          isFormData: true, // Signal our fetch utility not to stringify this
          body: submitData,
        });
        addToast('Product updated successfully', 'success');
      } else {
        await apiFetch('/product', {
          method: 'POST',
          isFormData: true,
          body: submitData,
        });
        addToast('Product created successfully', 'success');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', description: '', price: '', category: '' });
      setImageFile(null);
      fetchProducts();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || ''
    });
    setImageFile(null); // Reset file input when editing
    setEditingId(product._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiFetch(`/product/${id}`, { method: 'DELETE' });
      addToast('Product deleted');
      fetchProducts();
    } catch (err) {
      addToast('Failed to delete product', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem' }}>Manage Products</h2>
        <button 
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', description: '', price: '', category: '' });
            setImageFile(null);
            setShowModal(true);
          }}
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {loading ? <Loader /> : (
        <>
          <style>{`
            .admin-product-grid {
              display: grid;
              gap: 1rem;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            }
            @media (max-width: 768px) {
              .admin-product-grid {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
              }
              .admin-modal-content {
                margin: 1rem !important;
                max-width: calc(100% - 2rem) !important;
              }
            }
          `}</style>
          <div className="admin-product-grid">
          <AnimatePresence>
            {products.map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
              >
                <img 
                  src={product.image || '/fallback.png'} 
                  alt={product.name} 
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem' }} 
                  onError={(e) => {
                    if (e.target.src !== window.location.origin + '/fallback.png') {
                      e.target.src = '/fallback.png';
                    }
                  }}
                />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '1rem' }}>₹{product.price}</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button className="btn-secondary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => handleEdit(product)}><Edit2 size={16} style={{ margin: '0 auto' }} /></button>
                  <button className="btn-secondary" style={{ flex: 1, padding: '0.5rem', color: 'var(--secondary)' }} onClick={() => handleDelete(product._id)}><Trash2 size={16} style={{ margin: '0 auto' }} /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          </div>
        </>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card admin-modal-content" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'var(--bg-color)', position: 'relative' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{editingId ? 'Edit Product' : 'New Product'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" className="input-field" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <textarea className="input-field" placeholder="Description" rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="number" className="input-field" placeholder="Price" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required style={{ flex: 1 }} />
                <select 
                  className="input-field" 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})} 
                  required 
                  style={{ flex: 1, cursor: 'pointer' }}
                >
                  <option value="" disabled>Select Category</option>
                  <option value="electroincs">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home</option>
                  <option value="books">Books</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Product Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="input-field" 
                  onChange={(e) => setImageFile(e.target.files[0])} 
                  style={{ padding: '0.5rem' }}
                />
                {editingId && !imageFile && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Leave empty to keep existing image</span>}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
