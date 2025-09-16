from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from domain.entities.sesion_token import SesionToken
import json

class TokenAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware para autenticación basada en tokens
    """
    
    def process_request(self, request):
        # Rutas que no requieren autenticación
        public_paths = [
            '/api/v1/register/',
            '/api/v1/login/',
            '/admin/',
        ]
        
        # Si la ruta es pública, no validar token
        if any(request.path.startswith(path) for path in public_paths):
            return None
        
        # Obtener token del header Authorization
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({
                'error': 'Token de autorización requerido'
            }, status=401)
        
        token_valor = auth_header.split(' ')[1]
        
        # Validar token
        usuario = SesionToken.get_user_by_token(token_valor)
        if not usuario:
            return JsonResponse({
                'error': 'Token inválido o expirado'
            }, status=401)
        
        # Agregar usuario al request
        request.user = usuario
        return None