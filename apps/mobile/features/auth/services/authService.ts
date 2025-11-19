import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '~/constants/config';
import { secureStorage, initializeSecureStorage } from '~/services/secureStorage';

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';
const USER_ROLE_ID_KEY = 'user_role_id';
const USER_ROLE_NAME_KEY = 'user_role_name';
const USER_ID_KEY = 'user_id';

// Variable para controlar llamadas simultáneas a isAuthenticated
let isAuthenticating = false;
let lastAuthCheck = 0;
const AUTH_CHECK_INTERVAL = 60000; // Solo verificar con backend cada 60 segundos

// Función para migrar tokens existentes al almacenamiento seguro
export const migrateToSecureStorage = async (): Promise<void> => {
  try {
    // Verificar si ya hay un token en el almacenamiento seguro
    const secureToken = await secureStorage.getItem(TOKEN_KEY);
    if (secureToken) {
      return;
    }

    // Intentar obtener token del almacenamiento normal
    const legacyToken = await AsyncStorage.getItem(TOKEN_KEY);
    const expiryDate = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);

    if (legacyToken && expiryDate) {
      // Guardar en almacenamiento seguro
      await secureStorage.setItem(TOKEN_KEY, legacyToken);
    }
  } catch (error) {
    console.error('Error migrating to secure storage:', error);
  }
};

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

// Guardar token y fecha de expiración de forma segura
export const saveToken = async (token: string, expiresAt: string): Promise<void> => {
  try {
    // Intentar usar almacenamiento seguro primero
    await secureStorage.setItem(TOKEN_KEY, token);
    // Guardar fecha de expiración (no necesita ser encriptada)
    await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt);
  } catch (error) {
    console.error('Error saving token securely:', error);
    // Fallback a AsyncStorage normal
    try {
      await AsyncStorage.multiSet([
        [TOKEN_KEY, token],
        [TOKEN_EXPIRY_KEY, expiresAt]
      ]);
    } catch (fallbackError) {
      console.error('Fallback storage also failed:', fallbackError);
    }
  }
};

// Obtener token del almacenamiento local
// Obtener token del almacenamiento seguro
export const getToken = async (): Promise<string | null> => {
  try {
    // Intentar obtener el token del almacenamiento seguro primero
    const token = await secureStorage.getItem(TOKEN_KEY);
    const expiryDate = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);

    if (token && expiryDate) {
      // Verificar si el token ha expirado
      const now = new Date();
      const expiry = new Date(expiryDate);

      if (now >= expiry) {
        // Token expirado, limpiarlo
        await removeToken();
        return null;
      }

      return token;
    }

    return null;
  } catch (error) {
    console.error('Error getting token securely:', error);
    // Fallback a AsyncStorage normal
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
        await removeToken();
        return null;
      }

      return token;
    } catch (fallbackError) {
      console.error('Fallback storage also failed:', fallbackError);
      return null;
    }
  }
};// Eliminar token y fecha de expiración (logout)
// Eliminar token y fecha de expiración de forma segura (logout)
export const removeToken = async (): Promise<void> => {
  try {
    // Intentar usar almacenamiento seguro primero
    await secureStorage.removeItem(TOKEN_KEY);

    // Eliminar otros datos relacionados
    await AsyncStorage.multiRemove([TOKEN_EXPIRY_KEY, USER_ROLE_ID_KEY, USER_ROLE_NAME_KEY]);
  } catch (error) {
    console.error('Error removing token securely:', error);
    // Fallback a AsyncStorage normal
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, TOKEN_EXPIRY_KEY, USER_ROLE_ID_KEY, USER_ROLE_NAME_KEY]);
    } catch (fallbackError) {
      console.error('Fallback removal also failed:', fallbackError);
    }
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

// Guardar ID del usuario
export const saveUserId = async (userId: string | number): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userId.toString());
  } catch (error) {
    console.error('Error saving user ID:', error);
  }
};

// Obtener ID del usuario
export const getUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_ID_KEY);
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
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
export const isAuthenticated = async (forceCheck = false): Promise<boolean> => {
  const token = await getToken();
  if (!token) {
    return false;
  }

  // Si no es un check forzado y verificamos recientemente, confiar en token local
  const now = Date.now();
  if (!forceCheck && (now - lastAuthCheck) < AUTH_CHECK_INTERVAL) {
    return true;
  }

  // Verificar con el backend si el token es válido y no ha expirado
  try {
    // Evitar llamadas simultáneas a isAuthenticated
    if (isAuthenticating) {
      // Si ya hay una verificación en curso, retornar estado del token local
      return token !== null;
    }

    isAuthenticating = true;
    
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
        lastAuthCheck = now;
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
  } finally {
    isAuthenticating = false;
  }
};

// Login con backend
export async function loginUser(data: LoginData): Promise<AuthResponse> {
  try {
    // Verificar si hay un token guardado (no debería haberlo para login)
    // const existingToken = await getToken();
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();

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

      // Guardar ID del usuario
      if (result.user_id) {
        await saveUserId(result.user_id);
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
      return {
        success: false,
        message: result.message || result.error || 'authServiceInvalidCredentials',
      };
    }
  } catch (error: any) {
    console.error('Login error:', error.message);
    return {
      success: false,
      message: error.message || 'authServiceConnectionError',
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

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
      if (result.token && result.expires_at) {
        await saveToken(result.token, result.expires_at);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
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

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Si el token es inválido o expirado (401 Unauthorized), intentar refrescar
  if (response.status === 401) {
    const refreshSuccess = await refreshToken();

    if (refreshSuccess) {
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
          await removeToken();
          throw new Error('Session expired. Please log in again.');
        }
      } else {
        await removeToken();
        throw new Error('Session expired. Please log in again.');
      }
    } else {
      await removeToken();
      throw new Error('Session expired. Please log in again.');
    }
  }

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
        message: result.message || 'authServiceCodeSent',
      };
    } else {
      return {
        success: false,
        message: result.message || result.error || 'authServiceSendCodeError',
      };
    }
  } catch (error: any) {
    console.error('Password reset request error:', error);
    return {
      success: false,
      message: error.message || 'authServiceConnectionError',
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
        message: result.message || 'authServiceCodeVerified',
        reset_token: result.reset_token,
      };
    } else {
      return {
        success: false,
        message: result.message || result.error || 'authServiceCodeExpired',
      };
    }
  } catch (error: any) {
    console.error('Verify reset code error:', error);
    return {
      success: false,
      message: error.message || 'authServiceConnectionError',
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