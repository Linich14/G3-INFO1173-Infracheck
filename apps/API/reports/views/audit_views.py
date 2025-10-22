import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from reports.models.report_history import ReportHistory
from reports.models import ReportModel
from reports.serializers.report_history_serializer import ReportHistorySerializer
from interfaces.authentication.permissions import IsAuthenticatedWithSesionToken
from interfaces.authentication.session_token_auth import SesionTokenAuthentication

logger = logging.getLogger(__name__)


class ReportAuditView(APIView):
    """
    Vista para consultar el historial de cambios de un reporte
    
    GET /api/audit/reports/{id}/
    
    Retorna el historial completo de cambios del reporte incluyendo:
    - Creación
    - Actualizaciones
    - Cambios de estado
    - Cambios de urgencia
    - Imágenes agregadas/eliminadas
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request, report_id):
        try:
            # Verificar que el reporte existe
            try:
                reporte = ReportModel.objects.get(id=report_id)
            except ReportModel.DoesNotExist:
                return Response({
                    'error': 'Reporte no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Obtener el historial del reporte
            historial = ReportHistory.objects.filter(
                reporte=reporte
            ).select_related('usuario').order_by('-fecha')
            
            # Serializar los datos
            serializer = ReportHistorySerializer(historial, many=True)
            
            return Response({
                'success': True,
                'reporte_id': report_id,
                'reporte_titulo': reporte.titulo,
                'total_cambios': historial.count(),
                'historial': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error al obtener historial del reporte {report_id}: {str(e)}")
            return Response({
                'error': 'Error al obtener el historial del reporte',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
