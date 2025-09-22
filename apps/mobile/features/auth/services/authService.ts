import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

export interface LoginData {
  rut: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  expires_at?: string; // Fecha de expiración del token
  user?: {
    id: string;
    rut: string;
    email: string;
    username: string;
  };
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
    await AsyncStorage.multiRemove([TOKEN_KEY, TOKEN_EXPIRY_KEY]);
  } catch (error) {
    console.error('Error removing token:', error);
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
    const response = await fetch('http://192.168.1.5:8000/api/v1/verify-token/', {
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
    
    const response = await fetch('http://192.168.1.5:8000/api/v1/login/', {
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
      await fetch('http://192.168.1.5:8000/api/v1/logout/', {
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

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Si el token es inválido, expirado o no autorizado (401 Unauthorized)
  if (response.status === 401) {
    // Cerrar sesión automáticamente
    await removeToken();
    throw new Error('Session expired. Please log in again.');
  }

  // Si hay otros errores relacionados con autenticación (403 Forbidden)
  if (response.status === 403) {
    const result = await response.json().catch(() => ({}));
    if (result.message?.includes('expired') || result.message?.includes('invalid')) {
      await removeToken();
      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
};