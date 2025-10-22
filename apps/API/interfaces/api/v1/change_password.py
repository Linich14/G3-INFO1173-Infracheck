from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from interfaces.api.serializers.change_password import ChangePasswordSerializer
from domain.entities.sesion_token import SesionToken
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
def change_password_view(request):
    """
    Endpoint para cambiar contraseña del usuario autenticado.

    Headers:
        Authorization: Bearer <token>

    Body (JSON):
    {
        "current_password": "string",  // Contraseña actual
        "new_password": "string",      // Nueva contraseña
        "confirm_password": "string"   // Confirmación de nueva contraseña
    }

    Respuesta exitosa (200):
    {
        "message": "Contraseña cambiada exitosamente"
    }

    Respuesta de error (400/401):
    {
        "errors": ["string"]
    }
    """
    try:
        # Obtener usuario autenticado del middleware
        usuario = getattr(request, 'auth_user', None)
        if not usuario:
            return Response(
                {'errors': ['Usuario no autenticado.']},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            # Cambiar la contraseña
            nueva_password = serializer.validated_data['new_password']
            usuario.set_password(nueva_password)
            usuario.save()

            # Invalidar todas las sesiones anteriores por seguridad
            SesionToken.objects.filter(usua_id=usuario).delete()

            logger.info(f"Contraseña cambiada para usuario: {usuario.usua_nickname}")

            return Response(
                {'message': 'Contraseña cambiada exitosamente'},
                status=status.HTTP_200_OK
            )
        else:
            logger.warning(f"Cambio de contraseña fallido para usuario {usuario.usua_nickname}: {serializer.errors}")
            return Response(
                {'errors': [str(error) for errors in serializer.errors.values() for error in errors]},
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        logger.error(f"Error inesperado en cambio de contraseña: {str(e)}")
        return Response(
            {'errors': ['Error interno del servidor. Intente nuevamente.']},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )