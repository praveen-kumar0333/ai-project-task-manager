import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { onUnauthorized } from '../services/api.js';

const AuthContext = createContext(null);

/**
 * Safely validates and retrieves stored token from localStorage
 */
function getStoredToken() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token || typeof token !== 'string') return null;
    const trimmed = token.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
      return null;
    }
    return trimmed;
  } catch (err) {
    console.warn('Unable to access localStorage token:', err);
    return null;
  }
}

/**
 * Safely validates and retrieves a parsed user object from localStorage
 */
function getStoredUser() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const rawUser = localStorage.getItem('user');
    if (!rawUser || typeof rawUser !== 'string') return null;
    const trimmed = rawUser.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
      return null;
    }
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      // Validate expected user properties exist
      if (parsed.id || parsed.email || parsed.name) {
        return parsed;
      }
    }
    return null;
  } catch (err) {
    console.warn('Corrupted user data encountered in localStorage:', err);
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch {
      // Ignore storage cleanup error
    }
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /**
   * Centralized logout handler
   * Clears credentials from localStorage and resets context state
   */
  const logout = useCallback(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (err) {
      console.error('Failed to clear credentials from localStorage:', err);
    }
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Centralized login handler
   * Saves JWT and user profile to localStorage and updates state
   * @param {object} userData - Authenticated user info { id, name, email }
   * @param {string} authToken - JWT authentication token
   */
  const login = useCallback((userData, authToken) => {
    try {
      if (authToken && typeof authToken === 'string') {
        localStorage.setItem('token', authToken);
        setToken(authToken);
      }
      if (userData && typeof userData === 'object') {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (err) {
      console.error('Failed to persist authentication data to localStorage:', err);
    }
  }, []);

  // Restore existing authentication session on application mount
  useEffect(() => {
    try {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      } else {
        // Inconsistent or missing authentication storage: wipe both to preserve clean state
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch {
          // Ignore cleanup errors
        }
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Error restoring authentication state:', err);
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch {
        // Ignore cleanup errors
      }
      setToken(null);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Listen for unauthorized 401 signals and log out safely
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    // Listen to browser CustomEvent
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('auth:unauthorized', handleUnauthorized);
    }

    // Listen to in-memory listener subscription from api service
    const unsubscribe = onUnauthorized(handleUnauthorized);

    return () => {
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('auth:unauthorized', handleUnauthorized);
      }
      unsubscribe();
    };
  }, [logout]);

  // Memoize user object with computed avatar initials
  const userWithInitials = useMemo(() => {
    if (!user) return null;
    const computedInitials =
      user.avatarInitials ||
      (user.name
        ? user.name
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : 'AD');

    return {
      ...user,
      avatarInitials: computedInitials
    };
  }, [user]);

  const value = useMemo(
    () => ({
      user: userWithInitials,
      token,
      isAuthenticated: Boolean(token && user),
      authLoading,
      login,
      logout
    }),
    [userWithInitials, token, authLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
