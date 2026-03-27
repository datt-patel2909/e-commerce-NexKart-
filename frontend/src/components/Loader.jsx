import { motion } from 'framer-motion';

export default function Loader({ fullScreen = false }) {
  const containerStyle = fullScreen
    ? { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', zIndex: 9999 }
    : { display: 'flex', justifyContent: 'center', padding: '2rem' };

  return (
    <div style={containerStyle}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{
          width: '3rem',
          height: '3rem',
          border: '4px solid var(--glass-border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
        }}
      />
    </div>
  );
}
