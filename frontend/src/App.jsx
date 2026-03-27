import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { FilterProvider } from './context/FilterContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import { AdminRoutes } from './pages/admin/AdminLayout';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <BrowserRouter>
            <FilterProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="product/:id" element={<ProductDetails />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="cart" element={<Cart />} />
                <Route path="orders" element={<Orders />} />
                <Route path="admin/*" element={<AdminRoutes />} />
              </Route>
            </Routes>
          </FilterProvider>
          </BrowserRouter>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
