import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || 'user');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);

  const login = (newToken, newRole, newUserId) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole || 'user');
    localStorage.setItem('userId', newUserId || '');
    setToken(newToken);
    setRole(newRole || 'user');
    setUserId(newUserId || null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setToken(null);
    setRole('user');
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
