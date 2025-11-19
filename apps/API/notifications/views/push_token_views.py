from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from notifications.models.push_token import PushToken
import logging

logger = logging.getLogger('notifications')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_push_token(request):
    """
    Registrar token de push notification
    POST /api/notifications/register-token/
    
    Body:
    {
        "push_token": "ExponentPushToken[xxxxxx]",
        "platform": "ios" | "android"
    }
    """
    try:
        usuario = getattr(request, 'auth_user', None)
        if not usuario:
            return Response({
                'success': False,
                'error': 'Usuario no autenticado'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        push_token = request.data.get('push_token')
        platform = request.data.get('platform', 'android')
        
        if not push_token:
            return Response({
                'success': False,
                'error': 'Se requiere push_token'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear o actualizar el token
        token_obj, created = PushToken.objects.update_or_create(
            push_token=push_token,
            defaults={
                'usuario': usuario,
                'platform': platform,
                'is_active': True
            }
        )
        
        logger.info(
            f"Push token {'creado' if created else 'actualizado'} para usuario "
            f"{usuario.usua_nickname} ({platform})"
        )
        
        return Response({
            'success': True,
            'message': 'Token registrado exitosamente',
            'created': created
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error al registrar push token: {str(e)}")
        return Response({
            'success': False,
            'error': 'Error al registrar token'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
