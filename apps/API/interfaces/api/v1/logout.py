from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from domain.entities.sesion_token import SesionToken
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
def logout_view(request):
    """
    Endpoint para cerrar sesión y desactivar token de usuario.
    
    Headers:
        Authorization: Bearer <token>
    
    Body (JSON):
    {
        "token": "string"  // Token a desactivar (opcional si se pasa en headers)
    }
    
    Respuesta exitosa (200):
    {
        "message": "Sesión cerrada exitosamente"
    }
    
    Respuesta de error (400/401):
    {
        "errors": ["string"]
    }
    """
    try:
        # Intentar obtener token del header Authorization
        auth_header = request.headers.get('Authorization', '')
        token_from_header = None
        
        if auth_header.startswith('Bearer '):
            token_from_header = auth_header[7:]  # Remover 'Bearer '
        
        # Si no hay token en header, intentar obtenerlo del body
        token_from_body = request.data.get('token', '')
        
        # Usar token del header primero, sino del body
        token_value = token_from_header or token_from_body
        
        if not token_value:
            return Response(
                {
                    'errors': ['Token no proporcionado. Use header Authorization: Bearer <token> o campo token en el body.']
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Buscar el token en la base de datos
            sesion_token = SesionToken.objects.get(
                token_valor=token_value,
                token_activo=True
            )
            
            # Eliminar el token
            usuario_nickname = sesion_token.usua_id.usua_nickname
            sesion_token.delete()
            
            logger.info(f"Logout exitoso para usuario: {usuario_nickname}")
            
            return Response(
                {'message': 'Sesión cerrada exitosamente'}, 
                status=status.HTTP_200_OK
            )
        
        except SesionToken.DoesNotExist:
            # Token ya no existe o no está activo
            logger.warning(f"Intento de logout con token inválido: {token_value[:10]}...")
            return Response(
                {
                    'errors': ['Token inválido o ya expirado.']
                }, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    except Exception as e:
        logger.error(f"Error inesperado en logout: {str(e)}")
        return Response(
            {
                'errors': ['Error interno del servidor. Intente nuevamente.']
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )