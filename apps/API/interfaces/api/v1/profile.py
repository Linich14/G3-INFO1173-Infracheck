from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from interfaces.api.serializers.user_profile import UserProfileSerializer, UserProfileUpdateSerializer
from domain.entities.usuario import Usuario
from domain.entities.sesion_token import SesionToken
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


def get_user_from_token(request):
    """
    Extrae el usuario del token de autorización en los headers.
    Retorna el usuario si el token es válido, None en caso contrario.
    Nota: Elimina automáticamente tokens expirados de la base de datos.
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    
    try:
        # Buscar el token en la base de datos
        sesion_token = SesionToken.objects.select_related('usua_id').get(
            token_valor=token
        )
        
        # Usar el método is_valid() del modelo para validar el token
        if sesion_token.is_valid():
            return sesion_token.usua_id
        else:
            # Token expirado o inactivo - eliminarlo de la base de datos
            logger.debug(f"Token expirado eliminado: {token[:10]}...")
            sesion_token.delete()
            return None
            
    except SesionToken.DoesNotExist:
        return None


@api_view(['GET', 'PUT'])
def profile_view(request):
    # Obtener usuario del middleware o del token directamente
    user = getattr(request, 'auth_user', None)
    if not user:
        # Fallback: intentar obtener usuario del token manualmente
        user = get_user_from_token(request)
        if not user:
            return Response(
                {'error': 'Token de autorización inválido o expirado'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    if request.method == 'GET':
        try:
            # Obtener el usuario con su rol relacionado
            usuario = Usuario.objects.select_related('rous_id').get(usua_id=user.usua_id)
            serializer = UserProfileSerializer(usuario)
            
            logger.info(f"Perfil consultado para usuario: {usuario.usua_nickname} (ID: {usuario.usua_id})")
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Usuario.DoesNotExist:
            logger.error(f"Usuario no encontrado con ID: {user.usua_id}")
            return Response(
                {'error': 'Usuario no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error al obtener perfil de usuario {user.usua_id}: {str(e)}")
            return Response(
                {'error': 'Error interno del servidor'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    elif request.method == 'PUT':
        try:
            # Obtener el usuario a actualizar
            usuario = Usuario.objects.get(usua_id=user.usua_id)
            serializer = UserProfileUpdateSerializer(usuario, data=request.data, partial=True)
            
            if serializer.is_valid():
                # Guardar los cambios
                updated_usuario = serializer.save()
                
                # Retornar el perfil actualizado
                profile_serializer = UserProfileSerializer(updated_usuario)
                
                logger.info(f"Perfil actualizado para usuario: {updated_usuario.usua_nickname} (ID: {updated_usuario.usua_id})")
                return Response(profile_serializer.data, status=status.HTTP_200_OK)
            else:
                logger.warning(f"Error de validación al actualizar perfil del usuario {user.usua_id}: {serializer.errors}")
                return Response(
                    {'errors': [str(error) for errors in serializer.errors.values() for error in errors]}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Usuario.DoesNotExist:
            logger.error(f"Usuario no encontrado con ID: {user.usua_id}")
            return Response(
                {'error': 'Usuario no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error al actualizar perfil de usuario {user.usua_id}: {str(e)}")
            return Response(
                {'error': 'Error interno del servidor'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    else:
        return Response(
            {'error': 'Método no permitido'}, 
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )