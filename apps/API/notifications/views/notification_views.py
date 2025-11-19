from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from notifications.models import Notification
from notifications.serializers import (
    NotificationSerializer,
    NotificationReadSerializer,
    NotificationAdminSerializer,
    NotificationCreateSerializer
)
from reports.services.notification_service import notification_service
from reports.models import ReportModel
import logging

logger = logging.getLogger('notifications')


class NotificationListView(APIView):
    """
    Vista para listar las notificaciones del usuario actual
    GET /api/notifications/ - Lista todas las notificaciones del usuario
    """
    
    def get(self, request):
        try:
            # Verificar autenticación usando el middleware personalizado
            if not hasattr(request, 'auth_user') or request.auth_user is None:
                return Response({
                    'success': False,
                    'error': 'Autenticación requerida'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            usuario = request.auth_user
            
            # Obtener parámetros de query
            solo_no_leidas = request.query_params.get('unread', 'false').lower() == 'true'
            
            # Filtrar notificaciones del usuario
            notificaciones = Notification.objects.filter(usuario=usuario)
            
            if solo_no_leidas:
                notificaciones = notificaciones.filter(leida=False)
            
            # Serializar
            serializer = NotificationSerializer(notificaciones, many=True)
            
            # Contar no leídas
            count_no_leidas = Notification.objects.filter(
                usuario=usuario,
                leida=False
            ).count()
            
            return Response({
                'success': True,
                'data': serializer.data,
                'unread_count': count_no_leidas,
                'total': notificaciones.count()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error al listar notificaciones: {str(e)}")
            return Response({
                'success': False,
                'error': 'Error al obtener notificaciones'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MarkNotificationReadView(APIView):
    """
    Vista para marcar una notificación como leída
    POST /api/notifications/<id>/mark-read/ - Marca como leída
    """
    
    def post(self, request, notification_id):
        try:
            # Verificar autenticación usando el middleware personalizado
            if not hasattr(request, 'auth_user') or request.auth_user is None:
                return Response({
                    'success': False,
                    'error': 'Autenticación requerida'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            usuario = request.auth_user
            
            # Obtener la notificación
            notificacion = get_object_or_404(
                Notification,
                id=notification_id,
                usuario=usuario
            )
            
            # Marcar como leída
            notificacion.marcar_como_leida()
            
            serializer = NotificationReadSerializer({
                'success': True,
                'message': 'Notificación marcada como leída'
            })
            
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Notification.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Notificación no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            logger.error(f"Error al marcar notificación como leída: {str(e)}")
            return Response({
                'success': False,
                'error': 'Error al marcar notificación como leída'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MarkAllNotificationsReadView(APIView):
    """
    Vista para marcar todas las notificaciones como leídas
    POST /api/notifications/mark-all-read/ - Marca todas como leídas
    """
    
    def post(self, request):
        try:
            # Verificar autenticación usando el middleware personalizado
            if not hasattr(request, 'auth_user') or request.auth_user is None:
                return Response({
                    'success': False,
                    'error': 'Autenticación requerida'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            usuario = request.auth_user
            
            from django.utils import timezone
            
            # Actualizar todas las notificaciones no leídas del usuario
            count = Notification.objects.filter(
                usuario=usuario,
                leida=False
            ).update(
                leida=True,
                fecha_lectura=timezone.now()
            )
            
            return Response({
                'success': True,
                'message': f'{count} notificaciones marcadas como leídas',
                'count': count
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error al marcar todas las notificaciones: {str(e)}")
            return Response({
                'success': False,
                'error': 'Error al marcar notificaciones como leídas'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NotificationAdminListView(APIView):
    """
    Vista para listar notificaciones administrativas
    GET /api/notifications/admin/ - Lista notificaciones para administradores
    
    Parámetros query opcionales:
    - unread: (true/false) Filtrar solo no leídas
    - user_id: ID de usuario específico
    - tipo: Tipo de notificación (info, success, warning, error)
    - search: Buscar en título o mensaje
    """
    
    def get(self, request):
        try:
            # Verificar autenticación
            if not hasattr(request, 'auth_user') or request.auth_user is None:
                return Response({
                    'success': False,
                    'error': 'Autenticación requerida'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            usuario = request.auth_user
            
            # Verificar permisos de administrador
            if not usuario.usua_is_admin:
                return Response({
                    'success': False,
                    'error': 'No tienes permisos de administrador'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Obtener todas las notificaciones (admin puede ver todas)
            notificaciones = Notification.objects.all()
            
            # Filtros opcionales
            solo_no_leidas = request.query_params.get('unread', 'false').lower() == 'true'
            if solo_no_leidas:
                notificaciones = notificaciones.filter(leida=False)
            
            # Filtrar por usuario específico
            user_id = request.query_params.get('user_id')
            if user_id:
                notificaciones = notificaciones.filter(usuario_id=user_id)
            
            # Filtrar por tipo
            tipo = request.query_params.get('tipo')
            if tipo and tipo in ['info', 'success', 'warning', 'error']:
                notificaciones = notificaciones.filter(tipo=tipo)
            
            # Buscar en título o mensaje
            search = request.query_params.get('search')
            if search:
                notificaciones = notificaciones.filter(
                    Q(titulo__icontains=search) | Q(mensaje__icontains=search)
                )
            
            # Ordenar por fecha de creación (más recientes primero)
            notificaciones = notificaciones.select_related('usuario', 'denuncia').order_by('-fecha_creacion')
            
            # Serializar con el serializer admin (incluye info de usuario)
            serializer = NotificationAdminSerializer(notificaciones, many=True)
            
            # Estadísticas
            total = notificaciones.count()
            no_leidas = notificaciones.filter(leida=False).count()
            por_tipo = {
                'info': notificaciones.filter(tipo='info').count(),
                'success': notificaciones.filter(tipo='success').count(),
                'warning': notificaciones.filter(tipo='warning').count(),
                'error': notificaciones.filter(tipo='error').count(),
            }
            
            return Response({
                'success': True,
                'data': serializer.data,
                'total': total,
                'unread_count': no_leidas,
                'stats': {
                    'by_type': por_tipo,
                    'read_percentage': round((total - no_leidas) / total * 100, 2) if total > 0 else 0
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error al listar notificaciones administrativas: {str(e)}")
            return Response({
                'success': False,
                'error': 'Error al obtener notificaciones administrativas'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NotificationCreateAdminView(APIView):
    """
    Vista para crear notificaciones desde el panel admin
    POST /api/notifications/create/ - Crea una notificación
    
    Body JSON:
    {
        "usuario_identifier": "12345678-9" o 5,  // RUT o ID (opcional si send_to_all=true)
        "titulo": "Título de la notificación",
        "mensaje": "Mensaje de la notificación",
        "tipo": "info",  // info, success, warning, error
        "reporte_id": 123,  // opcional
        "send_to_all": false  // opcional, si es true envía a todos los usuarios
    }
    """
    
    def post(self, request):
        try:
            # Verificar autenticación
            if not hasattr(request, 'auth_user') or request.auth_user is None:
                return Response({
                    'success': False,
                    'error': 'Autenticación requerida'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            usuario_admin = request.auth_user
            
            # Obtener datos
            usuario_identifier = request.data.get('usuario_identifier')
            titulo = request.data.get('titulo')
            mensaje = request.data.get('mensaje')
            tipo = request.data.get('tipo', 'info')
            reporte_id = request.data.get('reporte_id')
            send_to_all = request.data.get('send_to_all', False)
            
            # Validaciones
            if not send_to_all and not usuario_identifier:
                return Response({
                    'success': False,
                    'error': 'Se requiere usuario_identifier (RUT o ID) o activar send_to_all'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not titulo or not mensaje:
                return Response({
                    'success': False,
                    'error': 'Se requiere título y mensaje'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Buscar reporte si se proporciona
            reporte = None
            if reporte_id:
                try:
                    reporte = ReportModel.objects.get(id=reporte_id)
                except ReportModel.DoesNotExist:
                    logger.warning(f"Reporte {reporte_id} no encontrado")
            
            # Si send_to_all es True, crear notificaciones para todos los usuarios
            if send_to_all:
                from domain.entities.usuario import Usuario
                usuarios = Usuario.objects.filter(usua_estado=1)
                notificaciones_creadas = []
                
                for usuario in usuarios:
                    notificacion = notification_service.create_notification(
                        usuario=usuario,
                        titulo=titulo,
                        mensaje=mensaje,
                        tipo=tipo,
                        denuncia=reporte
                    )
                    if notificacion:
                        notificaciones_creadas.append(notificacion)
                
                logger.info(
                    f"Notificaciones masivas creadas por admin {usuario_admin.usua_nickname}: "
                    f"{len(notificaciones_creadas)} notificaciones enviadas"
                )
                
                return Response({
                    'success': True,
                    'message': f'{len(notificaciones_creadas)} notificaciones creadas exitosamente',
                    'count': len(notificaciones_creadas)
                }, status=status.HTTP_201_CREATED)
            
            # Crear notificación individual usando el servicio con RUT/ID
            notificacion = notification_service.create_notification(
                usuario=usuario_identifier,
                titulo=titulo,
                mensaje=mensaje,
                tipo=tipo,
                denuncia=reporte
            )
            
            if not notificacion:
                return Response({
                    'success': False,
                    'error': f'No se pudo crear la notificación. Usuario no encontrado: {usuario_identifier}'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Serializar respuesta
            response_serializer = NotificationSerializer(notificacion)
            
            logger.info(f"Notificación creada por admin {usuario_admin.usua_nickname}: ID={notificacion.id}")
            
            return Response({
                'success': True,
                'message': 'Notificación creada exitosamente',
                'notificacion': response_serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error al crear notificación administrativa: {str(e)}")
            return Response({
                'success': False,
                'error': 'Error al crear la notificación'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

