import { localizacion } from '../map/types';

export type ReportFormData = {
    titulo: string;
    descripcion: string;
    idCiudad: string;
    tipoDenuncia: string;
    ubicacion: localizacion;
    nivelUrgencia: string;
    imagenes: string[];
    video: string | null;
};

export type ReportFormErrors = {
    titulo?: string;
    descripcion?: string;
    idCiudad?: string;
    tipoDenuncia?: string;
    ubicacion?: string;
    nivelUrgencia?: string;
    imagenes?: string;
    video?: string;
};

export type ReportDetails = ReportFormData & {
    id: string;
    estado: string;
    autor: string;
    fecha: string;
};
