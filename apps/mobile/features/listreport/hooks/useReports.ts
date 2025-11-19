import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReportsService, { ListResponse, FetchAllOpts } from '../services/ReportsService';
import { ReportListItem } from '../types';

interface UseReportsFilters {
  visible?: boolean;
  urgencia?: number;
  estado?: number;
  tipo?: number;
  ciudad?: number;
  search?: string;
}

interface UseReportsOptions {
  initialFilters?: UseReportsFilters;
  limit?: number;
  debounceMs?: number;
  autoLoad?: boolean;
}

interface UseReportsReturn {
  items: ReportListItem[];
  allResults: ReportListItem[];
  total: number;
  loading: boolean;
  error: string | null;
  filters: UseReportsFilters;
  setFilters: (filters: Partial<UseReportsFilters> | ((prev: UseReportsFilters) => UseReportsFilters)) => void;
  refresh: () => void;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  cursor: string | null;
  getById: (id: number | string) => Promise<ReportListItem | null>;
}

export function useReports(opts?: UseReportsOptions): UseReportsReturn {
  const {
    initialFilters = {},
    limit = 10,
    debounceMs = 300,
    autoLoad = true,
  } = opts || {};

  const [allResults, setAllResults] = useState<ReportListItem[]>([]);
  const [items, setItems] = useState<ReportListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const [filters, setFiltersState] = useState<UseReportsFilters>(initialFilters);

  const debounceRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // Helper to set partial filters
  const setFilters = useCallback(
    (next: Partial<UseReportsFilters> | ((prev: UseReportsFilters) => UseReportsFilters)) => {
      setFiltersState((prev) =>
        typeof next === 'function' ? (next as any)(prev) : { ...prev, ...next }
      );
      // Reset cursor cuando cambian los filtros
      setCursor(null);
      setAllResults([]);
    },
    []
  );

  const fetch = useCallback(
    async (f: UseReportsFilters, currentCursor: string | null = null) => {
      setLoading(true);
      setError(null);
      try {
        const fetchOpts: FetchAllOpts = {
          filters: f,
          cursor: currentCursor,
          limit,
        };

        const resp: ListResponse = await ReportsService.fetchAll(fetchOpts);

        if (isMountedRef.current) {
          if (currentCursor) {
            // Load more: agregar a resultados existentes
            setAllResults((prev) => [...prev, ...resp.results]);
          } else {
            // Nueva búsqueda: reemplazar resultados
            setAllResults(resp.results || []);
          }
          setTotal(resp.count || 0);
          setCursor(resp.next_cursor || null);
          setHasMore(resp.has_more || false);
        }
      } catch (e: any) {
        if (isMountedRef.current) {
          setError(e?.message || 'Error al cargar reportes');
          console.error('Error in useReports:', e);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [limit]
  );

  // Debounce fetch when filters change
  useEffect(() => {
    if (!autoLoad) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = (setTimeout(() => {
      fetch(filters, null);
    }, debounceMs) as unknown) as number;

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, fetch, debounceMs, autoLoad]);

  // Update items when allResults change
  useEffect(() => {
    setItems(allResults);
  }, [allResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(() => {
    ReportsService.invalidateAll();
    setCursor(null);
    setAllResults([]);
    fetch(filters, null);
  }, [fetch, filters]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !cursor) return;
    await fetch(filters, cursor);
  }, [hasMore, loading, cursor, fetch, filters]);

  const getById = useCallback(
    async (id: number | string) => ReportsService.fetchById(id),
    []
  );

  return {
    items,
    allResults,
    total,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    loadMore,
    hasMore,
    cursor,
    getById,
  };
}
