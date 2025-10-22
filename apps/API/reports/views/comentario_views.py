import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError

from reports.models import ReportModel, ComentarioReporte

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_comentario_reporte(request, report_id):
    """
    Endpoint para que un usuario comente en un reporte.
    POST /api/v1/reports/{report_id}/comments/
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

        # Validar que se proporcione el comentario
        comentario_texto = request.data.get('comentario', '').strip()
        if not comentario_texto:
            return Response(
                {'errors': ['El comentario no puede estar vacío.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(comentario_texto) > 1000:
            return Response(
                {'errors': ['El comentario no puede exceder los 1000 caracteres.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Crear el comentario
        comentario = ComentarioReporte.objects.create(
            usuario=usuario,
            reporte=reporte,
            comentario=comentario_texto
        )

        return Response(
            {
                'message': 'Comentario creado exitosamente.',
                'comentario': {
                    'id': comentario.id,
                    'comentario': comentario.comentario,
                    'fecha_comentario': comentario.fecha_comentario.isoformat(),
                    'usuario': {
                        'id': comentario.usuario.usua_id,
                        'nickname': comentario.usuario.usua_nickname
                    }
                }
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        logger.error(f"Error al crear comentario: {str(e)}")
        return Response(
            {'errors': ['Error interno del servidor. Intente nuevamente.']},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_comentarios_reporte(request, report_id):
    """
    Endpoint para listar todos los comentarios de un reporte.
    GET /api/v1/reports/{report_id}/comments/
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

        # Obtener comentarios con información del usuario
        comentarios = ComentarioReporte.objects.filter(reporte=reporte)\
            .select_related('usuario')\
            .order_by('-fecha_comentario')[offset:offset + limit]

        # Serializar resultados
        results = []
        for comentario in comentarios:
            results.append({
                'id': comentario.id,
                'comentario': comentario.comentario,
                'fecha_comentario': comentario.fecha_comentario.isoformat(),
                'usuario': {
                    'id': comentario.usuario.usua_id,
                    'nickname': comentario.usuario.usua_nickname
                }
            })

        # Contar total de comentarios
        total_count = ComentarioReporte.objects.filter(reporte=reporte).count()

        return Response(
            {
                'count': total_count,
                'results': results
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        logger.error(f"Error al obtener comentarios del reporte: {str(e)}")
        return Response(
            {'errors': ['Error interno del servidor. Intente nuevamente.']},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )