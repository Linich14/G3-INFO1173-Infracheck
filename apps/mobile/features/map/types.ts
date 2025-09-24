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
    VIALIDAD_VEREDAS = 'vialidad_veredas',
    ALUMBRADO_PUBLICO = 'alumbrado_publico',
    DRENAJE_AGUAS = 'drenaje_aguas',
    AREAS_VERDES = 'areas_verdes',
    MOBILIARIO_URBANO = 'mobiliario_urbano',
    SENALIZACION = 'senalizacion',
    CICLOVIAS = 'ciclovias',
    PARADEROS_TRANSPORTE = 'paraderos_transporte',
    INFRAESTRUCTURA_MUNICIPAL = 'infraestructura_municipal',
    LIMPIEZA_ESPACIO_PUBLICO = 'limpieza_espacio_publico',
    ACCESIBILIDAD = 'accesibilidad',
    RIESGOS_EMERGENCIAS = 'riesgos_emergencias',
}

export interface AnnotationData {
    id: string;
    type: AnnotationType;
    coordinate: [number, number];
    title: string;
    description?: string;
    severity?: 'low' | 'medium' | 'high';
    status?: 'active' | 'resolved' | 'pending';
}

export interface AnnotationConfig {
    icon: string;
    color: string;
    size: number;
}

export const ANNOTATION_CONFIGS: Record<AnnotationType, AnnotationConfig> = {
    [AnnotationType.VIALIDAD_VEREDAS]: {
        icon: 'road-variant',
        color: '#FFD700',
        size: 32,
    },
    [AnnotationType.ALUMBRADO_PUBLICO]: {
        icon: 'lightbulb',
        color: '#FFD700',
        size: 32,
    },
    [AnnotationType.DRENAJE_AGUAS]: {
        icon: 'pipe-wrench',
        color: '#2196F3',
        size: 32,
    },
    [AnnotationType.AREAS_VERDES]: {
        icon: 'tree',
        color: '#4CAF50',
        size: 32,
    },
    [AnnotationType.MOBILIARIO_URBANO]: {
        icon: 'table-chair',
        color: '#795548',
        size: 32,
    },
    [AnnotationType.SENALIZACION]: {
        icon: 'sign-direction',
        color: '#FF9800',
        size: 32,
    },
    [AnnotationType.CICLOVIAS]: {
        icon: 'bike',
        color: '#8BC34A',
        size: 32,
    },
    [AnnotationType.PARADEROS_TRANSPORTE]: {
        icon: 'bus-stop-covered',
        color: '#3F51B5',
        size: 32,
    },
    [AnnotationType.INFRAESTRUCTURA_MUNICIPAL]: {
        icon: 'office-building',
        color: '#607D8B',
        size: 32,
    },
    [AnnotationType.LIMPIEZA_ESPACIO_PUBLICO]: {
        icon: 'broom',
        color: '#9C27B0',
        size: 32,
    },
    [AnnotationType.ACCESIBILIDAD]: {
        icon: 'wheelchair-accessibility',
        color: '#009688',
        size: 32,
    },
    [AnnotationType.RIESGOS_EMERGENCIAS]: {
        icon: 'alert-circle',
        color: '#F44336',
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
