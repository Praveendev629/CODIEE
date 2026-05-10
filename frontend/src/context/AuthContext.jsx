import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = localStorage.getItem('codiee_token');
    if (!t) { setLoading(false); return; }
    api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => localStorage.removeItem('codiee_token')).finally(() => setLoading(false));
  }, []);
  const login  = useCallback((token, user) => { localStorage.setItem('codiee_token', token); setUser(user); }, []);
  const logout = useCallback(() => { localStorage.removeItem('codiee_token'); setUser(null); }, []);
  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
