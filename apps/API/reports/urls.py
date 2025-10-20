from django.urls import path
from .views.report_views import (
    ReportCreateView,
    ReportListView,
    ReportDetailView,
    ReportUpdateView,
    ReportDeleteView,
    ReportImageDeleteView,
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

urlpatterns = [
    # ==================== REPORTES/DENUNCIAS ====================
    path('', ReportListView.as_view(), name='report-list'),
    path('create/', ReportCreateView.as_view(), name='report-create'),
    path('<int:report_id>/', ReportDetailView.as_view(), name='report-detail'),
    path('<int:report_id>/update/', ReportUpdateView.as_view(), name='report-update'),
    path('<int:report_id>/delete/', ReportDeleteView.as_view(), name='report-delete'),
    path('<int:report_id>/images/<int:image_id>/delete/', ReportImageDeleteView.as_view(), name='report-image-delete'),

    # ==================== SEGUIMIENTO DE REPORTES ====================
    path('<int:report_id>/follow/', follow_report_view, name='follow-report'),
    path('<int:report_id>/unfollow/', unfollow_report_view, name='unfollow-report'),
    path('<int:report_id>/is-following/', is_following_report_view, name='is-following-report'),
    path('followed/', followed_reports_view, name='followed-reports'),

    # ==================== VOTOS DE REPORTES ====================
    path('<int:report_id>/vote/', votar_reporte, name='vote-report'),
    path('<int:report_id>/votes/', listar_votos_reporte, name='list-report-votes'),
]
