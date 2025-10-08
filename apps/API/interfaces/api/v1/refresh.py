from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from domain.entities.sesion_token import SesionToken
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
def refresh_token_view(request):
    """
    Endpoint para refrescar un token de sesión válido.
    
    Headers:
        Authorization: Bearer <token_actual>
    
    Body (JSON):
    {
        "token": "string"  // Token actual a refrescar (opcional si se pasa en headers)
    }
    
    Respuesta exitosa (200):
    {
        "token": "string",              // Nuevo token generado
        "expires_at": "datetime",       // Fecha y hora de expiración del nuevo token
        "user_id": integer,             // ID del usuario
        "username": "string",           // Nickname del usuario
        "email": "string",              // Email del usuario
        "rous_id": integer,             // ID del rol
        "rous_nombre": "string"         // Nombre del rol
    }
    
    Respuesta de error (401):
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
                usuario = sesion_token.usua_id
                
                # Desactivar el token actual
                sesion_token.deactivate()
                
                # Generar nuevo token
                nuevo_token = SesionToken.generate_token(usuario, hours=24)
                
                logger.info(f"Token refrescado para usuario: {usuario.usua_nickname}")
                
                response_data = {
                    'token': nuevo_token.token_valor,
                    'expires_at': nuevo_token.token_expira_en.isoformat(),
                    'user_id': usuario.usua_id,
                    'username': usuario.usua_nickname,
                    'email': usuario.usua_email,
                    'rous_id': usuario.rous_id.rous_id,
                    'rous_nombre': usuario.rous_id.rous_nombre
                }
                
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                # Token expirado - eliminarlo
                sesion_token.delete()
                logger.warning(f"Intento de refresh con token expirado: {token_value[:10]}...")
                
                return Response(
                    {
                        'errors': ['Token expirado. Inicie sesión nuevamente.']
                    }, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        except SesionToken.DoesNotExist:
            logger.warning(f"Token inválido para refresh: {token_value[:10]}...")
            return Response(
                {
                    'errors': ['Token inválido o no encontrado.']
                }, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    except Exception as e:
        logger.error(f"Error inesperado en refresh de token: {str(e)}")
        return Response(
            {
                'errors': ['Error interno del servidor. Intente nuevamente.']
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )