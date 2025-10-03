from rest_framework.permissions import BasePermission

class IsAuthenticatedWithSesionToken(BasePermission):
    """
    Permiso personalizado que verifica si el usuario está autenticado
    usando el sistema de SesionToken
    """
    
    def has_permission(self, request, view):
        
        # Verificar diferentes posibles campos de ID del modelo Usuario
        user_id = None
        if hasattr(request.user, 'id'):
            user_id = request.user.id
        elif hasattr(request.user, 'usua_id'):
            user_id = request.user.usua_id
        elif hasattr(request.user, 'pk'):
            user_id = request.user.pk
        
        # Verificar si el usuario fue autenticado por nuestro sistema
        is_authenticated = bool(request.user and user_id)
        
        return is_authenticated