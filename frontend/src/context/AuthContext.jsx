import { createContext, useState, useCallback, useEffect } from 'react';
import { setSession, clearSession } from '../api/client';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('uf_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('uf_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const login = useCallback((userData, token) => {
    setUser(userData);
    setSession(token, userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearSession();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('uf_theme', next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
}
