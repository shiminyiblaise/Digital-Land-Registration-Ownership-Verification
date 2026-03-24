import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { LandUser } from '@/lib/types';

interface AuthContextType {
  user: LandUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; name: string; phone: string; role?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isOfficer: boolean;
  isSeller: boolean;
  isBuyer: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  isAdmin: false,
  isOfficer: false,
  isSeller: false,
  isBuyer: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LandUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('land_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('land_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password);
      if (data.error) {
        return { success: false, error: data.error };
      }
      setUser(data.user);
      localStorage.setItem('land_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (regData: { email: string; password: string; name: string; phone: string; role?: string }) => {
    try {
      const data = await api.register(regData);
      if (data.error) {
        return { success: false, error: data.error };
      }
      setUser(data.user);
      localStorage.setItem('land_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('land_user');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'admin',
        isOfficer: user?.role === 'officer',
        isSeller: user?.role === 'seller',
        isBuyer: user?.role === 'buyer',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
