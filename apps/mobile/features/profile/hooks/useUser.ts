import { useState, useEffect, useCallback } from 'react';
import { User, UserUpdateData } from '../types';
import { getUserProfile, updateUserProfile, mapProfileResponseToUser } from '../services/profileService';
import { useAuth } from '~/contexts/AuthContext';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  
  const { isLoggedIn, handleSessionExpired } = useAuth();

  const loadUser = useCallback(async () => {
    if (!isLoggedIn) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const profileData = await getUserProfile();
      const userData = mapProfileResponseToUser(profileData);
      setUser(userData);
      
      console.log('Profile loaded successfully:', userData.usua_nickname);
    } catch (err: any) {
      console.error('Error loading user profile:', err);
      
      // Si es un error de sesión expirada, manejarlo con el AuthContext
      if (err.message?.includes('Session expired')) {
        await handleSessionExpired();
        return;
      }
      
      setError(err.message || 'Error al cargar los datos del usuario');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, handleSessionExpired]);

  // Función para actualizar los datos del usuario
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
      
      console.log('Profile updated successfully:', updatedUserData.usua_nickname);
      return true;
    } catch (err: any) {
      console.error('Error updating user profile:', err);
      
      // Si es un error de sesión expirada, manejarlo con el AuthContext
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

  // Función para refrescar los datos del usuario
  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  // Cargar datos del usuario cuando el componente se monta o cuando cambia el estado de autenticación
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    user,
    loading,
    error,
    updating,
    updateUser,
    refreshUser,
  };
};
