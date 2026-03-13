import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
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
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LandUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved session
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
      const { data, error } = await supabase
        .from('land_users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('password_hash', password)
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid email or password' };
      }

      setUser(data);
      localStorage.setItem('land_user', JSON.stringify(data));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (regData: { email: string; password: string; name: string; phone: string; role?: string }) => {
    try {
      // Check if email exists
      const { data: existing } = await supabase
        .from('land_users')
        .select('id')
        .eq('email', regData.email.toLowerCase().trim())
        .single();

      if (existing) {
        return { success: false, error: 'Email already registered' };
      }

      const { data, error } = await supabase
        .from('land_users')
        .insert({
          email: regData.email.toLowerCase().trim(),
          password_hash: regData.password,
          name: regData.name,
          phone: regData.phone,
          role: regData.role || 'seller',
          is_verified: false,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      setUser(data);
      localStorage.setItem('land_user', JSON.stringify(data));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('land_user');
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
