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
 * Mapea la respuesta de la API y maneja valores null/undefined
 */
export const mapProfileResponseToUser = (profileData: UserProfileResponse): User => {
  // Crear full_name si no viene de la API o si es null
  let fullName = profileData.full_name;
  if (!fullName || fullName === 'null' || fullName.trim() === '') {
    const firstName = profileData.usua_nombre && profileData.usua_nombre !== 'null' ? profileData.usua_nombre : '';
    const lastName = profileData.usua_apellido && profileData.usua_apellido !== 'null' ? profileData.usua_apellido : '';
    fullName = `${firstName} ${lastName}`.trim() || profileData.usua_nickname || 'Usuario';
  }

  return {
    ...profileData,
    // Asegurar que full_name nunca sea null
    full_name: fullName,
    // Limpiar otros campos que podrían ser null
    usua_nombre: profileData.usua_nombre && profileData.usua_nombre !== 'null' ? profileData.usua_nombre : '',
    usua_apellido: profileData.usua_apellido && profileData.usua_apellido !== 'null' ? profileData.usua_apellido : '',
    usua_email: profileData.usua_email || '',
    usua_nickname: profileData.usua_nickname || `user_${profileData.usua_id}`,
    // Campo opcional para futuro
    avatar: undefined,
  };
};