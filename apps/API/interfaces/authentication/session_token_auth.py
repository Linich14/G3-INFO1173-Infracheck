from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from domain.entities.sesion_token import SesionToken
import logging

logger = logging.getLogger(__name__)

class SesionTokenAuthentication(BaseAuthentication):
    """
    Autenticación personalizada basada en SesionToken usando el sistema existente
    """
    
    def authenticate(self, request):
        
        # Si ya se autenticó a través del middleware, usar esa información
        if hasattr(request, 'auth_user') and request.auth_user:
            return (request.auth_user, request.auth_token)
        
        # Si no, intentar autenticar directamente
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return None
        
        token_value = auth_header[7:]  # Remover 'Bearer '
        
        try:
            # Buscar token en la base de datos usando tu modelo existente
            sesion_token = SesionToken.objects.select_related('usua_id').get(
                token_valor=token_value,
                token_activo=True
            )
            
            # Verificar si el token es válido
            if sesion_token.is_valid():
                return (sesion_token.usua_id, sesion_token)
            else:
                # Token expirado - eliminarlo
                sesion_token.delete()
                raise AuthenticationFailed('Token expirado')
        
        except SesionToken.DoesNotExist:
            raise AuthenticationFailed('Token inválido')
        except Exception as e:
            raise AuthenticationFailed('Error de autenticación')
    
    def authenticate_header(self, request):
        return 'Bearer'