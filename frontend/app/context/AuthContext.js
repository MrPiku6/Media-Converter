'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error('Failed to fetch user', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initializeUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.Authorization = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      toast.success('Login Successful!');
      router.push('/tool');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login Failed');
      throw error;
    }
  };
  
  const signup = async (email, password) => {
    try {
      const res = await api.post('/api/auth/register', { email, password });
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.Authorization = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      toast.success('Signup Successful!');
      router.push('/tool');
    } catch (error) {
       toast.error(error.response?.data?.message || 'Signup Failed');
       throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.Authorization;
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const value = { user, loading, login, signup, logout, isAuthenticated: !!user, setUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
