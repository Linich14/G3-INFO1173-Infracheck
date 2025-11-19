import axios from 'axios';
import { API_CONFIG } from '~/constants/config';
import { getToken } from '~/features/auth/services/authService';

const API_URL = API_CONFIG.BASE_URL;

export interface DeleteReportResponse {
  success: boolean;
  message: string;
}

export const adminReportService = {
  /**
   * Elimina un reporte (solo administradores)
   * @param reportId - ID del reporte a eliminar
   * @param hardDelete - Si es true, elimina permanentemente. Si es false, solo oculta
   */
  async deleteReport(reportId: string | number, hardDelete: boolean = false): Promise<DeleteReportResponse> {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const url = `${API_URL}/api/reports/${reportId}/delete/${hardDelete ? '?hard_delete=true' : ''}`;
      
      const response = await axios.delete<DeleteReportResponse>(
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
      throw new Error(error.response?.data?.error || 'Error al eliminar el reporte');
    }
  },
};
