'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastContext';

export interface IUserAddress {
  _id?: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserType {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  avatarUrl?: string;
  addresses: IUserAddress[];
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (firebasePayload: { name: string; email: string; avatarUrl?: string; firebaseUid?: string }) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Temporary mock user for offline admin testing
  const [user, setUser] = useState<UserType | null>({
    _id: 'mock-admin-id-123456789012',
    name: 'Admin Tester (Offline)',
    email: 'admin@antigravity.com',
    role: 'admin',
    status: 'active',
    addresses: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { showToast } = useToast();

  const refreshUser = useCallback(async () => {
    // Keep mock user offline
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setUser({
      _id: 'mock-admin-id-123456789012',
      name: 'Admin Tester (Offline)',
      email: 'admin@antigravity.com',
      role: 'admin',
      status: 'active',
      addresses: [],
    });
    showToast('Logged in successfully (OFFLINE BYPASS)!', 'success');
    router.push('/admin');
    return true;
  };

  const loginWithGoogle = async (payload: {
    name: string;
    email: string;
    avatarUrl?: string;
    firebaseUid?: string;
  }): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/firebase-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Google sign-in failed', 'error');
        return false;
      }
      setUser(data.user);
      showToast('Signed in with Google successfully!', 'success');
      router.refresh();
      return true;
    } catch {
      showToast('An error occurred during Google sign-in', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Registration failed', 'error');
        return false;
      }
      setUser(data.user);
      showToast('Registered successfully!', 'success');
      router.refresh();
      return true;
    } catch {
      showToast('An error occurred during registration', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      showToast('Logged out successfully', 'info');
      router.push('/');
      router.refresh();
    } catch {
      showToast('Error logging out', 'error');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser
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
