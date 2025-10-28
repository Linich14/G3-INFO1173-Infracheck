from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from reports.models import ReportModel, VotoReporte
from domain.entities.usuario import Usuario
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
def user_stats_view(request):
    """
    Endpoint para obtener estadísticas del usuario autenticado
    GET /api/v1/profile/stats/
    
    Respuesta Éxito (200):
    {
        "report_count": 12,
        "up_votes": 45
    }
    """
    try:
        usuario = getattr(request, 'auth_user', None)
        if not usuario:
            return Response(
                {'errors': ['Usuario no autenticado.']},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Contar reportes del usuario
        report_count = ReportModel.objects.filter(usuario=usuario, visible=True).count()
        
        # Contar votos recibidos en los reportes del usuario
        up_votes = VotoReporte.objects.filter(reporte__usuario=usuario, reporte__visible=True).count()
        
        return Response({
            'report_count': report_count,
            'up_votes': up_votes
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error al obtener estadísticas del usuario: {str(e)}")
        return Response(
            {'errors': ['Error al obtener estadísticas.']},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def public_user_stats_view(request, user_id):
    """
    Endpoint para obtener estadísticas de cualquier usuario
    GET /api/v1/users/{user_id}/stats/
    
    Respuesta Éxito (200):
    {
        "report_count": 12,
        "up_votes": 45
    }
    """
    try:
        usuario_solicitante = getattr(request, 'auth_user', None)
        if not usuario_solicitante:
            return Response(
                {'errors': ['Usuario no autenticado.']},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Buscar el usuario
        try:
            usuario = Usuario.objects.get(usua_id=user_id)
        except Usuario.DoesNotExist:
            return Response(
                {'errors': ['Usuario no encontrado.']},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Contar reportes del usuario
        report_count = ReportModel.objects.filter(usuario=usuario, visible=True).count()
        
        # Contar votos recibidos en los reportes del usuario
        up_votes = VotoReporte.objects.filter(reporte__usuario=usuario, reporte__visible=True).count()
        
        return Response({
            'report_count': report_count,
            'up_votes': up_votes
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error al obtener estadísticas del usuario {user_id}: {str(e)}")
        return Response(
            {'errors': ['Error al obtener estadísticas.']},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
