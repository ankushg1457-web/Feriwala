import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'feriwala_portal_token';
const LEGACY_TOKEN_KEY = 'feriwala_admin_token';
const ALLOWED_ROLES = ['admin', 'shop_admin'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);

    api.get('/auth/profile')
      .then((res) => {
        const profile = res.data.data;
        if (ALLOWED_ROLES.includes(profile.role)) {
          setUser(profile);
        } else {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(LEGACY_TOKEN_KEY);
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(LEGACY_TOKEN_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { credential: email, email, password });
    const { user: signedInUser, accessToken } = res.data.data;

    if (!ALLOWED_ROLES.includes(signedInUser.role)) {
      throw new Error('Portal access is available only for admins and shop owners');
    }

    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(LEGACY_TOKEN_KEY, accessToken);
    setUser(signedInUser);
    return res.data.data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

