export type localizacion = {
    latitud: number;
    longitud: number;
    direccion: string;
};

export type PinDetails = {
    id: string;
    titulo: string;
    descripcion: string;
    tipoDenuncia: string;
    ubicacion: localizacion;
    nivelUrgencia: string;
    fecha: string;
    imagenes: string[];
    video: string;
};

export enum AnnotationType {
    CALLES_VEREDAS = '1',
    ALUMBRADO_DANADO = '2',
    DRENAJE_AGUAS = '3',
    PARQUES_ARBOLES = '4',
    BASURA_ESCOMBROS = '5',
    EMERGENCIAS_RIESGOS = '6',
    MOBILIARIO_DANADO = '7',
}

export interface AnnotationData {
    id: string;
    type: AnnotationType;
    coordinate: [number, number];
    title: string;
    description?: string;
    // Usar directamente los strings del backend (ya están en español)
    severity?: string; // "Baja", "Media", "Alta", "Crítica"
    status?: string; // "Abierto", "En Revisión", "En Proceso", "Resuelto", "Cerrado", "Rechazado"
    // Campos adicionales del backend
    direccion?: string;
    urgencia?: number;
    urgencia_label?: string;
    estado?: number;
    estado_nombre?: string;
    tipo_denuncia?: number;
    tipo_denuncia_nombre?: string;
    ciudad_nombre?: string;
    fecha_creacion?: string;
    imagen_principal?: string;
    total_archivos?: number;
    es_mi_reporte?: boolean;
    usuario_nombre?: string;
    marker_color?: string;
}

export interface AnnotationConfig {
    icon: string;
    color: string;
    size: number;
}

export const ANNOTATION_CONFIGS: Record<AnnotationType, AnnotationConfig> = {
    [AnnotationType.CALLES_VEREDAS]: {
        icon: 'road-variant',
        color: '#FF9800',
        size: 32,
    },
    [AnnotationType.ALUMBRADO_DANADO]: {
        icon: 'lightbulb-off',
        color: '#FFD700',
        size: 32,
    },
    [AnnotationType.DRENAJE_AGUAS]: {
        icon: 'pipe-wrench',
        color: '#2196F3',
        size: 32,
    },
    [AnnotationType.PARQUES_ARBOLES]: {
        icon: 'tree',
        color: '#4CAF50',
        size: 32,
    },
    [AnnotationType.BASURA_ESCOMBROS]: {
        icon: 'delete',
        color: '#9C27B0',
        size: 32,
    },
    [AnnotationType.EMERGENCIAS_RIESGOS]: {
        icon: 'alert-circle',
        color: '#F44336',
        size: 32,
    },
    [AnnotationType.MOBILIARIO_DANADO]: {
        icon: 'chair-rolling',
        color: '#795548',
        size: 32,
    },
};

export interface FilterState {
    activeTypes: Set<AnnotationType>;
    showAll: boolean;
}

// Configuración global de zoom - punto único de control
export const ZOOM_CONFIG = {
    MIN_ZOOM_TO_SHOW_POINTS: 13,
    DEFAULT_ZOOM: 13,
    USER_LOCATION_ZOOM: 15,
} as const;
