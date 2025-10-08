from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from interfaces.api.serializers import AdminUserSerializer
from domain.entities.usuario import Usuario
import logging
from django.db import models

logger = logging.getLogger(__name__)

def check_admin_permission(request):
    """Verifica si el usuario es admin."""
    usuario = getattr(request, 'auth_user', None)
    if not usuario or usuario.rous_id.pk != 1:  # 1 = Administrador
        return False
    return True

@csrf_exempt
@require_http_methods(["GET"])
def admin_list_users(request):
    """
    Endpoint para admins: Lista usuarios con filtros y paginación.
    GET params: estado (0/1), page, limit.
    """
    if not check_admin_permission(request):
        return JsonResponse({
            'success': False,
            'message': 'Acceso denegado. Solo administradores.'
        }, status=403)

    # Filtros
    estado = request.GET.get('estado')
    queryset = Usuario.objects.select_related('rous_id').order_by('-usua_creado')

    if estado is not None:
        queryset = queryset.filter(usua_estado=int(estado))

    serializer = AdminUserSerializer(queryset, many=True)

    return JsonResponse({
        'success': True,
        'data': serializer.data
    })

@csrf_exempt
@require_http_methods(["PUT"])
def admin_update_user_status(request, user_id):
    """
    Endpoint para admins: Actualizar estado de un usuario.
    PUT body: {"usua_estado": 0|1}
    """
    if not check_admin_permission(request):
        return JsonResponse({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'Acceso denegado. Solo administradores.'
            }
        }, status=403)

    from interfaces.api.serializers import AdminUserUpdateSerializer
    import json
    from django.utils import timezone

    try:
        data = json.loads(request.body)
        serializer = AdminUserUpdateSerializer(data=data)
        if not serializer.is_valid():
            return JsonResponse({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'usua_estado debe ser 0 o 1',
                    'details': serializer.errors
                }
            }, status=400)

        usuario = Usuario.objects.get(usua_id=user_id)

        # Validación: no deshabilitarse a sí mismo
        admin_user = request.auth_user
        if admin_user.usua_id == usuario.usua_id and serializer.validated_data['usua_estado'] == 0:
            return JsonResponse({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'No puedes deshabilitarte a ti mismo.'
                }
            }, status=400)

        old_status = usuario.usua_estado
        usuario.usua_estado = serializer.validated_data['usua_estado']
        usuario.save()

        # Log de auditoría
        logger.info(f"Admin {admin_user.usua_nickname} cambió estado de {usuario.usua_nickname} de {old_status} a {usuario.usua_estado}")

        status_text = "habilitado" if usuario.usua_estado else "deshabilitado"

        return JsonResponse({
            'success': True,
            'data': {
                'usua_id': usuario.usua_id,
                'usua_estado': usuario.usua_estado,
                'updated_at': timezone.now().isoformat()
            },
            'message': f'Usuario {status_text} exitosamente'
        })

    except Usuario.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': {
                'code': 'USER_NOT_FOUND',
                'message': f'Usuario con ID {user_id} no encontrado'
            }
        }, status=404)
    except Exception as e:
        logger.error(f"Error al actualizar usuario {user_id}: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Error interno del servidor.'
            }
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def admin_search_users(request):
    """
    Endpoint para admins: Buscar usuarios por q (nickname, email o RUT).
    GET params: q (query string).
    """
    if not check_admin_permission(request):
        return JsonResponse({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'Acceso denegado. Solo administradores.'
            }
        }, status=403)

    query = request.GET.get('q', '').strip()
    if not query:
        return JsonResponse({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Parámetro q requerido para búsqueda.'
            }
        }, status=400)

    queryset = Usuario.objects.select_related('rous_id').filter(
        models.Q(usua_nickname__icontains=query) |
        models.Q(usua_email__icontains=query) |
        models.Q(usua_rut__icontains=query)
    ).order_by('-usua_creado')

    serializer = AdminUserSerializer(queryset, many=True)

    return JsonResponse({
        'success': True,
        'data': serializer.data
    })