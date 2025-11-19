import api from '~/shared/api';
import { AnnotationType } from '../types';

export interface GeoJSONFeature {
    type: 'Feature';
    geometry: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    properties: {
        id: number;
        titulo: string;
        descripcion: string;
        direccion: string;
        urgencia: number;
        urgencia_label: string;
        estado: number;
        estado_nombre: string;
        tipo_denuncia: number;
        tipo_denuncia_nombre: string;
        ciudad: number;
        ciudad_nombre: string;
        fecha_creacion: string;
        fecha_actualizacion: string;
        imagen_principal: string;
        total_archivos: number;
        es_mi_reporte: boolean;
        usuario_nombre: string;
        marker_color: string;
        marker_size: string;
        marker_symbol: string;
    };
}

export interface GeoJSONResponse {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
    metadata: {
        total_features: number;
        limit_applied: number;
        filters_applied: Record<string, any>;
        generated_at: string;
    };
}

export class MapService {
    /**
     * Obtener reportes en formato GeoJSON desde la API
     */
    static async getReportsGeoJSON(filterTypes?: Set<AnnotationType>): Promise<GeoJSONResponse> {
        try {
            const params: Record<string, string> = {};

            if (filterTypes && filterTypes.size > 0) {
                const tipoIds = Array.from(filterTypes).join(',');
                params.tipo = tipoIds;
            }

            const response = await api.get('/api/reports/geojson/', {
                params,
                timeout: 15000,
            });

            if (!response.data || !response.data.features) {
                throw new Error('Invalid GeoJSON response structure');
            }

            return response.data;
        } catch (error: any) {
            return {
                type: 'FeatureCollection',
                features: [],
                metadata: {
                    total_features: 0,
                    limit_applied: 100,
                    filters_applied: {},
                    generated_at: new Date().toISOString(),
                },
            };
        }
    }

    /**
     * Convertir feature de GeoJSON a AnnotationData
     */
    static featureToAnnotationData(feature: GeoJSONFeature): any {
        try {
            const annotationType = feature.properties.tipo_denuncia.toString() as AnnotationType;

            const mappedData = {
                id: feature.properties.id.toString(),
                type: annotationType,
                coordinate: feature.geometry.coordinates,
                title: feature.properties.titulo,
                description: feature.properties.descripcion,
                severity: feature.properties.urgencia_label,
                status: feature.properties.estado_nombre,
                direccion: feature.properties.direccion,
                urgencia: feature.properties.urgencia,
                urgencia_label: feature.properties.urgencia_label,
                estado: feature.properties.estado,
                estado_nombre: feature.properties.estado_nombre,
                tipo_denuncia: feature.properties.tipo_denuncia,
                tipo_denuncia_nombre: feature.properties.tipo_denuncia_nombre,
                ciudad_nombre: feature.properties.ciudad_nombre,
                fecha_creacion: feature.properties.fecha_creacion,
                imagen_principal: feature.properties.imagen_principal,
                total_archivos: feature.properties.total_archivos,
                es_mi_reporte: feature.properties.es_mi_reporte,
                usuario_nombre: feature.properties.usuario_nombre,
                marker_color: feature.properties.marker_color,
            };

            return mappedData;
        } catch (error) {
            return null;
        }
    }

    /**
     * Convertir múltiples features a AnnotationData
     */
    static featuresToAnnotationData(features: GeoJSONFeature[]): any[] {
        const mappedFeatures = features
            .map((feature) => MapService.featureToAnnotationData(feature))
            .filter((annotation) => annotation !== null);

        return mappedFeatures;
    }
}

export default MapService;
