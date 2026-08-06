import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  photo_url: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  photoURL?: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('aitag_token');
    if (token) {
      authApi.me()
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('aitag_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('aitag_token', res.data.token);
    setUser(res.data.user);
  };

  const register = async (data: RegisterData) => {
    const res = await authApi.register(data);
    localStorage.setItem('aitag_token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('aitag_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
