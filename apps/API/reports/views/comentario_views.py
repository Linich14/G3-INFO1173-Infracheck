import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError

from reports.models import ReportModel, ComentarioReporte
from infrastructure.exceptions import (
    ReportNotFoundError,
    ReportPermissionError,
    UserNotFoundError,
    UserPermissionError,
    UserAuthenticationError
)

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
            raise UserAuthenticationError(
                message="Usuario no autenticado"
            )

        # Obtener el reporte
        reporte = get_object_or_404(ReportModel, id=report_id)

        # Validar que se proporcione el comentario
        comentario_texto = request.data.get('comentario', '').strip()
        if not comentario_texto:
            raise ValidationError("El comentario no puede estar vacío.")

        if len(comentario_texto) > 1000:
            raise ValidationError("El comentario no puede exceder los 1000 caracteres.")

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

    except UserAuthenticationError as e:
        return Response(e.get_error_response(), status=e.status_code)
    except ValidationError as e:
        return Response(
            {'errors': [str(e)]},
            status=status.HTTP_400_BAD_REQUEST
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
            raise UserAuthenticationError(
                message="Usuario no autenticado"
            )

        # Obtener el reporte
        reporte = get_object_or_404(ReportModel, id=report_id)

        # Obtener parámetros de paginación
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 50)  # Máximo 50

        # Calcular offset
        offset = (page - 1) * limit

        # Obtener comentarios con información del usuario (solo visibles)
        comentarios = ComentarioReporte.objects.filter(
            reporte=reporte,
            comment_visible=True
        ).select_related('usuario')\
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

        # Contar total de comentarios visibles
        total_count = ComentarioReporte.objects.filter(
            reporte=reporte,
            comment_visible=True
        ).count()

        return Response(
            {
                'count': total_count,
                'results': results
            },
            status=status.HTTP_200_OK
        )

    except UserAuthenticationError as e:
        return Response(e.get_error_response(), status=e.status_code)
    except Exception as e:
        logger.error(f"Error al obtener comentarios del reporte: {str(e)}")
        return Response(
            {'errors': ['Error interno del servidor. Intente nuevamente.']},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_comentario_reporte(request, comment_id):
    """
    Endpoint para eliminar (ocultar) un comentario de un reporte.
    Solo el autor del comentario o un administrador pueden eliminarlo.
    DELETE /api/v1/comments/{comment_id}/

    En lugar de eliminar físicamente, marca comment_visible=FALSE
    """
    try:
        # Obtener usuario autenticado
        usuario = getattr(request, 'auth_user', None)
        if not usuario:
            raise UserAuthenticationError(
                message="Usuario no autenticado"
            )

        # Obtener el comentario
        comentario = get_object_or_404(ComentarioReporte, id=comment_id)

        # Verificar si el comentario ya está oculto
        if not comentario.comment_visible:
            return Response(
                {'message': 'El comentario ya ha sido eliminado.'},
                status=status.HTTP_200_OK
            )

        # Validar permisos: solo el autor o admin pueden eliminar
        es_autor = comentario.usuario.usua_id == usuario.usua_id
        es_admin = usuario.rous_id.rous_nombre.lower() == 'admin'

        if not (es_autor or es_admin):
            raise UserPermissionError(
                message="No tienes permisos para eliminar este comentario"
            )

        # Marcar como no visible (soft delete)
        comentario.comment_visible = False
        comentario.save(update_fields=['comment_visible'])

        logger.info(f"Comentario {comment_id} marcado como no visible por usuario {usuario.usua_id}")

        return Response(
            {
                'message': 'Comentario eliminado exitosamente.',
                'comentario': {
                    'id': comentario.id,
                    'comentario': comentario.comentario,
                    'fecha_comentario': comentario.fecha_comentario.isoformat(),
                    'usuario': {
                        'id': comentario.usuario.usua_id,
                        'nickname': comentario.usuario.usua_nickname
                    },
                    'visible': comentario.comment_visible
                }
            },
            status=status.HTTP_200_OK
        )

    except UserAuthenticationError as e:
        return Response(e.get_error_response(), status=e.status_code)
    except UserPermissionError as e:
        return Response(e.get_error_response(), status=e.status_code)
    except ComentarioReporte.DoesNotExist:
        raise ReportNotFoundError(
            message=f"El comentario con ID {comment_id} no existe"
        )
    except Exception as e:
        logger.error(f"Error al eliminar comentario {comment_id}: {str(e)}")
        return Response(
            {'errors': ['Error interno del servidor. Intente nuevamente.']},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def restaurar_comentario_reporte(request, comment_id):
    """
    Endpoint para restaurar un comentario eliminado (solo administradores).
    POST /api/v1/admin/comments/{comment_id}/restore/

    Solo administradores pueden restaurar comentarios.
    Marca comment_visible=TRUE para hacer visible el comentario nuevamente.
    """
    try:
        # Obtener usuario autenticado
        usuario = getattr(request, 'auth_user', None)
        if not usuario:
            raise UserAuthenticationError(
                message="Usuario no autenticado"
            )

        # Validar que sea administrador
        es_admin = usuario.rous_id.rous_nombre.lower() == 'admin'
        if not es_admin:
            raise UserPermissionError(
                message="Solo los administradores pueden restaurar comentarios"
            )

        # Obtener el comentario
        comentario = get_object_or_404(ComentarioReporte, id=comment_id)

        # Verificar si el comentario ya está visible
        if comentario.comment_visible:
            return Response(
                {'message': 'El comentario ya está visible.'},
                status=status.HTTP_200_OK
            )

        # Marcar como visible (restaurar)
        comentario.comment_visible = True
        comentario.save(update_fields=['comment_visible'])

        logger.info(f"Comentario {comment_id} restaurado por administrador {usuario.usua_id}")

        return Response(
            {
                'message': 'Comentario restaurado exitosamente.',
                'comentario': {
                    'id': comentario.id,
                    'comentario': comentario.comentario,
                    'fecha_comentario': comentario.fecha_comentario.isoformat(),
                    'usuario': {
                        'id': comentario.usuario.usua_id,
                        'nickname': comentario.usuario.usua_nickname
                    },
                    'visible': comentario.comment_visible
                }
            },
            status=status.HTTP_200_OK
        )

    except UserAuthenticationError as e:
        return Response(e.get_error_response(), status=e.status_code)
    except UserPermissionError as e:
        return Response(e.get_error_response(), status=e.status_code)
    except ComentarioReporte.DoesNotExist:
        raise ReportNotFoundError(
            message=f"El comentario con ID {comment_id} no existe"
        )
    except Exception as e:
        logger.error(f"Error al restaurar comentario {comment_id}: {str(e)}")
        return Response(
            {'errors': ['Error interno del servidor. Intente nuevamente.']},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )