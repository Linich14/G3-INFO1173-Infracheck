import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

interface FeedbackOptions {
  haptic?: 'success' | 'error' | 'warning' | 'light';
  duration?: number;
}

/**
 * Hook para manejar feedback al usuario (alerts y haptics)
 */
export const useVoteFeedback = () => {
  /**
   * Mostrar mensaje de éxito
   */
  const showSuccess = useCallback((message: string, options: FeedbackOptions = {}) => {
    const { haptic = 'success', duration = 2000 } = options;

    // Alert de éxito
    Alert.alert('¡Votado!', message, [{ text: 'OK' }], { cancelable: false });

    // Feedback háptico
    if (haptic === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (haptic === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  /**
   * Mostrar mensaje de error
   */
  const showError = useCallback((message: string, options: FeedbackOptions = {}) => {
    const { haptic = 'error' } = options;

    // Alert de error
    Alert.alert('Error', message, [{ text: 'Entendido' }], { cancelable: false });

    // Feedback háptico
    if (haptic === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (haptic === 'warning') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  /**
   * Mostrar mensaje informativo
   */
  const showInfo = useCallback((message: string, options: FeedbackOptions = {}) => {
    const { haptic = 'light' } = options;

    // Alert informativo
    Alert.alert('Información', message, [{ text: 'OK' }], { cancelable: false });

    // Feedback háptico suave
    if (haptic === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  /**
   * Feedback háptico solo (sin alert)
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
    showError,
    showInfo,
    hapticOnly,
  };
};