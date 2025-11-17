import api from '~/shared/api';
import { isAuthenticated, getUserId } from '~/features/auth/services/authService';
import {
    ReportFormData,
    CreateReportResponse,
    ReportDetailResponse,
    ReportsListResponse,
} from '../types';

export class ReportService {
    /**
     * Crear un nuevo reporte - POST /api/reports/create/
     */
    static async createReport(data: ReportFormData): Promise<CreateReportResponse> {
        try {
            console.log('Creating report with data:', data);
                // creating report (no debug log)

            // Verificar autenticación
            const authenticated = await isAuthenticated();
            if (!authenticated) {
                return {
                    success: false,
                    message: 'reportServiceSessionExpired', // Translation key
                };
            }

            const formData = new FormData();

            // Agregar campos de texto con validación
            formData.append('titulo', data.titulo.trim());
            formData.append('descripcion', data.descripcion.trim());
            formData.append('direccion', data.direccion.trim());
            formData.append('latitud', data.latitud.toString());
            formData.append('longitud', data.longitud.toString());

            // Validar y agregar urgencia
            if (!data.urgencia || !['1', '2', '3', '4'].includes(data.urgencia)) {
                console.error('Invalid urgencia value:', data.urgencia);
                return {
                    success: false,
                    message: 'reportServiceInvalidUrgency',
                };
            }
            formData.append('urgencia', data.urgencia);

            // Validar y agregar tipo_denuncia
            if (
                !data.tipoDenuncia ||
                !['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].includes(
                    data.tipoDenuncia
                )
            ) {
                console.error('Invalid tipoDenuncia value:', data.tipoDenuncia);
                return {
                    success: false,
                    message: 'reportServiceInvalidType',
                };
            }
            formData.append('tipo_denuncia', data.tipoDenuncia);

            // Validar y agregar ciudad
            if (!data.ciudad || !['1'].includes(data.ciudad)) {
                console.error('Invalid ciudad value:', data.ciudad);
                return {
                    success: false,
                    message: 'reportServiceInvalidCity',
                };
            }
            formData.append('ciudad', data.ciudad);

            formData.append('visible', data.visible.toString());

            // Agregar imágenes
            data.imagenes.forEach((imageUri, index) => {
                const filename = imageUri.split('/').pop() || `image_${index + 1}.jpg`;
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('imagenes', {
                    uri: imageUri,
                    name: filename,
                    type: type,
                } as any);
            });

            // Agregar video si existe
            if (data.video) {
                const videoFilename = data.video.split('/').pop() || 'video.mp4';
                const videoMatch = /\.(\w+)$/.exec(videoFilename);
                const videoType = videoMatch ? `video/${videoMatch[1]}` : 'video/mp4';

                formData.append('video', {
                    uri: data.video,
                    name: videoFilename,
                    type: videoType,
                } as any);
            }

            const response = await api.post('/api/reports/create/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return {
                success: true,
                message: response.data.message || 'reportServiceSuccess',
                reportId: response.data.id || response.data.report_id,
                data: response.data,
            };
        } catch (error: any) {
            console.error('Error creating report:', error);
            console.error('Error response:', error.response?.data);

            return ReportService.handleCreateReportError(error);
        }
    }

    /**
     * Obtener detalle de un reporte - GET /api/reports/{id}/
     */
    static async getReportDetail(reportId: string): Promise<ReportDetailResponse> {
        try {
            console.log('Getting report detail for ID:', reportId);
                // getting report detail

            // Verificar autenticación
            const authenticated = await isAuthenticated();
            if (!authenticated) {
                throw new Error('Sesión expirada. Inicie sesión nuevamente.');
            }

            const response = await api.get(`/api/reports/${reportId}/`);
            return response.data;
        } catch (error: any) {
            console.error('Error getting report detail:', error);
            console.error('Error response:', error.response?.data);
            throw error;
        }
    }

    /**
     * Obtener lista de reportes con paginación - GET /api/reports/
     */
    static async getReportsList(
        cursor?: string | null,
        limit: number = 10
    ): Promise<ReportsListResponse> {
        try {
            // Verificar autenticación
            const authenticated = await isAuthenticated();
            if (!authenticated) {
                throw new Error('Sesión expirada. Inicie sesión nuevamente.');
            }

            // Obtener ID del usuario para incluir en la petición
            const userId = await getUserId();

            // Construir parámetros de forma segura
            const params: Record<string, string> = {
                limit: limit.toString(),
            };

            // Agregar usuario_id si está disponible
            if (userId) {
                params.usuario_id = userId;
            }

            // Solo agregar cursor si es válido y no es null/undefined
            if (cursor && cursor.trim() !== '' && cursor !== 'null' && cursor !== 'undefined') {
                params.cursor = cursor;
            }

            const response = await api.get('/api/reports/', {
                params,
            });

            return response.data;
        } catch (error: any) {
            console.error('Error obteniendo reportes:', error.response?.status || error.message);

            // Re-lanzar el error para que lo maneje el hook
            throw error;
        }
    }

