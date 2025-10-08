import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '~/constants/config';

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';
const USER_ROLE_ID_KEY = 'user_role_id';
const USER_ROLE_NAME_KEY = 'user_role_name';

export interface LoginData {
  rut: string;
  password: string;
}

export interface User {
  id: string;
  rut: string;
  email: string;
  username: string;
  rous_id: number;
  rous_nombre: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  expires_at?: string;
  user?: User;
}

export interface PasswordResetRequest {
  identifier: string; // RUT o email
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

export interface VerifyResetCodeRequest {
  identifier: string;
  code: string;
}

export interface VerifyResetCodeResponse {
  success: boolean;
  message: string;
  reset_token?: string;
}

export interface ResetPasswordRequest {
  reset_token: string;
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// Guardar token y fecha de expiración en almacenamiento local
export const saveToken = async (token: string, expiresAt: string): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [TOKEN_EXPIRY_KEY, expiresAt]
    ]);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// Obtener token del almacenamiento local
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const expiryDate = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!token || !expiryDate) {
      return null;
    }

    // Verificar si el token ha expirado
    const now = new Date();
    const expiry = new Date(expiryDate);
    
    if (now >= expiry) {
      // Token expirado, limpiarlo
      await removeToken();
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Eliminar token y fecha de expiración (logout)
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, TOKEN_EXPIRY_KEY, USER_ROLE_ID_KEY, USER_ROLE_NAME_KEY]);
  } catch (error) {
    console.error('Error removing token and role:', error);
  }
};

// Guardar datos del rol del usuario
export const saveUserRole = async (rous_id: number, rous_nombre: string): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      [USER_ROLE_ID_KEY, rous_id.toString()],
      [USER_ROLE_NAME_KEY, rous_nombre]
    ]);
  } catch (error) {
    console.error('Error saving user role:', error);
  }
};

// Obtener datos del rol del usuario
export const getUserRole = async (): Promise<{rous_id: number, rous_nombre: string} | null> => {
  try {
    const roleId = await AsyncStorage.getItem(USER_ROLE_ID_KEY);
    const roleName = await AsyncStorage.getItem(USER_ROLE_NAME_KEY);

    if (!roleId || !roleName) return null;

    return {
      rous_id: parseInt(roleId),
      rous_nombre: roleName
    };
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Verificar si hay sesión activa y el token es válido
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  if (!token) {
    return false;
  }

  // Verificar con el backend si el token es válido y no ha expirado
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/verify-token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
      if (result.valid) {
        return true;
      } else {
        // Token inválido o expirado según el backend, cerrar sesión
        await removeToken();
        return false;
      }
    } else if (response.status === 401) {
      // Token no autorizado, cerrar sesión
      await removeToken();
      return false;
    }
    
    // Error del servidor, pero token existe localmente
    return false;
  } catch (error) {
    console.error('Error verifying token:', error);
    // En caso de error de red, confiar en la verificación local
    return token !== null;
  }
};

// Login con backend
export async function loginUser(data: LoginData): Promise<AuthResponse> {
  try {
    // Debug: Log what we're sending to the backend
    console.log('Sending login data:', data);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    // Debug: Log the response to understand what the backend is returning
    console.log('Backend response status:', response.status);
    console.log('Backend response data:', result);

    // El backend envía token cuando el login es exitoso, no un campo 'success'
    if (response.ok && result.token) {
      // Guardar token y fecha de expiración automáticamente si el login es exitoso
      if (result.expires_at) {
        await saveToken(result.token, result.expires_at);
      }

      // Guardar datos del rol del usuario
      if (result.rous_id && result.rous_nombre) {
        await saveUserRole(result.rous_id, result.rous_nombre);
      }

      return {
        success: true,
        message: result.message || 'Inicio de sesión exitoso',
        token: result.token,
        expires_at: result.expires_at,
        user: {
          id: result.user_id?.toString() || '',
          rut: result.rut || '',
          email: result.email || '',
          username: result.username || '',
          rous_id: result.rous_id || 0,
          rous_nombre: result.rous_nombre || '',
        },
      };
    } else {
      // Debug: Log detailed error information
      console.log('Login failed. Response status:', response.status);
      console.log('Login failed. Response data:', result);
      
      return {
        success: false,
        message: result.message || result.error || 'Verifica tus credenciales.',
      };
    }
  } catch (error: any) {
    console.error('Login network/parsing error:', error);
    return {
      success: false,
      message: error.message || 'Error de conexión. Verifica tu conexión a internet.',
    };
  }
}

