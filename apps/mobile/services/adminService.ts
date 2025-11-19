import { API_CONFIG } from '~/constants/config';
import { authenticatedFetch } from '~/features/auth/services/authService';

export interface AdminStats {
  total_users: number;
  total_reports: number;
  active_users_24h?: number;
  new_users_today?: number;
}

export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const response = await authenticatedFetch(
      `${API_CONFIG.BASE_URL}/api/admin/stats/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    throw new Error(error.message || 'Error al obtener las estadísticas');
  }
};
