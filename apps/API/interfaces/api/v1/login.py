from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from interfaces.api.serializers.user_login import UserLoginSerializer
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
def login_view(request):
    """
    Endpoint para autenticar usuarios con RUT/password y generar token de sesión.
    
    Body (JSON):
    {
        "rut": "string",       // RUT del usuario (ej: "12345678-9")
        "password": "string"   // Contraseña del usuario
    }
    
    Respuesta exitosa (200):
    {
        "token": "string",              // Token de sesión generado
        "expires_at": "datetime",       // Fecha y hora de expiración
        "user_id": integer,             // ID del usuario autenticado
        "username": "string",           // Nickname del usuario
        "rut": "string"                 // RUT del usuario autenticado
    }
    
    Respuesta de error (400/401):
    {
        "errors": ["string"]  // Lista de errores de validación
    }
    """
    try:
        if request.method != 'POST':
            return Response(
                {'errors': ['Método no permitido. Use POST.']}, 
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        
        serializer = UserLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            validated_data = serializer.validated_data
            usuario = validated_data['usuario']
            
            logger.info(f"Login exitoso para usuario con RUT: {usuario.usua_rut} (nickname: {usuario.usua_nickname})")
            
            response_data = {
                'token': validated_data['token'],
                'expires_at': validated_data['expires_at'].isoformat(),
                'user_id': usuario.usua_id,
                'username': usuario.usua_nickname,
                'rut': usuario.usua_rut
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            logger.warning(f"Intento de login fallido: {serializer.errors}")
            return Response(
                {'errors': [str(error) for errors in serializer.errors.values() for error in errors]}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    except Exception as e:
        logger.error(f"Error inesperado en login: {str(e)}")
        return Response(
            {'errors': ['Error interno del servidor. Intente nuevamente.']}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )