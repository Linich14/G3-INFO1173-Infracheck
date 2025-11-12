/**
 * Utilidades para métricas de performance de votos
 * Útil para monitoreo y optimización (caché de 1 minuto)
 */

interface VoteLoadMetrics {
  reportId: string | number;
  duration: number;
  success: boolean;
  cached: boolean;
  timestamp: number;
  source: 'api' | 'cache' | 'batch';
}

/**
 * Clase para trackear métricas de carga de votos
 */
class VoteMetricsTracker {
  private metrics: VoteLoadMetrics[] = [];
  private readonly maxMetrics = 100; // Mantener solo las últimas 100 métricas

  /**
   * Registrar una métrica de carga de votos
   */
  trackVoteLoad(
    reportId: string | number,
    duration: number,
    success: boolean,
    cached: boolean = false,
    source: 'api' | 'cache' | 'batch' = 'api'
  ) {
    const metric: VoteLoadMetrics = {
      reportId,
      duration,
      success,
      cached,
      source,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);

    // Mantener solo las últimas métricas
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log para desarrollo (solo en desarrollo)
    if (__DEV__) {
      console.log(`[VoteMetrics] Report ${reportId}: ${duration}ms, ${success ? 'success' : 'failed'}, ${cached ? 'cached' : 'fresh'}, source: ${source}`);
    }
  }

  /**
   * Obtener estadísticas de rendimiento
   */
  getPerformanceStats() {
    if (this.metrics.length === 0) {
      return {
        totalLoads: 0,
        successRate: 0,
        averageDuration: 0,
        cacheHitRate: 0,
        recentLoads: [],
      };
    }

    const recentMetrics = this.metrics.slice(-50); // Últimas 50 métricas
    const totalLoads = recentMetrics.length;
    const successfulLoads = recentMetrics.filter(m => m.success).length;
    const cachedLoads = recentMetrics.filter(m => m.cached).length;
    const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);

    return {
      totalLoads,
      successRate: (successfulLoads / totalLoads) * 100,
      averageDuration: totalDuration / totalLoads,
      cacheHitRate: (cachedLoads / totalLoads) * 100,
      recentLoads: recentMetrics.slice(-10), // Últimas 10 para debugging
    };
  }

  /**
   * Limpiar métricas antiguas (más de 1 hora)
   */
  cleanupOldMetrics() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
  }

  /**
   * Obtener métricas por reporte
   */
  getMetricsByReport(reportId: string | number) {
    return this.metrics.filter(m => m.reportId === reportId);
  }
}

// Instancia global del tracker
export const voteMetricsTracker = new VoteMetricsTracker();

/**
 * Hook para usar métricas de votos en componentes
 */
export const useVoteMetrics = () => {
  const trackVoteLoad = (
    reportId: string | number,
    duration: number,
    success: boolean,
    cached: boolean = false,
    source: 'api' | 'cache' | 'batch' = 'api'
  ) => {
    voteMetricsTracker.trackVoteLoad(reportId, duration, success, cached, source);
  };

  const getStats = () => voteMetricsTracker.getPerformanceStats();

  const cleanup = () => voteMetricsTracker.cleanupOldMetrics();

  return {
    trackVoteLoad,
    getStats,
    cleanup,
  };
};

/**
 * Función utilitaria para medir tiempo de ejecución
 */
export const measureVoteLoadTime = async <T>(
  operation: () => Promise<T>,
  reportId: string | number,
  cached: boolean = false,
  source: 'api' | 'cache' | 'batch' = 'api'
): Promise<T> => {
  const startTime = Date.now();

  try {
    const result = await operation();
    const duration = Date.now() - startTime;

    voteMetricsTracker.trackVoteLoad(reportId, duration, true, cached, source);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    voteMetricsTracker.trackVoteLoad(reportId, duration, false, cached, source);
    throw error;
  }
};