from django.contrib import admin
from django.urls import path, re_path
from interfaces.api.v1.register import RegisterView
from interfaces.api.v1.login import login_view
from interfaces.api.v1.verify_token import verify_token_view
from interfaces.api.v1.logout import logout_view
from interfaces.api.v1.request_password_reset import request_password_reset_view
from interfaces.api.v1.verify_reset_code import verify_reset_code_view
from interfaces.api.v1.reset_password import reset_password_view
from interfaces.api.v1.profile import profile_view
from interfaces.api.v1.delete_account import delete_account
from interfaces.api.v1.refresh import refresh_token_view
from interfaces.api.v1.change_password import change_password_view
from django.urls import include
from interfaces.api.v1.admin_users import admin_list_users, admin_update_user_status, admin_search_users

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/register/', RegisterView.as_view(), name='user-register'),
    path('api/v1/login/', login_view, name='user-login'),
    path('api/v1/verify-token/', verify_token_view, name='verify-token'),
    path('api/v1/refresh/', refresh_token_view, name='refresh-token'),
    path('api/v1/logout/', logout_view, name='user-logout'),
    path('api/v1/request-password-reset/', request_password_reset_view, name='request-password-reset'),
    path('api/v1/verify-reset-code/', verify_reset_code_view, name='verify-reset-code'),
    path('api/v1/reset-password/', reset_password_view, name='reset-password'),
    path('api/v1/profile/', profile_view, name='user-profile'),
    path('api/v1/change-password/', change_password_view, name='change-password'),
    path('api/v1/delete-account/', delete_account, name='delete-account'),

    # Ruta de reportes /api/reports/
    path('api/reports/', include('reports.urls')),
    
    # Ruta de notificaciones /api/notifications/
    path('api/notifications/', include('notifications.urls')),

    # Ruta de proyectos /api/proyectos/
    path('api/proyectos/', include('proyectos.urls')),
    
    # Ruta de auditoría /api/audit/
    path('api/audit/', include('audit.urls')),

    # Rutas para admin users
    path('api/users/', admin_list_users, name='admin-list-users'),
    path('api/users/search/', admin_search_users, name='admin-search-users'),
    re_path(r'^api/users/(?P<user_id>\d+)/status/$', admin_update_user_status, name='admin-update-user-status'),
]
