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
