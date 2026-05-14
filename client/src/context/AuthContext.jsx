import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const role = user?.role || null;
  const isAdmin = role === 'admin';
  const isAuthenticated = Boolean(user);

  const applyAuth = useCallback((nextToken, nextUser) => {
    setToken(nextToken || (nextUser ? 'session' : ''));
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
      try {
        const me = await apiGet('/auth/me');
        if (active) {
          setUser(me);
          setToken('session');
        }
      } catch {
        if (active) {
          setUser(null);
          setToken('');
        }
      } finally {
        if (active) setIsCheckingAuth(false);
      }
    }

    setIsCheckingAuth(true);
    validateSession();

    return () => {
      active = false;
    };
  }, [token]);

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
