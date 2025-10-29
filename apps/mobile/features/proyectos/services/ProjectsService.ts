import api from '../../../shared/api';

export type Project = {
  id: number;
  lugar?: string;
  estado?: string;
  color?: string;
  prioridad?: string;
  reportesAsociados?: number;
  votosAFavor?: number;
  tipoDenuncia?: string;
  fechaCreacion?: string;
  titulo?: string;
  descripcion?: string;
  // detalle
  denuncia_id?: number | null;
  fechaInicioEstimada?: string | null;
  archivos?: any[];
  nombreProyecto?: string;
  progreso?: number;
};

export type ListResponse = {
  results: Project[];
  count: number;
};

type FetchAllOpts = {
  filters?: { estado?: number | string; prioridad?: number | string; categoria?: string; search?: string };
  sort?: { field: string; dir: 'asc' | 'desc' } | null;
};

class ProjectsService {
  private cache = new Map<string, { ts: number; data: any }>();
  private ttlMs: number;

  constructor(ttlSeconds = 60) {
    this.ttlMs = ttlSeconds * 1000;
  }

  private makeKey(prefix: string, payload?: any) {
    if (!payload) return prefix;
    try {
      return `${prefix}:${JSON.stringify(payload)}`;
    } catch {
      return `${prefix}:${String(payload)}`;
    }
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { ts: Date.now(), data });
  }

  invalidateAll() {
    this.cache.clear();
  }
  invalidateByKeyPrefix(prefix: string) {
    for (const key of Array.from(this.cache.keys())) {
      if (key.startsWith(prefix)) this.cache.delete(key);
    }
  }
  invalidateId(id: number | string) {
    this.cache.delete(this.makeKey('project:id', id));
  }

  async fetchAll(opts: FetchAllOpts = {}): Promise<ListResponse> {
    const key = this.makeKey('project:list', opts);
    const cached = this.getFromCache<ListResponse>(key);
    if (cached) return cached;

    const params: Record<string, any> = {};
    if (opts.filters) {
      const { estado, prioridad, categoria, search } = opts.filters;
      if (estado != null) params.estado = estado;
      if (prioridad != null) params.prioridad = prioridad;
      if (categoria) params.categoria = categoria;
      if (search) params.search = search;
    }

    // Note: backend currently doesn't support sort params; kept for future use
    if (opts.sort) {
      params._sort = opts.sort.field;
      params._order = opts.sort.dir;
    }

    const resp = await api.get('/api/proyectos/', { params });
    const data: ListResponse = resp.data;
    this.setCache(key, data);
    return data;
  }

  async fetchById(id: number): Promise<Project | null> {
    const key = this.makeKey('project:id', id);
    const cached = this.getFromCache<Project>(key);
    if (cached) return cached;

    try {
      const resp = await api.get(`/api/proyectos/${id}/`);
      const data: Project = resp.data;
      this.setCache(key, data);
      return data;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  }

  async fetchByReport(denunciaId: number): Promise<ListResponse> {
    const key = this.makeKey('project:byReport', denunciaId);
    const cached = this.getFromCache<ListResponse>(key);
    if (cached) return cached;

    const resp = await api.get(`/api/proyectos/denuncia/${denunciaId}/`);
    const data: ListResponse = resp.data;
    this.setCache(key, data);
    return data;
  }
}

export default new ProjectsService(60);
