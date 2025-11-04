from django.urls import path
from notifications.views import (
    NotificationListView,
    MarkNotificationReadView,
    MarkAllNotificationsReadView,
    NotificationAdminListView,
    NotificationCreateAdminView
)

urlpatterns = [
    # Endpoints para usuarios normales
    path('', NotificationListView.as_view(), name='notifications-list'),
    path('<int:notification_id>/mark-read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),
    path('mark-all-read/', MarkAllNotificationsReadView.as_view(), name='mark-all-notifications-read'),
    
    # Endpoint para crear notificaciones (accesible para admins/pruebas)
    path('create/', NotificationCreateAdminView.as_view(), name='notifications-create'),
    
    # Endpoints administrativos
    path('admin/', NotificationAdminListView.as_view(), name='notifications-admin-list'),
    path('admin/create/', NotificationCreateAdminView.as_view(), name='notifications-admin-create'),
]
