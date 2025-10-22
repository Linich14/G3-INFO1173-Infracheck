// hooks/useReportDetail.ts
import { useState, useEffect } from 'react';
import { ReportDetails } from '../types';
import { ReportService } from '../services/reportService';

export const useReportDetail = (reportId: string) => {
    const [report, setReport] = useState<ReportDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReport = async () => {
        try {
            setLoading(true);
            setError(null);
            const reportData = await ReportService.getReportDetail(reportId);
            setReport(reportData);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error al cargar el reporte';
            setError(errorMessage);
            console.error('Error in useReportDetail:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (reportId) {
            fetchReport();
        }
    }, [reportId]);

    return {
        report,
        loading,
        error,
        refetch: fetchReport,
    };
};
