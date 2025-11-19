from django.urls import path
from reports.views.audit_views import ReportAuditView
from .views import get_admin_stats

urlpatterns = [
    # Estadísticas para admin
    path('stats/', get_admin_stats, name='admin-stats'),
    
    # Auditoría de reportes
    path('reports/<int:id>/', ReportAuditView.as_view(), name='audit-report'),
    
    # TODO: Auditoría de proyectos - pendiente hasta que exista la tabla Proyecto
    # path('projects/<int:id>/', ProyectoAuditView.as_view(), name='audit-project'),
]
