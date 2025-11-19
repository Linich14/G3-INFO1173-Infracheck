import api from '../../../shared/api';
import { ReportListItem } from '../types';

// Tipos para la respuesta del backend
export interface BackendReport {
  id: number;
  titulo: string;
  descripcion: string;
  direccion: string;
  ubicacion: {
    latitud: number;
    longitud: number;
  };
  urgencia: {
    valor: number; // 1=Baja, 2=Media, 3=Alta
    etiqueta: string;
  };
  visible: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
  usuario: {
    id: number;
    nombre: string;
    email: string;
  };
  estado: {
    id: number;
    nombre: string;
  };
  tipo_denuncia: {
    id: number;
    nombre: string;
  };
  ciudad: {
    id: number;
    nombre: string;
  };
  archivos: Array<{
    id: number;
    nombre: string;
    url: string;
    tipo: string;
    mime_type: string;
    es_principal: boolean;
    orden: number;
  }>;
  estadisticas: {
    total_archivos: number;
    imagenes: number;
    videos: number;
    dias_desde_creacion: number;
    puede_agregar_imagenes: boolean;
    puede_agregar_videos: boolean;
  };
}

export interface CursorPaginatedResponse {
  success: boolean;
  data: {
    results: BackendReport[];
    next_cursor: string | null;
    has_more: boolean;
    count: number;
  };
}

export interface ListResponse {
  results: ReportListItem[];
  count: number;
  next_cursor: string | null;
  has_more: boolean;
}

export interface FetchAllOpts {
  filters?: {
    visible?: boolean;
    urgencia?: number;
    estado?: number;
    tipo?: number;
    ciudad?: number;
    search?: string;
  };
  cursor?: string | null;
  limit?: number;
}

class ReportsService {
  private cache = new Map<string, { ts: number; data: any }>();
  private ttlMs: number;

  constructor(ttlSeconds = 60) {
    this.ttlMs = ttlSeconds * 1000;
  }

