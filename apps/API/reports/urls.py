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

urlpatterns = [
    path('reports/', ReportListView.as_view(), name='list-reports'),
    path('reports/create/', CreateReportView.as_view(), name='create-report'),
    path('reports/<int:report_id>/', ReportDetailView.as_view(), name='report-detail'),
    path('reports/<int:report_id>/update/', UpdateReportView.as_view(), name='update-report'),
    path('reports/<int:report_id>/delete/', DeleteReportView.as_view(), name='delete-report'),
    path('reports/user/', UserReportsView.as_view(), name='user-reports'),
    path('reports/urgent/', UrgentReportsView.as_view(), name='urgent-reports'),
    path('reports/statistics/', ReportStatisticsView.as_view(), name='report-statistics'),
]
