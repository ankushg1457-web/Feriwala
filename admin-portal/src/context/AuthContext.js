import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('feriwala_admin_token');
    if (token) {
      api.get('/auth/profile')
        .then(res => {
          if (res.data.data.role === 'admin') {
            setUser(res.data.data);
          } else {
            localStorage.removeItem('feriwala_admin_token');
          }
        })
        .catch(() => localStorage.removeItem('feriwala_admin_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.data.user.role !== 'admin') {
      throw new Error('Admin access only');
    }
    localStorage.setItem('feriwala_admin_token', res.data.data.accessToken);
    setUser(res.data.data.user);
    return res.data.data;
  };

  const logout = () => {
    localStorage.removeItem('feriwala_admin_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
