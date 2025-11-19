import { useState, useEffect, useCallback } from 'react';
import { getReportVotes } from '../services/postsService';

interface BatchVoteState {
  [reportId: string]: {
    voteCount: number;
    userHasVoted: boolean;
    isLoading: boolean;
    error: string | null;
  };
}

/**
 * Hook para cargar votos de múltiples reportes en batch
 * Útil para optimizar la carga inicial del feed
 */
export const useBatchReportVotes = (reportIds: (string | number)[]) => {
  const [batchState, setBatchState] = useState<BatchVoteState>({});
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  /**
   * Cargar votos de múltiples reportes
   */
  const loadBatchVotes = useCallback(async () => {
    if (!reportIds.length) return;

    setIsBatchLoading(true);
    setBatchError(null);

    // Inicializar estado con valores por defecto
    const initialState: BatchVoteState = {};
    reportIds.forEach(id => {
      initialState[id.toString()] = {
        voteCount: 0,
        userHasVoted: false,
        isLoading: true,
        error: null,
      };
    });
    setBatchState(initialState);

    try {
      // Cargar votos de todos los reportes en paralelo
      const promises = reportIds.map(async (reportId) => {
        try {
          const data = await getReportVotes(reportId);
          return {
            reportId: reportId.toString(),
            data: {
              voteCount: data.count,
              userHasVoted: data.usuario_ha_votado,
              isLoading: false,
              error: null,
            },
          };
        } catch (error: any) {
          return {
            reportId: reportId.toString(),
            data: {
              voteCount: 0,
              userHasVoted: false,
              isLoading: false,
              error: error.message || 'Error al cargar votos',
            },
          };
        }
      });

      const results = await Promise.all(promises);

      // Actualizar estado con resultados
      setBatchState(prevState => {
        const newState = { ...prevState };
        results.forEach(({ reportId, data }) => {
          newState[reportId] = data;
        });
        return newState;
      });

    } catch (error: any) {
      console.error('Error in batch vote loading:', error);
      setBatchError(error.message || 'Error al cargar votos en batch');
    } finally {
      setIsBatchLoading(false);
    }
  }, [reportIds]);

  /**
   * Actualizar el estado de un reporte específico
   */
  const updateReportVoteState = useCallback((
    reportId: string | number,
    updates: Partial<{ voteCount: number; userHasVoted: boolean; isLoading: boolean; error: string | null }>
  ) => {
    setBatchState(prev => ({
      ...prev,
      [reportId.toString()]: {
        ...prev[reportId.toString()],
        ...updates,
      },
    }));
  }, []);

  /**
   * Obtener el estado de un reporte específico
   */
  const getReportVoteState = useCallback((reportId: string | number) => {
    return batchState[reportId.toString()] || {
      voteCount: 0,
      userHasVoted: false,
      isLoading: false,
      error: null,
    };
  }, [batchState]);

  // Cargar votos cuando cambien los reportIds
  useEffect(() => {
    if (reportIds.length > 0) {
      loadBatchVotes();
    }
  }, [loadBatchVotes]);

  return {
    batchState,
    isBatchLoading,
    batchError,
    loadBatchVotes,
    updateReportVoteState,
    getReportVoteState,
  };
};

/**
 * Hook simplificado para un solo reporte (envuelve useBatchReportVotes)
 * Útil cuando solo necesitas un reporte pero quieres la misma API
 */
export const useSingleReportVotes = (reportId: string | number) => {
  const reportIds = reportId ? [reportId] : [];
  const {
    batchState,
    isBatchLoading,
    batchError,
    updateReportVoteState,
  } = useBatchReportVotes(reportIds);

  const reportState = batchState[reportId?.toString() || ''] || {
    voteCount: 0,
    userHasVoted: false,
    isLoading: false,
    error: null,
  };

  return {
    ...reportState,
    isLoading: isBatchLoading || reportState.isLoading,
    error: batchError || reportState.error,
    updateVoteState: (updates: Partial<typeof reportState>) =>
      updateReportVoteState(reportId, updates),
  };
};