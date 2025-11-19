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

  const checkAuthStatus = async (forceCheck = false) => {
    setIsLoading(true);
    try {
      const authenticated = await isAuthenticated(forceCheck);
      setIsLoggedIn(authenticated);

      if (authenticated) {
        const role = await getUserRole();
        setUserRole(role);
      } else {
        setUserRole(null);
        await logoutService();
      }
    } catch (error) {
      
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
      
    }
  };

  const handleSessionExpired = async () => {
    try {
      await logoutService();
      setIsLoggedIn(false);
      setUserRole(null);
      router.replace('/(auth)/sign-in');
    } catch (error) {
      
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeSecureStorage({ enableMigration: true });
        
      } catch (error) {


        // Intentar limpieza de emergencia para datos corruptos
        try {
          console.log('🚨 Attempting emergency cleanup...');
          const { secureClearAll } = await import('../services/secureStorage');
          await secureClearAll();

          

          // Reintentar inicialización después de limpieza
          await initializeSecureStorage({ enableMigration: true });

        } catch (cleanupError) {

        }
      }

      // Forzar verificación solo en el inicio de la app
      await checkAuthStatus(true);
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
