import { useState, useEffect, useCallback } from 'react';
import { ReportService } from '~/features/report/services/reportService';

interface FollowedReport {
  id: number;
  titulo: string;
  descripcion: string;
  urgencia: number;
  estado: string;
  categoria: string;
  fecha_creacion: string;
  usuario_nombre: string;
}

interface UseFollowedReportsReturn {
  reports: FollowedReport[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  unfollowReport: (reportId: number) => Promise<boolean>;
}

export function useFollowedReports(): UseFollowedReportsReturn {
  const [reports, setReports] = useState<FollowedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowedReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ReportService.getFollowedReports();
      
      // Manejar diferentes formatos de respuesta
      let reportsList: any[] = [];
      
      if (response && typeof response === 'object') {
        if ('results' in response && Array.isArray(response.results)) {
          reportsList = response.results;
        } else if (Array.isArray(response)) {
          reportsList = response;
        }
      }

      // Transformar datos al formato esperado
      const transformedReports: FollowedReport[] = reportsList.map((item: any) => {
        // Si viene del endpoint de seguimientos
        if (item.reporte) {
          return {
            id: item.reporte.id,
            titulo: item.reporte.titulo,
            descripcion: item.reporte.descripcion,
            urgencia: item.reporte.urgencia,
            estado: item.reporte.estado || 'Nuevo',
            categoria: item.reporte.tipo || 'Sin categoría',
            fecha_creacion: item.reporte.fecha_creacion,
            usuario_nombre: item.reporte.usuario?.nickname || 'Usuario'
          };
        }
        // Si viene directamente como reporte
        return {
          id: item.id,
          titulo: item.titulo,
          descripcion: item.descripcion,
          urgencia: item.urgencia || 1,
          estado: item.estado || 'Nuevo',
          categoria: item.categoria || item.tipo || 'Sin categoría',
          fecha_creacion: item.fecha_creacion,
          usuario_nombre: item.usuario_nombre || item.usuario?.nickname || 'Usuario'
        };
      });

      setReports(transformedReports);
    } catch (err: any) {
      console.error('Error fetching followed reports:', err);
      
      // Si el error es 404 (no hay reportes seguidos), no es un error real
      if (err?.response?.status === 404 || err?.message?.includes('404')) {
        setReports([]);
        setError(null);
      } else if (err?.response?.status === 500) {
        setError('Error del servidor. Por favor intenta más tarde.');
        setReports([]);
      } else if (err?.message?.includes('Sesión expirada')) {
        setError('Tu sesión ha expirado. Inicia sesión nuevamente.');
        setReports([]);
      } else {
        setError('No se pudieron cargar los reportes seguidos');
        setReports([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const unfollowReport = useCallback(async (reportId: number): Promise<boolean> => {
    try {
      const response = await ReportService.unfollowReport(reportId);

      if (response.success) {
        // Remover del estado local
        setReports(prev => prev.filter(report => report.id !== reportId));
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error unfollowing report:', err);
      return false;
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchFollowedReports();
  }, [fetchFollowedReports]);

  // NO cargar automáticamente - dejar que el componente decida cuándo cargar
  // useEffect(() => {
  //   fetchFollowedReports();
  // }, [fetchFollowedReports]);

  return {
    reports,
    loading,
    error,
    refresh,
    unfollowReport
  };
}
