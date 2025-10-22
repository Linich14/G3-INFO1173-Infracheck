export interface ReportListItem {
  id: string;
  titulo: string;
  descripcion: string;
  descripcionCorta: string; // Para mostrar en lista
  autor: string;
  fecha: string;
  fechaRelativa: string; // "hace 2 horas", "ayer", etc.
  estado: 'Nuevo' | 'En proceso' | 'Resuelto' | 'Rechazado' | 'Cancelado';
  tipoDenuncia: string;
  nivelUrgencia: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  imagenPreview?: string;
  ubicacion: string;
  votos?: number;
  comentarios?: number;
}

export type ReportStatus = ReportListItem['estado'];
export type UrgencyLevel = ReportListItem['nivelUrgencia'];
export type ReportType = string;

export interface ReportsListFilters {
  searchQuery: string;
  status: ReportStatus | 'todos';
  type: ReportType | 'todos';
  urgency: UrgencyLevel | 'todos';
  sortBy: 'fecha' | 'urgencia' | 'votos' | 'estado';
  sortOrder: 'asc' | 'desc';
}

export interface ReportsListState {
  reports: ReportListItem[];
  filteredReports: ReportListItem[];
  filters: ReportsListFilters;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}