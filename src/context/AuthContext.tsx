'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Branch } from '@/types';
import { setApiToken } from '@/lib/api';

interface AuthContextType {
  token: string | null;
  branch: Branch | null;
  loading: boolean;
  login: (token: string, branch: Branch) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('gym_token');
    const storedBranch = localStorage.getItem('branch_data');
    if (storedToken && storedBranch) {
      setToken(storedToken);
      setBranch(JSON.parse(storedBranch) as Branch);
      setApiToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = useCallback((newToken: string, newBranch: Branch) => {
    localStorage.setItem('gym_token', newToken);
    localStorage.setItem('branch_data', JSON.stringify(newBranch));
    setToken(newToken);
    setBranch(newBranch);
    setApiToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('gym_token');
    localStorage.removeItem('branch_data');
    setToken(null);
    setBranch(null);
    setApiToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, branch, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
