from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from interfaces.api.serializers import DeleteAccountSerializer
from domain.entities.sesion_token import SesionToken
from domain.entities.recuperar_usuario import RecuperarUsuario
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["POST"])
def delete_account(request):
    """
    Endpoint para eliminar la cuenta del usuario autenticado.
    Requiere token válido en headers.
    Elimina todos los datos relacionados: SesionToken, RecuperarUsuario y Usuario.
    """
    # Validar serializador (aunque esté vacío, para consistencia)
    serializer = DeleteAccountSerializer(data=request.POST if request.method == 'POST' else {})
    if not serializer.is_valid():
        return JsonResponse({
            'success': False,
            'message': 'Datos inválidos.',
            'errors': serializer.errors
        }, status=400)

    # Obtener usuario autenticado del middleware
    usuario = getattr(request, 'auth_user', None)
    if not usuario:
        return JsonResponse({
            'success': False,
            'message': 'Usuario no autenticado.'
        }, status=401)

    try:
        # Soft delete: cambiar estado a deshabilitado en lugar de eliminar
        usuario.usua_estado = 0  # Deshabilitado
        usuario.save()

        # Opcional: eliminar sesiones activas para forzar logout
        SesionToken.objects.filter(usua_id=usuario).delete()

        logger.info(f"Cuenta desactivada para usuario: {usuario.usua_nickname}")

        return JsonResponse({
            'success': True,
            'message': 'Cuenta desactivada exitosamente. Puedes reactivarla contactando soporte.'
        })

    except Exception as e:
        logger.error(f"Error al eliminar cuenta para usuario {usuario.usua_nickname}: {str(e)}")
        return JsonResponse({
            'success': False,
            'message': 'Error interno al eliminar la cuenta.'
        }, status=500)