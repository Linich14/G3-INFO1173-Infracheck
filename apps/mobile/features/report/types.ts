import { localizacion } from '../map/types';

export interface ReportFormData {
    titulo: string;
    descripcion: string;
    direccion: string;
    latitud: number;
    longitud: number;
    urgencia: string;
    tipoDenuncia: string;
    ciudad: string;
    visible: boolean;
    imagenes: string[];
    video?: string;
}

export interface ReportFormErrors {
    titulo?: string;
    descripcion?: string;
    direccion?: string;
    ubicacion?: string;
    urgencia?: string;
    tipoDenuncia?: string;
    ciudad?: string;
}

export interface ReportPreviewData {
    titulo: string;
    descripcion: string;
    direccion: string;
    latitud: number;
    longitud: number;
    urgencia: string;
    tipoDenuncia: string;
    ciudad: string;
    visible: boolean;
    imagenes: string[];
    video?: string;
}

export interface CreateReportResponse {
    success: boolean;
    message: string;
    reportId?: string;
    data?: any;
    errors?: Record<string, string[]>;
}

// Interfaz para la respuesta del detalle del reporte
export interface ReportDetailResponse {
    success: boolean;
    data: {
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
    };
}

export interface ReportsListResponse {
    success: boolean;
    data: Array<{
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
    }>;
    pagination: {
        nextCursor: string | null;
        prevCursor: string | null;
        hasMore: boolean;
        count: number;
    };
}

export interface ReportForHome {
    id: string;
    title: string;
    author: string;
    timeAgo: string;
    image: any;
    upvotes: number;
    comments: any[];
    categoria: string;
    votos?: {
        count: number;
        usuario_ha_votado: boolean;
    };
    seguimiento?: {
        is_following: boolean;
        seguidores_count: number;
    };
    ubicacion?: {
        latitud: number;
        longitud: number;
    };
}
