import { useState } from 'react';
import { ReportService } from '../services/reportService';
import { useLanguage } from '~/contexts/LanguageContext';

export interface EditReportData {
    titulo: string;
    descripcion: string;
    direccion: string;
    latitud: number;
    longitud: number;
    urgencia: string;
    visible: boolean;
    tipo_denuncia: string;
    ciudad: string;
}

export interface EditReportResponse {
    success: boolean;
    message: string;
    data?: any;
    errors?: Record<string, string>;
}

export function useReportEdit() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useLanguage();

    const updateReport = async (
        reportId: string,
        data: EditReportData
    ): Promise<EditReportResponse> => {
        try {
            setLoading(true);
            setError(null);

            const response = await ReportService.updateReport(reportId, data);

            if (response.success) {
                return {
                    success: true,
                    message: t('reportEditSuccess') || 'Reporte actualizado exitosamente',
                    data: response.data,
                };
            } else {
                return {
                    success: false,
                    message:
                        response.message ||
                        t('reportEditError') ||
                        'Error al actualizar el reporte',
                    errors: response.errors,
                };
            }
        } catch (error: any) {
            console.error('Error in useReportEdit:', error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                t('reportEditUnexpectedError') ||
                'Error inesperado al actualizar el reporte';

            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    };

    const deleteReport = async (
        reportId: string,
        hardDelete: boolean = false
    ): Promise<EditReportResponse> => {
        try {
            setLoading(true);
            setError(null);

            const response = await ReportService.deleteReport(reportId, hardDelete);

            if (response.success) {
                return {
                    success: true,
                    message: hardDelete
                        ? t('reportDeleteHardSuccess') || 'Reporte eliminado permanentemente'
                        : t('reportDeleteSoftSuccess') || 'Reporte ocultado exitosamente',
                };
            } else {
                return {
                    success: false,
                    message:
                        response.message ||
                        t('reportDeleteError') ||
                        'Error al eliminar el reporte',
                };
            }
        } catch (error: any) {
            console.error('Error in deleteReport:', error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                t('reportDeleteUnexpectedError') ||
                'Error inesperado al eliminar el reporte';

            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    };

    return {
        updateReport,
        deleteReport,
        loading,
        error,
        setError,
    };
}
