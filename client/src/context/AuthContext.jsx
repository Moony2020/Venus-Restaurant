import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../lib/api';

const AuthContext = createContext(null);

const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const decoded = useMemo(() => (token ? decodeToken(token) : null), [token]);
  const role = user?.role || decoded?.role || null;
  const isAdmin = role === 'admin';
  const isAuthenticated = Boolean(token);

  const applyAuth = useCallback((nextToken, nextUser) => {
    setToken(nextToken || '');
    if (nextToken) {
      localStorage.setItem('token', nextToken);
    } else {
      localStorage.removeItem('token');
    }
    setUser(nextUser || null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost('/auth/logout', {});
    } catch {
      // Ignore network failures during client-side logout
    }
    applyAuth('', null);
  }, [applyAuth]);

  useEffect(() => {
    let active = true;

    async function validateSession() {
      if (!token) {
        if (active) {
          setUser(null);
          setIsCheckingAuth(false);
        }
        return;
      }

      try {
        const me = await apiGet('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (active) setUser(me);
      } catch {
        if (active) applyAuth('', null);
      } finally {
        if (active) setIsCheckingAuth(false);
      }
    }

    setIsCheckingAuth(true);
    validateSession();

    return () => {
      active = false;
    };
  }, [token, applyAuth]);

  const value = useMemo(
    () => ({
      token,
      user,
      role,
      isAdmin,
      isAuthenticated,
      isCheckingAuth,
      setAuth: applyAuth,
      logout
    }),
    [token, user, role, isAdmin, isAuthenticated, isCheckingAuth, applyAuth, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
};
