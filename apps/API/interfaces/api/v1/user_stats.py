from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from reports.models import ReportModel, VotoReporte
from reports.models.seguimiento_reporte import SeguimientoReporte
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
        "reportes_creados": 12,
        "reportes_seguidos": 5,
        "votos_recibidos": 45,
        "votos_realizados": 20
    }
    """
    try:
        usuario = getattr(request, 'auth_user', None)
        if not usuario:
            return Response(
                {'errors': ['Usuario no autenticado.']},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Contar reportes creados por el usuario (solo visibles)
        reportes_creados = ReportModel.objects.filter(
            usuario=usuario, visible=True).count()

        # Contar reportes seguidos por el usuario (solo visibles)
        reportes_seguidos = SeguimientoReporte.objects.filter(
            usuario=usuario,
            reporte__visible=True
        ).count()

        # Contar votos RECIBIDOS en los reportes del usuario
        votos_recibidos = VotoReporte.objects.filter(
            reporte__usuario=usuario, reporte__visible=True).count()

        # Contar votos REALIZADOS/DADOS por el usuario
        votos_realizados = VotoReporte.objects.filter(usuario=usuario).count()

        return Response({
            'reportes_creados': reportes_creados,
            'reportes_seguidos': reportes_seguidos,
            'votos_recibidos': votos_recibidos,
            'votos_realizados': votos_realizados
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
        "user_info": {
            "nickname": "usuario123",
            "nombre": "Juan",
            "apellido": "Pérez"
        },
        "reportes_creados": 12,
        "reportes_seguidos": 5,
        "votos_recibidos": 45,
        "votos_realizados": 20
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

        # Contar reportes creados por el usuario (solo visibles)
        reportes_creados = ReportModel.objects.filter(
            usuario=usuario, visible=True).count()

        # Contar reportes seguidos por el usuario (solo visibles)
        reportes_seguidos = SeguimientoReporte.objects.filter(
            usuario=usuario,
            reporte__visible=True
        ).count()

        # Contar votos RECIBIDOS en los reportes del usuario
        votos_recibidos = VotoReporte.objects.filter(
            reporte__usuario=usuario, reporte__visible=True).count()

        # Contar votos REALIZADOS/DADOS por el usuario
        votos_realizados = VotoReporte.objects.filter(usuario=usuario).count()

        return Response({
            'user_info': {
                'nickname': usuario.usua_nickname,
                'nombre': usuario.usua_nombre,
                'apellido': usuario.usua_apellido
            },
            'reportes_creados': reportes_creados,
            'reportes_seguidos': reportes_seguidos,
            'votos_recibidos': votos_recibidos,
            'votos_realizados': votos_realizados
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(
            f"Error al obtener estadísticas del usuario {user_id}: {str(e)}")
        return Response(
            {'errors': ['Error al obtener estadísticas.']},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
