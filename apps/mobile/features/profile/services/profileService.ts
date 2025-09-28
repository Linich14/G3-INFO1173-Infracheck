import { API_CONFIG } from '~/constants/config';
import { authenticatedFetch } from '~/features/auth/services/authService';
import { User, UserProfileResponse, UserUpdateData } from '../types';

/**
 * Servicio para obtener el perfil del usuario autenticado
 */
export const getUserProfile = async (): Promise<UserProfileResponse> => {
  try {
    const response = await authenticatedFetch(`${API_CONFIG.BASE_URL}/api/v1/profile/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const profileData: UserProfileResponse = await response.json();
    return profileData;
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    
    // Si es un error de sesión expirada, el authenticatedFetch ya lo maneja
    if (error.message?.includes('Session expired')) {
      throw error;
    }
    
    throw new Error(error.message || 'Error al obtener el perfil del usuario');
  }
};

/**
 * Servicio para actualizar el perfil del usuario autenticado
 */
export const updateUserProfile = async (updateData: UserUpdateData): Promise<UserProfileResponse> => {
  try {
    const response = await authenticatedFetch(`${API_CONFIG.BASE_URL}/api/v1/profile/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Si hay errores de validación, mostrarlos
      if (errorData.errors && Array.isArray(errorData.errors)) {
        throw new Error(errorData.errors.join(', '));
      }
      
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const updatedProfile: UserProfileResponse = await response.json();
    return updatedProfile;
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    
    // Si es un error de sesión expirada, el authenticatedFetch ya lo maneja
    if (error.message?.includes('Session expired')) {
      throw error;
    }
    
    throw new Error(error.message || 'Error al actualizar el perfil del usuario');
  }
};

/**
 * Función helper para convertir UserProfileResponse a User
 * Mapea directamente la respuesta de la API sin campos adicionales
 */
export const mapProfileResponseToUser = (profileData: UserProfileResponse): User => {
  return {
    ...profileData,
    // Solo agregar campos opcionales que no vienen de la API
    avatar: undefined, // Campo opcional para futuro
  };
};