// Logout
export const logout = async (): Promise<void> => {
  try {
    const token = await getToken();
    if (token) {
      // Llamar al backend para invalidar el token en la tabla Sesion_Token
      await fetch(`${API_CONFIG.BASE_URL}/api/v1/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error('Error during backend logout:', error);
    // Continuar con la limpieza local aunque falle el backend
  } finally {
    // Siempre limpiar el token local
    await removeToken();
  }
};

// Función para refrescar el token
export const refreshToken = async (): Promise<boolean> => {
  try {
    const token = await getToken();
    if (!token) {
      return false;
    }

    console.log('🔄 Intentando refrescar token...');
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('🔄 Refresh response status:', response.status);
    if (response.ok) {
      const result = await response.json();
      console.log('🔄 Refresh response data:', result);
      
      if (result.token && result.expires_at) {
        await saveToken(result.token, result.expires_at);
        console.log('✅ Token refrescado exitosamente');
        return true;
      }
    }
    console.log('❌ Falló el refresh del token');
    return false;
  } catch (error) {
    console.error('❌ Error refrescando token:', error);
    return false;
  }
};

// Función para hacer requests autenticadas
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = await getToken();
  
  if (!token) {
    throw new Error('No authenticated token available');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  headers['Authorization'] = `Bearer ${token}`;

  // 🔍 DEBUG: Log detallado del token y headers
  console.log('🔑 authenticatedFetch DEBUG:');
  console.log('  - URL:', url);
  console.log('  - Method:', options.method || 'GET');
  console.log('  - Token presente:', !!token);
  console.log('  - Token length:', token?.length || 0);
  console.log('  - Token preview:', token ? token.substring(0, 50) + '...' : 'N/A');
  console.log('  - Authorization header:', headers['Authorization'] ? 'Bearer [SET]' : 'NOT SET');

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Si el token es inválido o expirado (401 Unauthorized), intentar refrescar
  if (response.status === 401) {
    console.log('🔄 Token expired, attempting refresh...');
    const refreshSuccess = await refreshToken();
    
    if (refreshSuccess) {
      console.log('✅ Token refreshed successfully, retrying request...');
      // Re-obtener el nuevo token
      const newToken = await getToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        
        // Reintentar la petición con el nuevo token
        response = await fetch(url, {
          ...options,
          headers,
        });
        
        // Si aún falla después del refresh, entonces cerrar sesión
        if (response.status === 401) {
          console.log('❌ Token still invalid after refresh, logging out...');
          await removeToken();
          throw new Error('Session expired. Please log in again.');
        }
      } else {
        console.log('❌ Failed to get new token after refresh, logging out...');
        await removeToken();
        throw new Error('Session expired. Please log in again.');
      }
    } else {
      console.log('❌ Token refresh failed, logging out...');
      await removeToken();
      throw new Error('Session expired. Please log in again.');
    }
  }

  // No procesar respuestas 403 aquí para evitar "Already read"
  // Dejamos que el código llamador maneje los errores específicos
  return response;
};

// ========== FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA ==========

// Solicitar reset de contraseña
export const requestPasswordReset = async (data: PasswordResetRequest): Promise<PasswordResetResponse> => {
  try {
    console.log('Requesting password reset for:', data.identifier);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/request-password-reset/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    console.log('Password reset request response:', result);

    if (response.ok) {
      return {
        success: result.success || true,
        message: result.message || 'Código enviado exitosamente',
      };
    } else {
      return {
        success: false,
        message: result.message || result.error || 'Error al enviar el código',
      };
    }
  } catch (error: any) {
    console.error('Password reset request error:', error);
    return {
      success: false,
      message: error.message || 'Error de conexión. Verifica tu conexión a internet.',
    };
  }
};

// Verificar código de reset
export const verifyResetCode = async (data: VerifyResetCodeRequest): Promise<VerifyResetCodeResponse> => {
  try {
    console.log('Verifying reset code for:', data.identifier);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/verify-reset-code/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    console.log('Verify reset code response:', result);

    if (response.ok && result.success) {
      return {
        success: true,
        message: result.message || 'Código verificado exitosamente',
        reset_token: result.reset_token,
      };
    } else {
      return {
        success: false,
        message: result.message || result.error || 'Código inválido o expirado',
      };
    }
  } catch (error: any) {
    console.error('Verify reset code error:', error);
    return {
      success: false,
      message: error.message || 'Error de conexión. Verifica tu conexión a internet.',
    };
  }
};

// Resetear contraseña
export const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  try {
    console.log('Resetting password with token and confirm_password');
    console.log('Reset password data:', { ...data, new_password: '[HIDDEN]', confirm_password: '[HIDDEN]' });
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/reset-password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    console.log('Reset password response:', result);

    if (response.ok && result.success) {
      return {
        success: true,
        message: result.message || 'Contraseña actualizada exitosamente',
      };
    } else {
      // Manejar errores específicos del backend
      let errorMessage = 'Error al actualizar la contraseña';
      
      if (result.errors && Array.isArray(result.errors)) {
        errorMessage = result.errors.join(', ');
      } else if (result.message) {
        errorMessage = result.message;
      } else if (result.error) {
        errorMessage = result.error;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  } catch (error: any) {
    console.error('Reset password error:', error);
    return {
      success: false,
      message: error.message || 'Error de conexión. Verifica tu conexión a internet.',
    };
  }
};