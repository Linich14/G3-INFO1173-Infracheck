// hooks/useReportDetail.ts
import { useState, useEffect } from 'react';
import { ReportService } from '../services/reportService';

interface ApiReportDetails {
    id: number;
    titulo: string;
    descripcion: string;
    direccion: string;
    ubicacion: {
        latitud: number;
        longitud: number;
    };
    urgencia: {
        valor: number;
        etiqueta: string;
    };
    visible: boolean;
    fecha_creacion: string;
    fecha_actualizacion: string;
    usuario: {
        id: number;
        nombre: string;
        email: string;
    };
    estado: {
        id: number;
        nombre: string;
    };
    tipo_denuncia: {
        id: number;
        nombre: string;
    };
    ciudad: {
        id: number;
        nombre: string;
    };
    archivos: Array<{
        id: number;
        nombre: string;
        url: string;
        tipo: string;
        mime_type: string;
        es_principal: boolean;
        orden: number;
    }>;
    estadisticas: {
        total_archivos: number;
        imagenes: number;
        videos: number;
        dias_desde_creacion: number;
        puede_agregar_imagenes: boolean;
        puede_agregar_videos: boolean;
    };
    votos?: {
        count: number;
        usuario_ha_votado: boolean;
    };
    seguimiento?: {
        is_following: boolean;
        seguidores_count: number;
    };
}

// Tipo adaptado para el componente
export interface ReportDetails {
    id: string;
    titulo: string;
    descripcion: string;
    tipoDenuncia: string;
    fecha: string;
    nivelUrgencia: string;
    estado: string;
    ubicacion: {
        direccion: string;
        latitud: number;
        longitud: number;
    };
    imagenes: string[];
    video?: string;
    usuario: {
        id: number;
        nombre: string;
        email: string;
    };
    ciudad: string;
    estadisticas: {
        total_archivos: number;
        imagenes: number;
        videos: number;
        dias_desde_creacion: number;
        puede_agregar_imagenes: boolean;
        puede_agregar_videos: boolean;
    };
    votos?: {
        count: number;
        usuario_ha_votado: boolean;
    };
    seguimiento?: {
        is_following: boolean;
        seguidores_count: number;
    };
}

const adaptReportData = (apiData: ApiReportDetails): ReportDetails => {
    // Obtener la URL base del API
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

    // Filtrar y ordenar imágenes
    const imagenes = apiData.archivos
        .filter((archivo) => archivo.tipo === 'imagen')
        .sort((a, b) => a.orden - b.orden)
        .map((archivo) => {
            // Construir la URL completa si es necesario
            return archivo.url.startsWith('http') ? archivo.url : `${API_BASE_URL}${archivo.url}`;
        });

    // Buscar video si existe
    const videoArchivo = apiData.archivos.find((archivo) => archivo.tipo === 'video');

    return {
        id: apiData.id.toString(),
        titulo: apiData.titulo,
        descripcion: apiData.descripcion,
        tipoDenuncia: apiData.tipo_denuncia.nombre,
        fecha: apiData.fecha_creacion,
        nivelUrgencia: apiData.urgencia.etiqueta,
        estado: apiData.estado.nombre,
        ubicacion: {
            direccion: apiData.direccion,
            latitud: apiData.ubicacion.latitud,
            longitud: apiData.ubicacion.longitud,
        },
        imagenes,
        video: videoArchivo
            ? videoArchivo.url.startsWith('http')
                ? videoArchivo.url
                : `${API_BASE_URL}${videoArchivo.url}`
            : undefined,
        usuario: apiData.usuario,
        ciudad: apiData.ciudad.nombre,
        estadisticas: apiData.estadisticas,
        votos: apiData.votos, // Pasar estructura embebida
        seguimiento: apiData.seguimiento, // Pasar estructura embebida
    };
};

export const useReportDetail = (reportId: string) => {
    const [report, setReport] = useState<ReportDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReport = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ReportService.getReportDetail(reportId);

            if (response.success && response.data) {
                const adaptedReport = adaptReportData(response.data);
                setReport(adaptedReport);
            } else {
                setError('No se pudo cargar el reporte');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error al cargar el reporte';
            setError(errorMessage);
            console.error('Error in useReportDetail:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (reportId) {
            fetchReport();
        }
    }, [reportId]);

    return {
        report,
        loading,
        error,
        refetch: fetchReport,
    };
};
