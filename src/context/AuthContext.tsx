import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, signIn as apiSignIn, signUp as apiSignUp, getUserFromToken } from '../lib/api';

interface AuthContextType {
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (firmData: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const userData = await getUserFromToken(token);
        if (userData) {
          setUser(userData);
        } else {
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await apiSignIn(email, password);
      if (result.success && result.user && result.token) {
        setUser(result.user);
        localStorage.setItem('auth_token', result.token);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (firmData: any) => {
    setIsLoading(true);
    try {
      const result = await apiSignUp(firmData);
      if (result.success && result.user && result.token) {
        setUser(result.user);
        localStorage.setItem('auth_token', result.token);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      signIn,
      signUp,
      signOut,
      isLoading
    }}>
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