import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('woffy_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('woffy_token') || null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount or when token changes
  useEffect(() => {
    const initAuth = async () => {
      // Check query params for Google OAuth token redirect
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      if (urlToken) {
        localStorage.setItem('woffy_token', urlToken);
        setToken(urlToken);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const activeToken = urlToken || localStorage.getItem('woffy_token');
      if (activeToken) {
        try {
          const res = await api.get('/api/auth/me');
          if (res.data && res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('woffy_user', JSON.stringify(res.data.user));
          } else {
            setUser(null);
            localStorage.removeItem('woffy_token');
            localStorage.removeItem('woffy_user');
          }
        } catch (err) {
          console.warn('Initial session validation error:', err.message);
          // Don't immediately wipe if offline, but if 401 error clear
          if (err.response && err.response.status === 401) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('woffy_token');
            localStorage.removeItem('woffy_user');
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data && res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        if (receivedToken) {
          localStorage.setItem('woffy_token', receivedToken);
          setToken(receivedToken);
        }
        if (receivedUser) {
          localStorage.setItem('woffy_user', JSON.stringify(receivedUser));
          setUser(receivedUser);
        }
        return { success: true, message: res.data.message || 'Login successful' };
      }
      return { success: false, message: res.data.message || 'Invalid credentials' };
    } catch (err) {
      const message =
        err.response?.data?.message || err.response?.data?.error || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  const signup = async (fullName, email, password) => {
    try {
      const res = await api.post('/api/auth/signup', { fullName, email, password });
      if (res.data && res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        if (receivedToken) {
          localStorage.setItem('woffy_token', receivedToken);
          setToken(receivedToken);
        }
        if (receivedUser) {
          localStorage.setItem('woffy_user', JSON.stringify(receivedUser));
          setUser(receivedUser);
        }
        return { success: true, message: res.data.message || 'Account created successfully!' };
      }
      return { success: false, message: res.data.message || 'Signup failed' };
    } catch (err) {
      const message =
        err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.all ? api.post('/api/auth/logout') : api.get('/api/auth/logout');
    } catch (e) {
      console.warn('Logout notice:', e.message);
    } finally {
      localStorage.removeItem('woffy_token');
      localStorage.removeItem('woffy_user');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('woffy_user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/api/auth/me');
      if (res.data && res.data.success && res.data.user) {
        updateUser(res.data.user);
      }
    } catch (err) {
      console.warn('Failed to refresh user:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: Boolean(user?.isAdmin || user?.role === 'admin'),
        login,
        signup,
        logout,
        updateUser,
        refreshUser,
      }}
    >
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
