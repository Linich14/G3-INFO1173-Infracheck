import { API_CONFIG } from '~/constants/config';
import { authenticatedFetch } from '../../auth/services/authService';

// Definir todos los tipos necesarios
export interface User {
  usua_id: number;
  usua_rut: string;
  usua_nickname: string;
  usua_email: string;
  usua_telefono: number;
  rous_id: number; // ID del rol (1=Usuario, 2=Administrador, 3=Autoridad)
  usua_estado: number; // 0=Deshabilitado, 1=Habilitado
  usua_creado: string;
}

export interface Role {
  rous_id: number;
  rous_nombre: string;
}

export interface UsersResponse {
  success: boolean;
  data?: User[];
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface UpdateStatusResponse {
  usua_id: number;
  usua_estado: number;
  updated_at: string;
}

// Cache para controlar las peticiones
let lastFetchTime = 0;
let lastRequestTime = 0;
let cachedUsers: User[] | null = null;
const CACHE_DURATION = 60000; // 1 minuto en ms
const MIN_REQUEST_INTERVAL = 5000; // 5 segundos entre peticiones

/**
 * Obtiene la lista completa de usuarios
 * Solo accesible para administradores (rous_id = 1)
 */
export const getUsers = async (): Promise<{ success: boolean; data?: User[]; message?: string }> => {
  try {
    // Verificar rol del usuario antes de hacer la petición
    const { getUserRole, isAuthenticated } = await import('../../auth/services/authService');
    const userRole = await getUserRole();
    const authenticated = await isAuthenticated();
    
    // Verificación de autenticación
    if (!authenticated) {
      return {
        success: false,
        message: 'Token inválido. Inicia sesión nuevamente.'
      };
    }
    
    // 🔍 DEBUG: Verificación detallada de rol
    console.log('🔍 ROL DEBUG:', {
      userRole: userRole,
      rous_id: userRole?.rous_id,
      rous_id_type: typeof userRole?.rous_id,
      rous_nombre: userRole?.rous_nombre,
      isAdmin: userRole?.rous_id === 1,
      comparison: `${userRole?.rous_id} === 1 = ${userRole?.rous_id === 1}`
    });

    // Verificación de rol administrador
    if (!userRole || userRole.rous_id !== 1) {
      console.log('❌ ACCESO DENEGADO - Rol no es administrador:', {
        hasUserRole: !!userRole,
        rous_id: userRole?.rous_id,
        expected: 1,
        roleName: userRole?.rous_nombre
      });
      return {
        success: false,
        message: 'Acceso denegado. No eres administrador.'
      };
    }
    
    const url = `${API_CONFIG.BASE_URL}/api/users`;
    console.log('📡 GET /api/users - Token: Bearer [hidden], Role:', userRole.rous_nombre);

    const response = await authenticatedFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const status = response.status;
      let message = 'Error desconocido';
      
      if (status === 403) {
        message = 'Acceso denegado. No eres administrador.';
      } else if (status === 401) {
        message = 'Token inválido. Inicia sesión nuevamente.';
      } else if (status === 500) {
        message = 'Error interno del servidor.';
      } else {
        message = `Error del servidor: ${status}`;
      }
      
      console.error('❌ Error en la respuesta:', status, message);
      return { success: false, message };
    }

    const responseData = await response.json();
    
    // Estructura de respuesta esperada: { data: User[] } o User[] directamente
    const data = responseData.data || responseData;

    return { 
      success: true, 
      data: Array.isArray(data) ? data : []
    };
    
  } catch (error: any) {
    console.error('❌ Error obteniendo usuarios:', error);
    
    // Manejo específico de errores de red/conexión
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      return { 
        success: false, 
        message: 'Error de conexión. Verifica tu conexión a internet.' 
      };
    }
    
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido al obtener usuarios' 
    };
  }
};

/**
 * Carga usuarios con cache inteligente y control de spam
 */
export const loadUsersWithCache = async (forceReload: boolean = false): Promise<{ success: boolean; data?: User[]; message?: string }> => {
  const now = Date.now();
  
  // Validar tiempo mínimo entre peticiones para evitar spam
  if (!forceReload && now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - (now - lastRequestTime)) / 1000);
    
    // Si tenemos datos en cache, devolverlos
    if (cachedUsers) {
      return { success: true, data: cachedUsers };
    }
  }
  
  // Verificar cache
  const isCacheValid = cachedUsers && (now - lastFetchTime < CACHE_DURATION);
  
  if (!forceReload && isCacheValid) {
    return { success: true, data: cachedUsers || [] };
  }
  
  lastRequestTime = now;
  const result = await getUsers();
  
  if (result.success && result.data) {
    cachedUsers = result.data;
    lastFetchTime = now;
  }
  
  return result;
};

/**
 * Actualiza el estado de un usuario (activar/desactivar)
 */
