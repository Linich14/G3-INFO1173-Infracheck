import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProjectsService, { ListResponse, Project } from '../services/ProjectsService';

type Filters = { estado?: number | string; prioridad?: number | string; categoria?: string; search?: string };

export function useProjects(opts?: { initialFilters?: Filters; pageSize?: number; debounceMs?: number }) {
  const { initialFilters = {}, pageSize = 5, debounceMs = 300 } = opts || {};

  const [allResults, setAllResults] = useState<Project[]>([]); // full result set for current filters
  const [items, setItems] = useState<Project[]>([]); // paginated slice
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFiltersState] = useState<Filters>(initialFilters);
  const [sort, setSortState] = useState<{ field: string; dir: 'asc' | 'desc' } | null>(null);

  const debounceRef = useRef<number | null>(null);

  // helper to set partial filters
  const setFilters = useCallback((next: Partial<Filters> | ((prev: Filters) => Filters)) => {
    setFiltersState((prev) => (typeof next === 'function' ? (next as any)(prev) : { ...prev, ...next }));
    setPage(1);
  }, []);

  const setSort = useCallback((s: { field: string; dir: 'asc' | 'desc' } | null) => {
    setSortState(s);
    setPage(1);
  }, []);

  const fetch = useCallback(async (f: Filters) => {
    setLoading(true);
    setError(null);
    try {
      const resp: ListResponse = await ProjectsService.fetchAll({ filters: f, sort: sort ?? undefined });
      setAllResults(resp.results || []);
      setTotal(resp.count || (resp.results || []).length);
    } catch (e: any) {
      setError(e?.message || 'Error fetching projects');
    } finally {
      setLoading(false);
    }
  }, [sort]);

  // debounce fetch when filters change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = (setTimeout(() => {
      fetch(filters);
    }, debounceMs) as unknown) as number;

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, fetch, debounceMs]);

  // create paginated slice when allResults or page change
  useEffect(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setItems(allResults.slice(start, end));
  }, [allResults, page, pageSize]);

  const refresh = useCallback(() => {
    ProjectsService.invalidateAll();
    fetch(filters);
  }, [fetch, filters]);

  const getById = useCallback(async (id: number) => ProjectsService.fetchById(id), []);
  const getByReport = useCallback(async (reportId: number) => ProjectsService.fetchByReport(reportId), []);

  return {
    items,
    allResults,
    total,
    page,
    pageSize,
    loading,
    error,
    filters,
    setFilters,
    sort,
    setSort,
    setPage,
    refresh,
    getById,
    getByReport,
  };
}
