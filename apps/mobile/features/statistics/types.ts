// Tipos para la pantalla de estadísticas globales del sistema

// Estadísticas globales del sistema
export interface GlobalStatistics {
  // Reportes
  totalReports: number;
  newReports: number;
  inProgressReports: number;
  resolvedReports: number;
  rejectedReports: number;
  canceledReports: number;
  
  // Proyectos
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  
  // Participación
  totalUsers: number;
  totalVotes: number;
  totalComments: number;
  averageVotesPerReport: number;
  
  // Tendencias
  reportsThisMonth: number;
  reportsLastMonth: number;
  growthPercentage: number;
  projectsThisMonth: number;
  projectsLastMonth: number;
}

// Distribución por tipo de problema
export interface TypeDistribution {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

// Distribución por estado
export interface StatusDistribution {
  status: 'Nuevo' | 'En proceso' | 'Resuelto' | 'Rechazado' | 'Cancelado';
  count: number;
  percentage: number;
  color: string;
}

// Distribución por urgencia
export interface UrgencyDistribution {
  urgency: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  count: number;
  percentage: number;
  color: string;
}

// Datos temporales (evolución)
export interface TemporalData {
  period: string; // "Ene", "Feb", "Mar", etc.
  reports: number;
  projects: number;
  month: number; // 1-12
  year: number;
}

// Proyecto con más reportes
export interface TopProject {
  id: string;
  name: string;
  reportsCount: number;
  location: string;
  percentage: number;
}

// Insight automático
export interface Insight {
  id: string;
  icon: string;
  text: string;
  type: 'success' | 'warning' | 'info' | 'danger';
  priority: number;
}

// Estado de la pantalla
export interface StatisticsScreenState {
  stats: GlobalStatistics | null;
  typeDistribution: TypeDistribution[];
  statusDistribution: StatusDistribution[];
  urgencyDistribution: UrgencyDistribution[];
  temporalData: TemporalData[];
  topProjects: TopProject[];
  insights: Insight[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Props para componentes
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
    arrow: '↑' | '↓' | '→';
  };
  subtitle?: string;
}

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  scrollable?: boolean;
}

export interface InsightCardProps {
  icon: string;
  text: string;
  type: 'success' | 'warning' | 'info' | 'danger';
}

export interface TrendIndicatorProps {
  value: number;
  isPositive: boolean;
  arrow?: '↑' | '↓' | '→';
}
