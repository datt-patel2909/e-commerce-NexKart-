import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, LogOut, Moon, Sun, Box, Search, Home, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFilters } from '../context/FilterContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const filters = useFilters();
  const { cartCount } = useCart();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = location.pathname === '/';

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <nav className="glass" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, borderBottom: '1px solid var(--glass-border)' }}>
      {/* Top bar */}
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.6rem 1rem' }}>
        {/* Left: Logo */}
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 700, textDecoration: 'none', color: 'var(--primary)', flexShrink: 0 }}>
          NexKart
        </Link>

        {/* Center: Filter controls (only on Home page, hidden on mobile) */}
        {isHome && filters && (
          <div className="navbar-filters" style={{ 
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'nowrap',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', minWidth: '140px', maxWidth: '200px', flex: '1' }}>
              <Search style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={14} />
              <input
                type="text"
                placeholder="Search..."
                className="input-field"
                style={{ paddingLeft: '1.8rem', width: '100%', fontSize: '0.78rem', padding: '0.35rem 0.5rem 0.35rem 1.8rem' }}
                value={filters.search}
                onChange={(e) => { filters.setSearch(e.target.value); filters.setPage(1); }}
              />
            </div>
            
            <select 
              className="input-field" 
              style={{ width: '110px', cursor: 'pointer', fontSize: '0.78rem', padding: '0.35rem 0.4rem' }}
              value={filters.sort}
              onChange={(e) => filters.setSort(e.target.value)}
            >
              <option value="-createdAt">Latest</option>
              <option value="createdAt">Oldest</option>
              <option value="price">Price ↑</option>
              <option value="-price">Price ↓</option>
            </select>

            <input
              type="number"
              placeholder="Min ₹"
              className="input-field"
              style={{ width: '70px', fontSize: '0.78rem', padding: '0.35rem 0.4rem' }}
              value={filters.minPrice}
              onChange={(e) => { filters.setMinPrice(e.target.value); filters.setPage(1); }}
            />
            <input
              type="number"
              placeholder="Max ₹"
              className="input-field"
              style={{ width: '70px', fontSize: '0.78rem', padding: '0.35rem 0.4rem' }}
              value={filters.maxPrice}
              onChange={(e) => { filters.setMaxPrice(e.target.value); filters.setPage(1); }}
            />
            
            <select 
              className="input-field" 
              style={{ width: '120px', cursor: 'pointer', fontSize: '0.78rem', padding: '0.35rem 0.4rem' }}
              value={filters.category}
              onChange={(e) => { filters.setCategory(e.target.value); filters.setPage(1); }}
            >
              <option value="">All Categories</option>
              <option value="electroincs">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home</option>
              <option value="books">Books</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        {/* Right: Desktop nav links (hidden on mobile) */}
        <div className="navbar-links" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
          <Link to="/" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }} title="Home">
            <Home size={22} />
          </Link>
          <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {isAuthenticated ? (
            <>
              {role === 'admin' ? (
                <>
                  <Link to="/admin/products" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.9rem' }} title="Manage Products">
                    <Box size={20} /> Products
                  </Link>
                  <Link to="/admin/orders" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.9rem' }} title="Manage Orders">
                    <Package size={20} /> Orders
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/cart" style={{ color: 'var(--text-primary)', position: 'relative' }} title="Cart">
                    <ShoppingCart size={24} />
                    {cartCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: 'var(--primary)',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid var(--glass-bg)'
                      }}>
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/orders" style={{ color: 'var(--text-primary)' }} title="Orders"><Package size={24} /></Link>
                </>
              )}
              <button className="btn-secondary" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '14px' }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '14px' }}>Login</Link>
              <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '14px' }}>Register</Link>
            </>
          )}
        </div>

        {/* Mobile: hamburger + theme + cart */}
        <div className="navbar-mobile-icons" style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {isAuthenticated && role !== 'admin' && (
            <Link to="/cart" style={{ color: 'var(--text-primary)', position: 'relative' }} title="Cart">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: 'var(--primary)', color: 'white', fontSize: '0.65rem', fontWeight: 700,
                  width: '18px', height: '18px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--glass-bg)'
                }}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="mobile-menu" style={{
          display: 'none',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '1rem',
          borderTop: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}>
          {/* Mobile filters (Home page only) */}
          {isHome && filters && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={14} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="input-field"
                  style={{ paddingLeft: '2rem', width: '100%', fontSize: '0.85rem' }}
                  value={filters.search}
                  onChange={(e) => { filters.setSearch(e.target.value); filters.setPage(1); }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select className="input-field" style={{ flex: 1, cursor: 'pointer', fontSize: '0.85rem' }} value={filters.sort} onChange={(e) => filters.setSort(e.target.value)}>
                  <option value="-createdAt">Latest</option>
                  <option value="createdAt">Oldest</option>
                  <option value="price">Price ↑</option>
                  <option value="-price">Price ↓</option>
                </select>
                <select className="input-field" style={{ flex: 1, cursor: 'pointer', fontSize: '0.85rem' }} value={filters.category} onChange={(e) => { filters.setCategory(e.target.value); filters.setPage(1); }}>
                  <option value="">All Categories</option>
                  <option value="electroincs">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home</option>
                  <option value="books">Books</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="number" placeholder="Min ₹" className="input-field" style={{ flex: 1, fontSize: '0.85rem' }} value={filters.minPrice} onChange={(e) => { filters.setMinPrice(e.target.value); filters.setPage(1); }} />
                <input type="number" placeholder="Max ₹" className="input-field" style={{ flex: 1, fontSize: '0.85rem' }} value={filters.maxPrice} onChange={(e) => { filters.setMaxPrice(e.target.value); filters.setPage(1); }} />
              </div>
            </div>
          )}

          {/* Mobile navigation links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Link to="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '0.6rem 0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
              <Home size={18} /> Home
            </Link>

            {isAuthenticated ? (
              <>
                {role === 'admin' ? (
                  <>
                    <Link to="/admin/products" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '0.6rem 0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                      <Box size={18} /> Manage Products
                    </Link>
                    <Link to="/admin/orders" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '0.6rem 0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                      <Package size={18} /> Manage Orders
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/cart" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '0.6rem 0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                      <ShoppingCart size={18} /> Cart {cartCount > 0 && `(${cartCount})`}
                    </Link>
                    <Link to="/orders" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '0.6rem 0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                      <Package size={18} /> My Orders
                    </Link>
                  </>
                )}
                <button onClick={logout} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.6rem 0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, fontSize: '1rem', textAlign: 'left' }}>
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', flex: 1, textAlign: 'center', padding: '0.6rem' }}>Login</Link>
                <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', flex: 1, textAlign: 'center', padding: '0.6rem' }}>Register</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS for mobile show/hide */}
      <style>{`
        @media (max-width: 768px) {
          .navbar-filters { display: none !important; }
          .navbar-links { display: none !important; }
          .navbar-mobile-icons { display: flex !important; }
          .mobile-menu { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
