from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from reports.models import ProyectoHistory
from reports.serializers.proyecto_history_serializer import ProyectoHistorySerializer
from interfaces.authentication.permissions import IsAuthenticatedWithSesionToken
from interfaces.authentication.session_token_auth import SesionTokenAuthentication


class ProyectoAuditView(APIView):
    """
    Vista para consultar el historial de cambios de un proyecto específico.
    
    GET /api/audit/projects/<id>/
    Retorna el historial completo de cambios de un proyecto.
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request, id):
        """
        Obtiene el historial de cambios de un proyecto
        
        Args:
            id: ID del proyecto
            
        Returns:
            Lista de cambios ordenados por fecha (más recientes primero)
        """
        try:
            # Filtrar historial por proyecto_id
            historial = ProyectoHistory.objects.filter(proyecto_id=id).select_related(
                'proyecto', 'usuario'
            )
            
            if not historial.exists():
                return Response(
                    {
                        'error': 'No se encontró historial para el proyecto especificado',
                        'proyecto_id': id
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = ProyectoHistorySerializer(historial, many=True)
            
            return Response(
                {
                    'proyecto_id': id,
                    'total_registros': historial.count(),
                    'historial': serializer.data
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {
                    'error': 'Error al obtener el historial del proyecto',
                    'detalle': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
