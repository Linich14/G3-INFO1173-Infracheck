import { authenticatedFetch } from '~/features/auth/services/authService';
import { API_CONFIG } from '~/constants/config';
import api from '~/shared/api';

/**
 * Función utilitaria para probar la conectividad con el backend
 */
export const testBackendConnection = async (): Promise<{ success: boolean; message: string; url: string }> => {
  try {
    const url = `${API_CONFIG.BASE_URL}/api/v1/health/`; // Endpoint de health check si existe
    console.log('🔍 Probando conexión con backend:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return {
      success: response.ok,
      message: `Status: ${response.status} ${response.statusText}`,
      url: API_CONFIG.BASE_URL
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error de conexión: ${error.message}`,
      url: API_CONFIG.BASE_URL
    };
  }
};

/**
 * Función de debug para verificar configuración de votación
 */
export const debugVoteConfiguration = async (reportId: string | number = 1) => {
  console.log('🔧 Debug - Configuración de Votación');
  console.log('=====================================');

  // Verificar URL base
  console.log('📍 URL Base:', API_CONFIG.BASE_URL);

  // Verificar URL completa del endpoint
  const voteUrl = `${API_CONFIG.BASE_URL}/api/reports/${reportId}/vote/`;
  console.log('🎯 URL del endpoint de voto:', voteUrl);

  // Verificar autenticación
  console.log('🔐 Verificando autenticación...');
  try {
    const { isAuthenticated, getToken } = await import('~/features/auth/services/authService');
    const isAuth = await isAuthenticated();
    const token = await getToken();
    console.log('Estado de autenticación:', isAuth ? 'AUTENTICADO' : 'NO AUTENTICADO');
    console.log('Token disponible:', token ? 'SÍ' : 'NO', token ? `(longitud: ${token.length})` : '');
  } catch (error) {
    console.log('Error verificando autenticación:', error);
  }

  // Probar conexión básica
  console.log('🌐 Probando conexión básica...');
  const connectionTest = await testBackendConnection();
  console.log('Resultado:', connectionTest);

  // Verificar si el endpoint existe (sin autenticación)
  console.log('🔍 Verificando endpoint de voto...');
  try {
    const response = await fetch(voteUrl, {
      method: 'OPTIONS', // O GET si el endpoint lo permite
    });
    console.log('Endpoint response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
  } catch (error) {
    console.log('Error al verificar endpoint:', error);
  }

  console.log('=====================================');
  console.log('💡 URLs del backend:');
  console.log('   - Auth: /api/v1/* (login, verify-token, etc.)');
  console.log('   - Reports/Proyectos: /api/* (sin v1)');
  console.log('💡 Si ves "NO AUTENTICADO", necesitas iniciar sesión');
  console.log('💡 Si ves errores 403, el token podría ser inválido');
  console.log('💡 Si ves errores de red, verifica que el backend esté ejecutándose');
};

export interface VoteData {
  id: number;
  fecha_voto: string;
  usuario: {
    id: number;
    nickname: string;
  };
}

export interface ReportVotesResponse {
  count: number;
  results: VoteData[];
  usuario_ha_votado: boolean;
}

/**
 * Servicio para obtener los votos de un reporte específico
 */
export const getReportVotes = async (reportId: string | number): Promise<ReportVotesResponse> => {
  try {
    const response = await api.get(`/api/reports/${reportId}/votes/`);

    if (response.status === 200) {
      const data = response.data;
      return {
        count: data.count || 0,
        results: data.results || [],
        usuario_ha_votado: data.usuario_ha_votado || false,
      };
    } else if (response.status === 404) {
      return {
        count: 0,
        results: [],
        usuario_ha_votado: false,
      };
    } else if (response.status === 401) {
      return {
        count: 0,
        results: [],
        usuario_ha_votado: false,
      };
    } else {
      return {
        count: 0,
        results: [],
        usuario_ha_votado: false,
      };
    }
  } catch (error: any) {
    // Silenciosamente manejar errores comunes (403, 404, 401)
    if (error.response?.status === 404 || error.response?.status === 401 || error.response?.status === 403) {
      return {
        count: 0,
        results: [],
        usuario_ha_votado: false,
      };
    }
    
    console.error('Error obteniendo votos:', error.message);
    return {
      count: 0,
      results: [],
      usuario_ha_votado: false,
    };
  }
};

/**
 * Servicio para votar/unvotar un reporte
 */
export const toggleReportVote = async (reportId: string | number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post(`/api/reports/${reportId}/vote/`, {}, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.status === 201) {
      return {
        success: true,
        message: response.data.message || 'Voto registrado exitosamente'
      };
    } else {
      const errorMessage = response.data?.errors?.[0] || response.data?.message || 'Error al registrar el voto';
      return {
        success: false,
        message: errorMessage
      };
    }
  } catch (error: any) {
    if (error.message?.includes('Session expired')) {
      throw error;
    }

    const errorMessage = error.response?.data?.detail 
      || error.response?.data?.message 
      || error.response?.data?.error
      || error.message 
      || 'Error de conexión al votar';

    return {
      success: false,
      message: errorMessage
    };
  }
};