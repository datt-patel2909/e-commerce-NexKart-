import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Check, MessageSquare } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();
  const { fetchCartCount } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProductAndReviews();
  }, [id]);

  const fetchProductAndReviews = async () => {
    setLoading(true);
    try {
      const [productRes, reviewsRes] = await Promise.all([
        apiFetch(`/product/${id}`),
        apiFetch(`/review/${id}`)
      ]);
      setProduct(productRes.product);
      setReviews(reviewsRes.reviews);
      if (productRes.product.colors && productRes.product.colors.length > 0) {
        setSelectedColor(productRes.product.colors[0]);
      }
    } catch (err) {
      addToast(err.message, 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      addToast('Please login to add items to cart', 'error');
      return;
    }
    try {
      await apiFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });
      fetchCartCount();
      addToast('Added to cart!');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      addToast('Please login to buy items', 'error');
      return;
    }
    const qty = window.prompt("Enter quantity", "1");
    if (!qty) return;
    
    const quantity = Number(qty);
    if (isNaN(quantity) || quantity < 1) {
      addToast('Invalid quantity', 'error');
      return;
    }

    try {
      const res = await apiFetch('/order/buy-now', {
        method: 'POST',
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });
      addToast('Redirecting to secure checkout...', 'success');
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      addToast(err.message || 'Order failed', 'error');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingReview(true);
    try {
      await apiFetch('/review', {
        method: 'POST',
        body: JSON.stringify({
          product: product._id,
          rating,
          comment
        })
      });
      addToast('Review submitted successfully!');
      setComment('');
      setRating(5);
      fetchProductAndReviews();
    } catch (err) {
      addToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader /></div>;
  if (!product) return null;

  return (
    <div style={{ padding: '2rem 0', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        .pd-meta { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .pd-actions { display: flex; gap: 1rem; margin-top: auto; }
        @media (max-width: 768px) {
          .pd-wrapper { gap: 1.5rem !important; padding: 1rem !important; }
          .pd-title { font-size: 1.5rem !important; }
          .pd-price { font-size: 1.75rem !important; }
          .pd-actions { flex-direction: column; }
          .pd-actions button { width: 100%; }
          .pd-desc { font-size: 0.95rem !important; }
        }
      `}</style>
      {/* Top Section: Product Details */}
      <div className="glass-card pd-wrapper" style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', padding: '2rem', marginBottom: '3rem' }}>
        
        {/* Left: Image */}
        <div style={{ flex: '1 1 400px', borderRadius: '1rem', overflow: 'hidden', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <motion.img 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src={product.image} 
            alt={product.name} 
            style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }}
          />
        </div>

        {/* Right: Info */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <h1 className="pd-title" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {product.name}
            </h1>
          </div>

          <div className="pd-meta">
            <div style={{ display: 'flex', alignItems: 'center', color: '#fbbf24' }}>
              <Star fill="#fbbf24" size={20} />
              <span style={{ marginLeft: '0.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {product.averageRating || 0}
              </span>
            </div>
            <span style={{ color: 'var(--text-secondary)' }}>({product.numOfReviews || 0} reviews)</span>
            <span style={{ color: product.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 600, background: 'rgba(0,0,0,0.05)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem' }}>
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </span>
          </div>

          <div className="pd-price" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.5rem' }}>
            ₹{product.price.toFixed(2)}
          </div>

          <p className="pd-desc" style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem', fontSize: '1.1rem' }}>
            {product.description}
          </p>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Colors</h4>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: c,
                      border: selectedColor === c ? '3px solid var(--primary)' : '2px solid var(--glass-border)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    {selectedColor === c && <Check size={20} color={c === '#fff' || c === '#ffffff' ? '#000' : '#fff'} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pd-actions">
            <button 
              onClick={handleAddToCart}
              className="btn-secondary" 
              style={{ flex: 1, padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}
              disabled={product.stock < 1}
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button 
              onClick={handleBuyNow}
              style={{ 
                flex: 1, 
                padding: '1rem',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'white',
                background: 'linear-gradient(45deg, var(--primary), var(--secondary))',
                cursor: product.stock < 1 ? 'not-allowed' : 'pointer',
                opacity: product.stock < 1 ? 0.7 : 1,
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
              disabled={product.stock < 1}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Reviews */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <MessageSquare size={28} color="var(--primary)" />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Customer Reviews</h2>
        </div>

        {/* Write a Review (Only if logged in) */}
        {isAuthenticated ? (
          <form onSubmit={submitReview} style={{ marginBottom: '3rem', background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
            <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>Write a Review</h4>
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setRating(num)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <Star fill={rating >= num ? '#fbbf24' : 'transparent'} color={rating >= num ? '#fbbf24' : 'var(--text-secondary)'} size={28} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-field"
              placeholder="Share your thoughts about this product..."
              style={{ width: '100%', minHeight: '100px', marginBottom: '1rem', padding: '1rem', resize: 'vertical' }}
              required
            />
            <button type="submit" className="btn-primary" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <div style={{ marginBottom: '3rem', padding: '1rem', background: 'rgba(0,0,0,0.05)', borderRadius: '0.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Please login to write a review.</p>
          </div>
        )}

        {/* Reviews List */}
        <div>
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No reviews yet. Be the first to review!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {reviews.map((review) => (
                <div key={review._id} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h5 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{review.user?.name || 'Anonymous User'}</h5>
                      <div style={{ display: 'flex', gap: '0.1rem', marginTop: '0.25rem' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < review.rating ? '#fbbf24' : 'transparent'} color={i < review.rating ? '#fbbf24' : 'var(--text-secondary)'} />
                        ))}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.75rem' }}>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
