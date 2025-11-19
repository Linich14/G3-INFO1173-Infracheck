import { useState, useEffect, useCallback } from 'react';
import { getFollowedReports } from '../services/followService';
import { getToken } from '~/features/auth/services/authService';
import type { FollowedReportItem } from '../types';

interface UseFollowedReportsResult {
  followedReports: FollowedReportItem[];
  count: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useFollowedReports = (): UseFollowedReportsResult => {
  const [followedReports, setFollowedReports] = useState<FollowedReportItem[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFollowedReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = await getToken();
      
      if (!token) {
        setError('Debes iniciar sesión para ver tus reportes seguidos');
        setFollowedReports([]);
        setCount(0);
        return;
      }

      const response = await getFollowedReports(token);
      setFollowedReports(response.results);
      setCount(response.count);
    } catch (err: any) {
      console.error('Error loading followed reports:', err);
      setError(err.message || 'Error al cargar reportes seguidos');
      setFollowedReports([]);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFollowedReports();
  }, [loadFollowedReports]);

  const refresh = useCallback(async () => {
    await loadFollowedReports();
  }, [loadFollowedReports]);

  return {
    followedReports,
    count,
    isLoading,
    error,
    refresh,
  };
};
