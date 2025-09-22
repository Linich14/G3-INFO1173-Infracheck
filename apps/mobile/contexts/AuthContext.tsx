import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { isAuthenticated, logout as logoutService } from '../features/auth/services/authService';
import { router } from 'expo-router';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  handleSessionExpired: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    setIsLoading(true); // Forzar loading durante la verificación
    try {
      const authenticated = await isAuthenticated();
      console.log('Auth status check result:', authenticated); // Debug log
      setIsLoggedIn(authenticated);
      
      if (!authenticated) {
        // Si no está autenticado, asegurarse de limpiar cualquier token residual
        await logoutService();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
      await logoutService();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutService();
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleSessionExpired = async () => {
    try {
      await logoutService();
      setIsLoggedIn(false);
      // Redirigir al login con mensaje de sesión expirada
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Error handling session expiration:', error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    isLoggedIn,
    isLoading,
    logout,
    checkAuthStatus,
    handleSessionExpired,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};