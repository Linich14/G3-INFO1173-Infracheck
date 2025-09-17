import { localizacion } from '../map/types';

export type ReportDetails = {
    id: string;
    titulo: string;
    descripcion: string;
    tipoDenuncia: string;
    ubicacion: localizacion;
    nivelUrgencia: string;
    estado: string;
    autor: string;
    fecha: string;
    imagenes: string[];
    video: string;
};
