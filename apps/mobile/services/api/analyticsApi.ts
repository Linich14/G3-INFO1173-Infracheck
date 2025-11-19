import axios from 'axios';
import { API_CONFIG } from '~/constants/config';
import { getToken } from '~/features/auth/services/authService';

const API_URL = API_CONFIG.BASE_URL;

export interface AnalyticsStatsResponse {
  success: boolean;
  reports_by_day: number[];
  reports_this_week: number;
  week_change_percent: number;
  peak_max: number;
  active_users_24h: number;
  new_reports_week: number;
  categories: Record<string, number>;
}

export const analyticsApi = {
  /**
   * Obtiene estadísticas detalladas para el dashboard de analytics
   */
  async getAnalyticsStats(): Promise<AnalyticsStatsResponse> {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const url = `${API_URL}/api/admin/analytics/`;
      
      const response = await axios.get<AnalyticsStatsResponse>(
        url,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al cargar estadísticas de analytics');
    }
  },
};
