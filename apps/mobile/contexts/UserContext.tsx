import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserUpdateData } from '~/features/profile/types';
import { getUserProfile, updateUserProfile, mapProfileResponseToUser } from '~/features/profile/services/profileService';
import { useAuth } from './AuthContext';

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
  loadUser: () => Promise<void>;
  updateUser: (updateData: UserUpdateData) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  
  const { isLoggedIn, handleSessionExpired } = useAuth();

  const loadUser = useCallback(async () => {
    if (!isLoggedIn) {
      setUser(null);
      setLoading(false);
      return;
    }

    if (isLoadingUser) {
      return;
    }

    setIsLoadingUser(true);

    try {
      setLoading(true);
      setError(null);
      
      const profileData = await getUserProfile();
      const userData = mapProfileResponseToUser(profileData);
      setUser(userData);
      
      console.log('User profile loaded in context:', userData.usua_nickname);
    } catch (err: any) {
      console.error('Error loading user profile in context:', err);
      
      if (err.message?.includes('Session expired')) {
        await handleSessionExpired();
        return;
      }
      
      setError(err.message || 'Error al cargar los datos del usuario');
      setUser(null);
    } finally {
      setLoading(false);
      setIsLoadingUser(false);
    }
  }, [isLoggedIn, handleSessionExpired]);

  const updateUser = async (updateData: UserUpdateData): Promise<boolean> => {
    if (!user) {
      setError('No hay usuario cargado para actualizar');
      return false;
    }

    try {
      setUpdating(true);
      setError(null);
      
      const updatedProfileData = await updateUserProfile(updateData);
      const updatedUserData = mapProfileResponseToUser(updatedProfileData);
      setUser(updatedUserData);
      
      console.log('User profile updated in context:', updatedUserData.usua_nickname);
      return true;
    } catch (err: any) {
      console.error('Error updating user profile in context:', err);
      
      if (err.message?.includes('Session expired')) {
        await handleSessionExpired();
        return false;
      }
      
      setError(err.message || 'Error al actualizar el perfil del usuario');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  const clearUser = useCallback(() => {
    setUser(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadUser();
    } else {
      clearUser();
    }
    // Solo ejecutar cuando cambia isLoggedIn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        updating, 
        loadUser, 
        updateUser, 
        refreshUser,
        clearUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext debe usarse dentro de un UserProvider');
  }
  return context;
};
