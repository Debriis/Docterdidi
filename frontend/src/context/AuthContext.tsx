'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
}

interface AuthContextType {
  doctor: Doctor | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, specialty?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('pill_pal_token');
    const savedDoctor = localStorage.getItem('pill_pal_doctor');
    if (savedToken && savedDoctor) {
      setToken(savedToken);
      setDoctor(JSON.parse(savedDoctor));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, doctor } = res.data;
    localStorage.setItem('pill_pal_token', token);
    localStorage.setItem('pill_pal_doctor', JSON.stringify(doctor));
    setToken(token);
    setDoctor(doctor);
    router.push('/');
  };

  const register = async (name: string, email: string, password: string, specialty?: string) => {
    const res = await api.post('/auth/register', { name, email, password, specialty });
    const { token, doctor } = res.data;
    localStorage.setItem('pill_pal_token', token);
    localStorage.setItem('pill_pal_doctor', JSON.stringify(doctor));
    setToken(token);
    setDoctor(doctor);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('pill_pal_token');
    localStorage.removeItem('pill_pal_doctor');
    setToken(null);
    setDoctor(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ doctor, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