export const updateUserStatus = async (userId: number, newStatus: number): Promise<{ success: boolean; data?: UpdateStatusResponse; message?: string }> => {
  try {
    const url = `${API_CONFIG.BASE_URL}/api/users/${userId}/status`;
    console.log(`📡 PUT /api/users/${userId}/status - Body: {usua_estado: ${newStatus}}`);

    const response = await authenticatedFetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        usua_estado: newStatus 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error actualizando estado:', response.status, errorText);
      return { success: false, message: `Error ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    
    // Invalidar cache después de actualización exitosa
    cachedUsers = null;
    lastFetchTime = 0;

    return { success: true, data };
    
  } catch (error) {
    console.error('❌ Error actualizando estado del usuario:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido al actualizar usuario' 
    };
  }
};

/**
 * Busca usuarios por término de búsqueda
 */
export const searchUsers = async (searchTerm: string): Promise<{ success: boolean; data?: User[]; message?: string }> => {
  try {
    if (!searchTerm.trim()) {
      // Si no hay término de búsqueda, devolver todos los usuarios con cache
      return await loadUsersWithCache();
    }

    const url = `${API_CONFIG.BASE_URL}/api/users/search?q=${encodeURIComponent(searchTerm)}`;
    console.log(`📡 GET /api/users/search?q=${encodeURIComponent(searchTerm)}`);

    const response = await authenticatedFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en búsqueda:', response.status, errorText);
      return { success: false, message: `Error ${response.status}: ${errorText}` };
    }

    const data = await response.json();

    return { success: true, data: data || [] };
    
  } catch (error) {
    console.error('❌ Error buscando usuarios:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido en la búsqueda' 
    };
  }
};

/**
 * Función de diagnóstico para debug de autenticación
 */
export const diagnoseAuth = async (): Promise<{ success: boolean; message: string; details: any }> => {
  try {
    const { getToken, getUserRole, isAuthenticated } = await import('../../auth/services/authService');
    const token = await getToken();
    const userRole = await getUserRole();
    const authenticated = await isAuthenticated();
    
    // Verificación flexible de admin
    const isAdmin = userRole && (userRole.rous_id === 1);
    
    const diagnosis = {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 30) + '...' : null,
      roleId: userRole?.rous_id || null,
      roleIdType: typeof userRole?.rous_id,
      roleName: userRole?.rous_nombre || null,
      isAdmin: isAdmin,
      adminCheck: {
        strict: userRole?.rous_id === 1,
        number: Number(userRole?.rous_id) === 1
      },
      authenticated: authenticated,
      timestamp: new Date().toISOString()
    };
    
    if (!token) {
      return {
        success: false,
        message: 'No hay token de autenticación disponible',
        details: diagnosis
      };
    }
    
    if (!authenticated) {
      return {
        success: false,
        message: 'Usuario no está autenticado',
        details: diagnosis
      };
    }
    
    if (!userRole || !isAdmin) {
      return {
        success: false,
        message: `Usuario no es administrador. Rol: ${userRole?.rous_nombre || 'Desconocido'} (ID: ${userRole?.rous_id}, tipo: ${typeof userRole?.rous_id})`,
        details: diagnosis
      };
    }
    
    return {
      success: true,
      message: 'Autenticación y permisos correctos',
      details: diagnosis
    };
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return {
      success: false,
      message: 'Error ejecutando diagnóstico: ' + (error instanceof Error ? error.message : 'Error desconocido'),
      details: { error: error instanceof Error ? error.message : 'Error desconocido' }
    };
  }
};

/**
 * Función para probar conectividad con el servidor
 */
export const testConnection = async (): Promise<{ success: boolean; message: string; details?: any }> => {
  try {
    const url = `${API_CONFIG.BASE_URL}/api/users`;
    
    const response = await authenticatedFetch(url, {
      method: 'HEAD', // Solo verifica conectividad sin obtener datos
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Conexión exitosa con el servidor',
        details: {
          status: response.status,
          url: url
        }
      };
    } else {
      return {
        success: false,
        message: `Error de conexión: ${response.status}`,
        details: {
          status: response.status,
          url: url,
          statusText: response.statusText
        }
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Error de red o servidor no disponible',
      details: {
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    };
  }
};

/**
 * Sistema de polling para mantener datos actualizados
 */
export const startUserPolling = (callback: (users: User[]) => void, intervalMs: number = 60000) => {
  const pollUsers = async () => {
    try {
      const result = await loadUsersWithCache(false);
      if (result.success && result.data) {
        callback(result.data);
      }
    } catch (error) {
      // Silenciar errores de polling para evitar spam
    }
  };
  
  const intervalId = setInterval(pollUsers, intervalMs);
  
  // Polling inicial
  pollUsers();
  
  return () => clearInterval(intervalId);
};