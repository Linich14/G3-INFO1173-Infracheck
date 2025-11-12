import { authenticatedFetch } from '~/features/auth/services/authService';
import { API_CONFIG } from '~/constants/config';
import api from '~/shared/api';

/**
 * Función utilitaria para probar la conectividad con el backend
 */
export const testBackendConnection = async (): Promise<{ success: boolean; message: string; url: string }> => {
  try {
    const url = `${API_CONFIG.BASE_URL}/api/v1/health/`; // Endpoint de health check si existe
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
  // Esta función se deja como utilidad pero sin logs para no saturar la consola en producción.
  // Si necesitas debug, habilita manualmente logs locales aquí.
  const voteUrl = `${API_CONFIG.BASE_URL}/api/reports/${reportId}/vote/`;
  // Probar conexión básica (sin loguear)
  await testBackendConnection();
  try {
    await fetch(voteUrl, { method: 'OPTIONS' });
  } catch {
    // Silencioso
  }
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
export const toggleReportVote = async (reportId: string | number): Promise<{ success: boolean; action?: 'added' | 'removed'; message: string }> => {
  try {
    const response = await api.post(`/api/reports/${reportId}/vote/`, {}, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    // El endpoint puede devolver 201 para creación o 204/200 para eliminación dependiendo del backend
    if (response.status === 201) {
      return {
        success: true,
        action: 'added',
        message: response.data?.message || 'Voto registrado exitosamente'
      };
    } else if (response.status === 204 || response.status === 200) {
      return {
        success: true,
        action: 'removed',
        message: response.data?.message || 'Voto eliminado exitosamente'
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