from django.urls import path
from .views.report_views import (
    ReportCreateView,
    ReportListView,
    ReportDetailView,
    ReportUpdateView,
    ReportDeleteView,
    ReportImageDeleteView,
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
    path('', ReportListView.as_view(), name='report-list'),
    path('create/', ReportCreateView.as_view(), name='report-create'),
    path('<int:report_id>/', ReportDetailView.as_view(), name='report-detail'),
    path('<int:report_id>/update/', ReportUpdateView.as_view(), name='report-update'),
    path('<int:report_id>/delete/', ReportDeleteView.as_view(), name='report-delete'),
    path('<int:report_id>/images/<int:image_id>/delete/', ReportImageDeleteView.as_view(), name='report-image-delete'),
    
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
