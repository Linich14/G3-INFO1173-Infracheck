import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { isAuthenticated, logout as logoutService, getUserRole } from '../features/auth/services/authService';
import { initializeSecureStorage } from '../services/secureStorage';
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
    setIsLoading(true);
    try {
      const authenticated = await isAuthenticated();
      setIsLoggedIn(authenticated);

      if (authenticated) {
        const role = await getUserRole();
        setUserRole(role);
      } else {
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
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Error handling session expiration:', error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeSecureStorage({ enableMigration: true });
        console.log('Secure storage initialized successfully');
      } catch (error) {
        console.warn('Failed to initialize secure storage, attempting cleanup:', error);

        // Intentar limpieza de emergencia para datos corruptos
        try {
          console.log('🚨 Attempting emergency cleanup...');
          const { secureClearAll } = await import('../services/secureStorage');
          await secureClearAll();

          console.log('✅ Emergency cleanup completed, retrying initialization...');

          // Reintentar inicialización después de limpieza
          await initializeSecureStorage({ enableMigration: true });
          console.log('Secure storage reinitialized successfully after emergency cleanup');
        } catch (cleanupError) {
          console.error('Failed emergency cleanup and reinitialize:', cleanupError);
          console.warn('Continuing with degraded mode - some features may not work');
        }
      }

      await checkAuthStatus();
    };

    initializeApp();
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
