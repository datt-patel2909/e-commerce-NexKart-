import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product, onAddToCart, onBuyNow }) {
  const { isAuthenticated } = useAuth();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <style>{`
        .product-card-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .product-card-btns {
          display: flex;
          gap: 0.75rem;
        }
        @media (max-width: 768px) {
          .product-card-actions {
            flex-direction: column;
            align-items: stretch;
          }
          .product-card-btns {
            flex-direction: column;
            width: 100%;
          }
          .product-card-btns button {
            width: 100%;
            justify-content: center;
          }
          .product-card-desc {
            display: none !important;
          }
        }
      `}</style>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="glass-card"
        style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <Link to={`/product/${product._id}`} style={{ display: 'block', position: 'relative', paddingTop: '100%', overflow: 'hidden', background: 'rgba(0,0,0,0.05)' }}>
          <img
            src={product.image || '/fallback.png'}
            alt={product.name}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              if (e.target.src !== window.location.origin + '/fallback.png') {
                e.target.src = '/fallback.png';
              }
            }}
          />
        </Link>

        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{product.name}</h3>
          </Link>
          <div className="product-card-desc">
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {product.description}
            </p>
          </div>

          <div className="product-card-actions">
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)' }}>
              ₹{parseFloat(product.price).toFixed(2)}
            </span>
            <div className="product-card-btns">
              <button
                onClick={() => onAddToCart(product._id)}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
              >
                <ShoppingCart size={14} />
                {isAuthenticated ? 'Add to Cart' : 'Login to Buy'}
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => onBuyNow(product._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.5rem 1rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'white',
                    background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  Buy Now
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
