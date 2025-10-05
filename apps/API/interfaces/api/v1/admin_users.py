from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from interfaces.api.serializers import AdminUserSerializer
from domain.entities.usuario import Usuario
import logging

logger = logging.getLogger(__name__)

def check_admin_permission(request):
    """Verifica si el usuario es admin."""
    usuario = getattr(request, 'auth_user', None)
    if not usuario or usuario.rous_id.rous_nombre != 'Administrador':  # Ajustar nombre del rol
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

    # Paginación
    page = int(request.GET.get('page', 1))
    limit = int(request.GET.get('limit', 10))
    paginator = Paginator(queryset, limit)
    users_page = paginator.page(page)

    serializer = AdminUserSerializer(users_page, many=True)

    return JsonResponse({
        'success': True,
        'data': serializer.data,
        'pagination': {
            'page': page,
            'total_pages': paginator.num_pages,
            'total_users': paginator.count
        }
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
            'message': 'Acceso denegado. Solo administradores.'
        }, status=403)

    from interfaces.api.serializers import AdminUserUpdateSerializer
    import json

    try:
        data = json.loads(request.body)
        serializer = AdminUserUpdateSerializer(data=data)
        if not serializer.is_valid():
            return JsonResponse({
                'success': False,
                'message': 'Datos inválidos.',
                'errors': serializer.errors
            }, status=400)

        usuario = Usuario.objects.get(usua_id=user_id)
        usuario.usua_estado = serializer.validated_data['usua_estado']
        usuario.save()

        logger.info(f"Admin {request.auth_user.usua_nickname} cambió estado de {usuario.usua_nickname} a {usuario.usua_estado}")

        return JsonResponse({
            'success': True,
            'message': f'Estado de usuario actualizado a {"Habilitado" if usuario.usua_estado else "Deshabilitado"}.'
        })

    except Usuario.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'Usuario no encontrado.'
        }, status=404)
    except Exception as e:
        logger.error(f"Error al actualizar usuario {user_id}: {str(e)}")
        return JsonResponse({
            'success': False,
            'message': 'Error interno.'
        }, status=500)