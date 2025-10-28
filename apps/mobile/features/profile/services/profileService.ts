import { API_CONFIG } from '~/constants/config';
import { authenticatedFetch } from '~/features/auth/services/authService';
import { User, UserProfileResponse, UserUpdateData, ChangePasswordData, ChangePasswordResponse } from '../types';

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

/**
 * Servicio para eliminar/desactivar la cuenta del usuario autenticado
 * Realiza un soft delete de la cuenta
 */
export const deleteAccount = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await authenticatedFetch(`${API_CONFIG.BASE_URL}/api/v1/delete-account/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Body vacío como especificado
    });

    // Intentar parsear la respuesta JSON, pero manejar casos donde no hay contenido
    let data;
    try {
      const responseText = await response.text();
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      // Si no se puede parsear JSON, crear un objeto básico basado en el status
      data = {};
    }

    if (response.ok) {
      return {
        success: true,
        message: data.message || 'Cuenta desactivada exitosamente'
      };
    } else {
      return {
        success: false,
        message: data.message || data.error || `Error HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error: any) {
    console.error('Error deleting account:', error);
    
    // Si es un error de sesión expirada, el authenticatedFetch ya lo maneja
    if (error.message?.includes('Session expired')) {
      throw error;
    }
    
    return {
      success: false,
      message: error.message || 'Error de conexión al eliminar la cuenta'
    };
  }
};

/**
 * Servicio para cambiar la contraseña del usuario autenticado
 */
export const changePassword = async (passwordData: ChangePasswordData): Promise<ChangePasswordResponse> => {
  try {
    const response = await authenticatedFetch(`${API_CONFIG.BASE_URL}/api/v1/change-password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Contraseña cambiada exitosamente'
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.errors?.[0] || errorData.message || 'Error al cambiar la contraseña';
      return {
        success: false,
        message: errorMessage
      };
    }
  } catch (error: any) {
    console.error('Error changing password:', error);

    // Si es un error de sesión expirada, el authenticatedFetch ya lo maneja
    if (error.message?.includes('Session expired')) {
      throw error;
    }

    return {
      success: false,
      message: error.message || 'Error de conexión al cambiar la contraseña'
    };
  }
};

/**
 * Servicio para obtener estadísticas del usuario
 */
export const getUserStats = async (userId?: number): Promise<{ reportCount: number; upVotes: number }> => {
  try {
    const endpoint = userId 
      ? `${API_CONFIG.BASE_URL}/api/v1/users/${userId}/stats/`
      : `${API_CONFIG.BASE_URL}/api/v1/profile/stats/`;

    const response = await authenticatedFetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const stats = await response.json();
    return {
      reportCount: stats.report_count || 0,
      upVotes: stats.up_votes || 0,
    };
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return {
      reportCount: 0,
      upVotes: 0,
    };
  }
};