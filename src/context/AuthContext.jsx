import { createContext, useContext, useState, useEffect } from 'react';
import { apiPost, apiGet } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setLoading(true);
      // Cargar datos del usuario al iniciar
      apiGet('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(data => {
          setUser(data);
          setLoading(false);
        })
        .catch(() => {
          // Token inválido o expirado
          logout();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    const data = await apiPost('/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    const fullUser = await apiGet('/api/auth/me', {
      headers: { Authorization: `Bearer ${data.token}` }
    });
    setUser(fullUser);
    setLoading(false);
    return { ...data, user: fullUser };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const isAdmin = () => {
    return user?.rol === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
