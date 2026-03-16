import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // Initialize from localStorage on mount or auto-login
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedOnboarded = localStorage.getItem('isOnboarded');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsOnboarded(storedOnboarded === 'true');
        api.setAuthToken(storedToken);
      } else {
        // Auto-login with demo user for public access
        try {
          const response = await api.get('/auth/auto-login');
          if (response.data.success) {
            setToken(response.data.token);
            setUser(response.data.user);
            setIsOnboarded(response.data.isOnboarded);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('isOnboarded', response.data.isOnboarded.toString());
            api.setAuthToken(response.data.token);
          }
        } catch (error) {
          console.error('Auto-login failed:', error);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const register = async (name, email, password, confirmPassword) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        confirmPassword
      });

      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        setIsOnboarded(false);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('isOnboarded', 'false');
        api.setAuthToken(response.data.token);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        setIsOnboarded(response.data.isOnboarded);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('isOnboarded', response.data.isOnboarded.toString());
        api.setAuthToken(response.data.token);
        return { success: true, isOnboarded: response.data.isOnboarded };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsOnboarded(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isOnboarded');
    api.setAuthToken(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
    localStorage.setItem('isOnboarded', 'true');
  };

  const value = {
    user,
    token,
    loading,
    isOnboarded,
    register,
    login,
    logout,
    updateUser,
    completeOnboarding,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
