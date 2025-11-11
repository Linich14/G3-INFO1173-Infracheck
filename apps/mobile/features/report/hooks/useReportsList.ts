import { useState, useEffect, useCallback, useRef } from 'react';
import { getReportsList } from '../services/reportService';
import { ReportsListResponse, ReportForHome } from '../types';

// Base URL para las imágenes - ajusta según tu configuración
const BASE_URL = 'https://your-api-domain.com'; // Cambia esto por tu dominio real

const mapReportToHomeFormat = (report: any): ReportForHome => ({
    id: report.id.toString(),
    title: report.titulo,
    author: report.usuario.nombre || 'Usuario Anónimo',
    timeAgo: calculateTimeAgo(report.fecha_creacion),
    image: getMainImage(report.archivos),
    upvotes: Math.floor(Math.random() * 100) + 5, // Temporal hasta que tengas este dato
    comments: [],
    categoria: report.tipo_denuncia.nombre,
});

const getMainImage = (archivos: any[]) => {
    const mainImage = archivos.find((archivo) => archivo.es_principal && archivo.tipo === 'imagen');
    if (mainImage) {
        return { uri: `${BASE_URL}${mainImage.url}` };
    }
    return require('@assets/Publicaciones/1.png');
};

const calculateTimeAgo = (dateString: string): string => {
    try {
        const now = new Date();
        const createdAt = new Date(dateString);
        const diffInMs = now.getTime() - createdAt.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays > 0) {
            return `${diffInDays}d`;
        } else if (diffInHours > 0) {
            return `${diffInHours}h`;
        } else {
            return 'Ahora';
        }
    } catch {
        return 'Fecha inválida';
    }
};

