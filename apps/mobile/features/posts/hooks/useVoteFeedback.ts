import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useToast } from '../contexts/ToastContext';

interface FeedbackOptions {
  haptic?: 'success' | 'error' | 'warning' | 'light';
  duration?: number;
}

/**
 * Hook para manejar feedback al usuario (toast y haptics)
 */
export const useVoteFeedback = () => {
  const toast = useToast();

  /**
   * Mostrar mensaje de éxito
   */
  const showSuccess = useCallback((message: string, options: FeedbackOptions = {}) => {
    toast.showSuccess(message);
  }, [toast]);

  /**
   * Mostrar mensaje de voto
   */
  const showVote = useCallback((message: string, options: FeedbackOptions = {}) => {
    toast.showVote(message);
  }, [toast]);

  /**
   * Mostrar mensaje de unvote
   */
  const showUnvote = useCallback((message: string, options: FeedbackOptions = {}) => {
    toast.showUnvote(message);
  }, [toast]);

  /**
   * Mostrar mensaje de error
   */
  const showError = useCallback((message: string, options: FeedbackOptions = {}) => {
    toast.showError(message);
  }, [toast]);

  /**
   * Mostrar mensaje informativo
   */
  const showInfo = useCallback((message: string, options: FeedbackOptions = {}) => {
    toast.showInfo(message);
  }, [toast]);

  /**
   * Feedback háptico solo (sin toast)
   */
  const hapticOnly = useCallback((type: 'success' | 'error' | 'warning' | 'light' = 'light') => {
    switch (type) {
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'warning':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'light':
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }
  }, []);

  return {
    showSuccess,
    showVote,
    showUnvote,
    showError,
    showInfo,
    hapticOnly,
  };
};