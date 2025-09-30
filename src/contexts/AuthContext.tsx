'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

interface Tenant {
  address: string;
  phone: string;
  email: string;
  id: number;
  name: string;
  domain: string;
  database: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  tax_id: string;
  settings: {
    currency: string;
    language: string;
    timezone: string;
    date_format: string;
    time_format: string;
    contact_code_prefix: string;
    supplier_code_prefix: string;
  };
  modules: string[];
  subscription_plan: string;
  subscription_expires_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  logo: string | null;
  industry: {
    id: number;
    name: string;
  } | null;
}

interface Permission {
  id: number;
  name: string;
  module: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

import { User as AppUser } from '@/types';

interface User extends AppUser {
  tenant_id: number;
  phone?: string;
  employee_id?: string;
  salary?: number;
  bank_name?: string;
  bank_account?: string;
  mobile_money_provider?: string;
  mobile_money_number?: string;
  preferences?: any;
  email_verified_at?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  tenant: Tenant;
  roles: Role[];
  bio?: string;
  payment_method?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Define logout function using useCallback to avoid dependency issues
  const logout = useCallback(() => {
    // Call logout API
    authApi.logout().catch(console.error);
    
    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Clear user state
    setUser(null);
    
    // Redirect to login
    router.push('/login');
  }, [router]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          authApi.setHeader('Authorization', `Bearer ${token}`);
          const response = await authApi.me();
          console.log('User response:', response);
          if (response.success && response.data?.user) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          } else {
            console.log('Logout triggered due to unsuccessful response or missing user data.');
            logout();
          }
        } catch (error) {
          console.log('Logout triggered due to an error.', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [logout]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ email, password });
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        // Store token and user data
        localStorage.setItem('auth_token', token);
        
        const meResponse = await authApi.me();
        if (meResponse.success && meResponse.data?.user) {
          localStorage.setItem('user', JSON.stringify(meResponse.data.user));
          setUser(meResponse.data.user);
        } else {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await authApi.register(userData);
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        // Store token and user data
        localStorage.setItem('auth_token', token);

        const meResponse = await authApi.me();
        if (meResponse.success && meResponse.data?.user) {
          localStorage.setItem('user', JSON.stringify(meResponse.data.user));
          setUser(meResponse.data.user);
        } else {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  // logout function is now defined with useCallback above

  const refreshUser = async () => {
    try {
      const response = await authApi.me();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, user might be logged out
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
