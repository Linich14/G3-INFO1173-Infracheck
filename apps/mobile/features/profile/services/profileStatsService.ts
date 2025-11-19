import api from '~/shared/api';

export interface ProfileStatsResponse {
  reportes_creados: number;
  reportes_seguidos: number;
  votos_recibidos: number;
  votos_realizados: number;
}

/**
 * Obtiene las estadísticas del usuario autenticado
 */
export const getProfileStats = async (): Promise<ProfileStatsResponse> => {
  const response = await api.get<ProfileStatsResponse>('/api/v1/profile/stats/');
  return response.data;
};
