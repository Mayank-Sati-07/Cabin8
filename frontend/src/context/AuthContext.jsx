import { createContext, useState, useCallback } from 'react';
import { ROLES } from '../constants/roles';

export const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 1,
  name: 'Admin User',
  email: 'admin@urbanfurniture.com',
  role: ROLES.ADMIN,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('uf_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('uf_theme') || 'light';
  });

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('uf_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(DEFAULT_USER);
    localStorage.removeItem('uf_user');
  }, []);

  const switchRole = useCallback((role) => {
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem('uf_user', JSON.stringify(updated));
  }, [user]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('uf_theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
}
