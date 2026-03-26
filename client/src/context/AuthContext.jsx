import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const TOKEN_KEY = 'smartshop_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true); // true while validating stored token

  // On mount: validate any stored token
  useEffect(() => {
    if (!token) { setLoading(false); return; }

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setUser(data.user))
      .catch(() => {
        // Invalid / expired token — clear it
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (username, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
