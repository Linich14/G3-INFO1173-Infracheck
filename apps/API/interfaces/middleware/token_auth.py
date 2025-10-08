"""
Middleware para autenticación por token opcional.
Verifica tokens en headers Authorization y agrega información del usuario a request.
"""

from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from domain.entities.sesion_token import SesionToken
import logging

logger = logging.getLogger(__name__)

class TokenAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware que verifica tokens de autenticación de manera opcional.
    Si hay un token válido en los headers, agrega el usuario a request.user
    Si no hay token o es inválido, no interfiere con el request.
    """
    
    def process_request(self, request):
        # Inicializar usuario como None
        request.auth_user = None
        request.auth_token = None
        
        # Rutas públicas que no requieren autenticación
        public_paths = [
            '/api/v1/register/',
            '/api/v1/login/',
            '/api/v1/verify-token/',
            '/api/v1/request-password-reset/',
            '/admin/',
        ]
        
        # Si es una ruta pública, solo verificar token sin forzar autenticación
        is_public_path = any(request.path.startswith(path) for path in public_paths)
        
        # Obtener token del header Authorization
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if auth_header.startswith('Bearer '):
            token_value = auth_header[7:]  # Remover 'Bearer '
            
            try:
                # Buscar token en la base de datos
                sesion_token = SesionToken.objects.select_related('usua_id').get(
                    token_valor=token_value,
                    token_activo=True
                )
                
                # Verificar si el token es válido
                if sesion_token.is_valid():
                    # Verificar si el usuario está habilitado (soft delete)
                    if sesion_token.usua_id.usua_estado == 0:
                        logger.debug(f"Usuario deshabilitado intentó autenticarse: {sesion_token.usua_id.usua_nickname}")
                        # Si no es ruta pública, retornar error
                        if not is_public_path:
                            return JsonResponse({
                                'errors': ['Cuenta deshabilitada. Contacta soporte para reactivar.']
                            }, status=403)
                    else:
                        request.auth_user = sesion_token.usua_id
                        request.auth_token = sesion_token
                        logger.debug(f"Usuario autenticado: {sesion_token.usua_id.usua_nickname}")
                else:
                    # Token expirado - eliminarlo
                    sesion_token.delete()
                    logger.debug(f"Token expirado eliminado: {token_value[:10]}...")
                    
                    # Si no es ruta pública, retornar error
                    if not is_public_path:
                        return JsonResponse({
                            'errors': ['Token expirado.']
                        }, status=401)
            
            except SesionToken.DoesNotExist:
                logger.debug(f"Token no válido: {token_value[:10]}...")
                
                # Si no es ruta pública, retornar error
                if not is_public_path:
                    return JsonResponse({
                        'errors': ['Token inválido.']
                    }, status=401)
        else:
            # No hay token válido
            if not is_public_path:
                return JsonResponse({
                    'errors': ['Token de autorización requerido. Use: Authorization: Bearer <token>']
                }, status=401)
        
        # Continuar con el request normalmente
        return None