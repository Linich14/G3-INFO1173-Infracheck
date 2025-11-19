import { useState, useEffect, useCallback } from 'react';
import { getReportsByAuthor } from '../services/userReportsService';
import { ReportForHome } from '~/features/report/types';

interface UseUserReportsOptions {
    authorId?: number;
    limit?: number;
    autoLoad?: boolean;
}

export const useUserReports = ({
    authorId,
    limit = 30,
    autoLoad = true,
}: UseUserReportsOptions = {}) => {
    const [reports, setReports] = useState<ReportForHome[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadReports = useCallback(
        async (isRefresh = false) => {
            if (!authorId) {
                setError('Author ID is required');
                return;
            }

            try {
                isRefresh ? setRefreshing(true) : setLoading(true);
                setError(null);

                const response = await getReportsByAuthor(authorId, null, limit);

                if (response.success) {
                    setReports(response.data);
                } else {
                    setError('Error al cargar los reportes');
                }
            } catch (err: any) {
                console.error('Error loading user reports:', err);
                setError(err.message || 'Error al cargar los reportes del usuario');
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [authorId, limit]
    );

    const refresh = useCallback(() => {
        loadReports(true);
    }, [loadReports]);

    const updateAuthorId = useCallback(
        (newAuthorId: number) => {
            setReports([]);
            setError(null);
            // Solo cargar si el authorId cambió realmente
            if (newAuthorId !== authorId) {
                loadReports(false);
            }
        },
        [loadReports, authorId]
    );

    useEffect(() => {
        if (autoLoad && authorId) {
            loadReports(false);
        }
    }, [autoLoad, authorId, loadReports]);

    return {
        reports,
        loading,
        refreshing,
        error,
        refresh,
        updateAuthorId,
        reportsCount: reports.length,
    };
};