export const useReportsList = () => {
    const [reports, setReports] = useState<ReportForHome[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasNext, setHasNext] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [initialLoad, setInitialLoad] = useState(true);
    const [loadMoreError, setLoadMoreError] = useState<string | null>(null); // Error específico para loadMore
    const [isLoadingMore, setIsLoadingMore] = useState(false); // Estado específico para loadMore

    // Refs para manejar timeouts
    const loadMoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const loadReports = useCallback(
        async (cursor?: string | null, isRefresh = false, isLoadMore = false) => {
            try {
                // Limpiar timeout anterior si existe
                if (loadMoreTimeoutRef.current) {
                    clearTimeout(loadMoreTimeoutRef.current);
                    loadMoreTimeoutRef.current = null;
                }

                // Cancelar request anterior si existe
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }

                // Crear nuevo AbortController para este request
                abortControllerRef.current = new AbortController();

                // Prevenir múltiples cargas simultáneas
                if ((loading || isLoadingMore) && !isRefresh) {
                    console.log('Already loading, skipping request');
                    return;
                }

                console.log(
                    'Loading reports with cursor:',
                    cursor,
                    'isRefresh:',
                    isRefresh,
                    'isLoadMore:',
                    isLoadMore
                );

                // Limpiar errores
                if (isLoadMore) {
                    setLoadMoreError(null);
                    setIsLoadingMore(true);
                } else if (isRefresh) {
                    setRefreshing(true);
                    setError(null);
                    setLoadMoreError(null);
                } else {
                    setLoading(true);
                    setError(null);
                    setLoadMoreError(null);
                }

                // Configurar timeout para loadMore (5 segundos)
                if (isLoadMore) {
                    loadMoreTimeoutRef.current = setTimeout(() => {
                        console.log('LoadMore timeout reached');
                        setLoadMoreError(
                            'No se pudieron cargar más reportes. Verifica tu conexión.'
                        );
                        setIsLoadingMore(false);
                        if (abortControllerRef.current) {
                            abortControllerRef.current.abort();
                        }
                    }, 5000);
                }

                // Para la primera carga, no enviar cursor
                const requestCursor =
                    cursor && cursor !== 'null' && cursor !== 'undefined' ? cursor : undefined;

                console.log('Making request with cursor:', requestCursor);

                const response = await getReportsList(requestCursor, 10);

                // Limpiar timeout si la respuesta llegó a tiempo
                if (loadMoreTimeoutRef.current) {
                    clearTimeout(loadMoreTimeoutRef.current);
                    loadMoreTimeoutRef.current = null;
                }

                if (response.success) {
                    const mappedReports = response.data.map(mapReportToHomeFormat);

                    console.log('Response received:', {
                        reportsCount: mappedReports.length,
                        hasMore: response.pagination.hasMore,
                        nextCursor: response.pagination.nextCursor,
                    });

                    if (isRefresh || (!cursor && !isLoadMore)) {
                        // Nueva carga o refresh - reemplazar todos los reportes
                        setReports(mappedReports);
                        setNextCursor(response.pagination.nextCursor);
                    } else if (isLoadMore) {
                        // Cargar más - agregar a la lista existente
                        setReports((prev) => {
                            // Evitar duplicados comparando por ID
                            const existingIds = new Set(prev.map((r) => r.id));
                            const newReports = mappedReports.filter((r) => !existingIds.has(r.id));
                            console.log('Adding new reports:', newReports.length);
                            return [...prev, ...newReports];
                        });
                        setNextCursor(response.pagination.nextCursor);
                    }

                    setHasNext(response.pagination.hasMore);
                    console.log(
                        'Updated state - hasNext:',
                        response.pagination.hasMore,
                        'nextCursor:',
                        response.pagination.nextCursor
                    );

                    // Limpiar errores si la carga fue exitosa
                    setError(null);
                    setLoadMoreError(null);
                } else {
                    throw new Error('Response was not successful');
                }
            } catch (err: any) {
                // Limpiar timeout en caso de error
                if (loadMoreTimeoutRef.current) {
                    clearTimeout(loadMoreTimeoutRef.current);
                    loadMoreTimeoutRef.current = null;
                }

                // Ignorar errores por abort (cancelación)
                if (err.name === 'AbortError') {
                    console.log('Request was aborted');
                    return;
                }

                const errorMessage =
                    err?.response?.data?.error ||
                    err?.message ||
                    'Error desconocido al cargar reportes';

                console.error('Error loading reports:', err);
                console.error('Error details:', {
                    message: err?.message,
                    response: err?.response?.data,
                    status: err?.response?.status,
                });

                if (isLoadMore) {
                    setLoadMoreError('Error al cargar más reportes. Toca para reintentar.');
                } else {
                    setError(errorMessage);
                    // Si es la primera carga y falla, mostrar datos vacíos
                    if (!cursor && reports.length === 0) {
                        setReports([]);
                        setHasNext(false);
                        setNextCursor(null);
                    }
                }
            } finally {
                setLoading(false);
                setRefreshing(false);
                setIsLoadingMore(false);
                if (initialLoad) setInitialLoad(false);

                // Limpiar timeout
                if (loadMoreTimeoutRef.current) {
                    clearTimeout(loadMoreTimeoutRef.current);
                    loadMoreTimeoutRef.current = null;
                }
            }
        },
        [loading, initialLoad, reports.length, isLoadingMore]
    );

    const loadMore = useCallback(() => {
        if (
            hasNext &&
            !loading &&
            !refreshing &&
            !isLoadingMore &&
            nextCursor &&
            !error &&
            !loadMoreError
        ) {
            console.log('LoadMore triggered with cursor:', nextCursor);
            loadReports(nextCursor, false, true);
        } else {
            console.log('LoadMore blocked:', {
                hasNext,
                loading,
                refreshing,
                isLoadingMore,
                nextCursor,
                error,
                loadMoreError,
            });
        }
    }, [
        hasNext,
        loading,
        refreshing,
        isLoadingMore,
        nextCursor,
        loadReports,
        error,
        loadMoreError,
    ]);

    const refresh = useCallback(() => {
        console.log('Refreshing reports');
        setNextCursor(null);
        setError(null);
        setLoadMoreError(null);
        loadReports(undefined, true, false);
    }, [loadReports]);

    // Retry específico para loadMore
    const retryLoadMore = useCallback(() => {
        console.log('Retrying loadMore');
        setLoadMoreError(null);
        if (nextCursor) {
            loadReports(nextCursor, false, true);
        }
    }, [loadReports, nextCursor]);

    // Cargar reportes iniciales solo una vez
    useEffect(() => {
        if (initialLoad) {
            console.log('Initial load triggered');
            loadReports();
        }
    }, [loadReports, initialLoad]);

    // Cleanup en desmontaje
    useEffect(() => {
        return () => {
            if (loadMoreTimeoutRef.current) {
                clearTimeout(loadMoreTimeoutRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        reports,
        loading,
        refreshing,
        hasNext,
        error,
        loadMore,
        refresh,
        setReports,
        initialLoad,
        isLoadingMore,
        loadMoreError,
        retryLoadMore,
    };
};
