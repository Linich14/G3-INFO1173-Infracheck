from django.urls import path
from reports.views.audit_views import ReportAuditView

urlpatterns = [
    # Auditoría de reportes
    path('reports/<int:id>/', ReportAuditView.as_view(), name='audit-report'),
    
    # TODO: Auditoría de proyectos - pendiente hasta que exista la tabla Proyecto
    # path('projects/<int:id>/', ProyectoAuditView.as_view(), name='audit-project'),
]
