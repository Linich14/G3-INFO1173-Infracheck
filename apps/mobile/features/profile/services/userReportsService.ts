import api from '~/shared/api';
import { isAuthenticated } from '~/features/auth/services/authService';
import { ReportForHome } from '~/features/report/types';
import { API_CONFIG } from '~/constants/config'; // Importar configuración

export interface UserReportsResponse {
    success: boolean;
    data: ReportForHome[];
    pagination: {
        nextCursor: string | null;
        prevCursor: string | null;
        hasMore: boolean;
        count: number;
    };
}

export class UserReportsService {
    /**
     * Obtener reportes por autor ID específicamente para el perfil
     */
    static async getReportsByAuthor(
        authorId: number,
        cursor?: string | null,
        limit: number = 30
    ): Promise<UserReportsResponse> {
        try {
            console.log('Getting user reports for author:', authorId);

            // Verificar autenticación
            const authenticated = await isAuthenticated();
            if (!authenticated) {
                throw new Error('Sesión expirada. Inicie sesión nuevamente.');
            }

            // Construir parámetros
            const params: Record<string, string> = {
                autor_id: authorId.toString(),
                limit: limit.toString(),
            };

            // Solo agregar cursor si es válido
            if (cursor && cursor.trim() !== '' && cursor !== 'null' && cursor !== 'undefined') {
                params.cursor = cursor;
            }

            const response = await api.get('/api/reports/', { params });

            // Mapear la respuesta al formato esperado
            const mappedResults: ReportForHome[] =
                response.data.data?.map((item: any) => ({
                    id: item.id.toString(),
                    title: item.titulo,
                    author: item.usuario?.nickname || item.usuario?.nombre || 'Usuario',
                    authorId: item.usuario?.id?.toString(),
                    timeAgo: this.calculateTimeAgo(item.fecha_creacion),
                    image: this.getPrincipalImage(item.archivos),
                    upvotes: item.votos?.count || 0,
                    comments: [], // Los comentarios se cargan por separado
                    categoria: item.tipo_denuncia?.nombre || 'General',
                    urgencia:
                        typeof item.urgencia === 'object' ? item.urgencia.valor : item.urgencia,
                    estado: typeof item.estado === 'object' ? item.estado.nombre : item.estado,
                    commentsCount: item.comentarios_count || 0,
                    votos: item.votos,
                    seguimiento: item.seguimiento,
                    ubicacion: item.ubicacion,
                })) || [];

            return {
                success: true,
                data: mappedResults,
                pagination: response.data.pagination || {
                    nextCursor: null,
                    prevCursor: null,
                    hasMore: false,
                    count: mappedResults.length,
                },
            };
        } catch (error: any) {
            console.error('Error fetching user reports:', error);
            throw error;
        }
    }

    /**
     * Función helper para calcular tiempo transcurrido
     */
    private static calculateTimeAgo(fechaCreacion: string): string {
        try {
            const now = new Date();
            const created = new Date(fechaCreacion);
            const diffMs = now.getTime() - created.getTime();
            const diffInHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffInDays = Math.floor(diffInHours / 24);

            if (diffInDays > 0) {
                return `${diffInDays}d`;
            } else if (diffInHours > 0) {
                return `${diffInHours}h`;
            } else {
                return 'Ahora';
            }
        } catch (error) {
            return 'Fecha inválida';
        }
    }

    /**
     * Función helper para obtener la imagen principal con URL completa
     */
    private static getPrincipalImage(archivos: any[]): any {
        if (!archivos || archivos.length === 0) {
            return require('@assets/Publicaciones/1.png');
        }

        // Buscar imagen principal
        const mainImage = archivos.find(
            (archivo) => archivo.es_principal && archivo.tipo === 'imagen' && archivo.url
        );

        if (mainImage) {
            // Construir URL completa
            const fullUrl = mainImage.url.startsWith('http')
                ? mainImage.url // Si ya es una URL completa
                : `${API_CONFIG.BASE_URL}${mainImage.url}`; // Si es una ruta relativa

            return { uri: fullUrl };
        }

        // Si no hay imagen principal, buscar cualquier imagen
        const anyImage = archivos.find((archivo) => archivo.tipo === 'imagen' && archivo.url);

        if (anyImage) {
            const fullUrl = anyImage.url.startsWith('http')
                ? anyImage.url
                : `${API_CONFIG.BASE_URL}${anyImage.url}`;

            return { uri: fullUrl };
        }

        return require('@assets/Publicaciones/1.png');
    }
}

// Exportar funciones individuales para compatibilidad
export const getReportsByAuthor = UserReportsService.getReportsByAuthor.bind(UserReportsService);

// Exportar por defecto
export default UserReportsService;
