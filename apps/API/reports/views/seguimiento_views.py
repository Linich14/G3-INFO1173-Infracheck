from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from reports.models.seguimiento_reporte import SeguimientoReporte
from reports.models.report import ReportModel
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
def follow_report_view(request, report_id):
    """
    Endpoint para que un usuario siga un reporte específico.

    Headers:
        Authorization: Bearer <token>

    URL Params:
        report_id: ID del reporte a seguir

    Respuesta Éxito (200):
    {
        "message": "Reporte seguido exitosamente",
        "seguidores_count": 5
    }

    Respuesta Error (400/401/404):
    {
        "errors": ["mensaje de error"]
    }
    """
    try:
        # Obtener usuario autenticado
        usuario = getattr(request, 'auth_user', None)
        if not usuario:
            return Response(
                {'errors': ['Usuario no autenticado.']},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Verificar que el reporte existe y es visible
        try:
            reporte = ReportModel.objects.get(id=report_id, visible=True)
        except ReportModel.DoesNotExist:
            return Response(
                {'errors': ['Reporte no encontrado o no visible.']},
                status=status.HTTP_404_NOT_FOUND
            )

        # Verificar si ya está siguiendo el reporte
        if SeguimientoReporte.esta_siguiendo_reporte(usuario, reporte):
            return Response(
                {'errors': ['Ya estás siguiendo este reporte.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar límite de 15 reportes
        if not SeguimientoReporte.puede_seguir_mas_reportes(usuario):
            return Response(
                {'errors': ['Has alcanzado el límite máximo de 15 reportes seguidos.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Crear seguimiento
        seguimiento = SeguimientoReporte.objects.create(
            usuario=usuario,
            reporte=reporte
        )

        # Contar seguidores actuales
        seguidores_count = SeguimientoReporte.objects.filter(reporte=reporte).count()

        logger.info(f"Usuario {usuario.usua_nickname} comenzó a seguir reporte #{report_id}")

        return Response(
            {
                'message': 'Reporte seguido exitosamente',
                'seguidores_count': seguidores_count
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        logger.error(f"Error al seguir reporte {report_id}: {str(e)}")
        return Response(
            {'errors': ['Error interno del servidor. Intente nuevamente.']},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
def unfollow_report_view(request, report_id):
    """
    Endpoint para que un usuario deje de seguir un reporte específico.

    Headers:
        Authorization: Bearer <token>

    URL Params:
        report_id: ID del reporte a dejar de seguir

    Respuesta Éxito (200):
    {
        "message": "Dejaste de seguir el reporte",
        "seguidores_count": 4
    }

    Respuesta Error (400/401/404):
    {
        "errors": ["mensaje de error"]
    }
    """
    try:
        # Obtener usuario autenticado
        usuario = getattr(request, 'auth_user', None)
        if not usuario:
            return Response(
                {'errors': ['Usuario no autenticado.']},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Verificar que el reporte existe
        try:
            reporte = ReportModel.objects.get(id=report_id)
        except ReportModel.DoesNotExist:
            return Response(
                {'errors': ['Reporte no encontrado.']},
                status=status.HTTP_404_NOT_FOUND
            )

        # Verificar si está siguiendo el reporte
        try:
            seguimiento = SeguimientoReporte.objects.get(usuario=usuario, reporte=reporte)
            seguimiento.delete()

            # Contar seguidores actuales
            seguidores_count = SeguimientoReporte.objects.filter(reporte=reporte).count()

            logger.info(f"Usuario {usuario.usua_nickname} dejó de seguir reporte #{report_id}")

            return Response(
                {
                    'message': 'Dejaste de seguir el reporte',
                    'seguidores_count': seguidores_count
                },
                status=status.HTTP_200_OK
            )

        except SeguimientoReporte.DoesNotExist:
            return Response(
                {'errors': ['No estás siguiendo este reporte.']},
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        logger.error(f"Error al dejar de seguir reporte {report_id}: {str(e)}")
        return Response(
            {'errors': ['Error interno del servidor. Intente nuevamente.']},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def is_following_report_view(request, report_id):
    """
    Endpoint para verificar si el usuario actual está siguiendo un reporte específico.

    Headers:
        Authorization: Bearer <token>

    URL Params:
        report_id: ID del reporte a verificar

    Respuesta (200):
    {
        "is_following": true,
        "seguidores_count": 5
    }

    Respuesta Error (401/404):
    {
        "errors": ["mensaje de error"]
    }
    """
    try:
        # Obtener usuario autenticado
        usuario = getattr(request, 'auth_user', None)
        if not usuario:
            return Response(
                {'errors': ['Usuario no autenticado.']},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Verificar que el reporte existe
        try:
            reporte = ReportModel.objects.get(id=report_id)
        except ReportModel.DoesNotExist:
            return Response(
                {'errors': ['Reporte no encontrado.']},
                status=status.HTTP_404_NOT_FOUND
            )

        # Verificar seguimiento
        is_following = SeguimientoReporte.esta_siguiendo_reporte(usuario, reporte)
        seguidores_count = SeguimientoReporte.objects.filter(reporte=reporte).count()

        return Response(
            {
                'is_following': is_following,
                'seguidores_count': seguidores_count
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        logger.error(f"Error al verificar seguimiento de reporte {report_id}: {str(e)}")
        return Response(
            {'errors': ['Error interno del servidor. Intente nuevamente.']},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def followed_reports_view(request):
    """
    Endpoint para obtener todos los reportes que sigue el usuario actual.

    Headers:
        Authorization: Bearer <token>

    Query Params:
        page: número de página (opcional)
        limit: elementos por página (opcional, máximo 50)

    Respuesta (200):
    {
        "count": 3,
        "results": [
            {
                "id": 123,
                "titulo": "Bache en calle principal",
                "fecha_seguimiento": "2025-10-20T10:30:00Z",
                "reporte": {
                    "titulo": "Bache en calle principal",
                    "descripcion": "...",
                    "urgencia": 2,
                    "fecha_creacion": "2025-10-15T08:00:00Z"
                }
            }
        ]
    }
    """
    try:
        # Obtener usuario autenticado
        usuario = getattr(request, 'auth_user', None)
        if not usuario:
            return Response(
                {'errors': ['Usuario no autenticado.']},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Obtener parámetros de paginación
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 50)  # Máximo 50

        # Calcular offset
        offset = (page - 1) * limit

        # Obtener seguimientos con reportes relacionados, solo los visibles (segu_visible=TRUE)
        seguimientos = SeguimientoReporte.objects.filter(
            usuario=usuario,
            segu_visible=True
        ).select_related('reporte', 'reporte__usuario', 'reporte__denuncia_estado', 'reporte__tipo_denuncia', 'reporte__ciudad')\
            .order_by('-fecha_seguimiento')[offset:offset + limit]

        # Serializar resultados
        results = []
        for seguimiento in seguimientos:
            results.append({
                'id': seguimiento.id,
                'titulo': seguimiento.reporte.titulo,
                'fecha_seguimiento': seguimiento.fecha_seguimiento.isoformat(),
                'reporte': {
                    'id': seguimiento.reporte.id,
                    'titulo': seguimiento.reporte.titulo,
                    'descripcion': seguimiento.reporte.descripcion,
                    'ubicacion': seguimiento.reporte.ubicacion,
                    'urgencia': seguimiento.reporte.urgencia,
                    'fecha_creacion': seguimiento.reporte.fecha_creacion.isoformat(),
                    'usuario': {
                        'id': seguimiento.reporte.usuario.usua_id,
                        'nickname': seguimiento.reporte.usuario.usua_nickname
                    },
                    'estado': seguimiento.reporte.denuncia_estado.nombre if seguimiento.reporte.denuncia_estado else None,
                    'tipo': seguimiento.reporte.tipo_denuncia.nombre if seguimiento.reporte.tipo_denuncia else None,
                    'ciudad': seguimiento.reporte.ciudad.nombre if seguimiento.reporte.ciudad else None
                }
            })

        # Contar total solo de seguimientos visibles
        total_count = SeguimientoReporte.objects.filter(
            usuario=usuario,
            segu_visible=True
        ).count()

        return Response(
            {
                'count': total_count,
                'results': results
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        logger.error(f"Error al obtener reportes seguidos: {str(e)}")
        return Response(
            {'errors': ['Error interno del servidor. Intente nuevamente.']},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )