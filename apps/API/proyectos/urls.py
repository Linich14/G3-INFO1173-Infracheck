from django.urls import path
from proyectos.views import (
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
    # ==================== CRUD BÁSICO ====================
    path('', ProyectoListView.as_view(), name='list-proyectos'),
    path('create/', CreateProyectoView.as_view(), name='create-proyecto'),
    path('<int:proyecto_id>/', ProyectoDetailView.as_view(), name='proyecto-detail'),
    path('<int:proyecto_id>/update/', UpdateProyectoView.as_view(), name='update-proyecto'),
    path('<int:proyecto_id>/delete/', DeleteProyectoView.as_view(), name='delete-proyecto'),
    
    # ==================== CONSULTAS ESPECIALIZADAS ====================
    path('denuncia/<int:denuncia_id>/', ProyectosByDenunciaView.as_view(), name='proyectos-by-denuncia'),
    path('urgent/', ProyectosUrgentesView.as_view(), name='urgent-proyectos'),
    path('active/', ProyectosActivosView.as_view(), name='active-proyectos'),
    
    # ==================== REPORTES Y PROBLEMAS ====================
    path('<int:proyecto_id>/reports/', ProyectoReportsView.as_view(), name='proyecto-reports'),
    path('<int:proyecto_id>/report-problem/', ReportProblemaView.as_view(), name='report-problema'),
    
    # ==================== ESTADÍSTICAS ====================
    path('statistics/', ProyectoStatisticsView.as_view(), name='proyectos-statistics'),
    path('<int:proyecto_id>/statistics/', ProyectoDetailStatisticsView.as_view(), name='proyecto-detail-statistics'),
    
    # ==================== ARCHIVOS ====================
    path('<int:proyecto_id>/archivos/', ProyectoArchivosView.as_view(), name='proyecto-archivos'),
    path('<int:proyecto_id>/archivos/add/', AddArchivoProyectoView.as_view(), name='add-archivo'),
    path('archivos/<int:archivo_id>/delete/', DeleteArchivoView.as_view(), name='delete-archivo'),
]
