import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { isAuthenticated, logout as logoutService, getUserRole } from '../features/auth/services/authService';
import { router } from 'expo-router';

interface UserRole {
  rous_id: number;
  rous_nombre: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  userRole: UserRole | null;
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
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const checkAuthStatus = async () => {
    setIsLoading(true); // Forzar loading durante la verificación
    try {
      const authenticated = await isAuthenticated();
      console.log('Auth status check result:', authenticated); // Debug log
      setIsLoggedIn(authenticated);
      
      if (authenticated) {
        // Si está autenticado, obtener información del rol
        const role = await getUserRole();
        setUserRole(role);
        console.log('User role loaded:', role);
      } else {
        // Si no está autenticado, limpiar datos
        setUserRole(null);
        await logoutService();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
      setUserRole(null);
      await logoutService();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutService();
      setIsLoggedIn(false);
      setUserRole(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleSessionExpired = async () => {
    try {
      await logoutService();
      setIsLoggedIn(false);
      setUserRole(null);
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
    userRole,
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