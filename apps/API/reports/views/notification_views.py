from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from reports.models import Notification
from reports.serializers.notification_serializer import (
    NotificationSerializer,
    NotificationReadSerializer
)
import logging

logger = logging.getLogger('reports')


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
