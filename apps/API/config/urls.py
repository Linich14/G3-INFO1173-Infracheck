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
from interfaces.api.v1.user_stats import user_stats_view, public_user_stats_view
from django.urls import include
from interfaces.api.v1.admin_users import admin_list_users, admin_update_user_status, admin_search_users
from django.conf import settings
from django.conf.urls.static import static

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
    path('api/v1/profile/stats/', user_stats_view, name='user-stats'),
    path('api/v1/change-password/', change_password_view, name='change-password'),
    path('api/v1/delete-account/', delete_account, name='delete-account'),

    path('api/reports/', include('reports.urls')),
    
    path('api/notifications/', include('notifications.urls')),

    path('api/proyectos/', include('proyectos.urls')),
    
    path('api/admin/', include('audit.urls')),

    path('api/users/', admin_list_users, name='admin-list-users'),
    path('api/users/search/', admin_search_users, name='admin-search-users'),
    re_path(r'^api/users/(?P<user_id>\d+)/status/$', admin_update_user_status, name='admin-update-user-status'),
    re_path(r'^api/users/(?P<user_id>\d+)/stats/$', public_user_stats_view, name='public-user-stats'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
