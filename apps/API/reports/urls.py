from django.urls import path
from .views.report_views import (
    CreateReportView,
    ReportListView,
    ReportDetailView,
    UpdateReportView,
    DeleteReportView,
    UserReportsView,
    UrgentReportsView,
    ReportStatisticsView
)
from .views.notification_views import (
    NotificationListView,
    MarkNotificationReadView,
    MarkAllNotificationsReadView
)
from .views.proyecto_views import (
    CreateProyectoView,
    ProyectoListView,
    ProyectoDetailView,
    UpdateProyectoView,
    DeleteProyectoView,
    ProyectosByDenunciaView,
    ProyectosUrgentesView,
    ProyectosActivosView,
    ProyectoReportsView,
    ReportProblemaView,
    ProyectoStatisticsView,
    ProyectoDetailStatisticsView,
    ProyectoArchivosView,
    AddArchivoProyectoView,
    DeleteArchivoView
)

urlpatterns = [
    # ==================== REPORTES/DENUNCIAS ====================
    path('reports/', ReportListView.as_view(), name='list-reports'),
    path('reports/create/', CreateReportView.as_view(), name='create-report'),
    path('reports/<int:report_id>/', ReportDetailView.as_view(), name='report-detail'),
    path('reports/<int:report_id>/update/', UpdateReportView.as_view(), name='update-report'),
    path('reports/<int:report_id>/delete/', DeleteReportView.as_view(), name='delete-report'),
    path('reports/user/', UserReportsView.as_view(), name='user-reports'),
    path('reports/urgent/', UrgentReportsView.as_view(), name='urgent-reports'),
    path('reports/statistics/', ReportStatisticsView.as_view(), name='report-statistics'),
    
    # ==================== NOTIFICACIONES ====================
    path('notifications/', NotificationListView.as_view(), name='notifications-list'),
    path('notifications/<int:notification_id>/mark-read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),
    path('notifications/mark-all-read/', MarkAllNotificationsReadView.as_view(), name='mark-all-notifications-read'),
    
    # ==================== PROYECTOS - CRUD BÁSICO ====================
    path('projects/', ProyectoListView.as_view(), name='list-projects'),
    path('projects/create/', CreateProyectoView.as_view(), name='create-project'),
    path('projects/<int:proyecto_id>/', ProyectoDetailView.as_view(), name='project-detail'),
    path('projects/<int:proyecto_id>/update/', UpdateProyectoView.as_view(), name='update-project'),
    path('projects/<int:proyecto_id>/delete/', DeleteProyectoView.as_view(), name='delete-project'),
    
    # ==================== PROYECTOS - CONSULTAS ESPECIALIZADAS ====================
    path('projects/denuncia/<int:denuncia_id>/', ProyectosByDenunciaView.as_view(), name='projects-by-denuncia'),
    path('projects/urgent/', ProyectosUrgentesView.as_view(), name='urgent-projects'),
    path('projects/active/', ProyectosActivosView.as_view(), name='active-projects'),
    
    # ==================== PROYECTOS - REPORTES Y PROBLEMAS ====================
    path('projects/<int:proyecto_id>/reports/', ProyectoReportsView.as_view(), name='project-reports'),
    path('projects/<int:proyecto_id>/report-problem/', ReportProblemaView.as_view(), name='report-problem'),
    
    # ==================== PROYECTOS - ESTADÍSTICAS ====================
    path('projects/statistics/', ProyectoStatisticsView.as_view(), name='projects-statistics'),
    path('projects/<int:proyecto_id>/statistics/', ProyectoDetailStatisticsView.as_view(), name='project-detail-statistics'),
    
    # ==================== PROYECTOS - ARCHIVOS ====================
    path('projects/<int:proyecto_id>/archivos/', ProyectoArchivosView.as_view(), name='project-archivos'),
    path('projects/<int:proyecto_id>/archivos/add/', AddArchivoProyectoView.as_view(), name='add-archivo'),
    path('projects/archivos/<int:archivo_id>/delete/', DeleteArchivoView.as_view(), name='delete-archivo'),
]
