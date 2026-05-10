import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Ctx = createContext(null);
const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    AsyncStorage.getItem('codiee_token').then(t => {
      if (!t) { setLoading(false); return; }
      axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${t}` } })
        .then(r => setUser(r.data.user))
        .catch(() => AsyncStorage.removeItem('codiee_token'))
        .finally(() => setLoading(false));
    });
  }, []);
  const login  = async (t, u) => { await AsyncStorage.setItem('codiee_token', t); setUser(u); };
  const logout = async ()     => { await AsyncStorage.removeItem('codiee_token'); setUser(null); };
  return <Ctx.Provider value={{ user, loading, login, logout, apiUrl: API }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
