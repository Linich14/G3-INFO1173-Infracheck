import api from '@shared/api';
import { ReportDetails } from '../types';

export class ReportService {
    /**
     * Obtener detalle de un reporte - GET /reports/{id}/
     */
    static async getReportDetail(id: string): Promise<ReportDetails> {
        try {
            const response = await api.get(`/api/reports/${id}/`);

            return response.data;
        } catch (error) {
            console.error('Error fetching report detail:', error);
            throw error;
        }
    }

    /**
     * Obtener reportes que el usuario sigue - GET /reports/followed/
     */
    static async getFollowedReports(page: number = 1, limit: number = 20): Promise<{ count: number; results: any[] }> {
        try {
            const response = await api.get('/api/reports/followed/', {
                params: { page, limit }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching followed reports:', error);
            throw error;
        }
    }

    /**
     * Dejar de seguir un reporte - POST /reports/{id}/unfollow/
     */
    static async unfollowReport(reportId: string): Promise<{ message: string; seguidores_count: number }> {
        try {
            const response = await api.post(`/api/reports/${reportId}/unfollow/`);

            return response.data;
        } catch (error) {
            console.error('Error unfollowing report:', error);
            throw error;
        }
    }
}
