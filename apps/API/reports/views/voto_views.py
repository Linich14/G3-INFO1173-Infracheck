import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import IntegrityError

from reports.models import ReportModel, VotoReporte

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def votar_reporte(request, report_id):
    """
    Endpoint para que un usuario vote por un reporte.
    POST /api/v1/reports/{report_id}/vote/
    """
    try:
        # Obtener usuario autenticado
        usuario = getattr(request, 'auth_user', None)
        if not usuario:
            return Response(
                {'errors': ['Usuario no autenticado.']},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Obtener el reporte
        reporte = get_object_or_404(ReportModel, id=report_id)

        # Verificar si el usuario ya votó por este reporte
        if VotoReporte.ha_votado_reporte(usuario, reporte):
            return Response(
                {'errors': ['Ya has votado por este reporte.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Crear el voto
        try:
            voto = VotoReporte.objects.create(
                usuario=usuario,
                reporte=reporte
            )

            return Response(
                {
                    'message': 'Voto registrado exitosamente.',
                    'voto': {
                        'id': voto.id,
                        'fecha_voto': voto.fecha_voto.isoformat(),
                        'reporte_id': reporte.id
                    }
                },
                status=status.HTTP_201_CREATED
            )

        except IntegrityError:
            return Response(
                {'errors': ['Ya has votado por este reporte.']},
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        logger.error(f"Error al registrar voto: {str(e)}")
        return Response(
            {'errors': ['Error interno del servidor. Intente nuevamente.']},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_votos_reporte(request, report_id):
    """
    Endpoint para listar todos los votos de un reporte.
    GET /api/v1/reports/{report_id}/votes/
    """
    try:
        # Obtener usuario autenticado
        usuario = getattr(request, 'auth_user', None)
        if not usuario:
            return Response(
                {'errors': ['Usuario no autenticado.']},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Obtener el reporte
        reporte = get_object_or_404(ReportModel, id=report_id)

        # Obtener parámetros de paginación
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 50)  # Máximo 50

        # Calcular offset
        offset = (page - 1) * limit

        # Obtener votos con información del usuario
        votos = VotoReporte.objects.filter(reporte=reporte)\
            .select_related('usuario')\
            .order_by('-fecha_voto')[offset:offset + limit]

        # Serializar resultados
        results = []
        for voto in votos:
            results.append({
                'id': voto.id,
                'fecha_voto': voto.fecha_voto.isoformat(),
                'usuario': {
                    'id': voto.usuario.usua_id,
                    'nickname': voto.usuario.usua_nickname
                }
            })

        # Contar total de votos
        total_count = VotoReporte.objects.filter(reporte=reporte).count()

        # Verificar si el usuario autenticado ha votado
        usuario_ha_votado = VotoReporte.ha_votado_reporte(usuario, reporte)

        return Response(
            {
                'count': total_count,
                'results': results,
                'usuario_ha_votado': usuario_ha_votado
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        logger.error(f"Error al obtener votos del reporte: {str(e)}")
        return Response(
            {'errors': ['Error interno del servidor. Intente nuevamente.']},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )