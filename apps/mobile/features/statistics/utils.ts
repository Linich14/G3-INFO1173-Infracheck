import { GlobalStatistics, Insight } from './types';

/**
 * Calcula el porcentaje de un valor respecto al total
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Formatea números grandes con sufijos (K, M)
 * Ejemplos: 1000 → 1K, 1500000 → 1.5M
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Calcula la tendencia entre dos valores
 * Retorna el porcentaje de cambio y si es positivo o negativo
 */
export const calculateTrend = (
  current: number,
  previous: number
): {
  percentage: number;
  isPositive: boolean;
  arrow: '↑' | '↓' | '→';
} => {
  if (previous === 0) {
    return { percentage: 0, isPositive: true, arrow: '→' };
  }

  const diff = current - previous;
  const percentage = Math.abs(Math.round((diff / previous) * 100));
  const isPositive = diff >= 0;
  const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';

  return { percentage, isPositive, arrow };
};

/**
 * Obtiene el color correspondiente a un estado de reporte
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Nuevo: '#60A5FA',
    'En proceso': '#F59E0B',
    Resuelto: '#10B981',
    Rechazado: '#EF4444',
    Cancelado: '#9CA3AF',
  };
  return colors[status] || '#9CA3AF';
};

/**
 * Obtiene el color correspondiente a un nivel de urgencia
 */
export const getUrgencyColor = (urgency: string): string => {
  const colors: Record<string, string> = {
    Crítico: '#EF4444',
    Alto: '#F59E0B',
    Medio: '#3B82F6',
    Bajo: '#10B981',
  };
  return colors[urgency] || '#9CA3AF';
};

/**
 * Obtiene el color correspondiente a un tipo de insight
 */
export const getInsightColor = (type: 'success' | 'warning' | 'info' | 'danger'): string => {
  const colors = {
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    danger: '#EF4444',
  };
  return colors[type];
};

/**
 * Formatea una fecha relativa
 */
export const formatRelativeTime = (date: Date, t: (key: string) => string): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return t('statisticsTimeNow');
  if (diffInMinutes < 60) return `${diffInMinutes} ${t('statisticsTimeMinutes')}`;
  if (diffInHours < 24) return `${diffInHours}${t('statisticsTimeHours')}`;
  if (diffInDays === 1) return t('statisticsTimeYesterday');
  if (diffInDays < 7) return `${diffInDays} ${t('statisticsTimeDays')}`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} ${t('statisticsTimeWeeks')}`;

  return date.toLocaleDateString('es-CL');
};

/**
 * Genera insights automáticos basados en las estadísticas
 */
export const generateInsights = (stats: GlobalStatistics): Insight[] => {
  const insights: Insight[] = [];

  // Insight 1: Crecimiento de reportes
  if (stats.growthPercentage > 0) {
    insights.push({
      id: '1',
      icon: 'trending-up',
      text: `Los reportes aumentaron un ${stats.growthPercentage}% respecto al mes anterior`,
      type: 'info',
      priority: 1,
    });
  } else if (stats.growthPercentage < 0) {
    insights.push({
      id: '1',
      icon: 'trending-down',
      text: `Los reportes disminuyeron un ${Math.abs(stats.growthPercentage)}% respecto al mes anterior`,
      type: 'success',
      priority: 1,
    });
  }

  // Insight 2: Tasa de resolución
  const resolutionRate = calculatePercentage(stats.resolvedReports, stats.totalReports);
  if (resolutionRate > 70) {
    insights.push({
      id: '2',
      icon: 'checkmark-circle',
      text: `Excelente tasa de resolución: ${resolutionRate}% de reportes resueltos`,
      type: 'success',
      priority: 2,
    });
  } else if (resolutionRate < 30) {
    insights.push({
      id: '2',
      icon: 'alert-circle',
      text: `Tasa de resolución baja: solo ${resolutionRate}% de reportes resueltos`,
      type: 'warning',
      priority: 2,
    });
  }

  // Insight 3: Reportes nuevos pendientes
  if (stats.newReports > stats.totalReports * 0.2) {
    insights.push({
      id: '3',
      icon: 'notifications',
      text: `Hay ${stats.newReports} reportes nuevos esperando atención`,
      type: 'warning',
      priority: 3,
    });
  }

  // Insight 4: Participación de usuarios
  const reportsPerUser = stats.totalUsers > 0 ? (stats.totalReports / stats.totalUsers).toFixed(1) : '0';
  if (parseFloat(reportsPerUser) > 2) {
    insights.push({
      id: '4',
      icon: 'people',
      text: `Alta participación: promedio de ${reportsPerUser} reportes por usuario`,
      type: 'success',
      priority: 4,
    });
  }

  // Insight 5: Proyectos activos
  const activeProjectRate = calculatePercentage(stats.activeProjects, stats.totalProjects);
  if (activeProjectRate > 60) {
    insights.push({
      id: '5',
      icon: 'construct',
      text: `${stats.activeProjects} de ${stats.totalProjects} proyectos están activos (${activeProjectRate}%)`,
      type: 'info',
      priority: 5,
    });
  }

  // Insight 6: Promedio de votos
  if (stats.averageVotesPerReport > 15) {
    insights.push({
      id: '6',
      icon: 'thumbs-up',
      text: `Alto engagement: promedio de ${stats.averageVotesPerReport.toFixed(1)} votos por reporte`,
      type: 'success',
      priority: 6,
    });
  }

  // Ordenar por prioridad y retornar los primeros 5
  return insights.sort((a, b) => a.priority - b.priority).slice(0, 5);
};

/**
 * Genera colores para gráficos
 */
export const generateChartColors = (count: number): string[] => {
  const baseColors = [
    '#3B82F6', // Azul
    '#10B981', // Verde
    '#F59E0B', // Naranja
    '#EF4444', // Rojo
    '#8B5CF6', // Púrpura
    '#06B6D4', // Cyan
    '#EC4899', // Rosa
    '#F97316', // Naranja oscuro
  ];

  // Si necesitamos más colores, repetimos el patrón
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }

  return colors;
};
