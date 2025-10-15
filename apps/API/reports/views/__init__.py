from .report_views import *
from .proyecto_views import (
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

__all__ = [
    'ReportListView',
    'ReportDetailView',
    'create_report',
    'update_report',
    'manage_report_files'
]