    /**
     * Obtener reportes que el usuario sigue - GET /api/reports/followed/
     */
    static async getFollowedReports(
        page: number = 1,
        limit: number = 20
    ): Promise<{ count: number; results: any[] }> {
        try {
            console.log('Getting followed reports:', { page, limit });

            // Verificar autenticación
            const authenticated = await isAuthenticated();
            if (!authenticated) {
                throw new Error('Sesión expirada. Inicie sesión nuevamente.');
            }

            const response = await api.get('/api/reports/followed/', {
                params: { page, limit },
            });

            return response.data;
        } catch (error: any) {
            console.error('Error fetching followed reports:', error);
            throw error;
        }
    }

    /**
     * Seguir un reporte - POST /api/reports/{id}/follow/
     */
    static async followReport(
        reportId: string
    ): Promise<{ message: string; seguidores_count: number }> {
        try {
            console.log('Following report:', reportId);

            // Verificar autenticación
            const authenticated = await isAuthenticated();
            if (!authenticated) {
                throw new Error('Sesión expirada. Inicie sesión nuevamente.');
            }

            const response = await api.post(`/api/reports/${reportId}/follow/`);
            return response.data;
        } catch (error: any) {
            console.error('Error following report:', error);
            throw error;
        }
    }

    /**
     * Dejar de seguir un reporte - DELETE /api/reports/{id}/unfollow/
     */
    static async unfollowReport(
        reportId: string
    ): Promise<{ message: string; seguidores_count: number }> {
        try {
            // Verificar autenticación
            const authenticated = await isAuthenticated();
            if (!authenticated) {
                throw new Error('Sesión expirada. Inicie sesión nuevamente.');
            }

            const response = await api.delete(`/api/reports/${reportId}/unfollow/`);
            return response.data;
        } catch (error: any) {
            console.error('Error dejando de seguir:', error.message);
            throw error;
        }
    }

    /**
     * Validar datos del reporte antes de enviar
     */
    static validateReportData(data: ReportFormData): Record<string, string> {
        const errors: Record<string, string> = {};

        if (!data.titulo.trim()) {
            errors.titulo = 'El título es obligatorio';
        } else if (data.titulo.length > 50) {
            errors.titulo = 'Máximo 50 caracteres';
        }

        if (!data.descripcion.trim()) {
            errors.descripcion = 'La descripción es obligatoria';
        } else if (data.descripcion.length > 3000) {
            errors.descripcion = 'Máximo 3000 caracteres';
        }

        if (!data.direccion.trim()) {
            errors.direccion = 'La dirección es obligatoria';
        } else if (data.direccion.length > 200) {
            errors.direccion = 'Máximo 200 caracteres';
        }

        if (!data.tipoDenuncia) {
            errors.tipoDenuncia = 'Seleccione un tipo de denuncia';
        }

        if (!data.urgencia) {
            errors.urgencia = 'Seleccione un nivel de urgencia';
        }

        if (!data.ciudad) {
            errors.ciudad = 'Seleccione una ciudad';
        }

        if (data.latitud === 0 || data.longitud === 0) {
            errors.ubicacion = 'Seleccione una ubicación en el mapa';
        }

        return errors;
    }

    /**
     * Manejar errores de creación de reporte
     */
    private static handleCreateReportError(
        error: any,
        t: (key: string) => string
    ): CreateReportResponse {
        // Manejo simplificado de errores
        if (error.response) {
            const statusCode = error.response.status;
            const responseData = error.response.data;

            if (statusCode === 400 && responseData.errors) {
                return {
                    success: false,
                    message: t('reportValidationFormError'),
                    errors: responseData.errors,
                };
            }

            if (statusCode === 401) {
                return {
                    success: false,
                    message: t('reportServiceSessionExpired'),
                };
            }

            if (statusCode === 413) {
                return {
                    success: false,
                    message: t('reportValidationFilesError'),
                };
            }

            return {
                success: false,
                message:
                    responseData.detail ||
                    responseData.message ||
                    t('reportServiceErrorCreate'),
            };
        }

        if (error.request || error.code === 'ECONNABORTED') {
            return {
                success: false,
                message: t('reportValidationNetworkError'),
            };
        }

        return {
            success: false,
            message: t('reportValidationUnexpectedError'),
        };
    }
}

// Exportar funciones individuales para compatibilidad con código existente
export const createReport = ReportService.createReport.bind(ReportService);
export const getReportDetail = ReportService.getReportDetail.bind(ReportService);
export const getReportsList = ReportService.getReportsList.bind(ReportService);
export const validateReportData = ReportService.validateReportData.bind(ReportService);
export const getFollowedReports = ReportService.getFollowedReports.bind(ReportService);
export const followReport = ReportService.followReport.bind(ReportService);
export const unfollowReport = ReportService.unfollowReport.bind(ReportService);

// Exportar por defecto
export default ReportService;
