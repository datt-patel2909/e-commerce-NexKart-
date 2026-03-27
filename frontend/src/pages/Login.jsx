import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiFetch } from '../utils/api';

const GOOGLE_CLIENT_ID = '933416845536-ceip01iaos451sp9mqmbk5vmo9pvmoh9.apps.googleusercontent.com';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => initializeGoogle();
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) existing.remove();
    };
  }, []);

  const initializeGoogle = () => {
    if (window.google && googleBtnRef.current) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with',
        shape: 'pill',
      });
    }
  };

  const handleGoogleResponse = async (response) => {
    try {
      const data = await apiFetch('/auth/google/login', {
        method: 'POST',
        body: JSON.stringify({ credential: response.credential }),
      });
      
      let role = data.role || (data.user && data.user.role) || 'user';
      login(data.token, role, data.user?._id);
      addToast('Welcome!');
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Google login failed', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      let role = data.role || (data.user && data.user.role) || 'user';
      login(data.token, role, data.user?._id);
      addToast('Welcome back!');
      navigate('/');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}
      >
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Welcome Back</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
            <input 
              type="email" 
              className="input-field" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
        </div>

        {/* Google Sign-In Button */}
        <div ref={googleBtnRef} style={{ display: 'flex', justifyContent: 'center' }}></div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register</Link>
        </p>
      </motion.div>
    </div>
  );
}
