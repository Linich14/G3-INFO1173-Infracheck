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
}