  private makeKey(prefix: string, payload?: any): string {
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

  private setCache(key: string, data: any): void {
    this.cache.set(key, { ts: Date.now(), data });
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  invalidateByKeyPrefix(prefix: string): void {
    for (const key of Array.from(this.cache.keys())) {
      if (key.startsWith(prefix)) this.cache.delete(key);
    }
  }

  invalidateId(id: number | string): void {
    this.cache.delete(this.makeKey('report:id', id));
  }

  /**
   * Convierte fecha ISO a formato relativo ("hace 2 horas", "ayer", etc.)
   */
  private getRelativeTime(isoDate: string): string {
    const now = new Date();
    const date = new Date(isoDate);
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'hace unos segundos';
    if (diffMins < 60) return `hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    if (diffDays === 1) return 'ayer';
    if (diffDays < 7) return `hace ${diffDays} días`;
    if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) !== 1 ? 's' : ''}`;
    if (diffDays < 365) return `hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) !== 1 ? 'es' : ''}`;
    return `hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) !== 1 ? 's' : ''}`;
  }

  /**
   * Mapea el estado del backend al formato del frontend
   */
  private mapEstado(estadoNombre: string): ReportListItem['estado'] {
    const estadoLower = estadoNombre.toLowerCase();
    
    if (estadoLower.includes('pendiente') || estadoLower.includes('nuevo')) return 'Nuevo';
    if (estadoLower.includes('proceso') || estadoLower.includes('progreso')) return 'En proceso';
    if (estadoLower.includes('resuelto') || estadoLower.includes('completado')) return 'Resuelto';
    if (estadoLower.includes('rechazado')) return 'Rechazado';
    if (estadoLower.includes('cancelado')) return 'Cancelado';
    
    return 'Nuevo'; // Default
  }

  /**
   * Mapea la urgencia del backend al formato del frontend
   */
  private mapUrgencia(urgenciaValor: number): ReportListItem['nivelUrgencia'] {
    switch (urgenciaValor) {
      case 1: return 'Bajo';
      case 2: return 'Medio';
      case 3: return 'Alto';
      default: return 'Medio';
    }
  }

  /**
   * Trunca la descripción para la vista de lista
   */
  private truncateDescription(desc: string, maxLength: number = 100): string {
    if (desc.length <= maxLength) return desc;
    return desc.substring(0, maxLength) + '...';
  }

  /**
   * Transforma un reporte del backend al formato del frontend
   */
  private transformReport(backendReport: BackendReport): ReportListItem {
    // Obtener la imagen principal o la primera imagen disponible
    const imagenPrincipal = backendReport.archivos.find(a => a.es_principal && a.tipo === 'imagen');
    const primeraImagen = backendReport.archivos.find(a => a.tipo === 'imagen');
    const imagenPreview = (imagenPrincipal || primeraImagen)?.url;

    // Contar votos y comentarios (por ahora 0, cuando se implementen se actualizan)
    const votos = 0;
    const comentarios = 0;

    return {
      id: backendReport.id.toString(),
      titulo: backendReport.titulo,
      descripcion: backendReport.descripcion,
      descripcionCorta: this.truncateDescription(backendReport.descripcion),
      autor: backendReport.usuario.nombre || 'Usuario',
      fecha: backendReport.fecha_creacion,
      fechaRelativa: this.getRelativeTime(backendReport.fecha_creacion),
      estado: this.mapEstado(backendReport.estado.nombre),
      tipoDenuncia: backendReport.tipo_denuncia.nombre,
      nivelUrgencia: this.mapUrgencia(backendReport.urgencia.valor),
      imagenPreview,
      ubicacion: backendReport.direccion,
      votos,
      comentarios,
    };
  }

  /**
   * Obtiene todos los reportes con paginación cursor
   */
  async fetchAll(opts: FetchAllOpts = {}): Promise<ListResponse> {
    const key = this.makeKey('report:list', opts);
    const cached = this.getFromCache<ListResponse>(key);
    if (cached) {
      return cached;
    }

    const params: Record<string, any> = {};
    
    if (opts.filters) {
      const { visible, urgencia, estado, tipo, ciudad, search } = opts.filters;
      if (visible != null) params.visible = visible;
      if (urgencia != null) params.urgencia = urgencia;
      if (estado != null) params.estado = estado;
      if (tipo != null) params.tipo = tipo;
      if (ciudad != null) params.ciudad = ciudad;
      if (search) params.search = search;
    }

    if (opts.cursor) params.cursor = opts.cursor;
    if (opts.limit) params.limit = opts.limit;

    try {
      const resp = await api.get('/api/reports/', { params });
      
      // Manejar diferentes estructuras de respuesta
      let backendReports: BackendReport[] = [];
      let next_cursor: string | null = null;
      let has_more = false;
      let count = 0;

      if (resp.data.success && resp.data.data) {
        // Estructura con success y data
        if (Array.isArray(resp.data.data)) {
          backendReports = resp.data.data;
          
          // Obtener paginación si existe
          if (resp.data.pagination) {
            next_cursor = resp.data.pagination.next_cursor || null;
            has_more = resp.data.pagination.has_more || false;
            count = resp.data.pagination.count || backendReports.length;
          } else {
            count = backendReports.length;
          }
        } else if (resp.data.data.results) {
          backendReports = resp.data.data.results || [];
          next_cursor = resp.data.data.next_cursor || null;
          has_more = resp.data.data.has_more || false;
          count = resp.data.data.count || backendReports.length;
        }
      } else if (resp.data.results) {
        // Estructura directa con results
        backendReports = resp.data.results || [];
        next_cursor = resp.data.next_cursor || null;
        has_more = resp.data.has_more || false;
        count = resp.data.count || backendReports.length;
      } else if (Array.isArray(resp.data)) {
        // Array directo en la raíz
        backendReports = resp.data;
        count = backendReports.length;
      }

      const transformedReports = backendReports.map(r => this.transformReport(r));

      const data: ListResponse = {
        results: transformedReports,
        count,
        next_cursor,
        has_more,
      };

      this.setCache(key, data);
      return data;
    } catch (err: any) {
      console.error('Error al cargar reportes:', err?.response?.data || err?.message);
      throw new Error(err?.response?.data?.error || err?.message || 'Error al cargar reportes');
    }
  }

  /**
   * Obtiene un reporte por ID
   */
  async fetchById(id: number | string): Promise<ReportListItem | null> {
    const key = this.makeKey('report:id', id);
    const cached = this.getFromCache<ReportListItem>(key);
    if (cached) return cached;

    try {
      const resp = await api.get(`/api/reports/${id}/`);
      
      let backendReport: BackendReport;
      if (resp.data.success && resp.data.data) {
        backendReport = resp.data.data;
      } else {
        backendReport = resp.data;
      }

      const transformed = this.transformReport(backendReport);
      this.setCache(key, transformed);
      return transformed;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      console.error('Error fetching report by ID:', err);
      throw err;
    }
  }

  /**
   * Carga más resultados usando cursor pagination
   */
  async fetchMore(cursor: string, opts: FetchAllOpts = {}): Promise<ListResponse> {
    return this.fetchAll({ ...opts, cursor });
  }
}

export default new ReportsService(60);
