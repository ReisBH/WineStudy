import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(`${API}/auth/me`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Register with email/password
  const register = async (email, password, name) => {
    setError(null);
    try {
      const response = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Registration failed');
      }

      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Login with email/password
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Login failed');
      }

      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Process Google OAuth session
  const processGoogleSession = async (sessionId) => {
    setError(null);
    try {
      const response = await fetch(`${API}/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Google authentication failed');
      }

      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  // Update language preference
  const updateLanguage = async (language) => {
    try {
      await fetch(`${API}/auth/language`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ language }),
      });
      
      if (user) {
        setUser({ ...user, preferred_language: language });
      }
    } catch (err) {
      console.error('Language update error:', err);
    }
  };

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const initiateGoogleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    processGoogleSession,
    initiateGoogleLogin,
    updateLanguage,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
