import { useState, useEffect, useCallback } from 'react';
import { getReportVotes, toggleReportVote } from '../services/postsService';
import { measureVoteLoadTime } from './useVoteMetrics';
import { useVoteFeedback } from './useVoteFeedback';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';

interface VoteState {
  voteCount: number;
  userHasVoted: boolean;
  isLoading: boolean;
  isSubmitting: boolean; // Nuevo: estado específico para envío de voto
  error: string | null;
}

interface CachedVoteData {
  count: number;
  userHasVoted: boolean;
  timestamp: number;
}

// Caché global para votos (compartido entre componentes)
const votesCache = new Map<string | number, CachedVoteData>();
const CACHE_DURATION = 1 * 60 * 1000; // 1 minuto

/**
 * Hook para manejar el estado de votos de un reporte específico
 * Los votos vienen embebidos en /api/reports/, no se hace llamada separada
 */
export const useReportVotes = (
  reportId: string | number,
  initialVoteCount: number = 0,
  initialUserHasVoted: boolean = false
) => {
  const [state, setState] = useState<VoteState>({
    voteCount: initialVoteCount,
    userHasVoted: initialUserHasVoted,
    isLoading: false,
    isSubmitting: false,
    error: null,
  });

  const { showSuccess, showVote, showUnvote, showError, showInfo, hapticOnly } = useVoteFeedback();
  const { isLoggedIn, handleSessionExpired } = useAuth();

  // Actualizar el estado cuando cambien los valores iniciales (del reporte)
  useEffect(() => {
    setState(prev => ({
      ...prev,
      voteCount: initialVoteCount,
      userHasVoted: initialUserHasVoted,
    }));
  }, [initialVoteCount, initialUserHasVoted]);

  /**
   * Cargar votos del reporte desde datos embebidos (no hace petición a API)
   * Los votos vienen incluidos en el endpoint /api/reports/
   */
  const loadVotes = useCallback(async () => {
    // No hace nada - los votos vienen embebidos en el reporte
    // Este método se mantiene por compatibilidad pero no es necesario
  }, [reportId]);

  /**
   * Función de validación pre-voto
   */
  const canUserVote = useCallback(() => {
    // Validación 1: Usuario debe estar autenticado
    if (!isLoggedIn) {
      return {
        canVote: false,
        reason: 'not_authenticated',
        message: 'Debes iniciar sesión para votar'
      };
    }

    // Nota: permitimos toggling (votar y quitar voto). No bloqueamos si ya votó.

    // Validación 3: No debe estar enviando otro voto
    if (state.isSubmitting) {
      return {
        canVote: false,
        reason: 'request_in_progress',
        message: null // No mostrar mensaje, solo evitar
      };
    }

    return {
      canVote: true,
      reason: null,
      message: null
    };
  }, [isLoggedIn, state.userHasVoted, state.isSubmitting]);

  /**
   * Limpiar caché para este reporte
   */
  const clearCache = useCallback(() => {
    votesCache.delete(reportId);
  }, [reportId]);

  /**
   * Votar por el reporte con optimistic update y manejo completo de errores
   */
  const submitVote = useCallback(async () => {
    // PASO 1: Validaciones (solo autenticación y no reenvío)
    const validation = canUserVote();

    if (!validation.canVote) {
      if (validation.message) {
        if (validation.reason === 'not_authenticated') {
          showInfo(validation.message);
          router.push('/(auth)/sign-in');
        } else {
          showInfo(validation.message);
        }
      }
      return;
    }

    // PASO 2: Determinar acción (votar o eliminar voto)
    const isCurrentlyVoted = state.userHasVoted;
    const previousCount = state.voteCount;
    const previousVoted = state.userHasVoted;

    // Optimistic update: si ya votó -> decrement; si no -> increment
    setState(prev => ({
      ...prev,
      voteCount: prev.voteCount + (isCurrentlyVoted ? -1 : 1),
      userHasVoted: !isCurrentlyVoted,
      isSubmitting: true,
    }));

    // Feedback háptico inmediato
    hapticOnly('light');

    try {
      // PASO 3: Enviar request a API (endpoint toggle)
      const result = await toggleReportVote(reportId);

      if (result.success) {
        // Determinar acción informada por backend
        const action = result.action ?? (isCurrentlyVoted ? 'removed' : 'added');

        // Actualizar caché según acción
        votesCache.set(reportId, {
          count: action === 'added' ? previousCount + 1 : Math.max(0, previousCount - 1),
          userHasVoted: action === 'added',
          timestamp: Date.now(),
        });

        // Feedback al usuario con mensajes específicos
        if (action === 'added') {
          showVote('¡Voto registrado!');
        } else {
          showUnvote('Voto eliminado');
        }
        
        hapticOnly('success');

        // Establecer isSubmitting = false (ya actualizado optimísticamente)
        setState(prev => ({ ...prev, isSubmitting: false }));

      } else {
        // Server error: revertir optimismo
        setState(prev => ({
          ...prev,
          voteCount: previousCount,
          userHasVoted: previousVoted,
          isSubmitting: false,
        }));

        showError(result.message || 'Error al registrar voto');
      }

    } catch (error: any) {
      // Revertir cambio optimista
      if (__DEV__) console.error('Error al votar:', error);

      setState(prev => ({
        ...prev,
        voteCount: previousCount,
        userHasVoted: previousVoted,
        isSubmitting: false,
      }));

      if (error.message?.includes('Session expired')) {
        await handleSessionExpired();
        showError('Sesión expirada. Inicia sesión nuevamente.');
      } else {
        showError('Error de conexión. Verifica tu internet.');
      }
    }
  }, [reportId, state, canUserVote, showSuccess, showError, showInfo, hapticOnly, clearCache, handleSessionExpired]);

  /**
   * Refrescar votos (forzar recarga desde API, invalida caché)
   */
  const refreshVotes = useCallback(async () => {
    // Invalidar caché para este reporte
    votesCache.delete(reportId);

    // Forzar recarga
    await loadVotes();
  }, [reportId, loadVotes]);

  // Escuchar eventos globales de refresh
  useEffect(() => {
    const handleGlobalRefresh = () => {
      // Invalidar caché y recargar
      votesCache.delete(reportId);
      loadVotes();
    };

    // Registrar callback global
    setRefreshVotesCallback(handleGlobalRefresh);

    return () => {
      // Limpiar callback cuando el componente se desmonte
      if (refreshVotesEvent === handleGlobalRefresh) {
        refreshVotesEvent = null;
      }
    };
  }, [reportId, loadVotes]);

  return {
    ...state,
    submitVote,
    refreshVotes,
    clearCache,
  };
};

/**
 * Función utilitaria para limpiar todo el caché de votos
 * Útil cuando el usuario hace pull-to-refresh
 */
export const clearAllVotesCache = () => {
  votesCache.clear();
};

// Evento global para refrescar votos (usado en pull-to-refresh)
let refreshVotesEvent: (() => void) | null = null;

/**
 * Función para registrar callback de refresh global
 */
export const setRefreshVotesCallback = (callback: () => void) => {
  refreshVotesEvent = callback;
};

/**
 * Función para disparar refresh global de votos
 */
export const triggerGlobalVotesRefresh = () => {
  if (refreshVotesEvent) {
    refreshVotesEvent();
  }
};

/**
 * Función utilitaria para obtener datos del caché (útil para debugging)
 */
export const getCachedVoteData = (reportId: string | number) => {
  return votesCache.get(reportId);
};