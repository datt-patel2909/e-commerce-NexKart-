import { Routes, Route, Link, Outlet, Navigate } from 'react-router-dom';
import { Package, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';

export default function AdminLayout() {
  const { role } = useAuth();

  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', display: 'flex', gap: '2rem' }}>
 
     </div>

      <Outlet />
    </div>
  );
}

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>
    </Routes>
  );
}
