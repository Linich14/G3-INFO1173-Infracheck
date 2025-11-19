import { useEffect, useState, useCallback } from 'react';
import { getProfileStats, ProfileStatsResponse } from '../services/profileStatsService';

interface UseProfileStatsResult {
  stats: ProfileStatsResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useProfileStats = (): UseProfileStatsResult => {
  const [stats, setStats] = useState<ProfileStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfileStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error loading profile stats:', err);
      const message = err?.response?.data?.detail || 'Error al cargar las estadísticas de perfil';
      setError(message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refresh = useCallback(async () => {
    await loadStats();
  }, [loadStats]);

  return { stats, loading, error, refresh };
};
