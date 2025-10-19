from django.urls import path
from .views.report_views import (
    ReportCreateView,
    ReportListView,
    ReportDetailView,
    ReportUpdateView,
    ReportDeleteView,
    ReportImageDeleteView,
)

urlpatterns = [
    # ==================== REPORTES/DENUNCIAS ====================
    path('', ReportListView.as_view(), name='report-list'),
    path('create/', ReportCreateView.as_view(), name='report-create'),
    path('<int:report_id>/', ReportDetailView.as_view(), name='report-detail'),
    path('<int:report_id>/update/', ReportUpdateView.as_view(), name='report-update'),
    path('<int:report_id>/delete/', ReportDeleteView.as_view(), name='report-delete'),
    path('<int:report_id>/images/<int:image_id>/delete/', ReportImageDeleteView.as_view(), name='report-image-delete'),
]
