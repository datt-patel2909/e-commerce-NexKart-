import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useFilters } from '../context/FilterContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  const { search, category, sort, minPrice, maxPrice, page, setPage } = useFilters();
  const { fetchCartCount } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [search, category, sort, minPrice, maxPrice, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/product?page=${page}&limit=12&`;
      if (search) url += `search=${search}&`;
      if (category) url += `category=${category}&`;
      if (sort) url += `sort=${sort}&`;
      if (minPrice) url += `minPrice=${minPrice}&`;
      if (maxPrice) url += `maxPrice=${maxPrice}&`;
      
      const res = await apiFetch(url);
      setProducts(res.products);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!localStorage.getItem('token')) {
      addToast('Please login to add items to cart', 'error');
      return;
    }
    try {
      await apiFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      fetchCartCount();
      addToast('Added to cart!');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleBuyNow = async (productId) => {
    const qty = window.prompt("Enter quantity", "1");
    if (!qty) return;
    
    const quantity = Number(qty);
    if (isNaN(quantity) || quantity < 1) {
      addToast('Invalid quantity', 'error');
      return;
    }

    try {
      await apiFetch('/order/buy-now', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
      addToast('Order placed successfully!', 'success');
      navigate('/orders');
    } catch (err) {
      addToast(err.message || 'Order failed', 'error');
    }
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Discover
      </h1>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          No products found.
        </div>
      ) : (
        <>
          <style>{`
            .product-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
              gap: 2rem;
            }
            @media (max-width: 768px) {
              .product-grid {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 1rem;
              }
            }
          `}</style>
          <motion.div layout className="product-grid">
            <AnimatePresence>
              {products.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  onAddToCart={handleAddToCart} 
                  onBuyNow={handleBuyNow}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}

      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
          <button 
            className="btn-secondary" 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', fontWeight: '600' }}>
            Page {page} of {totalPages === 0 ? 1 : totalPages}
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
  );
}
