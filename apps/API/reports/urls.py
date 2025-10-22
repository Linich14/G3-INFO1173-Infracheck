from django.urls import path
from reports.views.report_views import (
    ReportCreateView, ReportListView, ReportDetailView, ReportUpdateView, ReportDeleteView,
    ReportMediaUploadView, ReportMediaListView, ReportMediaDeleteView, get_reports
)
from .views.seguimiento_views import (
    follow_report_view,
    unfollow_report_view,
    is_following_report_view,
    followed_reports_view
)
from .views.voto_views import (
    votar_reporte,
    listar_votos_reporte
)
from .views.comentario_views import (
    crear_comentario_reporte,
    listar_comentarios_reporte
)

urlpatterns = [
    # CRUD de reportes con clases APIView
    path('', ReportListView.as_view(), name='report_list'),
    path('create/', ReportCreateView.as_view(), name='report_create'),
    path('<int:report_id>/', ReportDetailView.as_view(), name='report_detail'),
    path('<int:report_id>/update/', ReportUpdateView.as_view(), name='report_update'),
    path('<int:report_id>/delete/', ReportDeleteView.as_view(), name='report_delete'),
    
    # Manejo de archivos/imágenes
    path('<int:report_id>/media/', ReportMediaListView.as_view(), name='report_media_list'),
    path('<int:report_id>/media/upload/', ReportMediaUploadView.as_view(), name='report_media_upload'),
    path('<int:report_id>/media/<int:archivo_id>/delete/', ReportMediaDeleteView.as_view(), name='report_media_delete'),
    
    # Vista con paginación (usando decorador para funciones específicas)
    path('paginated/', get_reports, name='get_reports_paginated'),
    
    # ==================== SEGUIMIENTO DE REPORTES ====================
    path('<int:report_id>/follow/', follow_report_view, name='follow-report'),
    path('<int:report_id>/unfollow/', unfollow_report_view, name='unfollow-report'),
    path('<int:report_id>/is-following/', is_following_report_view, name='is-following-report'),
    path('followed/', followed_reports_view, name='followed-reports'),

    # ==================== VOTOS DE REPORTES ====================
    path('<int:report_id>/vote/', votar_reporte, name='vote-report'),
    path('<int:report_id>/votes/', listar_votos_reporte, name='list-report-votes'),

    # ==================== COMENTARIOS DE REPORTES ====================
    path('<int:report_id>/comments/', crear_comentario_reporte, name='create-comment'),
    path('<int:report_id>/comments/list/', listar_comentarios_reporte, name='list-report-comments'),
]
