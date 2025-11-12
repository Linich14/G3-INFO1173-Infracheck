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

  const { showSuccess, showError, showInfo, hapticOnly } = useVoteFeedback();
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

    // Validación 2: No debe haber votado ya
    if (state.userHasVoted) {
      return {
        canVote: false,
        reason: 'already_voted',
        message: 'Ya has votado por este reporte'
      };
    }

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
    // PASO 1: Validaciones
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

    // PASO 2: Optimistic Update (actualizar UI inmediatamente)
    const previousCount = state.voteCount;
    const previousVoted = state.userHasVoted;

    setState(prev => ({
      ...prev,
      voteCount: prev.voteCount + 1,
      userHasVoted: true,
      isSubmitting: true,
    }));

    // Feedback háptico inmediato
    hapticOnly('light');

    try {
      // PASO 3: Enviar request a API
      const result = await toggleReportVote(reportId);

      if (result.success) {
        // ✅ ÉXITO: Voto registrado
        
        // Mantener el cambio optimista - no necesitamos recargar
        // El backend ya procesó el voto correctamente
        setState(prev => ({
          ...prev,
          isSubmitting: false,
        }));

        // Actualizar caché
        votesCache.set(reportId, {
          count: previousCount + 1,
          userHasVoted: true,
          timestamp: Date.now(),
        });

        // Feedback al usuario
        showSuccess('¡Voto registrado exitosamente!');
        hapticOnly('success');

      } else {
        // ❌ ERROR: Procesar según el tipo de error
        const errorMessage = result.message.toLowerCase();

        if (errorMessage.includes('ya has votado') || errorMessage.includes('already voted')) {
          // ⚠️ ERROR: Usuario ya había votado (validación preventiva falló)

          // Mantener estado "votado" (era validación preventiva)
          // No revertir porque técnicamente sí está votado
          votesCache.set(reportId, {
            count: state.voteCount + 1,
            userHasVoted: true,
            timestamp: Date.now(),
          });

          showInfo('Ya has votado por este reporte');

        } else if (errorMessage.includes('usuario no autenticado') || errorMessage.includes('not authenticated')) {
          // 🔒 ERROR: Token inválido/expirado

          // Revertir cambio optimista
          setState(prev => ({
            ...prev,
            voteCount: previousCount,
            userHasVoted: previousVoted,
            isSubmitting: false,
          }));

          // Limpiar sesión y redirigir
          await handleSessionExpired();
          showError('Sesión expirada. Inicia sesión nuevamente.');

        } else if (errorMessage.includes('reporte no encontrado') || errorMessage.includes('not found')) {
          // ❌ ERROR: Reporte no existe

          // Revertir cambio
          setState(prev => ({
            ...prev,
            voteCount: previousCount,
            userHasVoted: previousVoted,
            isSubmitting: false,
          }));

          showError('Reporte no encontrado');

        } else {
          // ❌ ERROR: Otro error del servidor

          // Revertir cambio
          setState(prev => ({
            ...prev,
            voteCount: previousCount,
            userHasVoted: previousVoted,
            isSubmitting: false,
          }));

          showError(result.message || 'Error al registrar voto');
        }
      }

    } catch (error: any) {
      // ❌ ERROR: Problema de red o sesión expirada

      console.error('Error al votar:', error);

      // Revertir cambio optimista
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

    } finally {
      setState(prev => ({
        ...prev,
        isSubmitting: false,
      }));
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