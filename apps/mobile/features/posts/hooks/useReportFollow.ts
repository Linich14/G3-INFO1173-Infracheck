import { useState, useEffect } from 'react';
import { followReport, unfollowReport } from '../services/followService';
import { getToken } from '~/features/auth/services/authService';
import * as Haptics from 'expo-haptics';

interface UseReportFollowResult {
  isFollowing: boolean;
  followersCount: number;
  isLoading: boolean;
  toggleFollow: () => Promise<void>;
}

export const useReportFollow = (
  reportId: string | number,
  initialIsFollowing: boolean,
  initialFollowersCount: number,
  onSuccess?: (isFollowing: boolean) => void,
  onError?: (error: string) => void
): UseReportFollowResult => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isLoading, setIsLoading] = useState(false);

  // Sincronizar el estado cuando cambien las props externas
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  useEffect(() => {
    setFollowersCount(initialFollowersCount);
  }, [initialFollowersCount]);

  const toggleFollow = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const token = await getToken();

      if (!token) {
        onError?.('Debes iniciar sesión para seguir reportes');
        return;
      }

      // Optimistic update
      const previousFollowing = isFollowing;
      const previousCount = followersCount;
      setIsFollowing(!isFollowing);
      setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);

      try {
        let response;
        if (isFollowing) {
          response = await unfollowReport(reportId, token);
        } else {
          response = await followReport(reportId, token);
        }

        // Actualizar con el contador real del servidor
        setFollowersCount(response.seguidores_count);
        
        // Feedback háptico
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // Callback de éxito
        onSuccess?.(!previousFollowing);
      } catch (error: any) {
        // Revertir optimistic update en caso de error
        setIsFollowing(previousFollowing);
        setFollowersCount(previousCount);
        
        // Feedback de error
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        onError?.(error.message || 'Error al actualizar el seguimiento');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFollowing,
    followersCount,
    isLoading,
    toggleFollow,
  };
};
