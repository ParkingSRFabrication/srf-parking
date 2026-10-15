import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('srf_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('srf_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('srf_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    verifySession();
  }, [token]);

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data?.success && res.data?.token) {
      localStorage.setItem('srf_token', res.data.token);
      localStorage.setItem('srf_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const requestOtp = async (email) => {
    const res = await api.post('/auth/request-otp', { email });
    return res.data;
  };

  const verifyOtp = async ({ email, otp, name, role }) => {
    const res = await api.post('/auth/verify-otp', { email, otp, name, role });
    if (res.data?.success && res.data?.token) {
      localStorage.setItem('srf_token', res.data.token);
      localStorage.setItem('srf_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data?.message || 'Verification failed');
  };

  const loginWithGoogle = async (googleData) => {
    const res = await api.post('/auth/google', googleData);
    if (res.data?.success && res.data?.token) {
      localStorage.setItem('srf_token', res.data.token);
      localStorage.setItem('srf_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data?.message || 'Google authentication failed');
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('srf_token');
      localStorage.removeItem('srf_user');
      setToken(null);
      setUser(null);
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.success && res.data?.token) {
      localStorage.setItem('srf_token', res.data.token);
      localStorage.setItem('srf_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const getDashboardPath = (targetRole = user?.role) => {
    if (targetRole === 'admin') return '/admin/dashboard';
    if (targetRole === 'operator') return '/operator/dashboard';
    return '/customer/dashboard';
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOperator: user?.role === 'operator',
    isCustomer: user?.role === 'customer' || user?.role === 'commuter',
    isCommuter: user?.role === 'customer' || user?.role === 'commuter',
    login,
    register,
    requestOtp,
    verifyOtp,
    loginWithGoogle,
    logout,
    getDashboardPath
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
