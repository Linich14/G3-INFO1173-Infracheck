from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from domain.entities.usuario import Usuario
from reports.models import ReportModel
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from django.db.models.functions import TruncDate


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_analytics_stats(request):
    """
    Endpoint para obtener estadísticas detalladas para Analytics
    GET /api/admin/analytics/
    """
    try:
        # Verificar que el usuario sea administrador
        usuario = getattr(request, 'auth_user', None)
        if not usuario:
            return Response(
                {'error': 'Usuario no autenticado'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        rol_nombre = usuario.rous_id.rous_nombre.lower().strip()
        if 'admin' not in rol_nombre:
            return Response(
                {'error': 'No tienes permisos para acceder a esta información'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        now = timezone.now()
        
        # Reportes por día de la semana (últimos 7 días)
        seven_days_ago = now - timedelta(days=7)
        daily_reports = ReportModel.objects.filter(
            fecha_creacion__gte=seven_days_ago
        ).annotate(
            day=TruncDate('fecha_creacion')
        ).values('day').annotate(
            count=Count('id')
        ).order_by('day')
        
        # Crear array con todos los días (rellenando con 0 si no hay datos)
        reports_by_day = []
        for i in range(7):
            day = (now - timedelta(days=6-i)).date()
            count = next((item['count'] for item in daily_reports if item['day'] == day), 0)
            reports_by_day.append(count)
        
        # Total esta semana
        week_start = now - timedelta(days=now.weekday())
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        reports_this_week = ReportModel.objects.filter(
            fecha_creacion__gte=week_start
        ).count()
        
        # Semana anterior
        last_week_start = week_start - timedelta(days=7)
        reports_last_week = ReportModel.objects.filter(
            fecha_creacion__gte=last_week_start,
            fecha_creacion__lt=week_start
        ).count()
        
        # Calcular porcentaje de cambio
        if reports_last_week > 0:
            week_change = ((reports_this_week - reports_last_week) / reports_last_week) * 100
        else:
            week_change = 100 if reports_this_week > 0 else 0
        
        # Pico máximo
        peak_max = max(reports_by_day) if reports_by_day else 0
        
        # Reportes por categoría (usando el campo tipo_denuncia)
        reports_by_category = ReportModel.objects.values('tipo_denuncia').annotate(
            count=Count('id')
        ).order_by('-count')
        
        categories = {}
        for item in reports_by_category:
            if item['tipo_denuncia']:
                categories[item['tipo_denuncia']] = item['count']
        
        # Usuarios activos (últimas 24h - aproximado por reportes creados)
        yesterday = now - timedelta(days=1)
        active_users_24h = Usuario.objects.filter(
            reportes__fecha_creacion__gte=yesterday
        ).distinct().count()
        
        # Nuevos reportes esta semana
        new_reports_week = reports_this_week
        
        return Response({
            'success': True,
            'reports_by_day': reports_by_day,
            'reports_this_week': reports_this_week,
            'week_change_percent': round(week_change, 1),
            'peak_max': peak_max,
            'active_users_24h': active_users_24h,
            'new_reports_week': new_reports_week,
            'categories': categories,
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
