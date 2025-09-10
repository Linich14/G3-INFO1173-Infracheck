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
