from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from domain.entities.sesion_token import SesionToken
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
def verify_token_view(request):
    """
    Endpoint para verificar la validez de un token de sesión.
    
    Headers:
        Authorization: Bearer <token>
    
    Body (JSON):
    {
        "token": "string"  // Token a verificar (opcional si se pasa en headers)
    }
    
    Respuesta exitosa (200):
    {
        "valid": true,
        "user_id": integer,
        "username": "string",
        "expires_at": "datetime"
    }
    
    Respuesta de error (401):
    {
        "valid": false,
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
                    'valid': False,
                    'errors': ['Token no proporcionado. Use header Authorization: Bearer <token> o campo token en el body.']
                }, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            # Buscar el token en la base de datos
            sesion_token = SesionToken.objects.select_related('usua_id').get(
                token_valor=token_value,
                token_activo=True
            )
            
            # Verificar si el token sigue siendo válido
            if sesion_token.is_valid():
                logger.info(f"Token válido verificado para usuario: {sesion_token.usua_id.usua_nickname}")
                
                response_data = {
                    'valid': True,
                    'user_id': sesion_token.usua_id.usua_id,
                    'username': sesion_token.usua_id.usua_nickname,
                    'email': sesion_token.usua_id.usua_email,
                    'expires_at': sesion_token.token_expira_en.isoformat(),
                    'rous_id': sesion_token.usua_id.rous_id.rous_id,
                    'rous_nombre': sesion_token.usua_id.rous_id.rous_nombre
                }
                
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                # Token expirado - eliminarlo
                sesion_token.delete()
                logger.warning(f"Token expirado eliminado: {token_value[:10]}...")
                
                return Response(
                    {
                        'valid': False,
                        'errors': ['Token expirado.']
                    }, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        except SesionToken.DoesNotExist:
            logger.warning(f"Token inválido intentado: {token_value[:10]}...")
            return Response(
                {
                    'valid': False,
                    'errors': ['Token inválido o no encontrado.']
                }, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    except Exception as e:
        logger.error(f"Error inesperado en verificación de token: {str(e)}")
        return Response(
            {
                'valid': False,
                'errors': ['Error interno del servidor. Intente nuevamente.']
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )