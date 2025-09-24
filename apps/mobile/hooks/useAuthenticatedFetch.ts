import { useAuth } from '../contexts/AuthContext';
import { authenticatedFetch } from '../features/auth/services/authService';

export const useAuthenticatedFetch = () => {
  const { handleSessionExpired } = useAuth();

  const fetch = async (url: string, options?: RequestInit) => {
    try {
      return await authenticatedFetch(url, options);
    } catch (error: any) {
      // Si el error indica sesión expirada, manejarla automáticamente
      if (error.message?.includes('Session expired') || error.message?.includes('Token expired')) {
        await handleSessionExpired();
        throw error;
      }
      throw error;
    }
  };

  return { fetch };
};