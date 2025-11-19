from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from domain.entities.usuario import Usuario
from reports.models import ReportModel
from django.utils import timezone
from datetime import timedelta


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_stats(request):
    """
    Endpoint para obtener estadísticas generales del sistema (solo admin)
    GET /api/admin/stats/
    """
    try:
        # Verificar que el usuario sea administrador
        usuario = getattr(request, 'auth_user', None)
        if not usuario:
            return Response(
                {'error': 'Usuario no autenticado'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Verificar si el usuario es admin (case-insensitive y acepta variaciones)
        rol_nombre = usuario.rous_id.rous_nombre.lower().strip()
        
        if 'admin' not in rol_nombre:
            return Response(
                {'error': f'No tienes permisos para acceder a esta información. Rol actual: {usuario.rous_id.rous_nombre}'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener estadísticas
        total_users = Usuario.objects.filter(usua_estado=1).count()
        total_reports = ReportModel.objects.count()
        
        # Nuevos usuarios hoy
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        new_users_today = Usuario.objects.filter(
            usua_creado__gte=today_start
        ).count()
        
        return Response({
            'success': True,
            'total_users': total_users,
            'total_reports': total_reports,
            'new_users_today': new_users_today,
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
