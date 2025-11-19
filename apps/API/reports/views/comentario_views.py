import logging
from datetime import datetime, timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.utils import timezone as django_timezone

from reports.models import ReportModel, ComentarioReporte
from infrastructure.exceptions import (
    ReportNotFoundError,
    ReportPermissionError,
    UserNotFoundError,
    UserPermissionError,
    UserAuthenticationError
)
from notifications.services.notification_service import notification_service

logger = logging.getLogger(__name__)


def obtener_tiempo_relativo(fecha_comentario):
    """
    Calcula el tiempo relativo desde que se hizo un comentario.
    Retorna un string amigable como "hace 5 minutos", "hace 2 horas", etc.
    """
    ahora = django_timezone.now()
    diferencia = ahora - fecha_comentario
    
    segundos = diferencia.total_seconds()
    minutos = segundos / 60
    horas = minutos / 60
    dias = horas / 24
    semanas = dias / 7
    meses = dias / 30
    años = dias / 365
    
    if segundos < 60:
        return "hace unos segundos"
    elif minutos < 60:
        mins = int(minutos)
        return f"hace {mins} minuto{'s' if mins != 1 else ''}"
    elif horas < 24:
        hrs = int(horas)
        return f"hace {hrs} hora{'s' if hrs != 1 else ''}"
    elif dias < 7:
        d = int(dias)
        return f"hace {d} día{'s' if d != 1 else ''}"
    elif semanas < 4:
        sem = int(semanas)
        return f"hace {sem} semana{'s' if sem != 1 else ''}"
    elif meses < 12:
        m = int(meses)
        return f"hace {m} mes{'es' if m != 1 else ''}"
    else:
        a = int(años)
        return f"hace {a} año{'s' if a != 1 else ''}"


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

        # Notificar a los seguidores del reporte (excepto al autor del comentario)
        try:
            notification_service.notify_followers_new_comment(
                reporte=reporte,
                comentario=comentario,
                autor_comentario=usuario
            )
            logger.info(f"Notificaciones enviadas por comentario en reporte #{report_id}")
        except Exception as e:
            logger.error(f"Error al enviar notificaciones: {str(e)}")
            # No fallar la creación del comentario si falla la notificación

        # Verificar si es administrador
        rol_nombre = usuario.rous_id.rous_nombre.lower().strip()
        es_admin = 'admin' in rol_nombre

        return Response(
            {
                'message': 'Comentario creado exitosamente.',
                'comentario': {
                    'id': comentario.id,
                    'comentario': comentario.comentario,
                    'fecha_comentario': comentario.fecha_comentario.isoformat(),
                    'tiempo_relativo': obtener_tiempo_relativo(comentario.fecha_comentario),
                    'usuario': {
                        'id': comentario.usuario.usua_id,
                        'nickname': comentario.usuario.usua_nickname
                    },
                    'puede_eliminar': True,  # El autor siempre puede eliminar su propio comentario
                    'es_autor': True,
                    'es_admin': es_admin
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

        # Verificar si el usuario es administrador
        rol_nombre = usuario.rous_id.rous_nombre.lower().strip()
        es_admin = 'admin' in rol_nombre

        # Verificar si el usuario ya ha comentado en este reporte
        usuario_ha_comentado = ComentarioReporte.objects.filter(
            reporte=reporte,
            usuario=usuario,
            comment_visible=True
        ).exists()

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
            # Verificar si el usuario actual es el autor de este comentario
            es_autor = comentario.usuario.usua_id == usuario.usua_id
            
            # El usuario puede eliminar si es el autor o es administrador
            puede_eliminar = es_autor or es_admin
            
            results.append({
                'id': comentario.id,
                'comentario': comentario.comentario,
                'fecha_comentario': comentario.fecha_comentario.isoformat(),
                'tiempo_relativo': obtener_tiempo_relativo(comentario.fecha_comentario),
                'usuario': {
                    'id': comentario.usuario.usua_id,
                    'nickname': comentario.usuario.usua_nickname
                },
                'es_autor': es_autor,
                'puede_eliminar': puede_eliminar,
                'es_admin': es_admin  # Indica si el usuario actual es admin (no si el comentario es de admin)
            })

        # Contar total de comentarios visibles
        total_count = ComentarioReporte.objects.filter(
            reporte=reporte,
            comment_visible=True
        ).count()

        # Calcular paginación
        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 0
        has_next = page < total_pages
        has_previous = page > 1

        # Preparar respuesta base
        response_data = {
            'comentarios': results,
            'usuario_ha_comentado': usuario_ha_comentado,
            'pagination': {
                'page': page,
                'limit': limit,
                'total_items': total_count,
                'total_pages': total_pages,
                'has_next': has_next,
                'has_previous': has_previous
            }
        }

        # Agregar mensaje personalizado si no hay comentarios
        if total_count == 0:
            response_data['message'] = '¡Sé el primero en comentar en este reporte!'
            response_data['empty'] = True

        return Response(response_data, status=status.HTTP_200_OK)

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
        rol_nombre = usuario.rous_id.rous_nombre.lower().strip()
        es_admin = 'admin' in rol_nombre

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
                    'tiempo_relativo': obtener_tiempo_relativo(comentario.fecha_comentario),
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
                    'tiempo_relativo': obtener_tiempo_relativo(comentario.fecha_comentario),
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